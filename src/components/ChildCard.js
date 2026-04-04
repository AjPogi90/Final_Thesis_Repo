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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useTheme } from '../contexts/ThemeContext';

const ChildCard = ({ child, onViewDetails, onViewApps, onViewLocation }) => {
  const { colors } = useTheme();

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

          <Box flex={1} minWidth={0}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 0.5, color: colors.text }}
              noWrap
            >
              {child.name || 'Unknown Child'}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
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

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography
            variant="body2"
            sx={{
              color: colors.textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 500
            }}
          >
            <PhoneAndroidIcon sx={{ fontSize: 18, color: colors.primary }} />
            {child.deviceModel || child.device || 'Unknown Device'}
          </Typography>
        </Box>


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
