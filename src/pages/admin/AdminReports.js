import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';

const BarChart = ({ data, maxVal }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 120 }}>
        {data.map((item, i) => (
            <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>{item.value}</Typography>
                <Box sx={{
                    width: '100%', maxWidth: 36,
                    height: `${maxVal > 0 ? (item.value / maxVal) * 100 : 0}%`,
                    minHeight: item.value > 0 ? 4 : 1,
                    bgcolor: item.color || '#EE791A',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease',
                }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.62rem', textAlign: 'center' }}>{item.label}</Typography>
            </Box>
        ))}
    </Box>
);

const AdminReports = () => {
    const [parents, setParents] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let loaded = 0;
        const checkDone = () => { loaded++; if (loaded >= 2) setLoading(false); };
        const u1 = onValue(ref(database, 'users/parents'), (s) => { setParents(s.val() ? Object.values(s.val()) : []); checkDone(); });
        const u2 = onValue(ref(database, 'users/childs'), (s) => { setChildren(s.val() ? Object.values(s.val()) : []); checkDone(); });
        return () => { u1(); u2(); };
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress sx={{ color: '#EE791A' }} /></Box>;

    const nonAdmin = parents.filter(p => !p.isAdmin);
    const pending = nonAdmin.filter(p => (p.idVerification?.status || 'pending_verification') === 'pending_verification').length;
    const approved = nonAdmin.filter(p => p.idVerification?.status === 'approved').length;
    const rejected = nonAdmin.filter(p => p.idVerification?.status === 'rejected').length;
    const admins = parents.filter(p => p.isAdmin).length;

    // Registration by month (last 6 months)
    const now = new Date();
    const monthLabels = [];
    const monthCounts = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthLabels.push(d.toLocaleString('default', { month: 'short' }));
        const start = d.getTime();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime();
        monthCounts.push(nonAdmin.filter(p => p.createdAt >= start && p.createdAt <= end).length);
    }
    const maxMonthly = Math.max(...monthCounts, 1);

    // Verification breakdown
    const verData = [
        { label: 'Pending', value: pending, color: '#EE791A' },
        { label: 'Approved', value: approved, color: '#4caf50' },
        { label: 'Rejected', value: rejected, color: '#ef4444' },
    ];
    const maxVer = Math.max(pending, approved, rejected, 1);

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Reports & Analytics</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>System usage statistics and insights</Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Users', value: nonAdmin.length + children.length, icon: <PeopleIcon />, color: '#3b82f6' },
                    { label: 'Parents', value: nonAdmin.length, icon: <PersonIcon />, color: '#8b5cf6' },
                    { label: 'Children', value: children.length, icon: <ChildCareIcon />, color: '#10b981' },
                    { label: 'Admins', value: admins, icon: <VerifiedUserIcon />, color: '#EE791A' },
                ].map(s => (
                    <Grid item xs={6} sm={3} key={s.label}>
                        <Paper sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'center' }}>
                            <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>{s.value}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* Monthly Registrations */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <TrendingUpIcon sx={{ color: '#EE791A' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Monthly Registrations</Typography>
                        </Box>
                        <BarChart
                            data={monthLabels.map((label, i) => ({ label, value: monthCounts[i], color: '#3b82f6' }))}
                            maxVal={maxMonthly}
                        />
                    </Paper>
                </Grid>

                {/* Verification Breakdown */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <VerifiedUserIcon sx={{ color: '#EE791A' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Verification Status</Typography>
                        </Box>
                        <BarChart data={verData} maxVal={maxVer} />
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                                Approval rate: <strong style={{ color: '#4caf50' }}>{(approved + rejected) > 0 ? Math.round(approved / (approved + rejected) * 100) : 0}%</strong>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* User Composition */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 2 }}>User Composition</Typography>
                        <Box sx={{ display: 'flex', height: 32, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                            {nonAdmin.length > 0 && <Box sx={{ flex: nonAdmin.length, bgcolor: '#8b5cf6', transition: 'flex 0.5s' }} />}
                            {children.length > 0 && <Box sx={{ flex: children.length, bgcolor: '#10b981', transition: 'flex 0.5s' }} />}
                            {admins > 0 && <Box sx={{ flex: admins, bgcolor: '#EE791A', transition: 'flex 0.5s' }} />}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Parents', count: nonAdmin.length, color: '#8b5cf6' },
                                { label: 'Children', count: children.length, color: '#10b981' },
                                { label: 'Admins', count: admins, color: '#EE791A' },
                            ].map(item => (
                                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                        {item.label}: <strong style={{ color: '#fff' }}>{item.count}</strong>
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminReports;
