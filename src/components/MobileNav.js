import React, { useState } from 'react';
import {
    IconButton,
    AppBar,
    Toolbar,
    Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

const MobileNav = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { colors } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            {/* Mobile App Bar - Only visible on mobile */}
            <AppBar
                position="fixed"
                sx={{
                    display: { xs: 'block', md: 'none' },
                    background: 'rgba(255, 255, 255, 1)',
                    boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
                    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        size="large" // Ensures 48px+ touch target
                        sx={{
                            mr: 2,
                            color: colors.text,
                            '&:active': {
                                bgcolor: colors.hover, // Visual tap feedback
                            }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box component="img" src="/LoginLogoLIght.png" alt="AegistNet" sx={{ height: 32, objectFit: 'contain' }} />
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Sidebar
                isMobile={true}
                open={mobileOpen}
                onClose={handleDrawerToggle}
            />
        </>
    );
};

export default MobileNav;
