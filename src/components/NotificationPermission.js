import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Collapse,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  isPushSupported,
  getNotificationPermission,
  requestAndSaveToken,
} from '../utils/pushNotifications';

/**
 * A notification permission banner that appears on the Dashboard when
 * push notifications haven't been enabled yet.
 *
 * States:
 *  - "unsupported" → hidden (browser doesn't support push)
 *  - "granted"     → hidden (already enabled)
 *  - "denied"      → shows a muted info banner (can't re-ask)
 *  - "default"     → shows the full CTA banner
 */
const NotificationPermission = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [permissionState, setPermissionState] = useState('default');
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isPushSupported()) {
      setPermissionState('unsupported');
      return;
    }
    setPermissionState(getNotificationPermission());

    // Also check localStorage for "dismissed" state
    const wasDismissed = localStorage.getItem('aegisnet_notif_dismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    if (!user) return;
    setLoading(true);

    const result = await requestAndSaveToken(user.uid);

    if (result.success) {
      setPermissionState('granted');
      setSnackbar({
        open: true,
        message: '🔔 Push notifications enabled! You\'ll receive instant NSFW alerts.',
        severity: 'success',
      });
    } else {
      // Check if it was denied
      setPermissionState(getNotificationPermission());
      setSnackbar({
        open: true,
        message: result.error || 'Could not enable notifications.',
        severity: 'warning',
      });
    }

    setLoading(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('aegisnet_notif_dismissed', 'true');
  };

  // Don't render anything if unsupported, already granted, or dismissed
  if (permissionState === 'unsupported' || permissionState === 'granted') {
    return null;
  }

  if (dismissed && permissionState === 'default') {
    return null;
  }

  // If denied, show a subtle info bar
  if (permissionState === 'denied') {
    return (
      <Collapse in={!dismissed}>
        <Paper
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255, 152, 0, 0.08)',
            border: `1px solid rgba(255, 152, 0, 0.3)`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <NotificationsOffIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
              Notifications Blocked
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              You've blocked notifications for this site. To re-enable, click the lock icon in
              your browser's address bar and allow notifications.
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleDismiss} sx={{ color: colors.textSecondary }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Collapse>
    );
  }

  // Default state — show the full CTA banner
  return (
    <>
      <Collapse in={true}>
        <Paper
          sx={{
            mb: 3,
            p: 0,
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${colors.cardBorder}`,
            background: `linear-gradient(135deg, ${colors.cardBg} 0%, rgba(214, 107, 7, 0.06) 100%)`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              p: 2.5,
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(214, 107, 7, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <NotificationsActiveIcon sx={{ color: colors.primary, fontSize: 28 }} />
            </Box>

            {/* Text */}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 700, mb: 0.25 }}>
                Enable Instant NSFW Alerts
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.5 }}>
                Get notified immediately when NSFW content is detected on your child's device — even
                when this tab is closed. Works on Chrome, Edge, and Firefox.
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Button
                variant="contained"
                onClick={handleEnable}
                disabled={loading}
                startIcon={loading ? null : <CheckCircleIcon />}
                sx={{
                  bgcolor: colors.primary,
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: '#c05905',
                  },
                }}
              >
                {loading ? 'Enabling…' : 'Enable Notifications'}
              </Button>
              <IconButton
                size="small"
                onClick={handleDismiss}
                sx={{ color: colors.textSecondary }}
                title="Maybe later"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default NotificationPermission;
