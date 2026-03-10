import React, { useState, useRef } from 'react';
import {
    Box, Typography, Button, Paper, Alert, CircularProgress, LinearProgress,
} from '@mui/material';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { auth, database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const PendingVerification = () => {
    const { verificationStatus, user, uploadVerificationId } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [idFile, setIdFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Read idUploadPending directly from DB so it refreshes live
    const [idUploadPending, setIdUploadPending] = useState(true);
    React.useEffect(() => {
        if (!user) return;
        const dbRef = ref(database, `users/parents/${user.uid}/idVerification/idUploadPending`);
        const unsub = onValue(dbRef, (snap) => setIdUploadPending(snap.val() === true));
        return () => unsub();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdFile(file);
            setUploadError('');
        }
    };

    const handleUpload = async () => {
        if (!idFile) return;
        setUploading(true);
        setUploadError('');
        const result = await uploadVerificationId(idFile);
        setUploading(false);
        if (result.success) {
            setUploadSuccess(true);
            setIdFile(null);
        } else {
            setUploadError('Upload failed: ' + (result.error?.message || 'Unknown error. Please try again.'));
        }
    };

    const isRejected = verificationStatus === 'rejected';

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

                {/* Status Icon */}
                <Box sx={{
                    width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isRejected
                        ? 'linear-gradient(135deg, #f44336 0%, #c62828 100%)'
                        : 'linear-gradient(135deg, #EE791A 0%, #c05905 100%)',
                    animation: isRejected ? 'none' : 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.05)', opacity: 0.85 },
                    },
                }}>
                    {isRejected
                        ? <CancelOutlinedIcon sx={{ fontSize: 42, color: '#fff' }} />
                        : <HourglassTopIcon sx={{ fontSize: 42, color: '#fff' }} />}
                </Box>

                {/* Title */}
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {isRejected ? 'Verification Denied' : 'Verification Pending'}
                </Typography>

                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, lineHeight: 1.7 }}>
                    {isRejected ? (
                        <>Your government ID verification has been <strong style={{ color: '#f44336' }}>rejected</strong>.
                            This may be because the ID was unreadable, expired, or did not match the information provided.</>
                    ) : (
                        <>Your account is under review. An administrator will verify your identity shortly.</>
                    )}
                </Typography>

                {/* Account info card */}
                <Paper sx={{
                    mt: 3, p: 2.5, bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'left',
                }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1.5 }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Account:</strong> {user?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1 }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Status:</strong>{' '}
                        <Box component="span" sx={{
                            px: 1.5, py: 0.3, borderRadius: 1, fontSize: '0.8rem', fontWeight: 600,
                            bgcolor: isRejected ? 'rgba(244,67,54,0.12)' : 'rgba(238,121,26,0.12)',
                            color: isRejected ? '#f44336' : '#EE791A',
                        }}>
                            {isRejected ? 'REJECTED' : 'PENDING REVIEW'}
                        </Box>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                        {isRejected
                            ? 'Please contact support or register again with a valid government-issued ID.'
                            : 'This process usually takes 1–2 business days. You\'ll gain access automatically once approved.'}
                    </Typography>
                </Paper>

                {/* ── ID Upload Section (shown when ID hasn't been uploaded yet) ── */}
                {!isRejected && idUploadPending && !uploadSuccess && (
                    <Paper sx={{
                        mt: 3, p: 3, bgcolor: 'rgba(238,121,26,0.06)',
                        border: '1px solid rgba(238,121,26,0.2)', borderRadius: 2, textAlign: 'left',
                    }}>
                        <Typography variant="subtitle2" sx={{ color: '#EE791A', fontWeight: 700, mb: 1 }}>
                            📎 Upload Your Government ID
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', mb: 2, lineHeight: 1.6 }}>
                            Your ID hasn't been uploaded yet. Please upload a clear photo of your government-issued ID so our admin team can verify your account.
                        </Typography>

                        {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                startIcon={<UploadFileIcon />}
                                onClick={() => fileInputRef.current.click()}
                                disabled={uploading}
                                sx={{
                                    color: '#EE791A', borderColor: '#EE791A',
                                    '&:hover': { bgcolor: 'rgba(238,121,26,0.08)', borderColor: '#EE791A' },
                                }}
                            >
                                {idFile ? idFile.name : 'Choose File'}
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleUpload}
                                disabled={!idFile || uploading}
                                sx={{
                                    bgcolor: '#EE791A', '&:hover': { bgcolor: '#c05905' },
                                    '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' },
                                    fontWeight: 600,
                                }}
                            >
                                {uploading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={18} sx={{ color: '#fff' }} />
                                        <span>Uploading...</span>
                                    </Box>
                                ) : 'Submit ID'}
                            </Button>
                        </Box>

                        {uploading && <LinearProgress sx={{ mt: 2, bgcolor: 'rgba(238,121,26,0.15)', '& .MuiLinearProgress-bar': { bgcolor: '#EE791A' } }} />}
                    </Paper>
                )}

                {/* Upload Success */}
                {(!idUploadPending || uploadSuccess) && !isRejected && (
                    <Alert
                        icon={<CheckCircleOutlineIcon />}
                        severity="success"
                        sx={{ mt: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#81c784', border: '1px solid rgba(76,175,80,0.2)' }}
                    >
                        Your ID has been submitted. An admin will review it shortly.
                    </Alert>
                )}

                {/* Logout button */}
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

export default PendingVerification;
