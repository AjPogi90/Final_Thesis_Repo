import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Typography, Box, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Listens for foreground push notification alerts (when the dashboard tab is in focus)
 * and displays them as a persistent snackbar at the bottom of the screen.
 *
 * Place this inside the Router so useNavigate() is available.
 */
const ForegroundNotificationAlert = () => {
  const { foregroundAlert } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    if (foregroundAlert) {
      setAlertData(foregroundAlert);
      setOpen(true);
    }
  }, [foregroundAlert]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleViewIncidents = () => {
    setOpen(false);
    navigate('/incidents');
  };

  if (!alertData) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={15000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={handleClose}
        severity="warning"
        variant="filled"
        icon={<WarningAmberIcon fontSize="medium" />}
        sx={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          borderRadius: 2,
          '& .MuiAlert-message': { width: '100%' },
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleViewIncidents}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            View
          </Button>
        }
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
            {alertData.title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95 }}>
            {alertData.body}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default ForegroundNotificationAlert;
