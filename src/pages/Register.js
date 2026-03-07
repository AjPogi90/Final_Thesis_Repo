import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  Link,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import IDVerificationStep from '../components/IDVerificationStep';

const steps = ['Verify Identity', 'Create Account'];

const Register = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Stepper
  const [activeStep, setActiveStep] = useState(0);

  // Step 1 – ID Verification
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idFile, setIdFile] = useState(null);

  // Step 2 – Account details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Shared state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // ── Age helpers ──
  const calculateAge = (dateString) => {
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const isStep1Valid = dateOfBirth && calculateAge(dateOfBirth) >= 18 && idFile;

  // ── Handlers ──
  const handleNext = () => {
    setError('');
    if (activeStep === 0) {
      if (!dateOfBirth) return setError('Please enter your date of birth.');
      if (calculateAge(dateOfBirth) < 18) return setError('You must be at least 18 years old to register.');
      if (!idFile) return setError('Please upload a government-issued ID.');
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    const result = await signup(email, password, name, idFile, dateOfBirth);
    setLoading(false);
    if (result.success) {
      setRegistered(true);
      setVerificationSent(Boolean(result.verificationSent));
      setInfoMessage(result.verificationSent ? 'Verification email sent. Please check your inbox.' : 'Account created. Verification email could not be sent automatically.');
    } else {
      setError(result.error?.message || 'Registration failed');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const current = auth.currentUser;
      if (!current) throw new Error('No authenticated user found to send verification. Please login and resend.');
      await sendEmailVerification(current);
      setVerificationSent(true);
      setInfoMessage('Verification email resent. Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Shared field styling ──
  const fieldSx = { mb: 2 };
  const inputProps = { sx: { bgcolor: '#0f0f0f', color: '#fff', borderRadius: 1 } };
  const labelProps = { sx: { color: 'rgba(255,255,255,0.7)' } };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Box sx={{ p: { xs: 3, sm: 4 }, width: 560, maxWidth: '94%', borderRadius: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', bgcolor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box component="img" src="/HeaderLogoImage.png" alt="logo" onError={(e) => { e.target.onerror = null; e.target.src = '/HeaderLogo.png'; }} sx={{ width: 140, mx: 'auto', display: 'block' }} />
        </Box>

        <Typography variant="h5" align="center" mb={1} sx={{ fontWeight: '800', color: '#fff' }}>
          Create AegistNet Account
        </Typography>

        {/* Stepper */}
        {!registered && (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 3, mt: 2,
              '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontWeight: 500 },
              '& .MuiStepLabel-label.Mui-active': { color: '#EE791A', fontWeight: 700 },
              '& .MuiStepLabel-label.Mui-completed': { color: '#4caf50' },
              '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.12)' },
              '& .MuiStepIcon-root.Mui-active': { color: '#EE791A' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' },
              '& .MuiStepConnector-line': { borderColor: 'rgba(255,255,255,0.08)' },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!registered ? (
          <>
            {/* ──── STEP 1: Identity Verification ──── */}
            {activeStep === 0 && (
              <Box>
                <IDVerificationStep
                  dateOfBirth={dateOfBirth}
                  setDateOfBirth={setDateOfBirth}
                  idFile={idFile}
                  setIdFile={setIdFile}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: 3, py: 1.4,
                    backgroundColor: '#EE791A',
                    '&:hover': { backgroundColor: '#c05905' },
                    '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' },
                    fontWeight: 600, fontSize: '0.95rem',
                  }}
                >
                  Continue to Account Setup
                </Button>

                <Box mt={2} textAlign="center">
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Already have an account?{' '}
                    <Link component="button" variant="body2" onClick={() => navigate('/login')} sx={{ color: '#EE791A' }}>Sign in</Link>
                  </Typography>
                </Box>
              </Box>
            )}

            {/* ──── STEP 2: Account Details ──── */}
            {activeStep === 1 && (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, textAlign: 'center' }}>
                  Identity verified! Now set up your parent account.
                </Typography>

                <TextField fullWidth label="Full name" value={name} onChange={(e) => setName(e.target.value)} sx={fieldSx} variant="filled" InputProps={inputProps} InputLabelProps={labelProps} />
                <TextField fullWidth label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={fieldSx} required variant="filled" InputProps={inputProps} InputLabelProps={labelProps} />
                <TextField fullWidth label="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={fieldSx} required variant="filled" InputProps={inputProps} InputLabelProps={labelProps}
                  helperText="At least 6 characters"
                  FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.3)' } }}
                />
                <TextField fullWidth label="Confirm password *" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} sx={{ mb: 3 }} required variant="filled" InputProps={inputProps} InputLabelProps={labelProps} />

                {/* Navigation buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      flex: '0 0 auto', py: 1.3,
                      color: 'rgba(255,255,255,0.7)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.4,
                      backgroundColor: '#EE791A',
                      '&:hover': { backgroundColor: '#c05905' },
                      fontWeight: 600, fontSize: '0.95rem',
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                        <span>Creating account...</span>
                      </Box>
                    ) : 'Create account'}
                  </Button>
                </Box>

                <Box mt={2} textAlign="center">
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Already have an account?{' '}
                    <Link component="button" variant="body2" onClick={() => navigate('/login')} sx={{ color: '#EE791A' }}>Sign in</Link>
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        ) : (
          // ──── Post-registration ────
          <Box>
            {infoMessage && <Alert severity="success" sx={{ mb: 2 }}>{infoMessage}</Alert>}
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Button variant="contained" onClick={handleResend} disabled={resendLoading} sx={{ backgroundColor: '#EE791A', '&:hover': { backgroundColor: '#c05905' } }}>
                {resendLoading ? 'Resending...' : (verificationSent ? 'Resend verification email' : 'Send verification email')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.12)' }}>
                Go to Login
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Register;
