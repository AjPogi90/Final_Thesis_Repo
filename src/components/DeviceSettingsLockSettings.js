import React, { useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress, Divider,
} from '@mui/material';
import SecurityIcon       from '@mui/icons-material/SecurityRounded';
import LockIcon           from '@mui/icons-material/LockRounded';
import LockOpenIcon       from '@mui/icons-material/LockOpenRounded';
import PhoneAndroidIcon   from '@mui/icons-material/PhoneAndroidRounded';
import VerifiedUserIcon   from '@mui/icons-material/VerifiedUserRounded';

/**
 * DeviceSettingsLockSettings
 * Drop this anywhere in your Settings page.
 *
 * Props:
 *  parentUid      – the logged-in parent's UID
 *  isLockEnabled  – boolean from useDeviceSettingsLock
 *  enableLock     – async (uid) => { success }
 *  disableLock    – async (uid) => { success }
 */
export default function DeviceSettingsLockSettings({
  parentUid, isLockEnabled, enableLock, disableLock,
}) {
  const [dialog,  setDialog]  = useState(null); // 'enable' | 'disable'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const closeDialog = () => {
    setDialog(null);
    setError('');
    setSuccess('');
  };

  // ── Enable ────────────────────────────────────────────────────────────────
  const handleEnable = async () => {
    setLoading(true);
    setError('');
    const result = await enableLock(parentUid);
    setLoading(false);
    if (!result.success) {
      setError('Failed to enable. Please try again.');
      return;
    }
    setSuccess('Device Settings Lock enabled! All linked devices are now protected.');
    setTimeout(closeDialog, 1800);
  };

  // ── Disable ───────────────────────────────────────────────────────────────
  const handleDisable = async () => {
    setLoading(true);
    setError('');
    const result = await disableLock(parentUid);
    setLoading(false);
    if (!result.success) {
      setError('Failed to disable. Please try again.');
      return;
    }
    setSuccess('Device Settings Lock removed.');
    setTimeout(closeDialog, 1500);
  };

  return (
    <Box>
      {/* ── Section Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <SecurityIcon sx={{ color: '#10b981' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Child Device Settings Lock
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        When enabled, this sends a lock command to all linked child devices, preventing
        children from accessing Android Settings, uninstalling apps, or resetting the device.
      </Typography>

      {/* ── Status Card ── */}
      <Box sx={{
        border:       '1px solid',
        borderColor:  isLockEnabled ? 'rgba(16,185,129,0.4)' : 'divider',
        borderRadius: 3,
        p:            3,
        background:   isLockEnabled
          ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))'
          : 'transparent',
        mb:           2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isLockEnabled
            ? <LockIcon sx={{ color: '#10b981', fontSize: 28 }} />
            : <LockOpenIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
          }
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isLockEnabled ? 'Device Settings Lock is ON' : 'Device Settings Lock is OFF'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isLockEnabled
                ? 'All linked child devices are restricted from accessing system settings'
                : 'Child devices can freely access Android Settings'
              }
            </Typography>
          </Box>
        </Box>

        {isLockEnabled && (
          <Box sx={{
            mt: 2, pt: 2,
            borderTop: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <VerifiedUserIcon sx={{ color: '#10b981', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
              Protection Active — Android app will enforce this restriction
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── What this protects ── */}
      {!isLockEnabled && (
        <Box sx={{
          display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2,
        }}>
          {[
            { icon: '🔒', label: 'Blocks access to Android Settings' },
            { icon: '📱', label: 'Prevents app uninstall' },
            { icon: '🛡️', label: 'Deters factory reset' },
          ].map((item) => (
            <Box key={item.label} sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.75,
              bgcolor: 'rgba(16,185,129,0.06)',
              borderRadius: 2,
              border: '1px solid rgba(16,185,129,0.15)',
            }}>
              <Typography sx={{ fontSize: '0.85rem' }}>{item.icon}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Action Buttons ── */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {!isLockEnabled ? (
          <Button
            variant="contained"
            startIcon={<PhoneAndroidIcon />}
            onClick={() => { setDialog('enable'); setError(''); }}
            sx={{
              background:   'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: 2,
              px:           3,
              textTransform: 'none',
              fontWeight:   600,
              '&:hover':    { background: 'linear-gradient(135deg, #059669, #047857)' },
            }}
          >
            Enable Device Settings Lock
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            startIcon={<LockOpenIcon />}
            onClick={() => { setDialog('disable'); setError(''); }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Remove Lock
          </Button>
        )}
      </Box>

      {/* ── Enable Confirmation Dialog ── */}
      <ConfirmDialog
        open={dialog === 'enable'}
        title="Enable Device Settings Lock?"
        description="This will send a lock command to all linked child devices. Children will not be able to open Android Settings or uninstall apps until you disable this."
        confirmLabel="Enable Lock"
        confirmColor="success"
        onClose={closeDialog}
        onConfirm={handleEnable}
        loading={loading}
        error={error}
        success={success}
        icon={<LockIcon sx={{ color: '#10b981', fontSize: 28 }} />}
      />

      {/* ── Disable Confirmation Dialog ── */}
      <ConfirmDialog
        open={dialog === 'disable'}
        title="Remove Device Settings Lock?"
        description="This will remove the restriction from all linked child devices. Children will regain access to Android Settings."
        confirmLabel="Remove Lock"
        confirmColor="error"
        onClose={closeDialog}
        onConfirm={handleDisable}
        loading={loading}
        error={error}
        success={success}
        icon={<LockOpenIcon sx={{ color: '#ef4444', fontSize: 28 }} />}
      />
    </Box>
  );
}

// ── Reusable Confirm Dialog ───────────────────────────────────────────────────
function ConfirmDialog({
  open, title, description, onClose, onConfirm,
  loading, error, success, confirmColor = 'primary', confirmLabel = 'Confirm', icon,
}) {
  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700 }}>
        {icon}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {error   && <Alert severity="error"   sx={{ mt: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
