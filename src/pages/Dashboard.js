import React from 'react';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Button,
  LinearProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AppsIcon from '@mui/icons-material/Apps';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChildrenList } from '../hooks/useFirebase';
import { useNavigate } from 'react-router-dom';
import { isOnline } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { children, loading, error } = useChildrenList(user?.email);
  const navigate = useNavigate();

  const safeChildren = children || [];
  const total = safeChildren.length;
  const onlineCount = safeChildren.filter((c) => isOnline(c.lastUpdated)).length;
  const offlineCount = total - onlineCount;

  // Calculate total blocked apps across all children
  const totalBlockedApps = safeChildren.reduce((sum, child) => {
    if (!child.apps) return sum;
    const appsArray = Array.isArray(child.apps)
      ? child.apps
      : Object.values(child.apps);
    return sum + appsArray.filter((app) => app.blocked).length;
  }, 0);

  // Calculate active filters across all children
  const childrenWithFilters = safeChildren.filter((child) => {
    const filters = child.contentFilters || {};
    return filters.nudity || filters.violence || filters.harmfulText;
  }).length;

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.background, color: colors.text }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.text }}>
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Welcome back! Here's an overview of your parental controls.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(255,0,0,0.08)', color: colors.text }}>
            Error loading dashboard: {error.message}
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.text,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.9, color: colors.primary }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Children
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.text,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <AppsIcon sx={{ fontSize: 40, opacity: 0.9, color: colors.primary }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {totalBlockedApps}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Blocked Apps
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Across all devices
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                color: colors.text,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <FilterListIcon sx={{ fontSize: 40, opacity: 0.9, color: colors.primary }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {childrenWithFilters}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Protected
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Content filters active
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} md={4}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PeopleIcon />}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/children')}
                sx={{
                  py: 1.5,
                  justifyContent: 'space-between',
                  borderColor: colors.divider,
                  color: colors.text,
                  '&:hover': {
                    borderColor: colors.primary,
                    bgcolor: colors.hover,
                  }
                }}
              >
                Manage Children
              </Button>
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AppsIcon />}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/apps')}
                sx={{
                  py: 1.5,
                  justifyContent: 'space-between',
                  borderColor: colors.divider,
                  color: colors.text,
                  '&:hover': {
                    borderColor: colors.primary,
                    bgcolor: colors.hover,
                  }
                }}
              >
                Block Apps
              </Button>
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterListIcon />}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/filters')}
                sx={{
                  py: 1.5,
                  justifyContent: 'space-between',
                  borderColor: colors.divider,
                  color: colors.text,
                  '&:hover': {
                    borderColor: colors.primary,
                    bgcolor: colors.hover,
                  }
                }}
              >
                Content Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Protection Status */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%', bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                  Protection Status
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Online Devices
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                    {onlineCount}/{total}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={total > 0 ? (onlineCount / total) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: colors.divider,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.primary,
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Content Filters Active
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                    {childrenWithFilters}/{total}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={total > 0 ? (childrenWithFilters / total) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: colors.divider,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.primary,
                    }
                  }}
                />
              </Box>

              {total === 0 && (
                <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.08)', color: colors.text, borderRadius: 2 }}>
                  No devices connected yet. Add a child device to get started!
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%', bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                  Activity Summary
                </Typography>
              </Box>

              {total > 0 ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }} gutterBottom>
                      Total Devices
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
                      {total}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }} gutterBottom>
                      Apps Monitored
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
                      {safeChildren.reduce((sum, child) => {
                        if (!child.apps) return sum;
                        const appsArray = Array.isArray(child.apps)
                          ? child.apps
                          : Object.values(child.apps);
                        return sum + appsArray.length;
                      }, 0)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/children')}
                    sx={{
                      mt: 2,
                      bgcolor: colors.primary,
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#c05905ff',
                      }
                    }}
                  >
                    View All Children
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.08)', color: colors.text, borderRadius: 2 }}>
                  Start by connecting your first child device through the mobile app.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
