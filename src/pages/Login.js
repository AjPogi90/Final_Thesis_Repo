import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ADMIN_EMAIL } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/* ─────────────────────────────────────────
   Geometric floating shapes (no emoji)
───────────────────────────────────────── */
const shapes = [
  { size: 56,  top: '7%',   left: '5%',   color: '#FFD93D', delay: '0s',   dur: '6s',  type: 'star'    },
  { size: 34,  top: '15%',  left: '88%',  color: '#FF6B6B', delay: '1s',   dur: '8s',  type: 'circle'  },
  { size: 42,  top: '70%',  left: '8%',   color: '#6BCB77', delay: '2s',   dur: '7s',  type: 'diamond' },
  { size: 28,  top: '80%',  left: '85%',  color: '#4D96FF', delay: '0.5s', dur: '9s',  type: 'star'    },
  { size: 46,  top: '40%',  left: '92%',  color: '#FF922B', delay: '3s',   dur: '5s',  type: 'circle'  },
  { size: 36,  top: '55%',  left: '3%',   color: '#CC5DE8', delay: '1.5s', dur: '10s', type: 'diamond' },
  { size: 24,  top: '23%',  left: '48%',  color: '#FFD93D', delay: '2.5s', dur: '6s',  type: 'star'    },
  { size: 30,  top: '87%',  left: '44%',  color: '#74C0FC', delay: '0.8s', dur: '8s',  type: 'circle'  },
  { size: 38,  top: '5%',   left: '70%',  color: '#63E6BE', delay: '1.2s', dur: '7s',  type: 'diamond' },
  { size: 26,  top: '62%',  left: '60%',  color: '#FF6B6B', delay: '3.5s', dur: '9s',  type: 'star'    },
  { size: 22,  top: '33%',  left: '17%',  color: '#A9E34B', delay: '4s',   dur: '7s',  type: 'circle'  },
  { size: 40,  top: '48%',  left: '75%',  color: '#F783AC', delay: '0.3s', dur: '11s', type: 'diamond' },
];

const clipPaths = {
  star:    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
};

const meteors = [0, 1, 2, 3, 4];

const particles = Array.from({ length: 40 }, (_, i) => ({
  left:  `${(i * 3.7 + 1.2) % 100}%`,
  top:   `${(i * 7.3 + 0.8) % 100}%`,
  delay: `${(i * 0.23) % 4}s`,
  size:  i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
  color: ['#FFD93D', '#74C0FC', '#6BCB77', '#F783AC', '#CC5DE8', '#FF922B'][i % 6],
}));

const CSS = `
  @keyframes bgShift {
    0%   { background-position: 0% 50%;   }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%;   }
  }
  @keyframes floatShape {
    0%, 100% { transform: translateY(0px)   scale(1);    }
    50%       { transform: translateY(-22px) scale(1.08); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.65; }
    50%       { opacity: 1;   }
  }
  @keyframes meteor {
    0%   { transform: translateX(0)    translateY(0)    rotate(-45deg); opacity: 1; }
    70%  { opacity: 1; }
    100% { transform: translateX(600px) translateY(600px) rotate(-45deg); opacity: 0; }
  }
  @keyframes borderGlow {
    0%   { box-shadow: 0 0 20px rgba(99,102,241,0.4),  0 24px 60px rgba(0,0,0,0.45); }
    33%  { box-shadow: 0 0 30px rgba(139,92,246,0.5),  0 24px 60px rgba(0,0,0,0.45); }
    66%  { box-shadow: 0 0 30px rgba(219,39,119,0.5),  0 24px 60px rgba(0,0,0,0.45); }
    100% { box-shadow: 0 0 20px rgba(99,102,241,0.4),  0 24px 60px rgba(0,0,0,0.45); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.4); }
  }
  @keyframes morphBlob {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50%       { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  .login-card { animation: borderGlow 4s ease-in-out infinite; }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const forwardedMessage = location.state?.message || '';

  const getFriendlyError = (code) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found': return 'Incorrect email or password. Please try again.';
      case 'auth/invalid-email':  return 'Please enter a valid email address.';
      case 'auth/user-disabled':  return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests': return 'Too many failed attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.';
      default: return 'Something went wrong. Please try again.';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      navigate(result.user.email === ADMIN_EMAIL ? '/admin' : '/dashboard');
    } catch (err) { setError(getFriendlyError(err.code)); }
    finally { setLoading(false); }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault(); setError(''); setResetSuccess(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Password reset email sent. Check your inbox.');
      setResetEmail('');
      setTimeout(() => setResetMode(false), 2000);
    } catch (err) { setError(getFriendlyError(err.code)); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <Box sx={{
        width: '100%', minHeight: '100vh', position: 'relative',
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        justifyContent: 'center', py: 6,
        background: 'linear-gradient(-45deg, #1e3a8a, #2563EB, #7c3aed, #db2777, #0ea5e9)',
        backgroundSize: '400% 400%',
        animation: 'bgShift 10s ease infinite',
      }}>

        {/* Dot-grid overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Morphing blobs */}
        <Box sx={{ position: 'absolute', top: '-15%', left: '-12%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(255,217,61,0.28) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, animation: 'morphBlob 8s ease-in-out infinite' }} />
        <Box sx={{ position: 'absolute', bottom: '-15%', right: '-12%', width: 520, height: 520, background: 'radial-gradient(circle, rgba(107,203,119,0.22) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0, animation: 'morphBlob 11s ease-in-out 2s infinite reverse' }} />
        <Box sx={{ position: 'absolute', top: '35%', right: '10%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(204,93,232,0.22) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, animation: 'morphBlob 9s ease-in-out 1s infinite' }} />

        {/* Twinkling particle dots */}
        {particles.map((p, i) => (
          <Box key={`p${i}`} sx={{
            position: 'absolute', left: p.left, top: p.top,
            width: p.size, height: p.size, borderRadius: '50%',
            bgcolor: p.color, zIndex: 1,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out ${p.delay} infinite`,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }} />
        ))}

        {/* Shooting star streaks */}
        {meteors.map((_, i) => (
          <Box key={`m${i}`} sx={{
            position: 'absolute', top: `${5 + i * 18}%`, left: '-5%',
            width: 120, height: 2,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), transparent)',
            borderRadius: 4, zIndex: 2,
            animation: `meteor ${3 + i * 1.5}s linear ${i * 2.5}s infinite`,
            '&::after': {
              content: '""', position: 'absolute', right: 0, top: '-1px',
              width: 6, height: 6, borderRadius: '50%',
              bgcolor: '#fff', boxShadow: '0 0 8px #fff',
            },
          }} />
        ))}

        {/* CSS geometric shapes (no emoji) */}
        {shapes.map((s, i) => (
          <Box key={`s${i}`} sx={{
            position: 'absolute', top: s.top, left: s.left,
            width: s.size, height: s.size,
            bgcolor: s.color,
            borderRadius: s.type === 'circle' ? '50%' : 0,
            clipPath: s.type !== 'circle' ? clipPaths[s.type] : undefined,
            zIndex: 2,
            animation: `floatShape ${s.dur} ease-in-out ${s.delay} infinite, pulseGlow 3s ease-in-out ${s.delay} infinite`,
            boxShadow: `0 0 18px ${s.color}aa`,
            filter: `brightness(1.1)`,
          }} />
        ))}

        {/* Login Card */}
        <Box className="login-card" sx={{
          position: 'relative', zIndex: 10,
          p: { xs: 3, sm: 4 }, width: 420, maxWidth: '92%',
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.22)',
          color: '#fff',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'translateY(-4px)' },
        }}>

          {/* Logo mark */}
          <Box sx={{ mb: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '18px',
              background: 'linear-gradient(135deg, #2563EB, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 28px rgba(37,99,235,0.5)',
            }}>
              <SecurityIcon sx={{ color: '#fff', fontSize: 36 }} />
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,0,0,0.15)', color: '#fff', border: '1px solid rgba(255,100,100,0.3)' }}>{error}</Alert>}
          {forwardedMessage && <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(0,255,0,0.1)', color: '#fff' }}>{forwardedMessage}</Alert>}
          {resetSuccess && <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(0,255,0,0.1)', color: '#fff' }}>{resetSuccess}</Alert>}

          {!resetMode ? (
            <form onSubmit={handleLogin}>
              <Typography variant="h5" align="center" mb={0.5} sx={{ fontWeight: 800, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                AegistNet Login
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 1.5, textAlign: 'center' }}>
                Welcome back! Please sign in to continue
              </Typography>

              <TextField fullWidth label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} margin="normal" required disabled={loading} variant="filled"
                sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' }, '& .MuiFilledInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.3)' } }}
                InputProps={{ sx: { color: '#fff' } }}
              />
              <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} margin="normal" required disabled={loading} variant="filled"
                sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' }, '& .MuiFilledInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.3)' } }}
                InputProps={{
                  sx: { color: '#fff' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={loading}
                sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.4, fontWeight: 800, fontSize: '1rem', textTransform: 'none', background: 'linear-gradient(90deg, #2563EB, #7c3aed)', boxShadow: '0 4px 24px rgba(37,99,235,0.6)', '&:hover': { background: 'linear-gradient(90deg, #1D4ED8, #6d28d9)', boxShadow: '0 6px 32px rgba(99,102,241,0.7)', transform: 'translateY(-2px)' } }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <Typography variant="h5" align="center" mb={0.5} sx={{ fontWeight: 800, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                Password Reset
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 1, textAlign: 'center' }}>
                Enter your email to receive a password reset link
              </Typography>
              <TextField fullWidth label="Email" type="email" value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)} margin="normal" required disabled={loading} variant="filled"
                sx={{ '& .MuiFilledInput-root': { bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2 }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' } }}
                InputProps={{ sx: { color: '#fff' } }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={loading}
                sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.4, fontWeight: 800, textTransform: 'none', background: 'linear-gradient(90deg, #2563EB, #7c3aed)', boxShadow: '0 4px 24px rgba(37,99,235,0.6)', '&:hover': { background: 'linear-gradient(90deg, #1D4ED8, #6d28d9)', transform: 'translateY(-2px)' } }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Reset Email'}
              </Button>
              <Button fullWidth variant="text" onClick={() => setResetMode(false)} disabled={loading} sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none', '&:hover': { color: '#fff' } }}>
                Back to Login
              </Button>
            </form>
          )}

          {!resetMode && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Link component="button" variant="body2" onClick={() => navigate('/register')}
                sx={{ color: 'rgba(255,255,255,0.85)', textDecorationColor: 'rgba(255,255,255,0.4)', '&:hover': { color: '#FFD93D' }, transition: 'color 0.2s' }}>
                Register new account
              </Link>
              <Link component="button" variant="body2" onClick={(e) => { e.preventDefault(); setResetMode(true); }}
                sx={{ color: 'rgba(255,255,255,0.85)', textDecorationColor: 'rgba(255,255,255,0.4)', '&:hover': { color: '#FFD93D' }, transition: 'color 0.2s' }}>
                Forgot your password?
              </Link>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Login;
