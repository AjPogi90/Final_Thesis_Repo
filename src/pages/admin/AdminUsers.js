import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Tabs, Tab, Avatar, Chip, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, InputAdornment, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CloseIcon from '@mui/icons-material/Close';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import { useTheme } from '../../contexts/ThemeContext';

const AdminUsers = () => {
    const { colors } = useTheme();
    const [tab, setTab] = useState(0);
    const [parents, setParents] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewUser, setViewUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        let loaded = 0;
        const checkDone = () => { loaded++; if (loaded >= 2) setLoading(false); };
        const u1 = onValue(ref(database, 'users/parents'), (s) => { setParents(s.val() ? Object.values(s.val()) : []); checkDone(); });
        const u2 = onValue(ref(database, 'users/childs'), (s) => { setChildren(s.val() ? Object.values(s.val()) : []); checkDone(); });
        return () => { u1(); u2(); };
    }, []);

    const filteredParents = useMemo(() => {
        const q = search.toLowerCase();
        return parents.filter(p => !p.isAdmin).filter(p =>
            (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q)
        );
    }, [parents, search]);

    const filteredChildren = useMemo(() => {
        const q = search.toLowerCase();
        return children.filter(c =>
            (c.name || '').toLowerCase().includes(q) || (c.email || c.parentEmail || '').toLowerCase().includes(q)
        );
    }, [children, search]);

    const showAlert = (severity, message) => {
        setAlert({ severity, message });
        setTimeout(() => setAlert(null), 4000);
    };

    const handleDisable = async (uid, currentlyDisabled) => {
        setActionLoading(true);
        try {
            await update(ref(database, `users/parents/${uid}`), { disabled: !currentlyDisabled });
            showAlert('success', currentlyDisabled ? 'User enabled.' : 'User disabled.');
        } catch { showAlert('error', 'Failed to update user.'); }
        setActionLoading(false);
        setConfirmAction(null);
    };

    const handleDelete = async (uid) => {
        setActionLoading(true);
        try {
            await remove(ref(database, `users/parents/${uid}`));
            showAlert('success', 'User removed from database.');
        } catch { showAlert('error', 'Failed to delete user.'); }
        setActionLoading(false);
        setConfirmAction(null);
    };

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress sx={{ color: '#EE791A' }} /></Box>;

    const cardBg = colors.cardBg;
    const cardBorder = colors.cardBorder;
    const txtMain = colors.text;
    const txtSub = colors.textSecondary;
    const txtDim = 'rgba(0,0,0,0.35)';
    const divider = colors.divider;

    const statusChip = (status) => {
        const config = {
            approved: { label: 'APPROVED', color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
            rejected: { label: 'REJECTED', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
            pending_verification: { label: 'PENDING', color: '#EE791A', bg: 'rgba(238,121,26,0.12)' },
        };
        const c = config[status] || config.pending_verification;
        return <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />;
    };

    const tabSx = {
        mb: 3,
        '& .MuiTab-root': { color: txtSub, textTransform: 'none', fontWeight: 600 },
        '& .Mui-selected': { color: '#EE791A' },
        '& .MuiTabs-indicator': { backgroundColor: '#EE791A' },
    };

    const thSx = { color: txtDim, borderColor: divider, fontWeight: 600, fontSize: '0.78rem' };
    const tdSx = { color: txtSub, borderColor: divider, py: 1.5 };

    const dialogPaper = { sx: { bgcolor: colors.cardBg, color: txtMain, border: `1px solid ${cardBorder}`, borderRadius: 3 } };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: txtMain, mb: 0.5 }}>User Management</Typography>
                <Typography variant="body2" sx={{ color: txtSub }}>Manage parent and child accounts</Typography>
            </Box>

            {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}

            <TextField
                placeholder="Search by name or email..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                fullWidth size="small" variant="filled"
                sx={{
                    mb: 2, maxWidth: 400,
                    '& .MuiFilledInput-root': { bgcolor: colors.hover, borderRadius: 1, '&:before,&:after': { display: 'none' } },
                    '& input': { color: txtMain },
                    '& .MuiInputLabel-root': { color: txtSub },
                }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: txtDim }} /></InputAdornment> }}
            />

            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={tabSx}>
                <Tab icon={<PersonIcon />} iconPosition="start" label={`Parents (${filteredParents.length})`} />
                <Tab icon={<ChildCareIcon />} iconPosition="start" label={`Children (${filteredChildren.length})`} />
            </Tabs>

            {tab === 0 && (
                <Paper sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': thSx }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>DOB</TableCell>
                                    <TableCell>Registered</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredParents.map((p) => (
                                    <TableRow key={p.uid} sx={{ '& td': tdSx, opacity: p.disabled ? 0.5 : 1 }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar src="/ParentLogo.png" alt="Parent" sx={{ width: 32, height: 32, bgcolor: 'transparent' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: txtMain }}>{p.name || 'No name'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: txtSub, fontSize: '0.82rem' }}>{p.email}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: txtDim, fontSize: '0.8rem' }}>{p.idVerification?.dateOfBirth || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: txtDim, fontSize: '0.8rem' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</Typography></TableCell>
                                        <TableCell>{p.disabled ? <Chip label="DISABLED" size="small" sx={{ bgcolor: colors.hover, color: txtDim, fontWeight: 700, fontSize: '0.7rem', height: 22 }} /> : statusChip(p.idVerification?.status)}</TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <Tooltip title="View details"><IconButton size="small" onClick={() => setViewUser(p)} sx={{ color: txtDim }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title={p.disabled ? 'Enable' : 'Disable'}><IconButton size="small" onClick={() => setConfirmAction({ type: 'disable', user: p })} sx={{ color: p.disabled ? '#4caf50' : '#EE791A' }}>{p.disabled ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}</IconButton></Tooltip>
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => setConfirmAction({ type: 'delete', user: p })} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredParents.length === 0 && <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', color: txtDim, py: 4 }}>No parent accounts found</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {tab === 1 && (
                <Paper sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': thSx }}>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Parent Email</TableCell>
                                    <TableCell>Device</TableCell>
                                    <TableCell>Last Active</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredChildren.map((c, i) => (
                                    <TableRow key={c.id || i} sx={{ '& td': tdSx }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981', fontSize: '0.8rem' }}>{(c.name || '?')[0].toUpperCase()}</Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: txtMain }}>{c.name || 'Unknown'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: txtSub, fontSize: '0.82rem' }}>{c.email || c.parentEmail || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: txtDim, fontSize: '0.8rem' }}>{c.deviceModel || c.device || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: txtDim, fontSize: '0.8rem' }}>{c.lastUpdated ? new Date(c.lastUpdated).toLocaleString() : '—'}</Typography></TableCell>
                                    </TableRow>
                                ))}
                                {filteredChildren.length === 0 && <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: txtDim, py: 4 }}>No child devices found</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* View User Dialog */}
            <Dialog open={Boolean(viewUser)} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth PaperProps={dialogPaper}>
                {viewUser && (<>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: txtMain }}>User Details</Typography>
                        <IconButton onClick={() => setViewUser(null)} sx={{ color: txtDim }}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ borderColor: divider }}>
                        {[
                            { label: 'Name', value: viewUser.name || 'N/A' },
                            { label: 'Email', value: viewUser.email },
                            { label: 'UID', value: viewUser.uid },
                            { label: 'Date of Birth', value: viewUser.idVerification?.dateOfBirth || 'N/A' },
                            { label: 'Registered', value: viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : 'N/A' },
                            { label: 'Verification Status', value: viewUser.idVerification?.status || 'N/A' },
                        ].map(item => (
                            <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: `1px solid ${divider}` }}>
                                <Typography variant="body2" sx={{ color: txtDim }}>{item.label}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: txtMain }}>{item.value}</Typography>
                            </Box>
                        ))}
                        {viewUser.idVerification?.idFileUrl && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ color: txtDim, mb: 1 }}>Government ID:</Typography>
                                <Box component="img" src={viewUser.idVerification.idFileUrl} alt="ID" sx={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 1, border: `1px solid ${cardBorder}` }} />
                            </Box>
                        )}
                    </DialogContent>
                </>)}
            </Dialog>

            {/* Confirm Action Dialog */}
            <Dialog open={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} PaperProps={dialogPaper}>
                {confirmAction && (<>
                    <DialogTitle sx={{ fontWeight: 700, color: txtMain }}>{confirmAction.type === 'delete' ? 'Delete User' : (confirmAction.user.disabled ? 'Enable User' : 'Disable User')}</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ color: txtSub }}>
                            {confirmAction.type === 'delete'
                                ? `Are you sure you want to delete ${confirmAction.user.email}? This cannot be undone.`
                                : `Are you sure you want to ${confirmAction.user.disabled ? 'enable' : 'disable'} ${confirmAction.user.email}?`}
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setConfirmAction(null)} sx={{ color: txtSub }}>Cancel</Button>
                        <Button
                            variant="contained"
                            disabled={actionLoading}
                            onClick={() => confirmAction.type === 'delete' ? handleDelete(confirmAction.user.uid) : handleDisable(confirmAction.user.uid, confirmAction.user.disabled)}
                            sx={{ bgcolor: confirmAction.type === 'delete' ? '#ef4444' : '#EE791A', '&:hover': { bgcolor: confirmAction.type === 'delete' ? '#dc2626' : '#c05905' } }}
                        >
                            {actionLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Confirm'}
                        </Button>
                    </DialogActions>
                </>)}
            </Dialog>
        </Box>
    );
};

export default AdminUsers;
