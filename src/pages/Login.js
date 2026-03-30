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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ADMIN_EMAIL } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/user-disabled': return 'This account has been disabled. Please contact support.';
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

  // Shared field styling
  const fieldSx = { mb: 2 };
  const inputProps = { sx: { bgcolor: '#f5f5f5', color: '#000', borderRadius: 1 } };
  const labelProps = { sx: { color: 'rgba(0,0,0,0.6)' } };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Box sx={{ p: { xs: 3, sm: 4 }, width: 420, maxWidth: '94%', borderRadius: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.1)', bgcolor: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', color: '#000' }}>

        {/* Logo mark */}
        <Box sx={{ textAlign: 'center', mb: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box component="img" src="/LoginLogoLIght.png" alt="AegistNet Logo" sx={{ width: 140, mx: 'auto', display: 'block', objectFit: 'contain' }} />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {forwardedMessage && <Alert severity="success" sx={{ mb: 2 }}>{forwardedMessage}</Alert>}
        {resetSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resetSuccess}</Alert>}

        {!resetMode ? (
          <form onSubmit={handleLogin}>
            <Typography variant="h5" align="center" mb={1} sx={{ fontWeight: 800, color: '#000' }}>
              AegistNet Login
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)', mb: 3, textAlign: 'center' }}>
              Welcome back! Please sign in to continue
            </Typography>

            <TextField fullWidth label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} sx={fieldSx} required disabled={loading} variant="filled"
              InputProps={inputProps} InputLabelProps={labelProps}
            />
            <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} sx={fieldSx} required disabled={loading} variant="filled"
              InputProps={{
                ...inputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(0,0,0,0.45)' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              InputLabelProps={labelProps}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ mt: 1, mb: 2, py: 1.4, backgroundColor: '#EE791A', '&:hover': { backgroundColor: '#c05905' }, fontWeight: 600, fontSize: '0.95rem', borderRadius: 1 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <Typography variant="h5" align="center" mb={1} sx={{ fontWeight: 800, color: '#000' }}>
              Password Reset
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)', mb: 3, textAlign: 'center' }}>
              Enter your email to receive a password reset link
            </Typography>
            <TextField fullWidth label="Email" type="email" value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)} sx={fieldSx} required disabled={loading} variant="filled"
              InputProps={inputProps} InputLabelProps={labelProps}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ mt: 1, mb: 2, py: 1.4, backgroundColor: '#EE791A', '&:hover': { backgroundColor: '#c05905' }, fontWeight: 600, fontSize: '0.95rem', borderRadius: 1 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Reset Email'}
            </Button>
            <Button fullWidth variant="text" onClick={() => setResetMode(false)} disabled={loading} sx={{ color: 'rgba(0,0,0,0.6)', textTransform: 'none', '&:hover': { color: '#000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
              Back to Login
            </Button>
          </form>
        )}

        {!resetMode && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Link component="button" variant="body2" onClick={() => navigate('/register')}
              sx={{ color: '#EE791A', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Register new account
            </Link>
            <Link component="button" variant="body2" onClick={(e) => { e.preventDefault(); setResetMode(true); }}
              sx={{ color: '#EE791A', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Forgot password?
            </Link>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;
