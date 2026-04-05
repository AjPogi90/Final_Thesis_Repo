import React from 'react';
import { Avatar, Box } from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';

const AppIcon = ({ packageName, appIconBase64, appName, size = 48 }) => {
  // 1. Check for Base64 Icon from Firebase
  let iconSrc = null;
  if (appIconBase64) {
    iconSrc = appIconBase64.startsWith('data:image') 
      ? appIconBase64 
      : `data:image/png;base64,${appIconBase64}`;
  }

  // 2. Fallback: Dynamic Fetching (Best Effort)
  // Extract domain from package name (e.g., com.whatsapp -> whatsapp.com)
  const getFallbackIcon = () => {
    if (!packageName) return null;
    const parts = packageName.split('.');
    if (parts.length >= 2) {
      // Common pattern: com.brand.app or com.brand
      const brand = parts[1];
      if (brand !== 'android' && brand !== 'google' && brand !== 'amazon') {
         return `https://www.google.com/s2/favicons?domain=${brand}.com&sz=${size * 2}`;
      }
    }
    return null;
  };

  const fallbackUrl = getFallbackIcon();

  return (
    <Avatar
      variant="rounded"
      src={iconSrc || fallbackUrl}
      sx={{
        width: size,
        height: size,
        bgcolor: 'rgba(238,121,26,0.1)',
        border: '1px solid rgba(238,121,26,0.2)',
        borderRadius: 2,
        '& img': {
          objectFit: 'contain',
          p: iconSrc ? 0 : 0.5,
        }
      }}
    >
      <AndroidIcon sx={{ color: '#EE791A', fontSize: size * 0.6 }} />
    </Avatar>
  );
};

export default AppIcon;
