import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Paper, CircularProgress, Avatar } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ref, onValue, update } from 'firebase/database';
import { database, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * TEMPORARY setup page — allows promoting a user to admin.
 * Works whether logged in or not (lists all existing parent users).
 * Remove this page after initial setup.
 */
const AdminSetup = () => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentUid, setCurrentUid] = useState(null);
    const [result, setResult] = useState(null);

    // Listen for auth state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUid(user?.uid || null);
        });
        return () => unsub();
    }, []);

    // Load all parent users
    useEffect(() => {
        const parentsRef = ref(database, 'users/parents');
        const unsub = onValue(parentsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setUsers(Object.entries(data).map(([uid, info]) => ({ uid, ...info })));
            } else {
                setUsers([]);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleMakeAdmin = async (uid, email) => {
        setActionLoading(uid);
        setResult(null);
        try {
            await update(ref(database, `users/parents/${uid}`), {
                isAdmin: true,
            });
            // Also ensure idVerification status is approved
            await update(ref(database, `users/parents/${uid}/idVerification`), {
                status: 'approved',
                reviewedAt: Date.now(),
                reviewedBy: 'system-setup',
            });
            setResult({
                severity: 'success',
                message: `✅ ${email} is now an admin with approved status! Go to /login to sign in, then visit /admin.`,
            });
        } catch (err) {
            setResult({ severity: 'error', message: `Failed: ${err.message}` });
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <Box sx={{
            width: '100%', minHeight: '100vh', background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6,
        }}>
            <Paper sx={{
                p: 5, width: 560, maxWidth: '94%', borderRadius: 3,
                bgcolor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)', color: '#fff',
            }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{
                        width: 70, height: 70, borderRadius: '50%', mx: 'auto', mb: 2,
                        background: 'linear-gradient(135deg, #EE791A 0%, #c05905 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <AdminPanelSettingsIcon sx={{ fontSize: 36, color: '#fff' }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Admin Setup</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        Select a user below to promote them to <strong style={{ color: '#EE791A' }}>admin</strong> and approve their verification.
                    </Typography>
                </Box>

                {result && <Alert severity={result.severity} sx={{ mb: 2, textAlign: 'left' }}>{result.message}</Alert>}

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#EE791A' }} />
                    </Box>
                ) : users.length === 0 ? (
                    <Alert severity="info">No parent accounts found in the database. Register an account first.</Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {users.map((u) => (
                            <Paper
                                key={u.uid}
                                sx={{
                                    p: 2,
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${u.isAdmin ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                    <Avatar sx={{ bgcolor: u.isAdmin ? '#4caf50' : '#EE791A', width: 38, height: 38 }}>
                                        {u.isAdmin ? <CheckCircleIcon /> : <PersonIcon />}
                                    </Avatar>
                                    <Box sx={{ overflow: 'hidden' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                            {u.name || 'No name'}{currentUid === u.uid ? ' (you)' : ''}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {u.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                {u.isAdmin ? (
                                    <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        ✓ ADMIN
                                    </Typography>
                                ) : (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleMakeAdmin(u.uid, u.email)}
                                        disabled={actionLoading === u.uid}
                                        sx={{
                                            backgroundColor: '#EE791A',
                                            '&:hover': { backgroundColor: '#c05905' },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {actionLoading === u.uid ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Make Admin'}
                                    </Button>
                                )}
                            </Paper>
                        ))}
                    </Box>
                )}

                <Alert severity="warning" sx={{ mt: 3, textAlign: 'left', bgcolor: 'rgba(255,152,0,0.08)', color: '#ffb74d' }}>
                    ⚠️ Remove this page after initial setup by deleting the <code>/admin-setup</code> route from <code>App.js</code> and this file.
                </Alert>
            </Paper>
        </Box>
    );
};

export default AdminSetup;
