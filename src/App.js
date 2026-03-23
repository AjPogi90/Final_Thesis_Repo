import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChildDetails from './pages/ChildDetails';
import Children from './pages/Children';
import Apps from './pages/Apps';
import Location from './pages/Location';
import Filters from './pages/Filters';
import Settings from './pages/Settings';
import Help from './pages/Help';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LearnPage from './pages/LearnPage';
import SupportPage from './pages/SupportPage';
import PendingVerification from './pages/PendingVerification';
import DisabledAccount from './pages/DisabledAccount';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import SessionTimeout from './components/SessionTimeout';

// Admin pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerification from './pages/admin/AdminVerification';
import AdminActivity from './pages/admin/AdminActivity';
import AdminReports from './pages/admin/AdminReports';
import AdminManagement from './pages/admin/AdminManagement';

function AppLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          width: { xs: '100%', md: 'calc(100% - 240px)' },
        }}
      >
        {/* Spacer for fixed mobile AppBar */}
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
        {children}
      </Box>

      {/* Session Timeout Manager */}
      <SessionTimeout />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending-verification" element={<PendingVerification />} />
            <Route path="/account-disabled" element={<DisabledAccount />} />

            {/* Protected Routes with Sidebar Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/children"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Children />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/apps"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Apps />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/location"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Location />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/filters"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Filters />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/child/:childId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChildDetails />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Help />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Panel – 7 sections with dedicated admin layout */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/verification" element={<ProtectedRoute requireAdmin><AdminLayout><AdminVerification /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/activity" element={<ProtectedRoute requireAdmin><AdminLayout><AdminActivity /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminLayout><AdminReports /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/admins" element={<ProtectedRoute requireAdmin><AdminLayout><AdminManagement /></AdminLayout></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

