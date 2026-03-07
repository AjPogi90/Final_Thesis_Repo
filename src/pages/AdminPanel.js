import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    IconButton,
    Avatar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BadgeIcon from '@mui/icons-material/Badge';
import PeopleIcon from '@mui/icons-material/People';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloseIcon from '@mui/icons-material/Close';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const statusColors = {
    pending_verification: { bg: 'rgba(238,121,26,0.12)', color: '#EE791A', label: 'PENDING' },
    approved: { bg: 'rgba(76,175,80,0.12)', color: '#4caf50', label: 'APPROVED' },
    rejected: { bg: 'rgba(244,67,54,0.12)', color: '#f44336', label: 'REJECTED' },
};

const AdminPanel = () => {
    const { reviewUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [previewUser, setPreviewUser] = useState(null);
    const [alert, setAlert] = useState(null);

    // Listen to all parent users
    useEffect(() => {
        const parentsRef = ref(database, 'users/parents');
        const unsub = onValue(parentsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.values(data).map((u) => ({
                    ...u,
                    verificationStatus: u.idVerification?.status || 'pending_verification',
                }));
                // Sort: pending first, then by creation date descending
                list.sort((a, b) => {
                    if (a.verificationStatus === 'pending_verification' && b.verificationStatus !== 'pending_verification') return -1;
                    if (a.verificationStatus !== 'pending_verification' && b.verificationStatus === 'pending_verification') return 1;
                    return (b.createdAt || 0) - (a.createdAt || 0);
                });
                setUsers(list);
            } else {
                setUsers([]);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleReview = async (uid, decision) => {
        setActionLoading(uid);
        const result = await reviewUser(uid, decision);
        setActionLoading(null);
        if (result.success) {
            setAlert({ severity: 'success', message: `User ${decision === 'approved' ? 'approved' : 'rejected'} successfully.` });
            setPreviewUser(null);
        } else {
            setAlert({ severity: 'error', message: 'Failed to update user status.' });
        }
        setTimeout(() => setAlert(null), 4000);
    };

    // Filter users by tab
    const filteredUsers = users.filter((u) => {
        if (u.isAdmin) return false; // don't show admin accounts
        if (tabValue === 0) return u.verificationStatus === 'pending_verification';
        if (tabValue === 1) return u.verificationStatus === 'approved';
        if (tabValue === 2) return u.verificationStatus === 'rejected';
        return true;
    });

    const pendingCount = users.filter((u) => !u.isAdmin && u.verificationStatus === 'pending_verification').length;
    const approvedCount = users.filter((u) => !u.isAdmin && u.verificationStatus === 'approved').length;
    const rejectedCount = users.filter((u) => !u.isAdmin && u.verificationStatus === 'rejected').length;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress sx={{ color: '#EE791A' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: 2,
                        background: 'linear-gradient(135deg, #EE791A 0%, #c05905 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <VerifiedUserIcon sx={{ color: '#fff', fontSize: 26 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                            ID Verification Panel
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Review and approve parent identity verifications
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {[
                    { label: 'Pending', count: pendingCount, color: '#EE791A', icon: <HourglassTopIcon /> },
                    { label: 'Approved', count: approvedCount, color: '#4caf50', icon: <CheckCircleIcon /> },
                    { label: 'Rejected', count: rejectedCount, color: '#f44336', icon: <CancelIcon /> },
                ].map((stat) => (
                    <Paper key={stat.label} sx={{
                        flex: '1 1 140px',
                        p: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '50%',
                            bgcolor: `${stat.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: stat.color,
                        }}>
                            {stat.icon}
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                                {stat.count}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                {stat.label}
                            </Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}

            {/* Tabs */}
            <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 600, fontSize: '0.9rem' },
                    '& .Mui-selected': { color: '#EE791A' },
                    '& .MuiTabs-indicator': { backgroundColor: '#EE791A' },
                }}
            >
                <Tab label={`Pending (${pendingCount})`} />
                <Tab label={`Approved (${approvedCount})`} />
                <Tab label={`Rejected (${rejectedCount})`} />
            </Tabs>

            {/* User list */}
            {filteredUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PeopleIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.35)' }}>
                        No {tabValue === 0 ? 'pending' : tabValue === 1 ? 'approved' : 'rejected'} verifications
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredUsers.map((u) => {
                        const statusInfo = statusColors[u.verificationStatus] || statusColors.pending_verification;
                        return (
                            <Paper
                                key={u.uid}
                                sx={{
                                    p: 2.5,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 2,
                                    transition: 'border-color 0.2s',
                                    '&:hover': { borderColor: 'rgba(255,255,255,0.12)' },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                    {/* User info */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 200 }}>
                                        <Avatar sx={{ bgcolor: '#EE791A', width: 44, height: 44, fontWeight: 700, fontSize: '1rem' }}>
                                            {(u.name || u.email || '?')[0].toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                                                {u.name || 'No name'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                                                {u.email}
                                            </Typography>
                                            {u.idVerification?.dateOfBirth && (
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                                                    DOB: {u.idVerification.dateOfBirth}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Status badge */}
                                    <Chip
                                        label={statusInfo.label}
                                        size="small"
                                        sx={{
                                            bgcolor: statusInfo.bg,
                                            color: statusInfo.color,
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            borderRadius: 1,
                                        }}
                                    />

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => setPreviewUser(u)}
                                            sx={{
                                                color: 'rgba(255,255,255,0.7)',
                                                borderColor: 'rgba(255,255,255,0.12)',
                                                textTransform: 'none',
                                                '&:hover': { borderColor: 'rgba(255,255,255,0.3)' },
                                            }}
                                        >
                                            Review
                                        </Button>
                                        {u.verificationStatus === 'pending_verification' && (
                                            <>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={actionLoading === u.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleIcon />}
                                                    onClick={() => handleReview(u.uid, 'approved')}
                                                    disabled={actionLoading === u.uid}
                                                    sx={{
                                                        bgcolor: '#4caf50',
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: '#388e3c' },
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={actionLoading === u.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CancelIcon />}
                                                    onClick={() => handleReview(u.uid, 'rejected')}
                                                    disabled={actionLoading === u.uid}
                                                    sx={{
                                                        bgcolor: '#f44336',
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: '#c62828' },
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            )}

            {/* ── ID Preview Dialog ── */}
            <Dialog
                open={Boolean(previewUser)}
                onClose={() => setPreviewUser(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#0b0b0b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 3,
                    },
                }}
            >
                {previewUser && (
                    <>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <BadgeIcon sx={{ color: '#EE791A' }} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>ID Verification Review</Typography>
                            </Box>
                            <IconButton onClick={() => setPreviewUser(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            {/* User details */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>Full Name</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>{previewUser.name || 'N/A'}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>Email</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>{previewUser.email}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>Date of Birth</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>{previewUser.idVerification?.dateOfBirth || 'N/A'}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>Submitted</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                                        {previewUser.idVerification?.submittedAt
                                            ? new Date(previewUser.idVerification.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : 'N/A'}
                                    </Typography>
                                </Paper>
                            </Box>

                            {/* ID Image */}
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)', mb: 1.5 }}>
                                📄 Uploaded Government ID
                            </Typography>
                            {previewUser.idVerification?.idFileUrl ? (
                                <Box sx={{
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    p: 1,
                                }}>
                                    <Box
                                        component="img"
                                        src={previewUser.idVerification.idFileUrl}
                                        alt="Government ID"
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: 400,
                                            objectFit: 'contain',
                                            borderRadius: 1,
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>No ID image available</Typography>
                                </Paper>
                            )}
                        </DialogContent>

                        {/* Action buttons in dialog */}
                        {previewUser.verificationStatus === 'pending_verification' && (
                            <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <Button
                                    variant="contained"
                                    startIcon={actionLoading === previewUser.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CancelIcon />}
                                    onClick={() => handleReview(previewUser.uid, 'rejected')}
                                    disabled={actionLoading === previewUser.uid}
                                    sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#c62828' }, textTransform: 'none' }}
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={actionLoading === previewUser.uid ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleIcon />}
                                    onClick={() => handleReview(previewUser.uid, 'approved')}
                                    disabled={actionLoading === previewUser.uid}
                                    sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, textTransform: 'none', px: 3 }}
                                >
                                    Approve
                                </Button>
                            </DialogActions>
                        )}
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default AdminPanel;
