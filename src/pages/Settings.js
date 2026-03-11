import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const Settings = () => {
    const { theme, toggleTheme, colors } = useTheme();
    const { deleteAccount } = useAuth();
    const navigate = useNavigate();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleOpenDelete = () => {
        setPassword('');
        setDeleteError('');
        setDeleteDialogOpen(true);
    };

    const handleCloseDelete = () => {
        if (deleting) return;
        setDeleteDialogOpen(false);
        setPassword('');
        setDeleteError('');
    };

    const handleDeleteAccount = async () => {
        if (!password) {
            setDeleteError('Please enter your password to confirm.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        const result = await deleteAccount(password);
        if (result.success) {
            navigate('/login');
        } else {
            const code = result.error?.code || '';
            if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setDeleteError('Incorrect password. Please try again.');
            } else if (code === 'auth/too-many-requests') {
                setDeleteError('Too many attempts. Please wait a moment and try again.');
            } else {
                setDeleteError('Failed to delete account. Please try again.');
            }
            setDeleting(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.background, py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.text }}>
                        Settings
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                        Customize your AegistNet experience
                    </Typography>
                </Box>

                {/* Appearance Section */}
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                        Appearance
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: colors.divider }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {theme === 'light' ? (
                                <LightModeIcon sx={{ fontSize: 32, color: colors.primary }} />
                            ) : (
                                <DarkModeIcon sx={{ fontSize: 32, color: colors.primary }} />
                            )}
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                                    Theme
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                                </Typography>
                            </Box>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: colors.primary,
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            bgcolor: colors.primary,
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                    {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                                </Typography>
                            }
                        />
                    </Box>
                </Paper>

                {/* About Section */}
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
                        About
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: colors.divider }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                Application
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                                AegistNet
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                Version
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                                1.0.0
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Danger Zone Section */}
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'rgba(239,68,68,0.04)',
                        border: '1px solid rgba(239,68,68,0.25)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <WarningAmberIcon sx={{ color: '#ef4444' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef4444' }}>
                            Danger Zone
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(239,68,68,0.15)' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.text }}>
                                Delete Account
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                Permanently delete your account and all associated data. This cannot be undone.
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<DeleteForeverIcon />}
                            onClick={handleOpenDelete}
                            sx={{
                                color: '#ef4444',
                                borderColor: 'rgba(239,68,68,0.4)',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: '#ef4444',
                                    bgcolor: 'rgba(239,68,68,0.08)',
                                },
                            }}
                        >
                            Delete Account
                        </Button>
                    </Box>
                </Paper>
            </Container>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDelete}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`,
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ef4444', fontWeight: 700 }}>
                    <DeleteForeverIcon />
                    Delete Account
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                        This action is <strong style={{ color: colors.text }}>permanent and irreversible</strong>. Your account, profile, and all linked children's data will be permanently deleted.
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                        Enter your password to confirm:
                    </Typography>
                    <TextField
                        type="password"
                        label="Current Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
                        fullWidth
                        size="small"
                        autoFocus
                        disabled={deleting}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(239,68,68,0.3)' },
                                '&:hover fieldset': { borderColor: '#ef4444' },
                                '&.Mui-focused fieldset': { borderColor: '#ef4444' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#ef4444' },
                            input: { color: colors.text },
                            label: { color: colors.textSecondary },
                        }}
                    />
                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button
                        onClick={handleCloseDelete}
                        disabled={deleting}
                        sx={{ color: colors.textSecondary, textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteAccount}
                        disabled={deleting || !password}
                        startIcon={deleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <DeleteForeverIcon />}
                        sx={{
                            bgcolor: '#ef4444',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#dc2626' },
                            '&.Mui-disabled': { bgcolor: 'rgba(239,68,68,0.3)' },
                        }}
                    >
                        {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
