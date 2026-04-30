import React, { useState, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Alert,
    IconButton,
    CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { loadModels } from '../utils/faceRecognition';
import * as faceapi from 'face-api.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/**
 * Calculates full years of age from a "YYYY-MM-DD" date string.
 */
function calculateAge(dateString) {
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

const inputSx = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#fff',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '6px',
    color: '#000',
    fontSize: '16px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
};

const IDVerificationStep = ({ dateOfBirth, setDateOfBirth, idFile, setIdFile }) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
    const isAdult = age !== null && age >= 18;

    // ---- Basic file validation (type + size) ----
    const validateFile = useCallback((file) => {
        if (!file) return 'No file selected.';
        if (!ACCEPTED_TYPES.includes(file.type)) return 'Please upload a JPG, PNG, WebP, or PDF file.';
        if (file.size > MAX_FILE_SIZE) return 'File size must be under 5 MB.';
        return null;
    }, []);

    /**
     * For image uploads (not PDF), performs three checks:
     *  1. Aspect ratio  — ID cards are landscape/square (ratio ≥ 0.75).
     *  2. Face presence — a valid photo ID must contain at least one face.
     *  3. Face area ratio — on a real ID the face photo is a small inset
     *     (~10–20% of card area). A selfie fills most of the frame (> 20%).
     *
     * Fails CLOSED: any AI error → reject (safer than silently accepting).
     */
    const validateIdImage = useCallback(async (file) => {
        // Step A — load the image element (same clean pattern as extractDescriptorFromFile)
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectUrl;

        try {
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = () => rej(new Error('load_failed'));
            });
        } catch {
            URL.revokeObjectURL(objectUrl);
            return 'Could not read the uploaded image. Please try a different file.';
        }
        URL.revokeObjectURL(objectUrl);

        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const imgArea = imgW * imgH;

        // Check 1: Aspect ratio
        const ratio = imgW / imgH;
        console.log('[IDVerification] Image dimensions:', imgW, 'x', imgH, '| ratio:', ratio.toFixed(3));
        if (ratio < 0.75) {
            console.log('[IDVerification] REJECTED — aspect ratio too low (portrait/selfie)');
            return (
                'Invalid image detected.' +
                'Please upload a scan or photo of your government-issued ID ' +
                '(National ID, Passport, Driver\'s License, or PhilSys ID).'
            );
        }

        // Checks 2 & 3 require face-api.js — fail CLOSED on any error
        try {
            await loadModels();

            const detection = await faceapi
                .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 }))
                .withFaceLandmarks();

            // Check 2: Must have a face
            if (!detection) {
                return (
                    'We couldn’t verify the uploaded image.' +
                    'Please upload a valid government-issued ID where your photo is clearly visible.'
                );
            }

            // Check 3: Face-to-image area ratio
            // Real ID card: face photo ≈ 10–20% of card area.
            // Selfie / portrait: face fills > 20% of the frame.
            const { width, height } = detection.detection.box;
            const faceRatio = (width * height) / imgArea;
            console.log('[IDVerification] Face box:', width.toFixed(0), 'x', height.toFixed(0), '| faceRatio:', faceRatio.toFixed(3));

            if (faceRatio > 0.20) {
                console.log('[IDVerification] REJECTED — face area ratio too high (selfie/portrait)');
                return (
                    'The uploaded image is not recognized as a valid ID.' +
                    'Ensure the entire ID card is visible, including all details. ' +
                    'Please upload a clear photo or scan of your government-issued ID.'
                );
            }

            // ✓ All checks passed
            return null;

        } catch {
            // Fail CLOSED — if AI analysis fails we reject rather than silently accept.
            return (
                'We were unable to verify the uploaded image as a government-issued ID. ' +
                'Please try again or upload a clearer photo of your ID.'
            );
        }
    }, []);

    const handleFile = useCallback(async (file) => {
        setFileError('');
        const basicErr = validateFile(file);
        if (basicErr) {
            setFileError(basicErr);
            return;
        }

        // PDFs skip image analysis — accepted as-is (face matching step will handle it)
        if (file.type === 'application/pdf') {
            setIdFile(file);
            return;
        }

        // Run AI-based ID image validation
        setAnalyzing(true);
        const imgErr = await validateIdImage(file);
        setAnalyzing(false);

        if (imgErr) {
            setFileError(imgErr);
            return;
        }

        setIdFile(file);
    }, [validateFile, validateIdImage, setIdFile]);

    // ---- Drag & drop handlers ----
    const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
    const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const removeFile = () => { setIdFile(null); setFileError(''); };

    // ---- Preview ----
    const previewUrl = idFile && idFile.type.startsWith('image/') ? URL.createObjectURL(idFile) : null;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box sx={{
                    width: 60, height: 60, borderRadius: '50%', mx: 'auto', mb: 2,
                    background: 'linear-gradient(135deg, #EE791A 0%, #c05905 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <VerifiedUserIcon sx={{ fontSize: 30, color: '#fff' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#000', mb: 0.5 }}>
                    Parent Identity Verification
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
                    To protect children, we require all parents to verify they are at least <strong style={{ color: '#EE791A' }}>18 years old</strong> before creating an account.
                </Typography>
            </Box>

            {/* ── Date of birth ── */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: '#EE791A' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
                        Date of Birth *
                    </Typography>
                </Box>

                <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={inputSx}
                    id="id-verification-dob"
                />

                {/* Age feedback */}
                {age !== null && (
                    <Box sx={{
                        mt: 1.5, px: 2, py: 1, borderRadius: 1,
                        display: 'flex', alignItems: 'center', gap: 1,
                        bgcolor: isAdult ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.08)',
                        border: `1px solid ${isAdult ? 'rgba(76,175,80,0.25)' : 'rgba(244,67,54,0.25)'}`,
                    }}>
                        {isAdult
                            ? <CheckCircleIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                            : <ErrorIcon sx={{ fontSize: 20, color: '#f44336' }} />}
                        <Typography variant="body2" sx={{ color: isAdult ? '#4caf50' : '#f44336', fontWeight: 500 }}>
                            {isAdult
                                ? `You are ${age} years old — age requirement met ✓`
                                : `You are ${age} years old — you must be at least 18 to register.`}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Government ID upload ── */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BadgeIcon sx={{ fontSize: 18, color: '#EE791A' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
                        Upload Government-Issued ID *
                    </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)', display: 'block', mb: 0.5, fontWeight: 500 }}>
                    Please upload one side of the ID that clearly shows your Age or Birth Date.
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', display: 'block', mb: 1.5 }}>
                    Accepted: National ID, Driver's License, Passport, PhilSys ID · Max 5 MB · JPG, PNG, WebP, or PDF
                </Typography>

                {analyzing ? (
                    // ── Analyzing state ──
                    <Box sx={{
                        border: '2px dashed rgba(238,121,26,0.4)',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'rgba(238,121,26,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                    }}>
                        <CircularProgress size={36} sx={{ color: '#EE791A' }} />
                        <Typography variant="body2" sx={{ color: '#EE791A', fontWeight: 600 }}>
                            Analyzing ID…
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                            Verifying that the uploaded image is a valid government-issued ID
                        </Typography>
                    </Box>
                ) : !idFile ? (
                    <Box
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            border: `2px dashed ${dragActive ? '#EE791A' : 'rgba(0,0,0,0.15)'}`,
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.25s',
                            bgcolor: dragActive ? 'rgba(238,121,26,0.06)' : '#fafafa',
                            '&:hover': { borderColor: '#EE791A', bgcolor: 'rgba(238,121,26,0.04)' },
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 44, color: dragActive ? '#EE791A' : 'rgba(0,0,0,0.25)', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)', mb: 0.5 }}>
                            {dragActive ? 'Drop your file here' : 'Drag & drop your ID here, or click to browse'}
                        </Typography>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
                            hidden
                            id="id-verification-upload"
                        />
                    </Box>
                ) : (
                    <Box sx={{
                        border: '1px solid rgba(76,175,80,0.3)',
                        borderRadius: 2,
                        p: 2,
                        bgcolor: 'rgba(76,175,80,0.04)',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: previewUrl ? 1.5 : 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                <CheckCircleIcon sx={{ fontSize: 22, color: '#4caf50', flexShrink: 0 }} />
                                <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#000', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {idFile.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                                        {(idFile.size / 1024).toFixed(1)} KB
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={removeFile} size="small" sx={{ color: 'rgba(0,0,0,0.5)', '&:hover': { color: '#f44336' } }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {previewUrl && (
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="ID preview"
                                sx={{
                                    width: '100%',
                                    maxHeight: 200,
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                            />
                        )}
                    </Box>
                )}

                {fileError && (
                    <Alert severity="error" sx={{ mt: 1.5, bgcolor: 'rgba(244,67,54,0.08)', color: '#f44336' }}>
                        {fileError}
                    </Alert>
                )}
            </Box>

            {/* Info note */}
            <Box sx={{
                mt: 3, p: 2, borderRadius: 1,
                bgcolor: 'rgba(238,121,26,0.06)',
                border: '1px solid rgba(238,121,26,0.15)',
            }}>
                <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>
                    Your government ID will be stored securely and used solely for age verification purposes. It will not be shared with third parties.
                </Typography>
            </Box>
        </Box>
    );
};

export default IDVerificationStep;
