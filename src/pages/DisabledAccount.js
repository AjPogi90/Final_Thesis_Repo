import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const DisabledAccount = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <Box sx={{
            width: '100%', minHeight: '100vh', background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6,
        }}>
            <Box sx={{
                p: { xs: 3, sm: 5 }, width: 540, maxWidth: '94%', borderRadius: 3,
                bgcolor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)', color: '#fff', textAlign: 'center',
            }}>
                {/* Logo */}
                <Box sx={{ mb: 3 }}>
                    <Box component="img" src="/HeaderLogoImage.png" alt="logo"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/HeaderLogo.png'; }}
                        sx={{ width: 120, mx: 'auto', display: 'block' }}
                    />
                </Box>

                {/* Icon */}
                <Box sx={{
                    width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ef4444 0%, #c62828 100%)',
                }}>
                    <BlockIcon sx={{ fontSize: 42, color: '#fff' }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Account Suspended
                </Typography>

                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, lineHeight: 1.7 }}>
                    Your account has been <strong style={{ color: '#ef4444' }}>suspended</strong> by an administrator.
                    You cannot access the dashboard or any protected features at this time.
                </Typography>

                {/* Account info */}
                <Paper sx={{
                    mt: 3, p: 2.5, bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'left',
                }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1.5 }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Account:</strong> {user?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Status:</strong>{' '}
                        <Box component="span" sx={{
                            px: 1.5, py: 0.3, borderRadius: 1, fontSize: '0.8rem', fontWeight: 600,
                            bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444',
                        }}>
                            DISABLED
                        </Box>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, display: 'block', mt: 1.5 }}>
                        If you believe this is a mistake, please contact the system administrator for assistance at aegistnet@gmail.com
                    </Typography>
                </Paper>

                <Button
                    variant="outlined"
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    sx={{
                        mt: 4, color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.12)',
                        '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.03)' },
                    }}
                >
                    Sign out
                </Button>
            </Box>
        </Box>
    );
};

export default DisabledAccount;
