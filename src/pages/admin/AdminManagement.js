import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Avatar, Button, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const AdminManagement = () => {
    const { user } = useAuth();
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [alert, setAlert] = useState(null);
    const [confirm, setConfirm] = useState(null);

    useEffect(() => {
        const unsub = onValue(ref(database, 'users/parents'), (snap) => {
            setParents(snap.val() ? Object.values(snap.val()) : []);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const admins = parents.filter(p => p.isAdmin);
    const nonAdmins = parents.filter(p => !p.isAdmin && p.idVerification?.status === 'approved');

    const showAlert = (severity, message) => {
        setAlert({ severity, message });
        setTimeout(() => setAlert(null), 4000);
    };

    const handleToggleAdmin = async (uid, makeAdmin) => {
        setActionLoading(uid);
        try {
            await update(ref(database, `users/parents/${uid}`), { isAdmin: makeAdmin });
            if (makeAdmin) {
                await update(ref(database, `users/parents/${uid}/idVerification`), { status: 'approved' });
            }
            showAlert('success', makeAdmin ? 'User promoted to admin.' : 'Admin access removed.');
        } catch { showAlert('error', 'Failed to update user.'); }
        setActionLoading(null);
        setConfirm(null);
    };

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress sx={{ color: '#EE791A' }} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 900, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Admin Management</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>Manage administrator access and privileges</Typography>
            </Box>

            {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}

            {/* Current Admins */}
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
                Current Administrators ({admins.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                {admins.map(a => (
                    <Paper key={a.uid} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(238,121,26,0.15)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#EE791A', width: 44, height: 44 }}><ShieldIcon /></Avatar>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>{a.name || 'Admin'}</Typography>
                                    {a.uid === user?.uid && <Chip label="YOU" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }} />}
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>{a.email}</Typography>
                            </Box>
                        </Box>
                        {a.uid !== user?.uid && (
                            <Button
                                size="small" variant="outlined"
                                startIcon={actionLoading === a.uid ? <CircularProgress size={14} sx={{ color: '#ef4444' }} /> : <RemoveCircleIcon />}
                                onClick={() => setConfirm({ uid: a.uid, email: a.email, action: 'remove' })}
                                disabled={actionLoading === a.uid}
                                sx={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', textTransform: 'none', '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' } }}
                            >
                                Remove Admin
                            </Button>
                        )}
                    </Paper>
                ))}
            </Box>

            {/* Promote Users */}
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
                Approved Users — Promote to Admin ({nonAdmins.length})
            </Typography>
            {nonAdmins.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <PersonIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', mb: 1 }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.35)' }}>No approved users available to promote</Typography>
                </Paper>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {nonAdmins.map(u => (
                        <Paper key={u.uid} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.08)', width: 44, height: 44, color: 'rgba(255,255,255,0.5)' }}><PersonIcon /></Avatar>
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>{u.name || 'No name'}</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>{u.email}</Typography>
                                </Box>
                            </Box>
                            <Button
                                size="small" variant="contained"
                                startIcon={actionLoading === u.uid ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <AddCircleIcon />}
                                onClick={() => setConfirm({ uid: u.uid, email: u.email, action: 'promote' })}
                                disabled={actionLoading === u.uid}
                                sx={{ bgcolor: '#EE791A', textTransform: 'none', '&:hover': { bgcolor: '#c05905' } }}
                            >
                                Make Admin
                            </Button>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} PaperProps={{ sx: { bgcolor: '#0b0b0b', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 } }}>
                {confirm && (<>
                    <DialogTitle sx={{ fontWeight: 700 }}>{confirm.action === 'promote' ? 'Promote to Admin' : 'Remove Admin Access'}</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {confirm.action === 'promote'
                                ? `Promote ${confirm.email} to administrator? They will have full access to the admin panel.`
                                : `Remove admin access for ${confirm.email}? They will lose access to the admin panel.`}
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setConfirm(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => handleToggleAdmin(confirm.uid, confirm.action === 'promote')}
                            sx={{ bgcolor: confirm.action === 'promote' ? '#EE791A' : '#ef4444', '&:hover': { bgcolor: confirm.action === 'promote' ? '#c05905' : '#dc2626' } }}>
                            Confirm
                        </Button>
                    </DialogActions>
                </>)}
            </Dialog>
        </Box>
    );
};

export default AdminManagement;
