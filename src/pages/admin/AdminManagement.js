import React from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import { ADMIN_EMAIL } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const AdminManagement = () => {
    const { colors } = useTheme();
    const txtMain = colors.text;
    const txtSub = colors.textSecondary;
    const txtDim = 'rgba(0,0,0,0.3)';

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 900, mx: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: txtMain, mb: 0.5 }}>
                    Admin Management
                </Typography>
                <Typography variant="body2" sx={{ color: txtSub }}>
                    Administrator account information
                </Typography>
            </Box>

            <Typography variant="overline" sx={{ color: txtDim, letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
                System Administrator (1)
            </Typography>

            <Paper sx={{
                p: 2.5,
                bgcolor: colors.cardBg,
                border: '1px solid rgba(238,121,26,0.25)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
                mb: 4,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#EE791A', width: 44, height: 44 }}>
                        <ShieldIcon />
                    </Avatar>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: txtMain }}>
                                System Admin
                            </Typography>
                            <Chip label="YOU" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: txtSub }}>
                            {ADMIN_EMAIL}
                        </Typography>
                    </Box>
                </Box>
                <Chip label="ADMIN" size="small" sx={{ bgcolor: 'rgba(238,121,26,0.15)', color: '#EE791A', fontWeight: 700, border: '1px solid rgba(238,121,26,0.3)' }} />
            </Paper>

            {/* Policy Notice */}
            <Paper sx={{
                p: 3,
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
            }}>
                <LockIcon sx={{ color: txtDim, mt: 0.3, flexShrink: 0 }} />
                <Box>
                    <Typography variant="body2" sx={{ color: txtMain, fontWeight: 600, mb: 0.5 }}>
                        Single Administrator Policy
                    </Typography>
                    <Typography variant="body2" sx={{ color: txtSub, lineHeight: 1.7 }}>
                        This system is configured with a single, fixed administrator account. Only{' '}
                        <span style={{ color: '#EE791A' }}>{ADMIN_EMAIL}</span> has admin access.
                        Regular users cannot be promoted to administrator.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default AdminManagement;
