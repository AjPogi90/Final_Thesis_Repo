import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, CircularProgress, Alert, Avatar, Button,
    Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BadgeIcon from '@mui/icons-material/Badge';
import PeopleIcon from '@mui/icons-material/People';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
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

const AdminVerification = () => {
    const { reviewUser } = useAuth();
    const { colors } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [previewUser, setPreviewUser] = useState(null);
    const [alert, setAlert] = useState(null);

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

    const handleReview = async (uid, decision) => {
        setActionLoading(uid);
        const result = await reviewUser(uid, decision);
        setActionLoading(null);
        if (result.success) {
            const labels = { approved: 'approved', rejected: 'rejected', resubmit_id: 'marked for resubmission', pending_verification: 'reset to pending' };
            setAlert({ severity: 'success', message: `User ${labels[decision] || decision} successfully.` });
            setPreviewUser(null);
        } else setAlert({ severity: 'error', message: 'Failed to update user status.' });
        setTimeout(() => setAlert(null), 4000);
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
                        return (
                            <Paper key={u.uid} sx={{ p: 2.5, bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, '&:hover': { borderColor: 'rgba(0,0,0,0.2)' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 200 }}>
                                        <Avatar sx={{ bgcolor: '#EE791A', width: 44, height: 44, fontWeight: 700 }}>{(u.name || u.email || '?')[0].toUpperCase()}</Avatar>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: txtMain }}>{u.name || 'No name'}</Typography>
                                            <Typography variant="body2" sx={{ color: txtSub }}>{u.email}</Typography>
                                            {u.idVerification?.dateOfBirth && <Typography variant="caption" sx={{ color: txtDim }}>DOB: {u.idVerification.dateOfBirth}</Typography>}
                                        </Box>
                                    </Box>
                                    <Chip label={si.label} size="small" sx={{ bgcolor: si.bg, color: si.color, fontWeight: 700, fontSize: '0.75rem', borderRadius: 1 }} />
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => setPreviewUser(u)} sx={{ color: txtSub, borderColor: cardBorder, textTransform: 'none' }}>Review</Button>
                                        {(u.verificationStatus === 'pending_verification' || u.verificationStatus === 'resubmit_id') && (<>
                                            <Button size="small" variant="contained" startIcon={actionLoading === u.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleIcon />} onClick={() => handleReview(u.uid, 'approved')} disabled={actionLoading === u.uid} sx={{ bgcolor: '#4caf50', textTransform: 'none', '&:hover': { bgcolor: '#388e3c' } }}>Approve</Button>
                                            <Button size="small" variant="contained" startIcon={actionLoading === u.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CancelIcon />} onClick={() => handleReview(u.uid, 'rejected')} disabled={actionLoading === u.uid} sx={{ bgcolor: '#f44336', textTransform: 'none', '&:hover': { bgcolor: '#c62828' } }}>Reject</Button>
                                            {u.verificationStatus === 'pending_verification' && (
                                                <Button size="small" variant="outlined" startIcon={<ReplayIcon />} onClick={() => handleReview(u.uid, 'resubmit_id')} disabled={actionLoading === u.uid} sx={{ color: '#2196f3', borderColor: '#2196f3', textTransform: 'none', '&:hover': { bgcolor: 'rgba(33,150,243,0.08)' } }}>Resubmit ID</Button>
                                            )}
                                        </>)}
                                        {u.verificationStatus === 'rejected' && (
                                            <Button size="small" variant="contained" startIcon={<ReplayIcon />} onClick={() => handleReview(u.uid, 'pending_verification')} sx={{ bgcolor: '#EE791A', textTransform: 'none', '&:hover': { bgcolor: '#c05905' } }}>Re-review</Button>
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
                            {[{ l: 'Full Name', v: previewUser.name || 'N/A' }, { l: 'Email', v: previewUser.email }, { l: 'Date of Birth', v: previewUser.idVerification?.dateOfBirth || 'N/A' }, { l: 'Submitted', v: previewUser.idVerification?.submittedAt ? new Date(previewUser.idVerification.submittedAt).toLocaleString() : 'N/A' }].map(x => (
                                <Paper key={x.l} sx={{ p: 2, bgcolor: colors.hover, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: txtDim, display: 'block', mb: 0.5 }}>{x.l}</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: txtMain }}>{x.v}</Typography>
                                </Paper>
                            ))}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: txtSub, mb: 1.5 }}>📄 Uploaded Government ID</Typography>
                        {(() => {
                            const imgSrc = previewUser.idVerification?.idBase64 || previewUser.idVerification?.idFileUrl;
                            if (imgSrc) return <Box sx={{ border: `1px solid ${cardBorder}`, borderRadius: 2, overflow: 'hidden', textAlign: 'center', p: 1 }}><Box component="img" src={imgSrc} alt="Government ID" sx={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1 }} /></Box>;
                            if (previewUser.idVerification?.idUploadPending) return <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(238,121,26,0.06)', border: '1px solid rgba(238,121,26,0.2)', borderRadius: 2 }}><Typography sx={{ color: '#EE791A', fontWeight: 600 }}>⏳ ID not yet uploaded</Typography><Typography variant="caption" sx={{ color: txtDim }}>The user has been asked to upload their ID.</Typography></Paper>;
                            return <Paper sx={{ p: 3, textAlign: 'center', bgcolor: cardBg, borderRadius: 2 }}><Typography sx={{ color: txtDim }}>No ID image available</Typography></Paper>;
                        })()}
                    </DialogContent>
                    {(previewUser.verificationStatus === 'pending_verification' || previewUser.verificationStatus === 'resubmit_id') && (
                        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${divider}`, gap: 1, flexWrap: 'wrap' }}>
                            <Button variant="outlined" startIcon={<ReplayIcon />} onClick={() => handleReview(previewUser.uid, 'resubmit_id')} disabled={actionLoading === previewUser.uid || previewUser.verificationStatus === 'resubmit_id'} sx={{ color: '#2196f3', borderColor: '#2196f3', textTransform: 'none', '&.Mui-disabled': { opacity: 0.4 } }}>Request Resubmit</Button>
                            <Box sx={{ flex: 1 }} />
                            <Button variant="contained" startIcon={<CancelIcon />} onClick={() => handleReview(previewUser.uid, 'rejected')} disabled={actionLoading === previewUser.uid} sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#c62828' }, textTransform: 'none' }}>Reject</Button>
                            <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={() => handleReview(previewUser.uid, 'approved')} disabled={actionLoading === previewUser.uid} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, textTransform: 'none', px: 3 }}>Approve</Button>
                        </DialogActions>
                    )}
                </>)}
            </Dialog>
        </Box>
    );
};

export default AdminVerification;
