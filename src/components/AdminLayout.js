import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Typography, Divider, Avatar, IconButton, Tooltip, Chip, Switch,
    AppBar, Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Shield';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import ConfirmationModal from './ConfirmationModal';

const DRAWER_WIDTH = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'ID Verification', icon: <BadgeIcon />, path: '/admin/verification' },
    { text: 'Activity Logs', icon: <TimelineIcon />, path: '/admin/activity' },
    { text: 'Reports', icon: <BarChartIcon />, path: '/admin/reports' },
    { text: 'Admin Management', icon: <AdminPanelSettingsIcon />, path: '/admin/admins' },
];

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { isDark, toggleTheme, colors } = useTheme();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    const handleSignOut = async () => {
        await signOut(auth);
        setLogoutModalOpen(false);
        navigate('/login');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.cardBg }}>
            {/* Admin Header */}
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary }}>
                    AegistNet
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Admin Panel
                </Typography>
            </Box>

            <Divider sx={{ borderColor: colors.divider }} />

            {/* Navigation */}
            <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
                <Typography variant="overline" sx={{ px: 1.5, color: colors.textSecondary, fontSize: '0.68rem', letterSpacing: 1.5 }}>
                    Administration
                </Typography>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        selected={isActive(item.path)}
                        sx={{
                            borderRadius: 2, mb: 0.5, color: colors.text,
                            '&:hover': { bgcolor: colors.hover },
                            '&.Mui-selected': {
                                bgcolor: colors.primary, color: '#fff',
                                '&:hover': { bgcolor: '#c05905ff' },
                                '& .MuiListItemIcon-root': { color: '#fff' },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: isActive(item.path) ? '#fff' : colors.textSecondary, minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: isActive(item.path) ? 600 : 400 }} />
                    </ListItemButton>
                ))}
            </List>

            <Divider sx={{ borderColor: colors.divider }} />

            {/* Theme Toggle */}
            <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDark
                        ? <DarkModeIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                        : <LightModeIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
                    }
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                </Box>
                <Switch checked={isDark} onChange={toggleTheme} size="small" sx={{ '& .Mui-checked': { color: '#EE791A' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#EE791A' } }} />
            </Box>

            <Divider sx={{ borderColor: colors.divider }} />

            {/* Admin Profile */}
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: colors.hover, borderRadius: 2 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: colors.primary }}>
                        <ShieldIcon fontSize="small" sx={{ color: '#fff' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }} noWrap>
                            {user?.displayName || 'System Admin'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }} noWrap>
                            {user?.email}
                        </Typography>
                    </Box>
                    <Tooltip title="Sign Out">
                        <IconButton size="small" onClick={() => setLogoutModalOpen(true)} sx={{ color: colors.textSecondary }}>
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.background }}>
            {/* Mobile AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    bgcolor: colors.cardBg,
                    borderBottom: `1px solid ${colors.divider}`,
                    boxShadow: 'none',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ gap: 1.5 }}>
                    <IconButton onClick={() => setMobileOpen(!mobileOpen)} edge="start" sx={{ color: colors.text }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.primary }}>
                        AegistNet Admin
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH, flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: `1px solid ${colors.cardBorder}`, bgcolor: colors.cardBg },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: colors.background,
                    minHeight: '100vh',
                    width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    color: colors.text,
                    pt: { xs: 8, md: 0 },
                }}
            >
                {children}
            </Box>

            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                open={logoutModalOpen}
                title="Confirm Logout"
                message="Are you sure you want to log out of the admin panel?"
                confirmText="Logout"
                onConfirm={handleSignOut}
                onCancel={() => setLogoutModalOpen(false)}
            />
        </Box>
    );
};

export default AdminLayout;

