import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, verificationStatus, isAdmin } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: '#000' }}
      >
        <CircularProgress sx={{ color: '#EE791A' }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin routes: only admins can access
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user's ID is not yet approved, redirect to pending page
  // Admins bypass this check so they can access the admin panel
  if (!isAdmin && verificationStatus && verificationStatus !== 'approved') {
    return <Navigate to="/pending-verification" replace />;
  }

  return children;
};

export default ProtectedRoute;
