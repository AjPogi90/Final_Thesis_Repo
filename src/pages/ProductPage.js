import React, { useEffect, useState, useRef } from 'react';
import {
    AppBar,
    Toolbar,
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import FilterListIcon from '@mui/icons-material/FilterList';

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AndroidIcon from '@mui/icons-material/Android';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScreenSearchDesktopIcon from '@mui/icons-material/ScreenSearchDesktop';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/* ─── Intersection‑Observer hook for scroll animations ─── */
const useOnScreen = (options) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setVisible(true);
        }, options);
        const cur = ref.current;
        if (cur) observer.observe(cur);
        return () => { if (cur) observer.unobserve(cur); };
    }, [options]);
    return [ref, visible];
};

const ProductPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Scroll to section on mount or hash change
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    const features = [
        {
            icon: <LockIcon sx={{ fontSize: 38 }} />,
            title: 'App Lock',
            desc: 'Instantly restrict apps you don\'t want your child to access. Set schedules or block instantly with one tap.',
            color: '#FF6B35',
            gradient: 'linear-gradient(135deg, #FF6B35, #FF8F5E)',
        },
        {
            icon: <FilterListIcon sx={{ fontSize: 38 }} />,
            title: 'Smart Content Filtering',
            desc: 'Real-time AI blocks inappropriate content across websites and native apps not just browsers.',
            color: '#FFB347',
            gradient: 'linear-gradient(135deg, #FFB347, #FFD080)',
        },

        {
            icon: <NotificationsActiveIcon sx={{ fontSize: 38 }} />,
            title: 'NSFW Incidents Alert',
            desc: 'Receive immediate notifications when inappropriate content is detected, keeping you informed in real-time.',
            color: '#D4651E',
            gradient: 'linear-gradient(135deg, #D4651E, #E88A4A)',
        },
        {
            icon: <DashboardIcon sx={{ fontSize: 38 }} />,
            title: 'Unified Dashboard',
            desc: 'Manage all your children\'s devices from a single, easy-to-use control center, accessible anywhere.',
            color: '#EE791A',
            gradient: 'linear-gradient(135deg, #EE791A, #FFB347)',
        },
    ];

    const steps = [
        {
            icon: <PersonAddIcon sx={{ fontSize: 44 }} />,
            step: '01',
            title: 'Create Your Parent Account',
            desc: 'Sign up securely and access your personal dashboard in under a minute.',
        },
        {
            icon: <InstallMobileIcon sx={{ fontSize: 44 }} />,
            step: '02',
            title: 'Install on Your Child\'s Device',
            desc: 'Download and set up the app on their phone or tablet quick and guided.',
        },
        {
            icon: <VerifiedUserIcon sx={{ fontSize: 44 }} />,
            step: '03',
            title: 'Activate Protection',
            desc: 'Follow the guided setup, adjust preferences, and start real-time monitoring instantly.',
        },
    ];

    const stats = [
        { icon: <SecurityIcon sx={{ fontSize: 28 }} />, value: 'Real-Time', label: 'AI Protection' },
        { icon: <VisibilityIcon sx={{ fontSize: 28 }} />, value: 'Native App', label: 'Monitoring' },
        { icon: <SpeedIcon sx={{ fontSize: 28 }} />, value: '< 3 min', label: 'Setup Time' },
    ];

    // Scroll-triggered section refs
    const [heroRef, heroVisible] = useOnScreen({ threshold: 0.15 });
    const [featRef, featVisible] = useOnScreen({ threshold: 0.1 });
    const [stepsRef, stepsVisible] = useOnScreen({ threshold: 0.1 });
    const [dlRef, dlVisible] = useOnScreen({ threshold: 0.15 });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', overflowX: 'hidden' }}>
            {/* ── Sticky Nav ── */}
            <AppBar
                position="sticky"
                sx={{
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
                }}
            >
                <Toolbar>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            color: '#1e3a8a',
                            textTransform: 'none',
                            fontWeight: 600,
                            mr: 2,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
                        }}
                    >
                        Back
                    </Button>
                    <Box
                        component="img"
                        src="/LoginLogoLIght.png"
                        alt="AegisNet"
                        sx={{ height: { xs: 26, sm: 32 }, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    />

                    {/* In-page section links (desktop only) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 4 }}>
                        {[
                            { label: 'Overview', hash: '#discover' },
                            { label: 'Features', hash: '#features' },
                            { label: 'Get Started', hash: '#get-started' },
                            { label: 'Download', hash: '#downloads' },
                        ].map((l) => (
                            <Button
                                key={l.hash}
                                size="small"
                                onClick={() => {
                                    const el = document.getElementById(l.hash.replace('#', ''));
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                sx={{
                                    color: 'rgba(0,0,0,0.6)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    '&:hover': { color: '#EE791A', bgcolor: 'transparent' },
                                }}
                            >
                                {l.label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/')}
                            sx={{
                                textTransform: 'none',
                                color: '#1e3a8a',
                                borderColor: 'rgba(30,58,138,0.35)',
                                '&:hover': { borderColor: '#EE791A' },
                            }}
                        >
                            Log in
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#EE791A',
                                color: '#fff',
                                '&:hover': { bgcolor: '#c05905' },
                                borderRadius: 2,
                                px: 3,
                            }}
                            onClick={() => navigate('/register')}
                        >
                            SIGN UP
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ═══════════════════════════════════════════════
          SECTION 1 — DISCOVER MORE (HERO)
          ═══════════════════════════════════════════════ */}
            <Box
                id="discover"
                ref={heroRef}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    py: { xs: 10, md: 16 },
                    background: 'linear-gradient(170deg, #ffffff 0%, #fff7ed 50%, #ffffff 100%)',
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease, transform 0.8s ease',
                }}
            >
                {/* Animated decorative orbs */}
                <Box
                    sx={{
                        position: 'absolute', top: -120, right: -80,
                        width: 500, height: 500, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(238,121,26,0.18) 0%, transparent 70%)',
                        filter: 'blur(60px)', pointerEvents: 'none',
                        animation: 'float 6s ease-in-out infinite',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute', bottom: -180, left: -120,
                        width: 420, height: 420, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
                        filter: 'blur(80px)', pointerEvents: 'none',
                        animation: 'float 8s ease-in-out infinite 1s',
                    }}
                />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    {/* Badge */}
                    <Box
                        sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 1,
                            bgcolor: 'rgba(238,121,26,0.1)', border: '1px solid rgba(238,121,26,0.22)',
                            borderRadius: 10, px: 2.5, py: 0.8, mb: 4,
                        }}
                    >
                        <ShieldIcon sx={{ color: '#EE791A', fontSize: 18 }} />
                        <Typography sx={{ color: '#EE791A', fontWeight: 700, fontSize: '0.78rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                            Why AegistNet
                        </Typography>
                    </Box>

                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900, color: '#000', mb: 3,
                            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
                            lineHeight: 1.08,
                        }}
                    >
                        Keeping Kids Safe in a{' '}
                        <Box
                            component="span"
                            sx={{
                                background: 'linear-gradient(135deg, #EE791A, #D4651E)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Digital World
                        </Box>
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(0,0,0,0.72)', mb: 3,
                            fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.75,
                            maxWidth: 680, mx: 'auto',
                        }}
                    >
                        Kids spend a lot of time on screens, and keeping them safe is essential.
                        Our app uses real-time AI to detect and filter explicit content, helping
                        parents stay in control of what their children see.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(0,0,0,0.6)', mb: 5,
                            fontSize: '0.97rem', lineHeight: 1.8,
                            maxWidth: 660, mx: 'auto',
                        }}
                    >
                        Unlike standard parental control apps that only block websites in browsers
                        like Chrome, our system monitors native apps too, giving deeper, smarter
                        protection where it matters most.
                    </Typography>

                    {/* CTA buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 8 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                bgcolor: '#EE791A', color: '#fff',
                                px: 5, py: 1.6, borderRadius: 2,
                                textTransform: 'none', fontWeight: 700, fontSize: '1rem',
                                boxShadow: '0 8px 32px rgba(238,121,26,0.35)',
                                '&:hover': { bgcolor: '#D4651E', boxShadow: '0 14px 44px rgba(238,121,26,0.45)' },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => {
                                const el = document.getElementById('features');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            sx={{
                                color: '#EE791A', borderColor: 'rgba(238,121,26,0.35)',
                                px: 4, py: 1.6, borderRadius: 2,
                                textTransform: 'none', fontWeight: 700, fontSize: '1rem',
                                '&:hover': { borderColor: '#EE791A', bgcolor: 'rgba(238,121,26,0.06)' },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Explore Features ↓
                        </Button>
                    </Box>

                    {/* Stats row */}
                    <Box
                        sx={{
                            display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 6 },
                            flexWrap: 'wrap',
                        }}
                    >
                        {stats.map((s, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Box sx={{ color: '#EE791A', mb: 0.5 }}>{s.icon}</Box>
                                <Typography sx={{ color: '#000', fontWeight: 800, fontSize: '1.25rem' }}>{s.value}</Typography>
                                <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.78rem', letterSpacing: 0.5 }}>{s.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══════════════════════════════════════════════
          Divider
          ═══════════════════════════════════════════════ */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.25), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 2 — FEATURES
          ═══════════════════════════════════════════════ */}
            <Box
                id="features"
                ref={featRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    background: '#ffffff',
                    opacity: featVisible ? 1 : 0,
                    transform: featVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900, color: '#000', mb: 2,
                                fontSize: { xs: '1.8rem', md: '2.6rem' },
                            }}
                        >
                            Powerful{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Features
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.05rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Take full control with tools designed to protect your child every day.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {features.map((f, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card
                                    sx={{
                                        bgcolor: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        borderRadius: 4,
                                        height: '100%',
                                        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                                        cursor: 'default',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                            background: f.gradient,
                                            opacity: 0, transition: 'opacity 0.3s',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            border: `1px solid ${f.color}40`,
                                            bgcolor: '#ffffff',
                                            boxShadow: `0 24px 64px ${f.color}25`,
                                            '&::before': { opacity: 1 },
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box
                                            sx={{
                                                width: 64, height: 64, borderRadius: 3,
                                                background: `linear-gradient(135deg, ${f.color}18, ${f.color}08)`,
                                                border: `1px solid ${f.color}25`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                mb: 2.5, color: f.color,
                                                transition: 'transform 0.3s',
                                                '&:hover': { transform: 'scale(1.08)' },
                                            }}
                                        >
                                            {f.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#000', mb: 1.2, fontSize: '1.05rem' }}>
                                            {f.title}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.7, fontSize: '0.9rem', flexGrow: 1 }}>
                                            {f.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Summary callout */}
                    <Box
                        sx={{
                            mt: 8, p: { xs: 4, md: 5 },
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(238,121,26,0.1) 0%, rgba(238,121,26,0.02) 100%)',
                            border: '1px solid rgba(238,121,26,0.12)',
                            textAlign: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute', top: -40, right: -40,
                                width: 180, height: 180, borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(238,121,26,0.1), transparent 70%)',
                                filter: 'blur(40px)', pointerEvents: 'none',
                            }}
                        />
                        <Typography sx={{ color: 'rgba(0,0,0,0.75)', fontSize: '1.08rem', lineHeight: 1.85, maxWidth: 650, mx: 'auto', position: 'relative', zIndex: 1 }}>
                            Everything works together in one secure, easy-to-use app, giving you{' '}
                            <Box component="span" sx={{ color: '#EE791A', fontWeight: 700 }}>
                                peace of mind
                            </Box>{' '}
                            while your child explores the digital world.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Divider */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 3 — GET STARTED
          ═══════════════════════════════════════════════ */}
            <Box
                id="get-started"
                ref={stepsRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    position: 'relative', overflow: 'hidden', background: '#fafafa',
                    opacity: stepsVisible ? 1 : 0,
                    transform: stepsVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}
            >
                {/* Decorative ring */}
                <Box
                    sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 700, height: 700, borderRadius: '50%',
                        border: '1px solid rgba(238,121,26,0.1)',
                        pointerEvents: 'none',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 500, height: 500, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(238,121,26,0.05) 0%, transparent 55%)',
                        filter: 'blur(60px)', pointerEvents: 'none',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900, color: '#000', mb: 2,
                                fontSize: { xs: '1.8rem', md: '2.6rem' },
                            }}
                        >
                            Get Started in{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Minutes
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.05rem', maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
                            Protecting your child shouldn't be complicated. Our setup is fast, simple,
                            and designed for busy parents.
                        </Typography>
                    </Box>

                    <Grid container spacing={4} justifyContent="center">
                        {steps.map((s, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Box
                                    sx={{
                                        textAlign: 'center', p: 4, borderRadius: 4,
                                        bgcolor: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                                        height: '100%',
                                        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                                        position: 'relative', overflow: 'hidden',
                                        '&:hover': {
                                            bgcolor: '#ffffff',
                                            border: '1px solid rgba(238,121,26,0.3)',
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 16px 48px rgba(238,121,26,0.12)',
                                        },
                                    }}
                                >
                                    {/* Step number */}
                                    <Typography
                                        sx={{
                                            fontSize: '3.5rem', fontWeight: 900,
                                            background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                            mb: 1.5, lineHeight: 1,
                                        }}
                                    >
                                        {s.step}
                                    </Typography>

                                    <Box sx={{ color: '#EE791A', mb: 2, opacity: 0.8 }}>{s.icon}</Box>

                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#000', mb: 1.5, fontSize: '1.05rem' }}>
                                        {s.title}
                                    </Typography>

                                    <Typography sx={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.75, fontSize: '0.93rem' }}>
                                        {s.desc}
                                    </Typography>

                                    {/* check mark at bottom */}
                                    <Box sx={{ mt: 3, color: 'rgba(238,121,26,0.3)' }}>
                                        <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Connector line between steps (desktop) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', mt: -1, mb: 2 }}>
                        <Box sx={{ width: '60%', height: 2, background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), rgba(238,121,26,0.2), transparent)', borderRadius: 1 }} />
                    </Box>

                    {/* Tagline + CTA */}
                    <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 800, color: '#000', fontSize: { xs: '1.15rem', md: '1.45rem' }, mb: 4 }}
                        >
                            Simple setup.{' '}
                            <Box component="span" sx={{ color: '#EE791A' }}>Powerful protection.</Box>{' '}
                            Complete peace of mind.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                bgcolor: '#EE791A', color: '#fff',
                                px: 5, py: 1.5, borderRadius: 2,
                                textTransform: 'none', fontWeight: 700,
                                boxShadow: '0 6px 28px rgba(238,121,26,0.3)',
                                '&:hover': { bgcolor: '#D4651E', boxShadow: '0 10px 36px rgba(238,121,26,0.4)' },
                                transition: 'all 0.3s',
                            }}
                        >
                            Create Your Account
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Divider */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 4 — DOWNLOADS
          ═══════════════════════════════════════════════ */}
            <Box
                id="downloads"
                ref={dlRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    background: '#ffffff',
                    opacity: dlVisible ? 1 : 0,
                    transform: dlVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}
            >
                <Container maxWidth="md">
                    <Box
                        sx={{
                            textAlign: 'center', p: { xs: 5, md: 7 },
                            borderRadius: 5,
                            background: '#fff7ed',
                            border: '1px solid rgba(238,121,26,0.18)',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                        }}
                    >
                        {/* Glow orbs */}
                        <Box
                            sx={{
                                position: 'absolute', top: -80, right: -60,
                                width: 240, height: 240, borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(238,121,26,0.12), transparent 70%)',
                                filter: 'blur(50px)', pointerEvents: 'none',
                                animation: 'pulse-glow 4s ease-in-out infinite',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute', bottom: -60, left: -40,
                                width: 200, height: 200, borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(255,179,71,0.08), transparent 70%)',
                                filter: 'blur(40px)', pointerEvents: 'none',
                                animation: 'pulse-glow 5s ease-in-out infinite 1s',
                            }}
                        />

                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            {/* Android icon */}
                            <Box
                                sx={{
                                    width: 88, height: 88, borderRadius: 4,
                                    background: 'linear-gradient(135deg, #EE791A, #D4651E)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    mx: 'auto', mb: 4,
                                    boxShadow: '0 16px 48px rgba(238,121,26,0.35)',
                                    transition: 'transform 0.3s',
                                    '&:hover': { transform: 'scale(1.06)' },
                                }}
                            >
                                <AndroidIcon sx={{ fontSize: 48, color: '#fff' }} />
                            </Box>

                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 900, color: '#000', mb: 3,
                                    fontSize: { xs: '1.8rem', md: '2.4rem' },
                                }}
                            >
                                Download for{' '}
                                <Box
                                    component="span"
                                    sx={{
                                        background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Android
                                </Box>
                            </Typography>

                            <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.05rem', lineHeight: 1.8, mb: 2.5, maxWidth: 540, mx: 'auto' }}>
                                Available for Android 9.0+ devices, our app brings advanced protection
                                right to your child's phone or tablet.
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 1.5, mb: 5, px: { xs: 0, md: 4 } }}>
                                <ScreenSearchDesktopIcon sx={{ color: '#EE791A', fontSize: 22, mt: 0.3, flexShrink: 0 }} />
                                <Typography sx={{ color: 'rgba(0,0,0,0.55)', fontSize: '0.93rem', lineHeight: 1.75, textAlign: 'left', maxWidth: 500 }}>
                                    Using real-time screen analysis, it monitors and filters harmful content
                                    as it appears across websites and native apps. Install in minutes and
                                    start safeguarding your child's digital world immediately.
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AndroidIcon />}
                                onClick={() => navigate('/register')}
                                sx={{
                                    bgcolor: '#EE791A', color: '#fff',
                                    px: 5, py: 1.6, borderRadius: 2,
                                    textTransform: 'none', fontWeight: 700, fontSize: '1.02rem',
                                    boxShadow: '0 8px 36px rgba(238,121,26,0.35)',
                                    '&:hover': { bgcolor: '#D4651E', boxShadow: '0 14px 44px rgba(238,121,26,0.45)', transform: 'translateY(-2px)' },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Download Now
                            </Button>

                            <Typography sx={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.78rem', mt: 2.5, letterSpacing: 0.3 }}>
                                Requires Android 9.0 (Pie) or higher
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ── Footer ── */}
            <Box sx={{ py: 5, borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: '#f1f5f9' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography sx={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.83rem' }}>
                            © 2025 AegisNet. All rights reserved.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            {[
                                { label: 'Home', to: '/' },
                                { label: 'Log in', to: '/' },
                                { label: 'Sign up', to: '/register' },
                            ].map((l) => (
                                <Button
                                    key={l.to}
                                    size="small"
                                    onClick={() => navigate(l.to)}
                                    sx={{
                                        color: 'rgba(0,0,0,0.5)', textTransform: 'none', fontSize: '0.83rem',
                                        '&:hover': { color: '#EE791A', bgcolor: 'transparent' },
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    {l.label}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default ProductPage;
