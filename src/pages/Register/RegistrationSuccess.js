import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * RegistrationSuccess
 *
 * Shown after a user successfully creates their account.
 * Handles the email-verification resend action.
 */
const RegistrationSuccess = ({ infoMessage, verificationSent, onResend, resendLoading }) => {
  const navigate = useNavigate();

  return (
    <Box>
      {infoMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {infoMessage}
        </Alert>
      )}

      <Typography
        variant="body2"
        sx={{ color: 'rgba(0,0,0,0.65)', mb: 3, lineHeight: 1.85 }}
      >
        Your account is now <strong>pending review</strong>. An admin will verify your
        submitted ID and approve your account before you can sign in. Please also verify
        your email address using the link we sent to your inbox.
      </Typography>

      <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
        <Button
          variant="contained"
          onClick={onResend}
          disabled={resendLoading}
          sx={{
            backgroundColor: '#EE791A',
            '&:hover': { backgroundColor: '#c05905' },
            fontWeight: 600,
          }}
        >
          {resendLoading
            ? 'Resending…'
            : verificationSent
            ? 'Resend Verification Email'
            : 'Send Verification Email'}
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{
            color: '#000',
            borderColor: 'rgba(0,0,0,0.15)',
            '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.02)' },
          }}
        >
          Go to Login
        </Button>
      </Box>
    </Box>
  );
};

export default RegistrationSuccess;
