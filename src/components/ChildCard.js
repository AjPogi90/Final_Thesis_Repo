import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Badge,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LogoutIcon from '@mui/icons-material/Logout';
import { formatDistanceToNow } from 'date-fns';
import { isOnline as isOnlineHelper } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

const ChildCard = ({ child, onViewDetails, onViewApps, onViewLocation }) => {
  const { colors } = useTheme();
  const isOnline = isOnlineHelper(child.lastUpdated);

  // Calculate "last seen" in human-readable format
  const getLastSeenText = () => {
    if (!child.lastUpdated) return 'Never';

    try {
      const timestamp = typeof child.lastUpdated === 'number'
        ? child.lastUpdated
        : new Date(child.lastUpdated).getTime();

      if (isOnline) {
        return 'Active now';
      }

      return `Active ${formatDistanceToNow(new Date(timestamp), { addSuffix: true })}`;
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        bgcolor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        color: colors.text,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${colors.hover}`,
          borderColor: colors.primary,
        },
      }}
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${child.name}`}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Profile Section */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: isOnline ? '#4caf50' : '#9e9e9e',
                  border: `2px solid ${colors.cardBg}`,
                }}
              />
            }
          >
            <Avatar
              src={child.profilePicture || undefined}
              sx={{
                width: 56,
                height: 56,
                bgcolor: colors.primary,
                fontSize: '1.5rem',
              }}
            >
              {child.profilePicture ? null : (
                child.name?.charAt(0).toUpperCase() || <PersonIcon />
              )}
            </Avatar>
          </Badge>

          <Box flex={1} minWidth={0}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 0.5, color: colors.text }}
              noWrap
            >
              {child.name || 'Unknown Child'}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
                label={isOnline ? 'Online' : 'Offline'}
                size="small"
                sx={{
                  fontWeight: 600,
                  height: 20,
                  bgcolor: isOnline ? 'rgba(76,175,80,0.2)' : 'rgba(158,158,158,0.2)',
                  color: isOnline ? '#4caf50' : '#9e9e9e',
                  border: `1px solid ${isOnline ? '#4caf50' : '#9e9e9e'}`,
                  '& .MuiChip-icon': {
                    ml: 0.5,
                    color: isOnline ? '#4caf50' : '#9e9e9e',
                  },
                }}
              />
              {child.logoutRequest === 'pending' && (
                <Chip
                  icon={<LogoutIcon sx={{ fontSize: 14 }} />}
                  label="Logout Request"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 600, height: 20 }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Details */}
        <Typography
          variant="body2"
          sx={{ color: colors.textSecondary, mb: 1, wordBreak: 'break-word' }}
          noWrap
        >
          📧 {child.email || 'N/A'}
        </Typography>

        <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
          {getLastSeenText()}
        </Typography>
      </CardContent>

      <CardActions sx={{ flexDirection: 'column', gap: 1, pt: 0, px: 2, pb: 2 }}>
        <Button
          variant="contained"
          size="medium"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          sx={{
            fontWeight: 600,
            bgcolor: colors.primary,
            color: '#fff',
            '&:hover': {
              bgcolor: '#c05905ff',
            }
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ChildCard;
