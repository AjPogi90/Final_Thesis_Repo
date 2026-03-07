import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, InputAdornment, Tabs, Tab,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SettingsIcon from '@mui/icons-material/Settings';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { database } from '../../config/firebase';

const actionConfig = {
    registration: { label: 'Registration', color: '#3b82f6', icon: <PersonAddIcon fontSize="small" /> },
    login: { label: 'Login', color: '#10b981', icon: <LoginIcon fontSize="small" /> },
    verification: { label: 'Verification', color: '#EE791A', icon: <VerifiedUserIcon fontSize="small" /> },
    admin: { label: 'Admin Action', color: '#8b5cf6', icon: <SettingsIcon fontSize="small" /> },
    system: { label: 'System', color: '#64748b', icon: <TimelineIcon fontSize="small" /> },
};

// Helper to log activities from anywhere in the app
export const logActivity = async (type, details, userId = '', userEmail = '') => {
    try {
        await push(ref(database, 'activityLogs'), {
            type, details, userId, userEmail,
            timestamp: Date.now(),
        });
    } catch (e) { console.warn('Activity log failed:', e); }
};

const AdminActivity = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState(0);

    useEffect(() => {
        const unsub = onValue(ref(database, 'activityLogs'), (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data).map(([id, log]) => ({ id, ...log }));
                list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                setLogs(list);
            } else setLogs([]);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const types = ['all', 'registration', 'login', 'verification', 'admin', 'system'];
    const filtered = logs.filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q || (l.details || '').toLowerCase().includes(q) || (l.userEmail || '').toLowerCase().includes(q);
        const matchType = tab === 0 || l.type === types[tab];
        return matchSearch && matchType;
    });

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress sx={{ color: '#EE791A' }} /></Box>;

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Activity Logs</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>Monitor system events and user activity</Typography>
            </Box>

            <TextField
                placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)}
                fullWidth size="small" variant="filled"
                sx={{ mb: 2, maxWidth: 400, '& .MuiFilledInput-root': { bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 1, '&:before,&:after': { display: 'none' } }, '& input': { color: '#fff' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment> }}
            />

            <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" sx={{ mb: 3, '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 600, minWidth: 'auto' }, '& .Mui-selected': { color: '#EE791A' }, '& .MuiTabs-indicator': { backgroundColor: '#EE791A' } }}>
                <Tab label={`All (${logs.length})`} />
                {types.slice(1).map(t => <Tab key={t} label={`${t.charAt(0).toUpperCase() + t.slice(1)} (${logs.filter(l => l.type === t).length})`} />)}
            </Tabs>

            <Paper sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& th': { color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.06)', fontWeight: 600, fontSize: '0.78rem' } }}>
                                <TableCell width={180}>Timestamp</TableCell>
                                <TableCell width={120}>Type</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell>User</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.slice(0, 100).map(log => {
                                const ac = actionConfig[log.type] || actionConfig.system;
                                return (
                                    <TableRow key={log.id} sx={{ '& td': { color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.04)', py: 1.2 } }}>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip icon={ac.icon} label={ac.label} size="small" sx={{ bgcolor: `${ac.color}15`, color: ac.color, fontWeight: 600, fontSize: '0.7rem', height: 24, '& .MuiChip-icon': { color: ac.color } }} />
                                        </TableCell>
                                        <TableCell><Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{log.details || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{log.userEmail || '—'}</Typography></TableCell>
                                    </TableRow>
                                );
                            })}
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', py: 6 }}>
                                    <TimelineIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', mb: 1, display: 'block', mx: 'auto' }} />
                                    No activity logs yet. Actions will appear here as users interact with the system.
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AdminActivity;
