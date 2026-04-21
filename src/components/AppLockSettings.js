import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
  Alert, CircularProgress, Divider,
} from '@mui/material';
import LockIcon        from '@mui/icons-material/LockRounded';
import LockOpenIcon    from '@mui/icons-material/LockOpenRounded';
import ShieldIcon      from '@mui/icons-material/ShieldRounded';

/**
 * AppLockSettings
 * Drop this anywhere in your Settings page.
 *
 * Props:
 *  isLockEnabled – boolean from useAppLock
 *  enableLock    – async (pin: string) => void
 *  disableLock   – async (pin: string) => boolean
 *  changePin     – async (old: string, new: string) => boolean
 */
export default function AppLockSettings({ isLockEnabled, enableLock, disableLock, changePin }) {
  const [dialog,   setDialog]   = useState(null); // 'enable' | 'disable' | 'change'
  const [pin1,     setPin1]     = useState('');
  const [pin2,     setPin2]     = useState('');
  const [oldPin,   setOldPin]   = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');

  const closeDialog = () => {
    setDialog(null);
    setPin1('');
    setPin2('');
    setOldPin('');
    setError('');
    setSuccess('');
  };

  const validatePin = (p) => {
    if (!/^\d{4,6}$/.test(p)) return 'PIN must be 4–6 digits.';
    return null;
  };

  // ── Enable Lock ──────────────────────────────────────────────────────────────
  const handleEnable = async () => {
    const err = validatePin(pin1);
    if (err) return setError(err);
    if (pin1 !== pin2) return setError('PINs do not match.');
    setLoading(true);
    await enableLock(pin1);
    setLoading(false);
    setSuccess('App lock enabled! Your PIN has been set.');
    setTimeout(closeDialog, 1500);
  };

  // ── Disable Lock ─────────────────────────────────────────────────────────────
  const handleDisable = async () => {
    if (!oldPin) return setError('Enter your current PIN.');
    setLoading(true);
    const ok = await disableLock(oldPin);
    setLoading(false);
    if (!ok) return setError('Incorrect PIN. Try again.');
    setSuccess('App lock removed.');
    setTimeout(closeDialog, 1500);
  };

  // ── Change PIN ───────────────────────────────────────────────────────────────
  const handleChange = async () => {
    if (!oldPin) return setError('Enter your current PIN.');
    const err = validatePin(pin1);
    if (err) return setError(err);
    if (pin1 !== pin2) return setError('New PINs do not match.');
    setLoading(true);
    const ok = await changePin(oldPin, pin1);
    setLoading(false);
    if (!ok) return setError('Current PIN is incorrect.');
    setSuccess('PIN changed successfully!');
    setTimeout(closeDialog, 1500);
  };

  return (
    <Box>
      {/* ── Section Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <ShieldIcon sx={{ color: '#6366f1' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          App Lock
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Set a PIN so only you can open the dashboard. If a child borrows your phone, they will not be able to access the parental controls.
      </Typography>

      {/* ── Status Card ── */}
      <Box sx={{
        border:       '1px solid',
        borderColor:  isLockEnabled ? 'rgba(99,102,241,0.4)' : 'divider',
        borderRadius: 3,
        p:            3,
        background:   isLockEnabled
          ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))'
          : 'transparent',
        mb:           2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isLockEnabled
              ? <LockIcon sx={{ color: '#6366f1', fontSize: 28 }} />
              : <LockOpenIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
            }
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {isLockEnabled ? 'App Lock is ON' : 'App Lock is OFF'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isLockEnabled
                  ? 'PIN required every time app opens or returns from background'
                  : 'Anyone with your phone can open the dashboard'
                }
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Action Buttons ── */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {!isLockEnabled ? (
          <Button
            variant="contained"
            startIcon={<LockIcon />}
            onClick={() => { setDialog('enable'); setError(''); }}
            sx={{
              background:   'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 2,
              px:           3,
              '&:hover':    { background: 'linear-gradient(135deg, #5254cc, #7c3aed)' },
            }}
          >
            Enable App Lock
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={() => { setDialog('change'); setError(''); }}
              sx={{ borderRadius: 2 }}
            >
              Change PIN
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LockOpenIcon />}
              onClick={() => { setDialog('disable'); setError(''); }}
              sx={{ borderRadius: 2 }}
            >
              Remove Lock
            </Button>
          </>
        )}
      </Box>

      {/* ── Enable Dialog ── */}
      <PinDialog
        open={dialog === 'enable'}
        title="Set Up App Lock"
        description="Choose a 4–6 digit PIN. You'll need to enter this every time you open the app."
        onClose={closeDialog}
        onConfirm={handleEnable}
        loading={loading}
        error={error}
        success={success}
      >
        <TextField
          label="New PIN"
          type="password"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          value={pin1}
          onChange={e => { setPin1(e.target.value.replace(/\D/g, '')); setError(''); }}
          fullWidth
          sx={{ mb: 2 }}
          autoFocus
        />
        <TextField
          label="Confirm PIN"
          type="password"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          value={pin2}
          onChange={e => { setPin2(e.target.value.replace(/\D/g, '')); setError(''); }}
          fullWidth
        />
      </PinDialog>

      {/* ── Disable Dialog ── */}
      <PinDialog
        open={dialog === 'disable'}
        title="Remove App Lock"
        description="Enter your current PIN to disable the app lock."
        onClose={closeDialog}
        onConfirm={handleDisable}
        loading={loading}
        error={error}
        success={success}
        confirmColor="error"
        confirmLabel="Remove Lock"
      >
        <TextField
          label="Current PIN"
          type="password"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          value={oldPin}
          onChange={e => { setOldPin(e.target.value.replace(/\D/g, '')); setError(''); }}
          fullWidth
          autoFocus
        />
      </PinDialog>

      {/* ── Change PIN Dialog ── */}
      <PinDialog
        open={dialog === 'change'}
        title="Change PIN"
        description="Verify your current PIN, then set a new one."
        onClose={closeDialog}
        onConfirm={handleChange}
        loading={loading}
        error={error}
        success={success}
        confirmLabel="Change PIN"
      >
        <TextField
          label="Current PIN"
          type="password"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          value={oldPin}
          onChange={e => { setOldPin(e.target.value.replace(/\D/g, '')); setError(''); }}
          fullWidth
          sx={{ mb: 2 }}
          autoFocus
        />
        <TextField
          label="New PIN"
          type="password"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          value={pin1}
          onChange={e => { setPin1(e.target.value.replace(/\D/g, '')); setError(''); }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Confirm New PIN"
          type="password"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          value={pin2}
          onChange={e => { setPin2(e.target.value.replace(/\D/g, '')); setError(''); }}
          fullWidth
        />
      </PinDialog>
    </Box>
  );
}

// ── Reusable PIN Dialog ───────────────────────────────────────────────────────
function PinDialog({ open, title, description, onClose, onConfirm, loading, error, success, confirmColor = 'primary', confirmLabel = 'Confirm', children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
        {children}
        {error   && <Alert severity="error"   sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
