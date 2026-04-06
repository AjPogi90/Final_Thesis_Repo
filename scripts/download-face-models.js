/**
 * download-face-models.js
 *
 * Downloads the face-api.js model weight files from the official GitHub repo
 * into public/models/ so the frontend can load them at runtime.
 *
 * Run once:  node scripts/download-face-models.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const BASE_URL =
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const OUT_DIR = path.join(__dirname, '..', 'public', 'models');

const FILES = [
  // Tiny face detector — used only for real-time live preview (fast)
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  // SSD MobileNet v1 — used for accurate final capture descriptor extraction
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  // 68-point face landmark model — blink / EAR detection
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  // Face recognition model — 128-dim descriptor comparison
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
];

// ── helpers ──────────────────────────────────────────────────────────────────

function download(urlStr, dest) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(urlStr, (res) => {
      // Follow redirects (GitHub raw URLs sometimes 301)
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    });

    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📦  face-api.js model downloader\n');

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUT_DIR}\n`);
  }

  let newFiles = 0;

  for (const filename of FILES) {
    const dest = path.join(OUT_DIR, filename);

    if (fs.existsSync(dest)) {
      const size = formatBytes(fs.statSync(dest).size);
      console.log(`  ✓  Already exists  ${filename}  (${size})`);
      continue;
    }

    process.stdout.write(`  ⬇  Downloading   ${filename} ...`);
    const url = `${BASE_URL}/${filename}`;
    await download(url, dest);
    const size = formatBytes(fs.statSync(dest).size);
    process.stdout.write(`  ✓  ${size}\n`);
    newFiles++;
  }

  console.log(
    `\n✅  Done! ${newFiles} new file(s) downloaded to public/models/\n`
  );
}

main().catch((err) => {
  console.error('\n❌  Download failed:', err.message);
  process.exit(1);
});
