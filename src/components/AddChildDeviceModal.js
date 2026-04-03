import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Alert,
    AlertTitle,
    IconButton,
    Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AndroidIcon from '@mui/icons-material/Android';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

const AddChildDeviceModal = ({ open, onClose }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const steps = [
        {
            label: 'Download AegistNet Child App',
            description: 'Install the companion app on your child\'s Android device',
        },
        {
            label: 'Grant Permissions',
            description: 'Allow location, app usage, and device admin access',
        },
    ];

    const activeStep = 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: colors.cardBg,
                    color: colors.text,
                    border: `1px solid ${colors.cardBorder}`,
                }
            }}
        >
            <DialogTitle sx={{ bgcolor: colors.cardBg, borderBottom: `1px solid ${colors.cardBorder}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text }}>
                        Connect Your Child's Device
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: colors.text }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: colors.cardBg, borderColor: colors.cardBorder }}>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(33,150,243,0.08)', color: colors.text }}>
                    <AlertTitle sx={{ color: colors.text }}>Android Only</AlertTitle>
                    AegistNet currently supports Android devices only. The child app is required for monitoring and control features.
                </Alert>

                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                        <Step key={step.label} active>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            bgcolor: colors.primary,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
                                )}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                                    {step.label}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }} paragraph>
                                    {step.description}
                                </Typography>

                                {index === 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<AndroidIcon />}
                                            href="https://play.google.com/store"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                mb: 2,
                                                bgcolor: colors.primary,
                                                color: '#fff',
                                                '&:hover': {
                                                    bgcolor: '#c05905ff',
                                                }
                                            }}
                                        >
                                            Open Play Store
                                        </Button>

                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: colors.inputBg,
                                                borderRadius: 2,
                                                textAlign: 'center',
                                                border: `1px solid ${colors.divider}`,
                                            }}
                                        >
                                            <Box sx={{ bgcolor: 'white', p: 1, display: 'inline-block', borderRadius: 1, mb: 2 }}>
                                                {user ? (
                                                    <QRCodeSVG
                                                        value={JSON.stringify({ parentEmail: user.email, parentUid: user.uid })}
                                                        size={180}
                                                        level={"H"}
                                                        includeMargin={true}
                                                    />
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                                        Please sign in first to generate a connection QR code.
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography variant="caption" sx={{ color: colors.textSecondary }} display="block">
                                                Scan this QR code with your child's device to instantly connect and log in
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {index === 1 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Alert severity="warning" sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(255,152,0,0.08)', color: colors.text }}>
                                            <Typography variant="body2">
                                                The app will request several permissions. All are required for AegistNet to function:
                                            </Typography>
                                        </Alert>
                                        <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                            <Typography component="li" variant="body2" sx={{ mb: 0.5, color: colors.text }}>
                                                <strong>Location:</strong> Track device location
                                            </Typography>
                                            <Typography component="li" variant="body2" sx={{ mb: 0.5, color: colors.text }}>
                                                <strong>App Usage:</strong> Monitor installed apps
                                            </Typography>
                                            <Typography component="li" variant="body2" sx={{ mb: 0.5, color: colors.text }}>
                                                <strong>Device Admin:</strong> Enable remote app blocking
                                            </Typography>
                                            <Typography component="li" variant="body2" sx={{ color: colors.text }}>
                                                <strong>Accessibility:</strong> Content filtering features
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}


                            </StepContent>
                        </Step>
                    ))}
                </Stepper>

                <Alert severity="success" sx={{ mt: 3, borderRadius: 2, bgcolor: 'rgba(76,175,80,0.08)', color: colors.text }}>
                    <AlertTitle sx={{ color: colors.text }}>What happens next?</AlertTitle>
                    Once your child's device is connected, it will appear on your Children page within 30 seconds. You can then manage apps, view location, and enable content filters.
                </Alert>

                <Box sx={{ mt: 3, p: 2, bgcolor: colors.inputBg, borderRadius: 2, border: `1px solid ${colors.divider}` }}>
                    <Typography variant="caption" sx={{ color: colors.text }} display="block" gutterBottom>
                        <strong>Need help?</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        If the device doesn't appear after 2 minutes, check that:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
                        <Typography component="li" variant="caption" sx={{ color: colors.textSecondary }}>
                            The child app is installed and signed in
                        </Typography>
                        <Typography component="li" variant="caption" sx={{ color: colors.textSecondary }}>
                            All permissions were granted
                        </Typography>
                        <Typography component="li" variant="caption" sx={{ color: colors.textSecondary }}>
                            The device has an active internet connection
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: colors.cardBg, borderTop: `1px solid ${colors.cardBorder}` }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="large"
                    sx={{
                        borderColor: colors.divider,
                        color: colors.text,
                        '&:hover': {
                            borderColor: colors.primary,
                            bgcolor: colors.hover,
                        }
                    }}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<AndroidIcon />}
                    size="large"
                    sx={{
                        bgcolor: colors.primary,
                        color: '#fff',
                        '&:hover': {
                            bgcolor: '#c05905ff',
                        }
                    }}
                >
                    Download App
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddChildDeviceModal;
