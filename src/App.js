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
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import SessionTimeout from './components/SessionTimeout';

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

