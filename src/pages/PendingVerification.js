import React, { useState, useRef, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, Alert, CircularProgress,
} from '@mui/material';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ReplayIcon from '@mui/icons-material/Replay';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const PendingVerification = () => {
    const { verificationStatus, user, uploadVerificationId } = useAuth();
    const navigate = useNavigate();

    // Resubmit form state
    const [idFile, setIdFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const validateFile = useCallback((file) => {
        if (!file) return 'No file selected.';
        if (!ACCEPTED_TYPES.includes(file.type)) return 'Please upload a JPG, PNG, WebP, or PDF file.';
        if (file.size > MAX_FILE_SIZE) return 'File size must be under 5 MB.';
        return null;
    }, []);

    const handleFile = useCallback((file) => {
        setFileError('');
        const err = validateFile(file);
        if (err) { setFileError(err); return; }
        setIdFile(file);
    }, [validateFile]);

    const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
    const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
    const onDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };
    const removeFile = () => { setIdFile(null); setFileError(''); };
    const previewUrl = idFile && idFile.type.startsWith('image/') ? URL.createObjectURL(idFile) : null;

    const handleResubmit = async () => {
        if (!idFile) { setFileError('Please select an ID file first.'); return; }
        setUploading(true);
        setUploadError('');
        const result = await uploadVerificationId(idFile);
        setUploading(false);
        if (result.success) {
            setUploadSuccess(true);
            setIdFile(null);
        } else {
            setUploadError('Upload failed. Please try again.');
        }
    };

    const isRejected = verificationStatus === 'rejected';
    const isResubmit = verificationStatus === 'resubmit_id';

    const iconBg = isRejected
        ? 'linear-gradient(135deg, #f44336 0%, #c62828 100%)'
        : isResubmit
            ? 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)'
            : 'linear-gradient(135deg, #EE791A 0%, #c05905 100%)';

    const iconPulse = !isRejected && !isResubmit;

    return (
        <Box sx={{
            width: '100%', minHeight: '100vh', background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6,
        }}>
            <Box sx={{
                p: { xs: 3, sm: 5 }, width: isResubmit ? 600 : 540, maxWidth: '94%', borderRadius: 3,
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
                    background: iconBg,
                    animation: iconPulse ? 'pulse 2s ease-in-out infinite' : 'none',
                    '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.05)', opacity: 0.85 },
                    },
                }}>
                    {isRejected
                        ? <CancelOutlinedIcon sx={{ fontSize: 42, color: '#fff' }} />
                        : isResubmit
                            ? <ReplayIcon sx={{ fontSize: 42, color: '#fff' }} />
                            : <HourglassTopIcon sx={{ fontSize: 42, color: '#fff' }} />}
                </Box>

                {/* Title */}
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {isRejected ? 'Verification Denied' : isResubmit ? 'Resubmit Your ID' : 'Verification Pending'}
                </Typography>

                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, lineHeight: 1.7 }}>
                    {isRejected ? (
                        <>Your government ID verification has been <strong style={{ color: '#f44336' }}>rejected</strong>.
                            This may be because the ID was unreadable, expired, or did not match the information provided.</>
                    ) : isResubmit ? (
                        <>An admin reviewed your ID and found an issue — it may have been <strong style={{ color: '#2196f3' }}>blurry or unreadable</strong>. Please upload a clearer copy of your government-issued ID.</>
                    ) : (
                        <>Your account is under review. An administrator will verify your identity shortly.</>
                    )}
                </Typography>

                {/* Account info card */}
                <Paper sx={{
                    mt: 2, mb: isResubmit ? 3 : 0, p: 2.5, bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'left',
                }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1 }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Account:</strong> {user?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Status:</strong>{' '}
                        <Box component="span" sx={{
                            px: 1.5, py: 0.3, borderRadius: 1, fontSize: '0.8rem', fontWeight: 600,
                            bgcolor: isRejected ? 'rgba(244,67,54,0.12)' : isResubmit ? 'rgba(33,150,243,0.12)' : 'rgba(238,121,26,0.12)',
                            color: isRejected ? '#f44336' : isResubmit ? '#2196f3' : '#EE791A',
                        }}>
                            {isRejected ? 'REJECTED' : isResubmit ? 'RESUBMIT ID' : 'PENDING REVIEW'}
                        </Box>
                    </Typography>
                </Paper>

                {/* ── Resubmit ID Upload Section ── */}
                {isResubmit && (
                    <Box sx={{ textAlign: 'left' }}>
                        {uploadSuccess ? (
                            <Alert
                                icon={<CheckCircleIcon />}
                                severity="success"
                                sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#81c784', border: '1px solid rgba(76,175,80,0.2)' }}
                            >
                                Your new ID has been submitted! An admin will review it shortly.
                            </Alert>
                        ) : (
                            <>
                                {uploadError && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{uploadError}</Alert>}

                                {/* Drop zone / file preview */}
                                {!idFile ? (
                                    <Box
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={onDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{
                                            border: `2px dashed ${dragActive ? '#2196f3' : 'rgba(255,255,255,0.12)'}`,
                                            borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer',
                                            transition: 'all 0.25s',
                                            bgcolor: dragActive ? 'rgba(33,150,243,0.06)' : 'transparent',
                                            '&:hover': { borderColor: '#2196f3', bgcolor: 'rgba(33,150,243,0.04)' },
                                            mb: 2,
                                        }}
                                    >
                                        <CloudUploadIcon sx={{ fontSize: 44, color: dragActive ? '#2196f3' : 'rgba(255,255,255,0.25)', mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>
                                            {dragActive ? 'Drop your file here' : 'Drag & drop your ID here, or click to browse'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                                            JPG, PNG, WebP, or PDF · Max 5 MB
                                        </Typography>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                                            onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
                                            hidden
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ border: '1px solid rgba(33,150,243,0.3)', borderRadius: 2, p: 2, bgcolor: 'rgba(33,150,243,0.04)', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: previewUrl ? 1.5 : 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CheckCircleIcon sx={{ fontSize: 22, color: '#2196f3' }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>{idFile.name}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{(idFile.size / 1024).toFixed(1)} KB</Typography>
                                                </Box>
                                            </Box>
                                            <Button size="small" startIcon={<DeleteIcon />} onClick={removeFile} sx={{ color: 'rgba(255,255,255,0.4)', minWidth: 0, '&:hover': { color: '#f44336' } }} />
                                        </Box>
                                        {previewUrl && (
                                            <Box component="img" src={previewUrl} alt="ID preview"
                                                sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1, border: '1px solid rgba(255,255,255,0.06)' }}
                                            />
                                        )}
                                    </Box>
                                )}

                                {fileError && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{fileError}</Alert>}

                                <Button
                                    fullWidth
                                    variant="contained"
                                    disabled={!idFile || uploading}
                                    onClick={handleResubmit}
                                    startIcon={uploading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CloudUploadIcon />}
                                    sx={{
                                        bgcolor: '#2196f3', color: '#fff', py: 1.3, fontWeight: 700,
                                        textTransform: 'none', fontSize: '1rem', borderRadius: 1.5,
                                        '&:hover': { bgcolor: '#1565c0' },
                                        '&.Mui-disabled': { bgcolor: 'rgba(33,150,243,0.3)' },
                                    }}
                                >
                                    {uploading ? 'Uploading…' : 'Submit New ID'}
                                </Button>
                            </>
                        )}
                    </Box>
                )}

                {/* ID submitted confirmation (shown when pending) */}
                {!isRejected && !isResubmit && (
                    <Alert
                        icon={<CheckCircleOutlineIcon />}
                        severity="success"
                        sx={{ mt: 3, bgcolor: 'rgba(76,175,80,0.1)', color: '#81c784', border: '1px solid rgba(76,175,80,0.2)', textAlign: 'left' }}
                    >
                        Your government ID has been submitted. An admin will review it shortly.
                    </Alert>
                )}

                {/* Caption for rejected */}
                {isRejected && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                        Please contact AegistNet support at aegistnet@gmail.com for assistance.
                    </Typography>
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
