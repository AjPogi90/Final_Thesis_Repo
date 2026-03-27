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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AppsIcon from '@mui/icons-material/Apps';

import FilterListIcon from '@mui/icons-material/FilterList';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import ConfirmationModal from './ConfirmationModal';

const DRAWER_WIDTH = 240;

const Sidebar = ({ isMobile = false, open = true, onClose = () => { } }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { colors } = useTheme();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Children', icon: <PeopleIcon />, path: '/children' },
    { text: 'Apps', icon: <AppsIcon />, path: '/apps' },

    { text: 'Filters', icon: <FilterListIcon />, path: '/filters' },
  ];

  const bottomMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpOutlineIcon />, path: '/help' },
    ...(isAdmin ? [{ text: 'Admin Panel', icon: <AdminPanelSettingsIcon />, path: '/admin' }] : []),
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLogoutModalOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.cardBg,
      }}
    >
      {/* Logo/Header */}
      <Box sx={{ p: 3, pt: 4, pb: 2, textAlign: 'center' }}>
        <Box component="img" src="/LoginLogoLIght.png" alt="AegistNet" sx={{ height: 40, objectFit: 'contain', mb: 0.5 }} />
        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
          Parental Control
        </Typography>
      </Box>

      <Divider sx={{ borderColor: colors.divider }} />

      {/* Main Navigation */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: colors.text,
              '&:hover': {
                bgcolor: colors.hover,
              },
              '&.Mui-selected': {
                bgcolor: colors.primary,
                color: '#fff',
                '&:hover': {
                  bgcolor: '#1D4ED8',
                },
                '& .MuiListItemIcon-root': {
                  color: '#fff',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive(item.path) ? '#fff' : colors.textSecondary,
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isActive(item.path) ? 600 : 400,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: colors.divider }} />

      {/* Bottom Navigation */}
      <List sx={{ px: 2, py: 1 }}>
        {bottomMenuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={isActive(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: colors.text,
              '&:hover': {
                bgcolor: colors.hover,
              },
              '&.Mui-selected': {
                bgcolor: colors.hover,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: colors.textSecondary }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontSize: '0.9rem' }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: colors.divider }} />

      {/* User Profile Section */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            bgcolor: colors.hover,
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: colors.primary }}>
            <PersonIcon fontSize="small" sx={{ color: '#fff' }} />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }} noWrap>
              {user?.email?.split('@')[0] || 'Parent'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }} noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Sign Out">
            <IconButton
              size="small"
              onClick={handleLogoutClick}
              sx={{ color: colors.textSecondary }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        open={logoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        onConfirm={handleSignOut}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop permanent drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${colors.cardBorder}`,
          bgcolor: colors.cardBg,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
