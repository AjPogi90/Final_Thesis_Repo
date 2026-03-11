import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Switch, Alert, CircularProgress,
    Divider, Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';
import BlockIcon from '@mui/icons-material/Block';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../../config/firebase';

const defaultSettings = {
    minAge: 18,
    maxUploadSizeMB: 5,
    autoApproveEnabled: false,
    maintenanceMode: false,
    registrationEnabled: true,
    blockedKeywords: '',
    systemNotice: '',
};

const AdminSettings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const unsub = onValue(
            ref(database, 'systemSettings'),
            (snap) => {
                const data = snap.val();
                setSettings(data ? { ...defaultSettings, ...data } : defaultSettings);
                setLoading(false);
            },
            (error) => {
                // Permission denied or node missing — fall back to defaults
                console.warn('systemSettings read error:', error.message);
                setSettings(defaultSettings);
                setLoading(false);
            }
        );
        return () => unsub();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await set(ref(database, 'systemSettings'), settings);
            setAlert({ severity: 'success', message: 'Settings saved successfully.' });
        } catch (e) {
            console.error('Save settings error:', e.code, e.message);
            setAlert({ severity: 'error', message: `Failed to save settings: ${e.message}` });
        }
        setSaving(false);
        setTimeout(() => setAlert(null), 4000);
    };

    const updateField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress sx={{ color: '#EE791A' }} /></Box>;

    const inputSx = {
        '& .MuiFilledInput-root': { bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 1, '&:before,&:after': { display: 'none' } },
        '& input, & textarea': { color: '#fff' },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>System Settings</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>Configure system behavior and policies</Typography>
            </Box>

            {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}

            {/* Registration Settings */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <SecurityIcon sx={{ color: '#EE791A' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Registration & Verification</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>Enable Registration</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>Allow new users to create accounts</Typography>
                    </Box>
                    <Switch checked={settings.registrationEnabled} onChange={(e) => updateField('registrationEnabled', e.target.checked)} sx={{ '& .Mui-checked': { color: '#EE791A' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#EE791A' } }} />
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>Auto-Approve Verification</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>Automatically approve ID verifications (not recommended)</Typography>
                    </Box>
                    <Switch checked={settings.autoApproveEnabled} onChange={(e) => updateField('autoApproveEnabled', e.target.checked)} sx={{ '& .Mui-checked': { color: '#EE791A' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#EE791A' } }} />
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', my: 1 }} />

                <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                    <TextField label="Minimum Age" type="number" value={settings.minAge} onChange={(e) => updateField('minAge', parseInt(e.target.value) || 18)} variant="filled" size="small" sx={{ ...inputSx, width: 150 }} />
                    <TextField label="Max Upload Size (MB)" type="number" value={settings.maxUploadSizeMB} onChange={(e) => updateField('maxUploadSizeMB', parseInt(e.target.value) || 5)} variant="filled" size="small" sx={{ ...inputSx, width: 180 }} />
                </Box>
            </Paper>

            {/* System */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <TuneIcon sx={{ color: '#EE791A' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>System</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>Maintenance Mode</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>Temporarily disable access for all users</Typography>
                    </Box>
                    <Switch checked={settings.maintenanceMode} onChange={(e) => updateField('maintenanceMode', e.target.checked)} sx={{ '& .Mui-checked': { color: '#ef4444' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#ef4444' } }} />
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', my: 1 }} />

                <TextField
                    label="System Notice (shown to all users)"
                    value={settings.systemNotice} onChange={(e) => updateField('systemNotice', e.target.value)}
                    variant="filled" fullWidth multiline rows={2} size="small" sx={{ ...inputSx, mt: 1.5 }}
                />
            </Paper>

            {/* Content Filtering */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <BlockIcon sx={{ color: '#EE791A' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Content Filtering</Typography>
                </Box>

                <TextField
                    label="Blocked Keywords (comma-separated)"
                    value={settings.blockedKeywords}
                    onChange={(e) => updateField('blockedKeywords', e.target.value)}
                    variant="filled" fullWidth multiline rows={3} size="small" sx={inputSx}
                    helperText="Enter keywords separated by commas that should be blocked across the system"
                    FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.25)' } }}
                />
                {settings.blockedKeywords && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
                        {settings.blockedKeywords.split(',').filter(k => k.trim()).map((k, i) => (
                            <Chip key={i} label={k.trim()} size="small" sx={{ bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '0.75rem' }} />
                        ))}
                    </Box>
                )}
            </Paper>

            {/* Save */}
            <Button
                variant="contained" fullWidth startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveIcon />}
                onClick={handleSave} disabled={saving}
                sx={{ py: 1.5, bgcolor: '#EE791A', '&:hover': { bgcolor: '#c05905' }, fontWeight: 700, fontSize: '1rem' }}
            >
                Save Settings
            </Button>
        </Box>
    );
};

export default AdminSettings;
