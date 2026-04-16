/**
 * FaceVerificationStep.js
 * 
 * Production-ready facial recognition implementation:
 * - Dual-models (TinyFaceDetector for speed, SSD MobileNet V1 for accuracy)
 * - 3-Stage camera flow: Positioning → Blink (Relative EAR) → Capturing (Average 3 frames)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Alert,
} from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LightModeIcon from '@mui/icons-material/LightMode';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BadgeIcon from '@mui/icons-material/Badge';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  loadModels,
  extractDescriptorFromFile,
  extractDescriptorFromImage,
  detectFaceWithLandmarks,
  computeEAR,
  compareFaces,
  MATCH_THRESHOLD,
} from '../utils/faceRecognition';

const MAX_ATTEMPTS = 3;
const DETECTION_INTERVAL_MS = 250; // run fast in browser

// ── Shared UI ──
const OrangeBtn = ({ children, onClick, disabled, icon, variant = 'filled' }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    disabled={disabled}
    sx={{
      width: '100%', py: 1.5, px: 3,
      border: variant === 'outline' ? '2px solid #EE791A' : 'none',
      borderRadius: 1.5,
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: variant === 'outline' ? 'transparent' : (disabled ? 'rgba(0,0,0,0.06)' : '#EE791A'),
      color: variant === 'outline' ? '#EE791A' : (disabled ? 'rgba(0,0,0,0.25)' : '#fff'),
      fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit',
      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
      '&:hover:not(:disabled)': {
        backgroundColor: variant === 'outline' ? 'rgba(238,121,26,0.08)' : '#c05905',
        transform: 'translateY(-1px)',
      },
    }}
  >
    {icon}
    {children}
  </Box>
);

const averageDescriptors = (descriptors) => {
  if (!descriptors.length) return null;
  const avg = new Float32Array(128);
  for (let i = 0; i < 128; i++) {
    let sum = 0;
    for (let d of descriptors) sum += d[i];
    avg[i] = sum / descriptors.length;
  }
  return avg;
};

const FaceVerificationStep = ({ idFile, onVerified }) => {
  const [phase, setPhase] = useState('preparing'); 
  // preparing | guide | active | comparing | success | failed | locked | no_camera | error

  // Stage inside 'active'
  const [camStage, setCamStage] = useState('positioning'); // positioning | blink | capturing | fallback
  const [feedbackMsg, setFeedbackMsg] = useState('Initializing camera...');
  const [feedbackColor, setFeedbackColor] = useState('rgba(0,0,0,0.4)');
  const [boxColor, setBoxColor] = useState('rgba(255,255,255,0.35)');

  const [errorMsg, setErrorMsg] = useState('');
  const [matchScore, setMatchScore] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isPDF, setIsPDF] = useState(false);
  const [capturingProgress, setCapturingProgress] = useState(0);
  
  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const pendingStreamRef = useRef(null);
  const isProcessingRef = useRef(false);
  const intervalRef = useRef(null);
  
  // State refs for the interval loop
  const camStageRef = useRef(camStage);
  const perfectFramesRef = useRef(0);
  
  // Blink detection vars
  // We use relative EAR: drop of 6% from baseline
  const earHistoryRef = useRef([]);
  const blinkBaselineRef = useRef(0);

  useEffect(() => { camStageRef.current = camStage; }, [camStage]);
  useEffect(() => { if (idFile?.type === 'application/pdf') setIsPDF(true); }, [idFile]);

  // 1. Init models
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadModels();
        if (!cancelled) setPhase('guide');
      } catch (err) {
        if (!cancelled) {
          setErrorMsg('Failed to load face models.');
          setPhase('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Ensure clean up
  useEffect(() => {
    return () => {
      stopCamera();
      stopLoop();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const stopLoop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // 2. Start Camera
  const startCamera = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      pendingStreamRef.current = stream;

      // Reset
      perfectFramesRef.current = 0;
      earHistoryRef.current = [];
      blinkBaselineRef.current = 0;
      setCamStage('positioning');
      setFeedbackMsg('Position your face within the oval');
      setFeedbackColor('rgba(238,121,26,0.6)');
      setBoxColor('rgba(255,255,255,0.3)');
      setCapturingProgress(0);

      setPhase('active');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPhase('no_camera');
      } else {
        setErrorMsg('Failed to access camera.');
        setPhase('error');
      }
    }
  };

  // Connect video element
  useEffect(() => {
    if (phase !== 'active' || !videoRef.current || !pendingStreamRef.current) return;
    const video = videoRef.current;
    const stream = pendingStreamRef.current;
    pendingStreamRef.current = null;

    video.srcObject = stream;
    video.play().then(() => {
      startDetectionLoop();
    }).catch(err => {
      setErrorMsg('Camera preview failed: ' + err.message);
      setPhase('error');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // 3. Main Liveness Loop
  const startDetectionLoop = () => {
    stopLoop();

    intervalRef.current = setInterval(async () => {
      if (isProcessingRef.current || phase !== 'active') return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const stage = camStageRef.current;
      if (stage === 'capturing') return; // Handled elsewhere

      isProcessingRef.current = true;
      try {
        const detection = await detectFaceWithLandmarks(video);
        if (!detection) {
          setFeedbackMsg('No face visible');
          setFeedbackColor('rgba(244,67,54,0.8)');
          setBoxColor('rgba(244,67,54,0.4)');
          perfectFramesRef.current = 0;
          return;
        }

        // POSITIONING LOGIC
        if (stage === 'positioning') {
          const { width, height, top, left } = detection.detection.box;
          const vidW = video.videoWidth;
          const vidH = video.videoHeight;
          
          // Heuristics for bounding box
          const faceAreaRatio = (width * height) / (vidW * vidH);
          const cx = left + width / 2;
          const cy = top + height / 2;
          
          const isCenteredX = cx > vidW * 0.35 && cx < vidW * 0.65;
          const isCenteredY = cy > vidH * 0.35 && cy < vidH * 0.65;
          
          if (!isCenteredX || !isCenteredY) {
            setFeedbackMsg('Center your face in the oval');
            setFeedbackColor('rgba(255,152,0,1)');
            setBoxColor('rgba(255,152,0,0.5)');
            perfectFramesRef.current = 0;
          } else if (faceAreaRatio < 0.12) {
            setFeedbackMsg('Move closer');
            setFeedbackColor('rgba(255,152,0,1)');
            setBoxColor('rgba(255,152,0,0.5)');
            perfectFramesRef.current = 0;
          } else if (faceAreaRatio > 0.40) {
            setFeedbackMsg('Move farther away');
            setFeedbackColor('rgba(255,152,0,1)');
            setBoxColor('rgba(255,152,0,0.5)');
            perfectFramesRef.current = 0;
          } else {
            perfectFramesRef.current += 1;
            setFeedbackMsg('Perfect! Holding...');
            setFeedbackColor('rgba(76,175,80,1)');
            setBoxColor('rgba(76,175,80,0.8)');
            
            if (perfectFramesRef.current >= 4) {
              setCamStage('blink');
              setFeedbackMsg('Look at camera and BLINK normally');
              setFeedbackColor('rgba(33,150,243,1)');
              setBoxColor('rgba(33,150,243,0.8)');
              earHistoryRef.current = [];
            }
          }
        } 
        // BLINK LOGIC
        else if (stage === 'blink') {
          const ear = computeEAR(detection.landmarks);
          earHistoryRef.current.push(ear);
          if (earHistoryRef.current.length > 15) earHistoryRef.current.shift();
          
          // Need at least 5 frames to form a baseline
          if (earHistoryRef.current.length > 5) {
            // Baseline is the average of the *highest* EARs recently (eyes open)
            const sorted = [...earHistoryRef.current].sort((a,b)=>b-a);
            blinkBaselineRef.current = (sorted[0] + sorted[1] + sorted[2]) / 3;
            
            const currentEar = earHistoryRef.current[earHistoryRef.current.length - 1];
            
            // Relative drop of 6% = blink
            if (currentEar < blinkBaselineRef.current * 0.94) {
              setCamStage('capturing');
              triggerCaptureSequence();
            }
          }
        }
      } finally {
        isProcessingRef.current = false;
      }
    }, DETECTION_INTERVAL_MS);
  };

  // 4. Multi-frame Capture Sequence
  const triggerCaptureSequence = async () => {
    stopLoop();
    setCamStage('capturing');
    setFeedbackMsg('Capturing face data...');
    setFeedbackColor('rgba(238,121,26,1)');
    setBoxColor('rgba(238,121,26,1)');
    
    try {
      const descriptors = [];
      const video = videoRef.current;
      let lastSelfieBase64 = null;
      
      // Capture 3 frames, 400ms apart
      for (let i = 0; i < 3; i++) {
        setCapturingProgress((i / 3) * 100);
        
        // Wait 400ms before taking image
        if (i > 0) {
          await new Promise(r => setTimeout(r, 400));
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const frameDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        if (i === 2) lastSelfieBase64 = frameDataUrl; // save the last frame

        // Using Image element for SSD MobileNet extraction
        const img = new Image();
        img.src = frameDataUrl;
        await new Promise((res) => { img.onload = res; });
        
        const desc = await extractDescriptorFromImage(img);
        if (desc) descriptors.push(desc);
      }

      setCapturingProgress(100);
      stopCamera();
      
      if (descriptors.length === 0) {
        handleFailure('Unable to detect clear facial features. Please ensure your face is well-lit, steady, and fully visible.');
        return;
      }

      const avgDescriptor = averageDescriptors(descriptors);
      runIDComparison(avgDescriptor, lastSelfieBase64);

    } catch (err) {
      handleFailure('An unexpected error occurred during capture. Please try again.');
    }
  };

  // 5. Compare with uploaded ID
  const runIDComparison = async (selfieDescriptor, selfieBase64) => {
    setPhase('comparing');
    
    try {
      if (!idFile || isPDF) {
        handleFailure('A valid, non-PDF photo ID is required to complete verification.');
        return;
      }
      const idDescriptor = await extractDescriptorFromFile(idFile);
      if (!idDescriptor) {
        handleFailure('We could not identify a clear face in your uploaded document. Please provide a clear, unobstructed ID photo.');
        return;
      }

      // Comparison
      const distance = compareFaces(selfieDescriptor, idDescriptor);
      const matched = distance < MATCH_THRESHOLD;

      if (matched) {
        setMatchScore(distance);
        setPhase('success');
        onVerified(selfieDescriptor, distance, selfieBase64);
      } else {
        handleFailure('We were unable to verify a match with your ID. Please ensure good lighting and that you are not wearing glasses, hats, or masks.');
      }
    } catch (err) {
      handleFailure('An error occurred while securely comparing your images. Please try again.');
    }
  };

  const handleFailure = (msg) => {
    stopCamera();
    stopLoop();
    setErrorMsg(msg);
    setAttempts((prev) => {
      const next = prev + 1;
      setPhase(next >= MAX_ATTEMPTS ? 'locked' : 'failed');
      return next;
    });
  };

  // ── Render ──

  if (phase === 'preparing') {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress size={52} sx={{ color: '#EE791A', mb: 2 }} />
        <Typography variant="body1" sx={{ fontWeight: 600, color: '#000', mb: 1 }}>
          Optimizing AI Models…
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)' }}>
          Loading high-accuracy face verification engine
        </Typography>
      </Box>
    );
  }

  if (phase === 'guide') {
    return (
      <Box>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 60, height: 60, borderRadius: '50%', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #EE791A 0%, #c05905 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CameraAltIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Selfie Verification</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
            We'll use a live camera check to compare your face securely against your ID. No photos are stored.
          </Typography>
        </Box>
        
        {isPDF && <Alert severity="warning" sx={{ mb: 2 }}>PDF IDs cannot be used for facial matching. Please go back.</Alert>}

        <OrangeBtn onClick={startCamera} icon={<CameraAltIcon fontSize="small" />} disabled={isPDF}>
          Start Camera
        </OrangeBtn>
      </Box>
    );
  }

  if (phase === 'active') {
    return (
      <Box>
        {/* Top Status */}
        <Box sx={{
          mb: 1.5, px: 2, py: 1.5, borderRadius: 1,
          bgcolor: feedbackColor.replace(/[\d.]+\)$/g, '0.1)'), // make bg 10% opacity
          border: `1px solid ${feedbackColor}`,
          display: 'flex', alignItems: 'center', gap: 1, transition: 'all 0.3s',
        }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: feedbackColor?.replace(/[\d.]+\)$/g, '1)') }}>
            {feedbackMsg}
          </Typography>
        </Box>

        {/* Video Area */}
        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: '#111', aspectRatio: '4/3' }}>
          <video ref={videoRef} autoPlay muted playsInline style={{
            width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block',
          }} />
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 52% 68% at 50% 47%, transparent 75%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -52%)',
            width: '45%', height: '65%', // slightly tighter 
            border: `4px solid ${boxColor}`, borderRadius: '50%',
            transition: 'border-color 0.3s', pointerEvents: 'none',
          }} />
          
          {camStage === 'capturing' && (
            <Box sx={{ position:'absolute', bottom:0, left:0, right:0, height:6 }}>
              <LinearProgress variant="determinate" value={capturingProgress} sx={{ height:'100%', '& .MuiLinearProgress-bar': { bgcolor:'#EE791A' }}} />
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  if (phase === 'comparing') {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress size={64} sx={{ color: '#EE791A', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Comparing Faces…</Typography>
      </Box>
    );
  }

  if (phase === 'success') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Verified ✓</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)', mb: 2 }}>
          Your face matches the ID securely.
        </Typography>
        {matchScore !== null && (
          <Box sx={{ display:'inline-block', p:1, bgcolor:'rgba(76,175,80,0.1)', color:'#2e7d32', borderRadius:1, fontSize:'0.8rem', fontWeight:600 }}>
            Confidence: {((1 - matchScore / MATCH_THRESHOLD) * 100).toFixed(0)}%
          </Box>
        )}
      </Box>
    );
  }

  if (phase === 'failed') {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CancelIcon sx={{ fontSize: 64, color: '#f44336', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Verification Unsuccessful</Typography>
        <Alert severity="error" sx={{ mx: 'auto', mt: 1, mb: 2, textAlign: 'left', fontSize:'0.85rem' }}>{errorMsg}</Alert>
        <OrangeBtn onClick={() => { setPhase('guide'); }} icon={<RefreshIcon fontSize="small" />}>Try Again</OrangeBtn>
      </Box>
    );
  }
  
  if (phase === 'locked') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <WarningAmberIcon sx={{ fontSize: 64, color: '#ff9800', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Locked Out</Typography>
        <Typography variant="body2" sx={{ mb: 2, color:'rgba(0,0,0,0.6)' }}>Maximum attempts reached.</Typography>
        <OrangeBtn onClick={() => { setAttempts(0); setPhase('guide'); }} variant="outline">Start Over</OrangeBtn>
      </Box>
    );
  }
  
  if (phase === 'error') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CancelIcon sx={{ fontSize: 48, color: '#f44336', mb:1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Error</Typography>
        <Alert severity="error" sx={{ mb:2, textAlign:'left' }}>{errorMsg}</Alert>
        <OrangeBtn onClick={() => window.location.reload()}>Refresh</OrangeBtn>
      </Box>
    );
  }
  
  if (phase === 'no_camera') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <NoPhotographyIcon sx={{ fontSize: 48, color: 'rgba(0,0,0,0.3)', mb:1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Camera Required</Typography>
        <Typography variant="body2" sx={{ mb:2, color:'rgba(0,0,0,0.6)' }}>Please allow camera access in your browser.</Typography>
        <OrangeBtn onClick={startCamera}>Try Again</OrangeBtn>
      </Box>
    );
  }

  return null;
};

export default FaceVerificationStep;
