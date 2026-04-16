import React, { useState } from 'react';
import {
  Box,
  Typography,
  Link,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import IDVerificationStep from '../../components/IDVerificationStep';
import FaceVerificationStep from '../../components/FaceVerificationStep';
import AccountDetailsForm from './AccountDetailsForm';
import RegistrationSuccess from './RegistrationSuccess';
const STEPS = ['Upload ID', 'Verify Face', 'Create Account'];

/**
 * Register/index.js — Main orchestrator (3-step wizard)
 *
 * Step 0  — IDVerificationStep   : date of birth + government ID upload
 * Step 1  — FaceVerificationStep : live selfie + liveness + face matching vs ID
 * Step 2  — AccountDetailsForm   : name, email, password (React Hook Form + Zod)
 *
 * On completion →  RegistrationSuccess
 */
const Register = () => {
  const { signup, uploadVerificationId, storeFaceDescriptor } = useAuth();
  const navigate = useNavigate();

  // ── Wizard state ────────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);

  // ── Step 0 data ─────────────────────────────────────────────────────────────
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idFile, setIdFile] = useState(null);

  // ── Step 1 data ─────────────────────────────────────────────────────────────
  const [faceDescriptor, setFaceDescriptor] = useState(null); // Float32Array
  const [faceMatchScore, setFaceMatchScore] = useState(null);
  const [selfieBase64, setSelfieBase64] = useState(null);

  // ── Shared async state ───────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  // ── Post-registration state ──────────────────────────────────────────────────
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // ── Age helper ───────────────────────────────────────────────────────────────
  const calculateAge = (dateString) => {
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const isStep0Valid = dateOfBirth && calculateAge(dateOfBirth) >= 18 && idFile;

  // ── Step 0 → Step 1 ─────────────────────────────────────────────────────────
  const handleNext = () => {
    setError('');
    if (!dateOfBirth) return setError('Please enter your date of birth.');
    if (calculateAge(dateOfBirth) < 18) return setError('You must be at least 18 years old to register.');
    if (!idFile) return setError('Please upload a government-issued ID.');
    setActiveStep(1);
  };

  // ── Called by FaceVerificationStep on success ────────────────────────────────
  const handleFaceVerified = (descriptor, matchScore, selfieImgBase64) => {
    setFaceDescriptor(descriptor);
    setFaceMatchScore(matchScore);
    setSelfieBase64(selfieImgBase64);
    setActiveStep(2);
  };

  // ── Step 1 → Step 0 (back) ──────────────────────────────────────────────────
  const handleBack = () => {
    setError('');
    setActiveStep((s) => Math.max(0, s - 1));
  };

  // ── Step 2 form submission ───────────────────────────────────────────────────
  const handleFormSubmit = async ({ name, email, password }) => {
    setError('');
    setLoading(true);

    const result = await signup(email, password, name, dateOfBirth);

    if (result.success) {
      // Upload ID (compressed to base64) — existing behaviour
      if (idFile) await uploadVerificationId(idFile);

      // Store face descriptor vector — new behaviour
      if (faceDescriptor && storeFaceDescriptor) {
        await storeFaceDescriptor(faceDescriptor, faceMatchScore, selfieBase64);
      }

      setLoading(false);
      setRegistered(true);
      setVerificationSent(Boolean(result.verificationSent));
      setInfoMessage(
        result.verificationSent
          ? 'Account created! Check your inbox to verify your email.'
          : 'Account created! Please verify your email before signing in.'
      );
    } else {
      setLoading(false);
      const code = result.error?.code;
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in or use a different email.');
      } else {
        setError(result.error?.message || 'Registration failed. Please try again.');
      }
    }
  };

  // ── Resend verification email ────────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const current = auth.currentUser;
      if (!current) throw new Error('No authenticated user found. Please login and resend.');
      await sendEmailVerification(current, {
        url: window.location.origin + '/',
        handleCodeInApp: false,
      });
      setVerificationSent(true);
      setInfoMessage('Verification email resent. Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: '#f5f6fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          width: 580,
          maxWidth: '94%',
          borderRadius: 2,
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          bgcolor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.05)',
          color: '#000',
        }}
      >
        {/* ── Logo ── */}
        <Box
          sx={{ textAlign: 'center', mb: 2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src="/LoginLogoLIght.png"
            alt="AegisNet logo"
            sx={{ width: 140, mx: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </Box>

        <Typography
          variant="h5"
          align="center"
          mb={1}
          sx={{ fontWeight: 800, color: '#000' }}
          component="h1"
        >
          Create AegistNet Account
        </Typography>

        {/* ── Stepper (3-step) ── */}
        {!registered && (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 3,
              mt: 2,
              '& .MuiStepLabel-label': { color: 'rgba(0,0,0,0.4)', fontSize: '0.78rem', fontWeight: 500 },
              '& .MuiStepLabel-label.Mui-active': { color: '#EE791A', fontWeight: 700 },
              '& .MuiStepLabel-label.Mui-completed': { color: '#4caf50' },
              '& .MuiStepIcon-root': { color: 'rgba(0,0,0,0.12)' },
              '& .MuiStepIcon-root.Mui-active': { color: '#EE791A' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#4caf50' },
              '& .MuiStepConnector-line': { borderColor: 'rgba(0,0,0,0.08)' },
            }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* ── Global error banner ── */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {registered ? (
          <RegistrationSuccess
            infoMessage={infoMessage}
            verificationSent={verificationSent}
            onResend={handleResend}
            resendLoading={resendLoading}
          />
        ) : (
          <>
            {/* ── STEP 0: Identity + ID Upload ── */}
            {activeStep === 0 && (
              <Box>
                <IDVerificationStep
                  dateOfBirth={dateOfBirth}
                  setDateOfBirth={setDateOfBirth}
                  idFile={idFile}
                  setIdFile={setIdFile}
                />

                <Box
                  component="button"
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep0Valid}
                  aria-label="Continue to selfie verification"
                  sx={{
                    mt: 3,
                    width: '100%',
                    py: 1.4,
                    px: 3,
                    border: 'none',
                    borderRadius: 1,
                    cursor: isStep0Valid ? 'pointer' : 'not-allowed',
                    backgroundColor: isStep0Valid ? '#EE791A' : 'rgba(0,0,0,0.06)',
                    color: isStep0Valid ? '#fff' : 'rgba(0,0,0,0.25)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    transition: 'background-color 0.2s ease',
                    '&:hover': isStep0Valid ? { backgroundColor: '#c05905' } : {},
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {loading && activeStep === 0 ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Continue to Selfie Verification →'
                  )}
                </Box>

                <Box mt={2} textAlign="center">
                  <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                    Already have an account?{' '}
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => navigate('/')}
                      sx={{ color: '#EE791A' }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            )}

            {/* ── STEP 1: Face Verification ── */}
            {activeStep === 1 && (
              <Box>
                <FaceVerificationStep
                  idFile={idFile}
                  onVerified={handleFaceVerified}
                />

                {/* Back to Step 0 */}
                <Box
                  component="button"
                  type="button"
                  onClick={handleBack}
                  sx={{
                    mt: 2,
                    width: '100%',
                    py: 1,
                    border: 'none',
                    borderRadius: 1,
                    bgcolor: 'transparent',
                    color: 'rgba(0,0,0,0.45)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': { color: '#EE791A' },
                  }}
                >
                  ← Back to ID Upload
                </Box>
              </Box>
            )}

            {/* ── STEP 2: Account Details ── */}
            {activeStep === 2 && (
              <AccountDetailsForm
                onBack={handleBack}
                onSubmit={handleFormSubmit}
                serverError={error}
                loading={loading}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Register;
