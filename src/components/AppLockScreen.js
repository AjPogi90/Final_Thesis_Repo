import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/BackspaceRounded';
import LockIcon from '@mui/icons-material/LockRounded';
import FingerprintIcon from '@mui/icons-material/FingerprintRounded';

const PIN_LENGTH = 4;

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export default function AppLockScreen({ onUnlock }) {
  const [pin,        setPin]        = useState('');
  const [shake,      setShake]      = useState(false);
  const [attempts,   setAttempts]   = useState(0);
  const [lockedOut,  setLockedOut]  = useState(false);
  const [countdown,  setCountdown]  = useState(0);
  const [errorMsg,   setErrorMsg]   = useState('');

  // ── Lockout countdown timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!lockedOut) return;
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setLockedOut(false);
          setAttempts(0);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedOut]);

  // ── Auto-submit when PIN is full ─────────────────────────────────────────────
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleSubmit(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleSubmit = useCallback(async (enteredPin) => {
    const success = await onUnlock(enteredPin);
    if (success) return; // parent will unmount this component

    // Wrong PIN
    setShake(true);
    setTimeout(() => setShake(false), 600);
    setPin('');

    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= 5) {
      setLockedOut(true);
      setErrorMsg('Too many attempts. Try again in 30 seconds.');
    } else {
      setErrorMsg(`Incorrect PIN. ${5 - newAttempts} attempt${5 - newAttempts === 1 ? '' : 's'} left.`);
    }
  }, [onUnlock, attempts]);

  const handleKey = useCallback((key) => {
    if (lockedOut) return;
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
      setErrorMsg('');
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    setPin(p => p + key);
  }, [pin, lockedOut]);

  return (
    <Box
      sx={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        // Premium glass-morphism dark background
        background:      'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a2e 100%)',
        backdropFilter:  'blur(20px)',
        userSelect:      'none',
      }}
    >
      {/* ── Background decorative circles ── */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(3)].map((_, i) => (
          <Box key={i} sx={{
            position:     'absolute',
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            width:        ['500px', '300px', '400px'][i],
            height:       ['500px', '300px', '400px'][i],
            top:          ['-10%', '60%', '20%'][i],
            left:         ['-10%', '70%', '40%'][i],
            animation:    `pulse${i} 8s ease-in-out infinite`,
          }} />
        ))}
      </Box>

      {/* ── Logo & Title ── */}
      <Box sx={{ textAlign: 'center', mb: 5, position: 'relative' }}>
        <Box sx={{
          width:          80,
          height:         80,
          borderRadius:   '24px',
          background:     'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          mx:             'auto',
          mb:             2,
          boxShadow:      '0 0 40px rgba(99,102,241,0.4)',
        }}>
          <LockIcon sx={{ fontSize: 40, color: '#fff' }} />
        </Box>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1 }}>
          AegisNet
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
          {lockedOut ? `Locked out — wait ${countdown}s` : 'Enter your PIN to continue'}
        </Typography>
      </Box>

      {/* ── PIN Dots ── */}
      <Box
        sx={{
          display:       'flex',
          gap:           2,
          mb:            2,
          transform:     shake ? 'translateX(0)' : undefined,
          animation:     shake ? 'shake 0.5s ease' : undefined,
          '@keyframes shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '20%':      { transform: 'translateX(-10px)' },
            '40%':      { transform: 'translateX(10px)' },
            '60%':      { transform: 'translateX(-10px)' },
            '80%':      { transform: 'translateX(10px)' },
          },
        }}
      >
        {[...Array(PIN_LENGTH)].map((_, i) => (
          <Box key={i} sx={{
            width:        18,
            height:       18,
            borderRadius: '50%',
            border:       '2px solid',
            borderColor:  pin.length > i ? '#6366f1' : 'rgba(255,255,255,0.3)',
            background:   pin.length > i
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'transparent',
            boxShadow:    pin.length > i ? '0 0 12px rgba(99,102,241,0.8)' : 'none',
            transition:   'all 0.2s ease',
            transform:    pin.length > i ? 'scale(1.2)' : 'scale(1)',
          }} />
        ))}
      </Box>

      {/* ── Error message ── */}
      <Collapse in={!!errorMsg}>
        <Typography variant="caption" sx={{
          color:     '#f87171',
          mb:        2,
          display:   'block',
          textAlign: 'center',
          minHeight: 20,
        }}>
          {errorMsg}
        </Typography>
      </Collapse>

      {/* ── Number Pad ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: errorMsg ? 0 : 2 }}>
        {KEYS.map((row, ri) => (
          <Box key={ri} sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
            {row.map((key, ki) => {
              if (key === '') return <Box key={ki} sx={{ width: 72, height: 72 }} />;

              const isDel = key === 'del';
              return (
                <Box
                  key={ki}
                  component="button"
                  onClick={() => handleKey(key)}
                  disabled={lockedOut}
                  sx={{
                    width:           72,
                    height:          72,
                    borderRadius:    '50%',
                    border:          isDel ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    background:      isDel
                      ? 'transparent'
                      : 'rgba(255,255,255,0.06)',
                    color:           '#fff',
                    fontSize:        isDel ? 'inherit' : '1.5rem',
                    fontWeight:      600,
                    cursor:          lockedOut ? 'not-allowed' : 'pointer',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    backdropFilter:  'blur(10px)',
                    transition:      'all 0.15s ease',
                    opacity:         lockedOut ? 0.3 : 1,
                    '&:hover': {
                      background:   isDel ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.3)',
                      borderColor:  '#6366f1',
                      transform:    'scale(1.05)',
                      boxShadow:    '0 0 20px rgba(99,102,241,0.3)',
                    },
                    '&:active': {
                      transform:   'scale(0.95)',
                      background:  'rgba(99,102,241,0.5)',
                    },
                  }}
                >
                  {isDel ? <BackspaceIcon sx={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }} /> : key}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* ── Footer ── */}
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', mt: 5 }}>
        🔒 AegisNet Parental Control — Protected
      </Typography>

      <style>{`
        @keyframes pulse0 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes pulse1 { 0%,100%{transform:scale(1.1)} 50%{transform:scale(0.9)} }
        @keyframes pulse2 { 0%,100%{transform:scale(0.9)} 50%{transform:scale(1.05)} }
      `}</style>
    </Box>
  );
}
