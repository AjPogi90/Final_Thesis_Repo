/**
 * src/utils/faceRecognition.js
 *
 * Thin wrapper around face-api.js that exposes:
 *   - loadModels()                       — lazy-loads the 4 required models once
 *   - extractDescriptorFromFile(file)    — 128-float descriptor from an image File (using SSD MobileNet v1)
 *   - extractDescriptorFromImage(img)    — 128-float descriptor from Image element
 *   - detectFaceWithLandmarks(video)     — lightweight detection using TinyFaceDetector
 *   - computeEAR(landmarks)             — Eye Aspect Ratio for blink detection
 *   - compareFaces(d1, d2)              — Euclidean distance (< MATCH_THRESHOLD is match)
 *   - descriptorToArray(descriptor)     — converts Float32Array → plain array
 */

import * as faceapi from 'face-api.js';

// Where the model weight files live (served from public/)
const MODEL_URL = process.env.PUBLIC_URL + '/models';

/** Euclidean distance below this value → faces match. 
 *  face-api.js recommends 0.6. We use 0.58 for a slightly stricter but fair check.
 */
export const MATCH_THRESHOLD = 0.58;

let _loaded = false;

// ── Model loading ─────────────────────────────────────────────────────────────

/**
 * Load the face-api.js models from /models/.
 * Safe to call multiple times — loads only once.
 */
export async function loadModels() {
  if (_loaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // more accurate for final capture
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  _loaded = true;
}

// ── Descriptor extraction ─────────────────────────────────────────────────────

/**
 * Extract a 128-dim face descriptor from an image File (e.g. uploaded ID).
 * Uses SSD MobileNet v1 for maximum accuracy.
 */
export async function extractDescriptorFromFile(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return null; // PDFs can't be processed
  }

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.src = objectUrl;
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('Could not load ID image'));
  });

  const descriptor = await extractDescriptorFromImage(img);
  URL.revokeObjectURL(objectUrl);
  return descriptor;
}

/**
 * Extract a 128-dim face descriptor from an image element.
 * Uses SSD MobileNet v1.
 */
export async function extractDescriptorFromImage(mediaElement) {
  const result = await faceapi
    .detectSingleFace(mediaElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return result ? result.descriptor : null;
}

/**
 * Lightweight face+landmark detection (no descriptor).
 * Used in the liveness loop for positioning and EAR computation.
 */
export async function detectFaceWithLandmarks(videoEl) {
  return await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks();
}

// ── Liveness helpers ──────────────────────────────────────────────────────────

/**
 * Eye Aspect Ratio (EAR) — a scalar that drops sharply during a blink.
 * Uses 68-point landmark indices:
 *   Left eye:  36–41
 *   Right eye: 42–47
 */
export function computeEAR(landmarks) {
  const p = landmarks.positions;

  const ear = (pts) => {
    const A = _dist(pts[1], pts[5]);
    const B = _dist(pts[2], pts[4]);
    const C = _dist(pts[0], pts[3]);
    return (A + B) / (2.0 * C);
  };

  const leftEAR = ear(p.slice(36, 42));
  const rightEAR = ear(p.slice(42, 48));
  return (leftEAR + rightEAR) / 2;
}

function _dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ── Comparison ────────────────────────────────────────────────────────────────

/**
 * Euclidean distance between two 128-dim face descriptors.
 */
export function compareFaces(d1, d2) {
  return faceapi.euclideanDistance(Array.from(d1), Array.from(d2));
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/**
 * Converts a Float32Array descriptor to a plain JS array.
 * Required for Firebase storage (Float32Array is not serializable).
 */
export function descriptorToArray(descriptor) {
  return Array.from(descriptor);
}
