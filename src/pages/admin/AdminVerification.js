import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, CircularProgress, Alert, Avatar, Button,
    Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BadgeIcon from '@mui/icons-material/Badge';
import PeopleIcon from '@mui/icons-material/People';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const statusColors = {
    pending_verification: { bg: 'rgba(238,121,26,0.12)', color: '#EE791A', label: 'PENDING' },
    approved: { bg: 'rgba(76,175,80,0.12)', color: '#4caf50', label: 'APPROVED' },
    rejected: { bg: 'rgba(244,67,54,0.12)', color: '#f44336', label: 'REJECTED' },
    resubmit_id: { bg: 'rgba(33,150,243,0.12)', color: '#2196f3', label: 'RESUBMIT ID' },
};

// Quick-pick reason chips shown in the remark dialog
const REJECT_CHIPS = [
    'ID is blurry or unreadable',
    'ID appears expired',
    'Name does not match registration',
    'Wrong document type submitted',
    'ID image is incomplete / cut off',
];

const RESUBMIT_CHIPS = [
    'ID is blurry or unreadable',
    'Please upload a clearer photo',
    'ID image is incomplete / cut off',
    'File quality is too low',
];

// ── Approve Confirmation Dialog ──────────────────────────────────────────────
const ApproveConfirmDialog = ({ open, onClose, onConfirm, user, loading, colors }) => {
    if (!user) return null;
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: colors?.cardBg || '#111',
                    border: '1px solid rgba(76,175,80,0.35)',
                    borderRadius: 3,
                    color: colors?.text || '#fff',
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '50%',
                        bgcolor: 'rgba(76,175,80,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#4caf50',
                    }}>
                        <CheckCircleIcon fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors?.text || '#fff' }}>Confirm Approval</Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.5)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Typography variant="body2" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.6)', mb: 2 }}>
                    Are you sure you want to <strong style={{ color: '#4caf50' }}>approve</strong> the ID verification for:
                </Typography>
                <Box sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: 'rgba(76,175,80,0.07)',
                    border: '1px solid rgba(76,175,80,0.2)',
                }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: colors?.text || '#fff' }}>
                        {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.55)' }}>
                        {user.email}
                    </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.4)', mt: 1.5, display: 'block' }}>
                    This action will grant the parent full access to the system.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${colors?.divider || 'rgba(255,255,255,0.06)'}`, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.6)', borderColor: colors?.divider || 'rgba(255,255,255,0.15)', textTransform: 'none' }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleIcon />}
                    sx={{ bgcolor: '#4caf50', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#388e3c' } }}
                >
                    {loading ? 'Approving…' : 'Yes, Approve'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Confirmation + Remark Dialog ─────────────────────────────────────────────
const RemarkDialog = ({ open, onClose, onConfirm, decision, loading, colors }) => {
    const [remark, setRemark] = useState('');

    const isReject = decision === 'rejected';
    const chips = isReject ? REJECT_CHIPS : RESUBMIT_CHIPS;
    const accentColor = isReject ? '#f44336' : '#2196f3';
    const title = isReject ? 'Reject Verification' : 'Request ID Resubmission';
    const subtitle = isReject
        ? 'Provide a reason for rejection. The parent will see this note.'
        : 'Explain what needs to be fixed. The parent will see this note.';

    const handleChip = (chip) => {
        setRemark((prev) => prev ? `${prev} ${chip}` : chip);
    };

    const handleClose = () => {
        setRemark('');
        onClose();
    };

    const handleConfirm = () => {
        onConfirm(remark);
        setRemark('');
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: colors?.cardBg || '#111',
                    border: `1px solid ${accentColor}33`,
                    borderRadius: 3,
                    color: colors?.text || '#fff',
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '50%',
                        bgcolor: `${accentColor}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: accentColor,
                    }}>
                        <WarningAmberIcon fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors?.text || '#fff' }}>{title}</Typography>
                </Box>
                <IconButton onClick={handleClose} size="small" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.5)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Typography variant="body2" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.55)', mb: 2 }}>
                    {subtitle}
                </Typography>

                {/* Quick-pick chips */}
                <Typography variant="caption" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'block', mb: 1 }}>
                    Quick reasons (click to add):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {chips.map((c) => (
                        <Chip
                            key={c}
                            label={c}
                            size="small"
                            onClick={() => handleChip(c)}
                            sx={{
                                bgcolor: `${accentColor}12`,
                                color: accentColor,
                                border: `1px solid ${accentColor}30`,
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                '&:hover': { bgcolor: `${accentColor}22` },
                            }}
                        />
                    ))}
                </Box>

                {/* Remark textarea */}
                <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    placeholder="Type a custom remark for the parent (optional)…"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    inputProps={{ maxLength: 400 }}
                    helperText={`${remark.length}/400`}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: colors?.text || '#fff',
                            bgcolor: colors?.hover || 'rgba(255,255,255,0.03)',
                            '& fieldset': { borderColor: `${accentColor}40` },
                            '&:hover fieldset': { borderColor: `${accentColor}80` },
                            '&.Mui-focused fieldset': { borderColor: accentColor },
                        },
                        '& .MuiFormHelperText-root': { color: colors?.textSecondary || 'rgba(255,255,255,0.35)', textAlign: 'right' },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${colors?.divider || 'rgba(255,255,255,0.06)'}`, gap: 1 }}>
                <Button onClick={handleClose} variant="outlined" sx={{ color: colors?.textSecondary || 'rgba(255,255,255,0.6)', borderColor: colors?.divider || 'rgba(255,255,255,0.15)', textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : (isReject ? <CancelIcon /> : <ReplayIcon />)}
                    sx={{
                        bgcolor: accentColor,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: isReject ? '#c62828' : '#1565c0' },
                    }}
                >
                    {loading ? 'Saving…' : (isReject ? 'Confirm Rejection' : 'Confirm Resubmit Request')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminVerification = () => {
    const { reviewUser } = useAuth();
    const { colors } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [previewUser, setPreviewUser] = useState(null);
    const [alert, setAlert] = useState(null);

    // Remark dialog state
    const [remarkDialog, setRemarkDialog] = useState({ open: false, uid: null, decision: null });

    // Approve confirmation dialog state
    const [approveDialog, setApproveDialog] = useState({ open: false, user: null });

    useEffect(() => {
        const unsub = onValue(ref(database, 'users/parents'), (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.values(data).filter(u => !u.isAdmin).map(u => ({
                    ...u, verificationStatus: u.idVerification?.status || 'pending_verification',
                }));
                list.sort((a, b) => {
                    if (a.verificationStatus === 'pending_verification' && b.verificationStatus !== 'pending_verification') return -1;
                    if (a.verificationStatus !== 'pending_verification' && b.verificationStatus === 'pending_verification') return 1;
                    return (b.createdAt || 0) - (a.createdAt || 0);
                });
                setUsers(list);
            } else setUsers([]);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Direct action (Approve, Re-review) — no dialog needed
    const handleReview = async (uid, decision, remark = '') => {
        setActionLoading(uid);
        const result = await reviewUser(uid, decision, remark);
        setActionLoading(null);
        if (result.success) {
            const labels = { approved: 'approved', rejected: 'rejected', resubmit_id: 'marked for resubmission', pending_verification: 'reset to pending' };
            setAlert({ severity: 'success', message: `User ${labels[decision] || decision} successfully.` });
            setPreviewUser(null);
        } else setAlert({ severity: 'error', message: 'Failed to update user status.' });
        setTimeout(() => setAlert(null), 4000);
    };

    // Open approve confirmation dialog
    const openApproveDialog = (user) => {
        setApproveDialog({ open: true, user });
    };

    const handleApproveConfirm = async () => {
        const { user } = approveDialog;
        setApproveDialog({ open: false, user: null });
        await handleReview(user.uid, 'approved');
    };

    // Open remark dialog for Reject / Resubmit
    const openRemarkDialog = (uid, decision) => {
        setRemarkDialog({ open: true, uid, decision });
    };

    const handleRemarkConfirm = async (remark) => {
        const { uid, decision } = remarkDialog;
        setRemarkDialog({ open: false, uid: null, decision: null });
        await handleReview(uid, decision, remark);
    };

    const filtered = users.filter(u => {
        if (tabValue === 0) return u.verificationStatus === 'pending_verification' || u.verificationStatus === 'resubmit_id';
        if (tabValue === 1) return u.verificationStatus === 'approved';
        if (tabValue === 2) return u.verificationStatus === 'rejected';
        return true;
    });

    const pending = users.filter(u => u.verificationStatus === 'pending_verification' || u.verificationStatus === 'resubmit_id').length;
    const approved = users.filter(u => u.verificationStatus === 'approved').length;
    const rejected = users.filter(u => u.verificationStatus === 'rejected').length;

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress sx={{ color: '#EE791A' }} /></Box>;

    const cardBg = colors.cardBg;
    const cardBorder = colors.cardBorder;
    const txtMain = colors.text;
    const txtSub = colors.textSecondary;
    const txtDim = 'rgba(0,0,0,0.35)';
    const divider = colors.divider;

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: txtMain, mb: 0.5 }}>ID Verification</Typography>
                <Typography variant="body2" sx={{ color: txtSub }}>Review and verify parent identity documents</Typography>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {[{ label: 'Pending', count: pending, color: '#EE791A', icon: <HourglassTopIcon /> }, { label: 'Approved', count: approved, color: '#4caf50', icon: <CheckCircleIcon /> }, { label: 'Rejected', count: rejected, color: '#f44336', icon: <CancelIcon /> }].map(s => (
                    <Paper key={s.label} sx={{ flex: '1 1 140px', p: 2, bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: txtMain, lineHeight: 1 }}>{s.count}</Typography>
                            <Typography variant="caption" sx={{ color: txtSub }}>{s.label}</Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, '& .MuiTab-root': { color: txtSub, textTransform: 'none', fontWeight: 600 }, '& .Mui-selected': { color: '#EE791A' }, '& .MuiTabs-indicator': { backgroundColor: '#EE791A' } }}>
                <Tab label={`Pending (${pending})`} /><Tab label={`Approved (${approved})`} /><Tab label={`Rejected (${rejected})`} />
            </Tabs>

            {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}><PeopleIcon sx={{ fontSize: 60, color: txtDim, mb: 2 }} /><Typography sx={{ color: txtDim }}>No {tabValue === 0 ? 'pending' : tabValue === 1 ? 'approved' : 'rejected'} verifications</Typography></Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filtered.map(u => {
                        const si = statusColors[u.verificationStatus] || statusColors.pending_verification;
                        const isPending = u.verificationStatus === 'pending_verification' || u.verificationStatus === 'resubmit_id';
                        return (
                            <Paper key={u.uid} sx={{ p: 2.5, bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, '&:hover': { borderColor: 'rgba(0,0,0,0.2)' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 200 }}>
                                        <Avatar src="/ParentLogo.png" alt="Parent" sx={{ bgcolor: 'transparent', width: 44, height: 44 }} />
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: txtMain }}>{u.name || 'No name'}</Typography>
                                            <Typography variant="body2" sx={{ color: txtSub }}>{u.email}</Typography>
                                            {u.idVerification?.dateOfBirth && <Typography variant="caption" sx={{ color: txtDim }}>DOB: {u.idVerification.dateOfBirth}</Typography>}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                        <Chip label={si.label} size="small" sx={{ bgcolor: si.bg, color: si.color, fontWeight: 700, fontSize: '0.75rem', borderRadius: 1 }} />
                                        {/* Show existing admin remark in list view */}
                                        {u.idVerification?.adminRemark && (
                                            <Typography variant="caption" sx={{ color: txtSub, maxWidth: 240, textAlign: 'right', fontStyle: 'italic' }}>
                                                "{u.idVerification.adminRemark}"
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => setPreviewUser(u)} sx={{ color: txtSub, borderColor: cardBorder, textTransform: 'none' }}>Review</Button>
                                        {isPending && (<>
                                            <Button size="small" variant="contained"
                                                startIcon={actionLoading === u.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleIcon />}
                                                onClick={() => openApproveDialog(u)}
                                                disabled={actionLoading === u.uid}
                                                sx={{ bgcolor: '#4caf50', textTransform: 'none', '&:hover': { bgcolor: '#388e3c' } }}>
                                                Approve
                                            </Button>
                                            <Button size="small" variant="contained"
                                                startIcon={actionLoading === u.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CancelIcon />}
                                                onClick={() => openRemarkDialog(u.uid, 'rejected')}
                                                disabled={actionLoading === u.uid}
                                                sx={{ bgcolor: '#f44336', textTransform: 'none', '&:hover': { bgcolor: '#c62828' } }}>
                                                Reject
                                            </Button>
                                            {u.verificationStatus === 'pending_verification' && (
                                                <Button size="small" variant="outlined"
                                                    startIcon={<ReplayIcon />}
                                                    onClick={() => openRemarkDialog(u.uid, 'resubmit_id')}
                                                    disabled={actionLoading === u.uid}
                                                    sx={{ color: '#2196f3', borderColor: '#2196f3', textTransform: 'none', '&:hover': { bgcolor: 'rgba(33,150,243,0.08)' } }}>
                                                    Resubmit ID
                                                </Button>
                                            )}
                                        </>)}
                                        {u.verificationStatus === 'rejected' && (
                                            <Button size="small" variant="contained"
                                                startIcon={<ReplayIcon />}
                                                onClick={() => handleReview(u.uid, 'pending_verification')}
                                                sx={{ bgcolor: '#EE791A', textTransform: 'none', '&:hover': { bgcolor: '#c05905' } }}>
                                                Re-review
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            )}

            {/* Preview Dialog */}
            <Dialog open={Boolean(previewUser)} onClose={() => setPreviewUser(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: cardBg, color: txtMain, border: `1px solid ${cardBorder}`, borderRadius: 3 } }}>
                {previewUser && (<>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><BadgeIcon sx={{ color: '#EE791A' }} /><Typography variant="h6" sx={{ fontWeight: 700, color: txtMain }}>ID Verification Review</Typography></Box>
                        <IconButton onClick={() => setPreviewUser(null)} sx={{ color: txtDim }}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ borderColor: divider }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                            {[{ l: 'First Name', v: previewUser.firstName || 'N/A' }, { l: 'Middle Name', v: previewUser.middleName || 'N/A' }, { l: 'Last Name', v: previewUser.lastName || 'N/A' }, { l: 'Email', v: previewUser.email }, { l: 'Date of Birth', v: previewUser.idVerification?.dateOfBirth || 'N/A' }, { l: 'Submitted', v: previewUser.idVerification?.submittedAt ? new Date(previewUser.idVerification.submittedAt).toLocaleString() : 'N/A' }].map(x => (
                                <Paper key={x.l} sx={{ p: 2, bgcolor: colors.hover, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: txtDim, display: 'block', mb: 0.5 }}>{x.l}</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: txtMain }}>{x.v}</Typography>
                                </Paper>
                            ))}
                        </Box>

                        {/* Previous admin remark (if any) */}
                        {previewUser.idVerification?.adminRemark && (
                            <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(238,121,26,0.06)', border: '1px solid rgba(238,121,26,0.2)', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#EE791A', fontWeight: 700, display: 'block', mb: 0.5 }}>Previous Admin Remark</Typography>
                                <Typography variant="body2" sx={{ color: txtMain, fontStyle: 'italic' }}>"{previewUser.idVerification.adminRemark}"</Typography>
                            </Paper>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: txtSub, mb: 1.5 }}>Uploaded Government ID</Typography>
                                {(() => {
                                    const imgSrc = previewUser.idVerification?.idBase64 || previewUser.idVerification?.idFileUrl;
                                    if (imgSrc) return <Box sx={{ border: `1px solid ${cardBorder}`, borderRadius: 2, overflow: 'hidden', textAlign: 'center', p: 1 }}><Box component="img" src={imgSrc} alt="Government ID" sx={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1 }} /></Box>;
                                    if (previewUser.idVerification?.idUploadPending) return <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(238,121,26,0.06)', border: '1px solid rgba(238,121,26,0.2)', borderRadius: 2 }}><Typography sx={{ color: '#EE791A', fontWeight: 600 }}>ID not yet uploaded</Typography><Typography variant="caption" sx={{ color: txtDim }}>The user has been asked to upload their ID.</Typography></Paper>;
                                    return <Paper sx={{ p: 3, textAlign: 'center', bgcolor: cardBg, borderRadius: 2 }}><Typography sx={{ color: txtDim }}>No ID image available</Typography></Paper>;
                                })()}
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: txtSub, mb: 1.5 }}>Selfie Verification</Typography>
                                {(() => {
                                    const selfieSrc = previewUser.faceVerification?.selfieBase64;
                                    if (selfieSrc) return <Box sx={{ border: `1px solid ${cardBorder}`, borderRadius: 2, overflow: 'hidden', textAlign: 'center', p: 1 }}><Box component="img" src={selfieSrc} alt="Selfie Verification" sx={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1 }} /></Box>;
                                    return <Paper sx={{ p: 3, textAlign: 'center', bgcolor: cardBg, borderRadius: 2 }}><Typography sx={{ color: txtDim }}>No Selfie available</Typography></Paper>;
                                })()}
                            </Box>
                        </Box>
                    </DialogContent>

                    {(previewUser.verificationStatus === 'pending_verification' || previewUser.verificationStatus === 'resubmit_id') && (
                        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${divider}`, gap: 1, flexWrap: 'wrap' }}>
                            <Button variant="outlined"
                                startIcon={<ReplayIcon />}
                                onClick={() => { setPreviewUser(null); openRemarkDialog(previewUser.uid, 'resubmit_id'); }}
                                disabled={actionLoading === previewUser.uid || previewUser.verificationStatus === 'resubmit_id'}
                                sx={{ color: '#2196f3', borderColor: '#2196f3', textTransform: 'none', '&.Mui-disabled': { opacity: 0.4 } }}>
                                Request Resubmit
                            </Button>
                            <Box sx={{ flex: 1 }} />
                            <Button variant="contained"
                                startIcon={<CancelIcon />}
                                onClick={() => { setPreviewUser(null); openRemarkDialog(previewUser.uid, 'rejected'); }}
                                disabled={actionLoading === previewUser.uid}
                                sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#c62828' }, textTransform: 'none' }}>
                                Reject
                            </Button>
                            <Button variant="contained"
                                startIcon={actionLoading === previewUser.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleIcon />}
                                onClick={() => { setPreviewUser(null); openApproveDialog(previewUser); }}
                                disabled={actionLoading === previewUser.uid}
                                sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, textTransform: 'none', px: 3 }}>
                                Approve
                            </Button>
                        </DialogActions>
                    )}
                </>)}
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <ApproveConfirmDialog
                open={approveDialog.open}
                onClose={() => setApproveDialog({ open: false, user: null })}
                onConfirm={handleApproveConfirm}
                user={approveDialog.user}
                loading={actionLoading === approveDialog.user?.uid}
                colors={colors}
            />

            {/* Remark / Confirmation Dialog */}
            <RemarkDialog
                open={remarkDialog.open}
                onClose={() => setRemarkDialog({ open: false, uid: null, decision: null })}
                onConfirm={handleRemarkConfirm}
                decision={remarkDialog.decision}
                loading={actionLoading === remarkDialog.uid}
                colors={colors}
            />
        </Box>
    );
};

export default AdminVerification;
