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
    InputAdornment,
    IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockResetIcon from '@mui/icons-material/LockReset';

const Settings = () => {
    const { theme, toggleTheme, colors } = useTheme();
    const { deleteAccount, changePassword } = useAuth();
    const navigate = useNavigate();

    // ── Change Password state ──
    const [pwDialogOpen, setPwDialogOpen] = useState(false);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [showDeletePw, setShowDeletePw] = useState(false);

    const handleOpenDelete = () => {
        setPassword('');
        setDeleteError('');
        setShowDeletePw(false);
        setDeleteDialogOpen(true);
    };

    const handleOpenPwDialog = () => {
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        setPwError('');
        setPwSuccess('');
        setShowCurrentPw(false);
        setShowNewPw(false);
        setShowConfirmPw(false);
        setPwDialogOpen(true);
    };

    const handleClosePwDialog = () => {
        if (pwLoading) return;
        setPwDialogOpen(false);
    };

    const handleChangePassword = async () => {
        setPwError('');
        if (!currentPw || !newPw || !confirmPw) {
            setPwError('Please fill in all fields.');
            return;
        }
        if (newPw.length < 6) {
            setPwError('New password must be at least 6 characters.');
            return;
        }
        if (newPw !== confirmPw) {
            setPwError('New passwords do not match.');
            return;
        }
        if (currentPw === newPw) {
            setPwError('New password must be different from your current password.');
            return;
        }
        setPwLoading(true);
        const result = await changePassword(currentPw, newPw);
        if (result.success) {
            setPwSuccess('Password changed successfully!');
            setTimeout(() => setPwDialogOpen(false), 1500);
        } else {
            const code = result.error?.code || '';
            if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setPwError('Current password is incorrect. Please try again.');
            } else if (code === 'auth/too-many-requests') {
                setPwError('Too many attempts. Please wait a moment and try again.');
            } else if (code === 'auth/weak-password') {
                setPwError('New password is too weak. Please choose a stronger password.');
            } else {
                setPwError('Failed to change password. Please try again.');
            }
        }
        setPwLoading(false);
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

                {/* Security Section */}
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
                        Security
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: colors.divider }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LockResetIcon sx={{ fontSize: 32, color: colors.primary }} />
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                                    Change Password
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                    Update your account password anytime
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<LockResetIcon />}
                            onClick={handleOpenPwDialog}
                            sx={{
                                color: colors.primary,
                                borderColor: colors.primary,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: 'rgba(238,121,26,0.08)',
                                    borderColor: colors.primary,
                                },
                            }}
                        >
                            Change Password
                        </Button>
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

            {/* Change Password Dialog */}
            <Dialog
                open={pwDialogOpen}
                onClose={handleClosePwDialog}
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
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.primary, fontWeight: 700 }}>
                    <LockResetIcon />
                    Change Password
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
                    <TextField
                        type={showCurrentPw ? 'text' : 'password'}
                        label="Current Password"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        fullWidth
                        size="small"
                        autoFocus
                        disabled={pwLoading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: colors.cardBorder },
                                '&:hover fieldset': { borderColor: colors.primary },
                                '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                            input: { color: colors.text },
                            label: { color: colors.textSecondary },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowCurrentPw(!showCurrentPw)} edge="end" sx={{ color: colors.textSecondary }}>
                                        {showCurrentPw ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        type={showNewPw ? 'text' : 'password'}
                        label="New Password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        fullWidth
                        size="small"
                        disabled={pwLoading}
                        helperText="At least 6 characters"
                        FormHelperTextProps={{ sx: { color: colors.textSecondary } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: colors.cardBorder },
                                '&:hover fieldset': { borderColor: colors.primary },
                                '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                            input: { color: colors.text },
                            label: { color: colors.textSecondary },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNewPw(!showNewPw)} edge="end" sx={{ color: colors.textSecondary }}>
                                        {showNewPw ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        type={showConfirmPw ? 'text' : 'password'}
                        label="Confirm New Password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                        fullWidth
                        size="small"
                        disabled={pwLoading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: colors.cardBorder },
                                '&:hover fieldset': { borderColor: colors.primary },
                                '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                            input: { color: colors.text },
                            label: { color: colors.textSecondary },
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirmPw(!showConfirmPw)} edge="end" sx={{ color: colors.textSecondary }}>
                                        {showConfirmPw ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    {pwError && <Alert severity="error">{pwError}</Alert>}
                    {pwSuccess && <Alert severity="success">{pwSuccess}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button
                        onClick={handleClosePwDialog}
                        disabled={pwLoading}
                        sx={{ color: colors.textSecondary, textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                        startIcon={pwLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <LockResetIcon />}
                        sx={{
                            bgcolor: colors.primary,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#c05905' },
                            '&.Mui-disabled': { bgcolor: 'rgba(238,121,26,0.3)' },
                        }}
                    >
                        {pwLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                        type={showDeletePw ? 'text' : 'password'}
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
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowDeletePw(!showDeletePw)} edge="end" sx={{ color: colors.textSecondary }}>
                                        {showDeletePw ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
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
