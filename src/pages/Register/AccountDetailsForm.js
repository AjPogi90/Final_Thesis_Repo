import React, { useCallback, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';
import { accountSchema } from '../../utils/passwordSchema';
import { analyzePassword } from '../../utils/passwordSchema';

// ── shared MUI slot props ──────────────────────────────────────────────────────
const inputProps   = { sx: { bgcolor: '#f5f5f5', color: '#000', borderRadius: 1 } };
const labelProps   = { sx: { color: 'rgba(0,0,0,0.6)' } };
const fieldSx      = { mb: 2 };

/**
 * AccountDetailsForm  (Step 2 of Registration)
 *
 * Responsibilities:
 *  - Collect name, email, password, confirm-password via React Hook Form + Zod
 *  - Check email uniqueness on blur (avoids a Firebase round-trip on submit)
 *  - Show real-time password strength (zxcvbn) via PasswordStrengthIndicator
 *  - Gate submission until password is Strong (score ≥ 3) AND all regex rules pass
 */
const AccountDetailsForm = ({ onBack, onSubmit: onFormSubmit, serverError, loading }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(accountSchema),
    mode: 'onChange',           // validate on every keystroke for live feedback
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const watchedPassword = watch('password');
  const { score: pwScore, allRulesPassed } = analyzePassword(watchedPassword);

  // Disable submit until: form is valid + password strong enough + all rules pass
  const isSubmitDisabled = loading || !isValid || pwScore < 3 || !allRulesPassed;

  /**
   * Email uniqueness check — fires onBlur so the user gets instant feedback
   * before spending any more time on the form.
   */
  const checkEmailUniqueness = useCallback(
    async (email) => {
      if (!email || errors.email) return; // skip if email field already has a format error
      setEmailChecking(true);
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          setError('email', {
            type: 'manual',
            message: 'This email is already registered. Please sign in or use a different address.',
          });
        }
      } catch (_) {
        // Silently fail — Firebase may throw for invalid format, Zod already covers that
      } finally {
        setEmailChecking(false);
      }
    },
    [errors.email, setError]
  );

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <Typography
        variant="body2"
        sx={{ color: 'rgba(0,0,0,0.5)', mb: 2, textAlign: 'center' }}
      >
        Identity verified! Now set up your parent account.
      </Typography>

      {/* ── Full Name ── */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Full name"
            autoComplete="name"
            variant="filled"
            sx={fieldSx}
            InputProps={inputProps}
            InputLabelProps={labelProps}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />

      {/* ── Email ── */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Email address *"
            type="email"
            autoComplete="username"
            variant="filled"
            sx={fieldSx}
            required
            InputProps={{
              ...inputProps,
              endAdornment: emailChecking ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} sx={{ color: 'rgba(0,0,0,0.3)', mr: 1 }} />
                </InputAdornment>
              ) : null,
            }}
            InputLabelProps={labelProps}
            error={!!errors.email}
            helperText={errors.email?.message}
            onBlur={(e) => {
              field.onBlur(e);
              checkEmailUniqueness(e.target.value);
            }}
          />
        )}
      />

      {/* ── Password ── */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Password *"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            variant="filled"
            sx={fieldSx}
            required
            InputProps={{
              ...inputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    sx={{ color: 'rgba(0,0,0,0.45)' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={labelProps}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />

      {/* Real-time strength indicator */}
      <PasswordStrengthIndicator password={watchedPassword} />

      {/* ── Confirm Password ── */}
      <Controller
        name="confirm"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Confirm password *"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            variant="filled"
            sx={{ mb: 3 }}
            required
            InputProps={{
              ...inputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    edge="end"
                    sx={{ color: 'rgba(0,0,0,0.45)' }}
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={labelProps}
            error={!!errors.confirm}
            helperText={errors.confirm?.message}
          />
        )}
      />

      {/* Server-side error (e.g. auth/email-already-in-use caught after submit) */}
      {serverError && (
        <Typography
          variant="caption"
          sx={{ display: 'block', color: '#e53935', mb: 2, fontWeight: 500 }}
        >
          {serverError}
        </Typography>
      )}

      {/* ── Actions ── */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            flex: '0 0 auto',
            py: 1.3,
            color: 'rgba(0,0,0,0.6)',
            borderColor: 'rgba(0,0,0,0.15)',
            '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.03)' },
          }}
        >
          Back
        </Button>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitDisabled}
          endIcon={loading ? null : <ArrowForwardIcon />}
          sx={{
            py: 1.4,
            backgroundColor: '#EE791A',
            '&:hover': { backgroundColor: '#c05905' },
            '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.28)' },
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <span>Creating account…</span>
            </Box>
          ) : (
            'Create Account'
          )}
        </Button>
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
  );
};

export default AccountDetailsForm;
