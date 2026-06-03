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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import IDVerificationStep from '../../components/IDVerificationStep';
import FaceVerificationStep from '../../components/FaceVerificationStep';
import AccountDetailsForm from './AccountDetailsForm';
import RegistrationSuccess from './RegistrationSuccess';
const STEPS = ['Data Privacy', 'Upload ID', 'Verify Face', 'Create Account'];

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

  // ── Step 0: Data Privacy ─────────────────────────────────────────────────────
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // ── Step 1 data (ID Upload) ──────────────────────────────────────────────────
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [declared, setDeclared] = useState(false); // user confirmed it's a gov ID

  // ── Step 2 data (Face Verification) ─────────────────────────────────────────
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

  const isStep1Valid = dateOfBirth && calculateAge(dateOfBirth) >= 18 && idFile && declared;

  // ── Step 0 → Step 1 (Privacy → ID Upload) ───────────────────────────────────
  const handlePrivacyNext = () => {
    if (!privacyAccepted) return;
    setActiveStep(1);
  };

  // ── Step 1 → Step 2 (ID Upload → Face Verification) ─────────────────────────
  const handleNext = () => {
    setError('');
    if (!dateOfBirth) return setError('Please enter your date of birth.');
    if (calculateAge(dateOfBirth) < 18) return setError('You must be at least 18 years old to register.');
    if (!idFile) return setError('Please upload a government-issued ID.');
    if (!declared) return setError('Please confirm that your uploaded ID is a valid government-issued ID.');
    setActiveStep(2);
  };

  // ── Called by FaceVerificationStep on success ────────────────────────────────
  const handleFaceVerified = (descriptor, matchScore, selfieImgBase64) => {
    setFaceDescriptor(descriptor);
    setFaceMatchScore(matchScore);
    setSelfieBase64(selfieImgBase64);
    setActiveStep(3);
  };

  // ── Back navigation ──────────────────────────────────────────────────────────
  const handleBack = () => {
    setError('');
    setActiveStep((s) => Math.max(0, s - 1));
  };

  // ── Step 2 form submission ───────────────────────────────────────────────────
  const handleFormSubmit = async ({ firstName, middleName, lastName, email, password }) => {
    setError('');
    setLoading(true);

    const result = await signup(email, password, { firstName, middleName, lastName }, dateOfBirth);

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
            {/* ── STEP 0: Data Privacy Consent ── */}
            {activeStep === 0 && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(0,0,0,0.5)', mb: 2, textAlign: 'center' }}
                >
                  Before proceeding, please read and accept our Data Privacy Notice.
                </Typography>

                <Box
                  sx={{
                    mb: 2, p: 1.5, borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: privacyAccepted ? 'rgba(238,121,26,0.4)' : 'rgba(0,0,0,0.1)',
                    bgcolor: privacyAccepted ? 'rgba(238,121,26,0.04)' : 'rgba(0,0,0,0.02)',
                    transition: 'border-color 0.2s, background-color 0.2s',
                  }}
                >
                  {/* Full privacy text — always visible */}
                  <Box
                    sx={{
                      mb: 1.5, p: 1.5, borderRadius: 1,
                      bgcolor: 'rgba(0,0,0,0.03)',
                      border: '1px solid rgba(0,0,0,0.07)',
                      maxHeight: 240, overflowY: 'auto',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: 'rgba(0,0,0,0.65)', lineHeight: 1.7 }}>
                      <strong>DATA PRIVACY NOTICE — AegisNet Parental Control System</strong>
                      <br /><br />
                      In compliance with the <strong>Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and
                      its Implementing Rules and Regulations, AegisNet informs you of the following:
                      <br /><br />
                      <strong>1. Data Collected</strong><br />
                      We collect your: full name, email address, date of birth, government-issued ID image,
                      and facial biometric data (face descriptor vectors and selfie image) for identity
                      verification purposes only.
                      <br /><br />
                      <strong>2. Purpose of Processing</strong><br />
                      Your data is collected to verify your identity as a parent/guardian, prevent fraudulent
                      account creation, and secure access to the parental control dashboard. Biometric data
                      is not used for any commercial purpose.
                      <br /><br />
                      <strong>3. Data Retention</strong><br />
                      Your personal and biometric data will be retained for the duration of your active
                      account. You may request deletion at any time by contacting our support team.
                      <br /><br />
                      <strong>4. Your Rights</strong><br />
                      Under RA 10173, you have the right to: access your personal data, correct inaccuracies,
                      object to processing, and request erasure of your data. To exercise these rights,
                      contact us through the Help &amp; Support section.
                      <br /><br />
                      <strong>5. Data Security</strong><br />
                      We implement appropriate technical and organizational measures to protect your data
                      against unauthorized access, disclosure, alteration, or destruction.
                    </Typography>
                  </Box>

                  {/* Consent checkbox */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="privacy-consent-checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        size="small"
                        sx={{
                          color: 'rgba(0,0,0,0.4)',
                          '&.Mui-checked': { color: '#EE791A' },
                          pt: 0, alignSelf: 'flex-start', mt: 0.2,
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.7)', lineHeight: 1.5 }}>
                        I have read and agree to the{' '}
                        <strong>Data Privacy Notice</strong>
                        {' '}and consent to the collection and processing of my personal and biometric data in
                        accordance with the{' '}
                        <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong>.
                      </Typography>
                    }
                    alignItems="flex-start"
                    sx={{ mr: 0, mt: 0.5 }}
                  />
                </Box>

                <Box
                  component="button"
                  type="button"
                  onClick={handlePrivacyNext}
                  disabled={!privacyAccepted}
                  aria-label="Accept privacy notice and continue"
                  sx={{
                    mt: 1, width: '100%', py: 1.4, px: 3,
                    border: 'none', borderRadius: 1,
                    cursor: privacyAccepted ? 'pointer' : 'not-allowed',
                    backgroundColor: privacyAccepted ? '#EE791A' : 'rgba(0,0,0,0.06)',
                    color: privacyAccepted ? '#fff' : 'rgba(0,0,0,0.25)',
                    fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit',
                    transition: 'background-color 0.2s ease',
                    '&:hover': privacyAccepted ? { backgroundColor: '#c05905' } : {},
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                  }}
                >
                  I Agree — Continue to Registration →
                </Box>

                <Box mt={2} textAlign="center">
                  <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                    Already have an account?{' '}
                    <Link
                      component="button" type="button" variant="body2"
                      onClick={() => navigate('/')}
                      sx={{ color: '#EE791A' }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            )}

            {/* ── STEP 1: Identity + ID Upload ── */}
            {activeStep === 1 && (
              <Box>
                <IDVerificationStep
                  dateOfBirth={dateOfBirth}
                  setDateOfBirth={setDateOfBirth}
                  idFile={idFile}
                  setIdFile={setIdFile}
                  declared={declared}
                  setDeclared={setDeclared}
                />

                <Box
                  component="button"
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  aria-label="Continue to selfie verification"
                  sx={{
                    mt: 3, width: '100%', py: 1.4, px: 3,
                    border: 'none', borderRadius: 1,
                    cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                    backgroundColor: isStep1Valid ? '#EE791A' : 'rgba(0,0,0,0.06)',
                    color: isStep1Valid ? '#fff' : 'rgba(0,0,0,0.25)',
                    fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit',
                    transition: 'background-color 0.2s ease',
                    '&:hover': isStep1Valid ? { backgroundColor: '#c05905' } : {},
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                  }}
                >
                  {loading && activeStep === 1 ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Continue to Selfie Verification →'
                  )}
                </Box>

                <Box mt={2} textAlign="center">
                  <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                    Already have an account?{' '}
                    <Link
                      component="button" type="button" variant="body2"
                      onClick={() => navigate('/')}
                      sx={{ color: '#EE791A' }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            )}

            {/* ── STEP 2: Face Verification ── */}
            {activeStep === 2 && (
              <Box>
                <FaceVerificationStep
                  idFile={idFile}
                  onVerified={handleFaceVerified}
                />
                <Box
                  component="button"
                  type="button"
                  onClick={handleBack}
                  sx={{
                    mt: 2, width: '100%', py: 1,
                    border: 'none', borderRadius: 1,
                    bgcolor: 'transparent', color: 'rgba(0,0,0,0.45)',
                    fontSize: '0.85rem', fontFamily: 'inherit',
                    cursor: 'pointer', fontWeight: 500,
                    '&:hover': { color: '#EE791A' },
                  }}
                >
                  ← Back to ID Upload
                </Box>
              </Box>
            )}

            {/* ── STEP 3: Account Details ── */}
            {activeStep === 3 && (
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
