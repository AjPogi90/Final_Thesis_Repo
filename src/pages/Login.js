import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      case 'auth/user-not-found':
        return 'Incorrect email or password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Password reset email sent. Check your inbox.');
      setResetEmail('');
      setTimeout(() => setResetMode(false), 2000);
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Box sx={{ p: { xs: 3, sm: 4 }, width: 420, maxWidth: '92%', borderRadius: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', bgcolor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Box component="img" src="/HeaderLogoImage.png" alt="logo" onError={(e) => { e.target.onerror = null; e.target.src = '/HeaderLogo.png'; }} sx={{ width: 120, height: 'auto', display: 'block', mx: 'auto' }} />
        </Box>



        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,0,0,0.08)', color: '#fff' }}>{error}</Alert>}
        {forwardedMessage && <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(0,255,0,0.04)', color: '#fff' }}>{forwardedMessage}</Alert>}
        {resetSuccess && <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(0,255,0,0.04)', color: '#fff' }}>{resetSuccess}</Alert>}

        {!resetMode ? (
          <form onSubmit={handleLogin}>
            <Typography variant="h5" align="center" mb={1} sx={{ fontWeight: 800, color: '#fff' }}>AegistNet Login</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, textAlign: 'center' }}>Welcome back! Please sign in to continue</Typography>

            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required disabled={loading} variant="filled" sx={{ '& .MuiFilledInput-root': { bgcolor: '#0f0f0f', borderRadius: 1 }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }} InputProps={{ sx: { color: '#fff' } }} />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required disabled={loading} variant="filled" sx={{ '& .MuiFilledInput-root': { bgcolor: '#0f0f0f', borderRadius: 1 }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }} InputProps={{ sx: { color: '#fff' } }} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, borderRadius: 1 }} disabled={loading} style={{ backgroundColor: '#EE791A', color: '#fff' }}>{loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign in'}</Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <Typography variant="h5" align="center" mb={1} sx={{ fontWeight: 800, color: '#fff' }}>Password Reset</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, textAlign: 'center' }}>Enter your email to receive a password reset link</Typography>
            <TextField fullWidth label="Email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} margin="normal" required disabled={loading} variant="filled" sx={{ '& .MuiFilledInput-root': { bgcolor: '#0f0f0f', borderRadius: 1 }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' } }} InputProps={{ sx: { color: '#fff' } }} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading} style={{ backgroundColor: '#EE791A', color: '#fff' }}>{loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Reset Email'}</Button>
            <Button fullWidth variant="text" onClick={() => setResetMode(false)} disabled={loading} sx={{ color: '#6b46ff' }}>Back to Login</Button>
          </form>
        )}

        {!resetMode && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Link component="button" variant="body2" onClick={() => navigate('/register')} sx={{ color: '#6b46ff' }}>Register new account</Link>
            <Link component="button" variant="body2" onClick={(e) => { e.preventDefault(); setResetMode(true); }} sx={{ color: '#6b46ff' }}>Forgot your password?</Link>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Login;
