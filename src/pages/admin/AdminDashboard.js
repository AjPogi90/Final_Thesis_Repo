import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Avatar, Chip, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DevicesIcon from '@mui/icons-material/Devices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { useTheme } from '../../contexts/ThemeContext';

const AdminDashboard = () => {
    const { colors } = useTheme();
    const [parents, setParents] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let loaded = 0;
        const checkDone = () => { loaded++; if (loaded >= 2) setLoading(false); };
        const unsub1 = onValue(ref(database, 'users/parents'), (snap) => { setParents(snap.val() ? Object.values(snap.val()) : []); checkDone(); });
        const unsub2 = onValue(ref(database, 'users/childs'), (snap) => { setChildren(snap.val() ? Object.values(snap.val()) : []); checkDone(); });
        return () => { unsub1(); unsub2(); };
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress sx={{ color: '#EE791A' }} /></Box>;

    const totalUsers = parents.length + children.length;
    const pendingCount = parents.filter(p => !p.isAdmin && (p.idVerification?.status === 'pending_verification' || !p.idVerification?.status)).length;
    const approvedCount = parents.filter(p => !p.isAdmin && p.idVerification?.status === 'approved').length;
    const rejectedCount = parents.filter(p => !p.isAdmin && p.idVerification?.status === 'rejected').length;
    const adminCount = parents.filter(p => p.isAdmin).length;
    const recentParents = [...parents].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8);

    const cardBg = colors.cardBg;
    const cardBorder = colors.cardBorder;
    const txtMain = colors.text;
    const txtSub = colors.textSecondary;
    const txtDim = 'rgba(0,0,0,0.35)';
    const divider = colors.divider;

    const statCards = [
        { label: 'Total Users', value: totalUsers, icon: <PeopleIcon />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Parent Accounts', value: parents.length - adminCount, icon: <PersonIcon />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { label: 'Child Devices', value: children.length, icon: <ChildCareIcon />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { label: 'Pending Verifications', value: pendingCount, icon: <HourglassTopIcon />, color: '#EE791A', bg: 'rgba(238,121,26,0.1)' },
        { label: 'Approved', value: approvedCount, icon: <CheckCircleIcon />, color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
        { label: 'Rejected', value: rejectedCount, icon: <CancelIcon />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    ];

    const statusConfig = {
        admin: { label: 'ADMIN', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
        approved: { label: 'APPROVED', color: '#4caf50', bg: 'rgba(76,175,80,0.12)' },
        rejected: { label: 'REJECTED', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
        pending_verification: { label: 'PENDING', color: '#EE791A', bg: 'rgba(238,121,26,0.12)' },
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: txtMain, mb: 0.5 }}>Admin Dashboard</Typography>
                <Typography variant="body2" sx={{ color: txtSub }}>System overview and statistics</Typography>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {statCards.map((stat) => (
                    <Grid item xs={6} sm={4} md={2} key={stat.label}>
                        <Paper sx={{ p: 2.5, bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, transition: 'border-color 0.2s', '&:hover': { borderColor: 'rgba(0,0,0,0.2)' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                    {stat.icon}
                                </Box>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: txtMain, lineHeight: 1 }}>{stat.value}</Typography>
                            <Typography variant="caption" sx={{ color: txtDim, mt: 0.5, display: 'block' }}>{stat.label}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Quick Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: txtMain, mb: 2.5 }}>Verification Overview</Typography>
                        {[
                            { label: 'Pending Review', count: pendingCount, total: parents.length, color: '#EE791A' },
                            { label: 'Approved', count: approvedCount, total: parents.length, color: '#4caf50' },
                            { label: 'Rejected', count: rejectedCount, total: parents.length, color: '#ef4444' },
                        ].map((item) => (
                            <Box key={item.label} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ color: txtSub }}>{item.label}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>{item.count}</Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 6, bgcolor: divider, borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${parents.length > 0 ? (item.count / parents.length) * 100 : 0}%`, height: '100%', bgcolor: item.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: txtMain, mb: 2.5 }}>System Summary</Typography>
                        <Grid container spacing={2}>
                            {[
                                { icon: <DevicesIcon />, label: 'Connected Devices', value: children.length, color: '#10b981' },
                                { icon: <PersonIcon />, label: 'Admin Accounts', value: adminCount, color: '#8b5cf6' },
                                { icon: <TrendingUpIcon />, label: 'Registration Rate', value: `${parents.length > 0 ? Math.round((approvedCount / Math.max(parents.length - adminCount, 1)) * 100) : 0}%`, color: '#3b82f6' },
                                { icon: <CheckCircleIcon />, label: 'Approval Rate', value: `${(approvedCount + rejectedCount) > 0 ? Math.round((approvedCount / (approvedCount + rejectedCount)) * 100) : 0}%`, color: '#EE791A' },
                            ].map((item) => (
                                <Grid item xs={6} key={item.label}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: colors.hover, borderRadius: 1.5 }}>
                                        <Box sx={{ color: item.color }}>{item.icon}</Box>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: txtMain, lineHeight: 1 }}>{item.value}</Typography>
                                            <Typography variant="caption" sx={{ color: txtDim }}>{item.label}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Registrations */}
            <Paper sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, borderBottom: `1px solid ${divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: txtMain }}>Recent Registrations</Typography>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& th': { color: txtDim, borderColor: divider, fontWeight: 600, fontSize: '0.78rem' } }}>
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentParents.map((p) => {
                                const status = p.isAdmin ? 'admin' : (p.idVerification?.status || 'pending_verification');
                                const sc = statusConfig[status] || statusConfig.pending_verification;
                                return (
                                    <TableRow key={p.uid} sx={{ '& td': { color: txtSub, borderColor: divider, py: 1.5 } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar src="/ParentLogo.png" alt="Parent" sx={{ width: 32, height: 32, bgcolor: 'transparent' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: txtMain }}>{p.name || 'No name'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: txtSub, fontSize: '0.82rem' }}>{p.email}</Typography></TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: txtDim, fontSize: '0.8rem' }}>
                                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {recentParents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center', color: txtDim, py: 4 }}>No registrations yet</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AdminDashboard;
