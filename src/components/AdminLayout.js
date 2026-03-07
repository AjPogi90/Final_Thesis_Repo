import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    IconButton,
    Tooltip,
    Toolbar,
    Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShieldIcon from '@mui/icons-material/Shield';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const DRAWER_WIDTH = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'ID Verification', icon: <BadgeIcon />, path: '/admin/verification' },
    { text: 'Activity Logs', icon: <TimelineIcon />, path: '/admin/activity' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/admin/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    { text: 'Admin Management', icon: <AdminPanelSettingsIcon />, path: '/admin/admins' },
];

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Admin Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        bgcolor: '#0a0a0a',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                    },
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Admin Header */}
                    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 1.5,
                            background: 'linear-gradient(135deg, #EE791A 0%, #c05905 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ShieldIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                                AegistNet
                            </Typography>
                            <Chip
                                label="ADMIN"
                                size="small"
                                sx={{
                                    height: 18, fontSize: '0.65rem', fontWeight: 700,
                                    bgcolor: 'rgba(238,121,26,0.15)', color: '#EE791A',
                                    borderRadius: 0.5, mt: 0.3,
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                    {/* Back to Parent Dashboard */}
                    <Box sx={{ px: 2, pt: 1.5 }}>
                        <ListItemButton
                            onClick={() => navigate('/dashboard')}
                            sx={{
                                borderRadius: 1.5, mb: 0.5, py: 0.8,
                                color: 'rgba(255,255,255,0.4)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                                <ArrowBackIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Back to Dashboard"
                                primaryTypographyProps={{ fontSize: '0.82rem' }}
                            />
                        </ListItemButton>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mt: 0.5 }} />

                    {/* Navigation */}
                    <List sx={{ flexGrow: 1, px: 1.5, py: 1.5 }}>
                        <Typography variant="overline" sx={{ px: 1.5, color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', letterSpacing: 1.5 }}>
                            Administration
                        </Typography>
                        {menuItems.map((item) => (
                            <ListItemButton
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                selected={isActive(item.path)}
                                sx={{
                                    borderRadius: 1.5,
                                    mb: 0.3,
                                    py: 1,
                                    color: 'rgba(255,255,255,0.6)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.04)',
                                        color: '#fff',
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(238,121,26,0.12)',
                                        color: '#EE791A',
                                        '&:hover': { bgcolor: 'rgba(238,121,26,0.18)' },
                                        '& .MuiListItemIcon-root': { color: '#EE791A' },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 38, fontSize: 20 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.88rem',
                                        fontWeight: isActive(item.path) ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                    {/* Admin Profile */}
                    <Box sx={{ p: 2 }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2,
                        }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#EE791A', fontSize: '0.9rem', fontWeight: 700 }}>
                                {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }} noWrap>
                                    {user?.displayName || 'Admin'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }} noWrap>
                                    {user?.email}
                                </Typography>
                            </Box>
                            <Tooltip title="Sign Out">
                                <IconButton size="small" onClick={handleSignOut} sx={{ color: 'rgba(255,255,255,0.3)' }}>
                                    <LogoutIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: '#050505',
                    minHeight: '100vh',
                    width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    color: '#fff',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;
