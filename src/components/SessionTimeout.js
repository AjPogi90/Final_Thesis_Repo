import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    LinearProgress,
    Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

const SessionTimeout = () => {
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Track user activity
    const resetTimer = useCallback(() => {
        setLastActivity(Date.now());
        setShowWarning(false);
    }, []);

    // Set up activity listeners
    useEffect(() => {
        if (!user) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [user, resetTimer]);

    // Check session timeout
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivity;
            const remaining = SESSION_TIMEOUT - timeSinceActivity;

            // Auto logout
            if (remaining <= 0) {
                signOut(auth);
                navigate('/');
                return;
            }

            // Show warning
            if (remaining <= WARNING_TIME && !showWarning) {
                setShowWarning(true);
            }

            // Update time remaining for progress bar
            if (showWarning) {
                setTimeRemaining(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [user, lastActivity, showWarning, navigate]);

    const handleExtendSession = () => {
        resetTimer();
        setShowWarning(false);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!user || !showWarning) return null;

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    const progressValue = (timeRemaining / WARNING_TIME) * 100;

    return (
        <Dialog
            open={showWarning}
            maxWidth="sm"
            fullWidth
            aria-labelledby="session-timeout-dialog"
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'warning.main',
                }}
            >
                <WarningAmberIcon />
                Session Timeout Warning
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" paragraph>
                        Your session is about to expire due to inactivity.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        You will be automatically logged out in:
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: timeRemaining < 60000 ? 'error.main' : 'warning.main',
                            textAlign: 'center',
                            my: 2,
                        }}
                    >
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={progressValue}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: timeRemaining < 60000 ? 'error.main' : 'warning.main',
                            },
                        }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Click "Stay Logged In" to continue your session, or "Logout" to sign out now.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleLogout} color="inherit">
                    Logout
                </Button>
                <Button
                    onClick={handleExtendSession}
                    variant="contained"
                    color="primary"
                    autoFocus
                >
                    Stay Logged In
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionTimeout;
