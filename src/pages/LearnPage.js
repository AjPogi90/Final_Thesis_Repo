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
    Avatar,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GamesIcon from '@mui/icons-material/Games';
import LanguageIcon from '@mui/icons-material/Language';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ShieldIcon from '@mui/icons-material/Shield';

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

const LearnPage = () => {
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

    /* ─── Data ─── */
    const productTips = [
        {
            icon: <ScheduleIcon sx={{ fontSize: 38 }} />,
            title: 'Set Smart Schedules',
            desc: 'Configure app time limits and bedtime schedules so your child\'s screen time stays healthy and balanced, without constant nagging.',
            color: '#FF6B35',
            gradient: 'linear-gradient(135deg, #FF6B35, #FF8F5E)',
        },
        {
            icon: <TuneIcon sx={{ fontSize: 38 }} />,
            title: 'Customize Content Filters',
            desc: 'Fine-tune the AI filtering sensitivity to match your child\'s age and maturity level. Stricter for younger kids, more relaxed for teens.',
            color: '#FFB347',
            gradient: 'linear-gradient(135deg, #FFB347, #FFD080)',
        },
        {
            icon: <NotificationsActiveIcon sx={{ fontSize: 38 }} />,
            title: 'Enable Smart Alerts',
            desc: 'Get instant notifications when something requires your attention — blocked content attempts, new app installs, or unusual activity.',
            color: '#EE791A',
            gradient: 'linear-gradient(135deg, #EE791A, #FF9F4A)',
        },
        {
            icon: <PhoneAndroidIcon sx={{ fontSize: 38 }} />,
            title: 'Remote Device Management',
            desc: 'Lock or unlock your child\'s device remotely in seconds. Perfect for homework time, family dinners, or bedtime routines.',
            color: '#D4651E',
            gradient: 'linear-gradient(135deg, #D4651E, #E88A4A)',
        },
    ];

    const parentingTips = [
        {
            icon: <ChatBubbleOutlineIcon sx={{ fontSize: 42 }} />,
            title: 'Talk About Online Safety',
            desc: 'Have open, age-appropriate conversations about what your children see online. Create a safe space where they feel comfortable telling you about uncomfortable encounters.',
        },
        {
            icon: <PsychologyIcon sx={{ fontSize: 42 }} />,
            title: 'Lead by Example',
            desc: 'Model healthy screen habits yourself. Children learn more from what you do than what you say — put your phone down during meals and family time.',
        },
        {
            icon: <ChildCareIcon sx={{ fontSize: 42 }} />,
            title: 'Age-Appropriate Access',
            desc: 'What\'s suitable for a 13-year-old isn\'t for a 7-year-old. Regularly review and adjust monitoring settings as your child grows and demonstrates responsibility.',
        },
    ];

    const safetyGuides = [
        {
            icon: <LanguageIcon sx={{ fontSize: 38 }} />,
            title: 'Social Media Safety',
            desc: 'Understand the risks of popular social platforms and learn which privacy settings to enable on TikTok, Instagram, Snapchat, and more.',
            color: '#FF6B35',
            rating: 'Essential',
        },
        {
            icon: <GamesIcon sx={{ fontSize: 38 }} />,
            title: 'Gaming & Chat Risks',
            desc: 'Online games often include unmoderated chats where predators operate. Learn how to secure gaming platforms and monitor in-game communications.',
            color: '#FFB347',
            rating: 'High Priority',
        },
        {
            icon: <MenuBookIcon sx={{ fontSize: 38 }} />,
            title: 'Cyberbullying Prevention',
            desc: 'Recognize the warning signs of cyberbullying early. Understand how to document incidents and take effective action to protect your child.',
            color: '#EE791A',
            rating: 'Important',
        },
        {
            icon: <VerifiedUserIcon sx={{ fontSize: 38 }} />,
            title: 'Privacy & Data Protection',
            desc: 'Teach children never to share personal information online. Understand how apps collect data and what permissions you should deny.',
            color: '#D4651E',
            rating: 'Critical',
        },
    ];

    const familyStories = [
        {
            name: 'Maria Santos',
            role: 'Mother of 2',
            avatar: 'M',
            quote: '"AegistNet gives me the peace of mind I\'ve been looking for. I know my kids are safe when they\'re online. The real-time alerts are a game changer."',
            color: '#FF6B35',
        },
        {
            name: 'Juan Dela Cruz',
            role: 'Father of 3',
            avatar: 'J',
            quote: '"Setting up was incredibly easy. Within minutes, I had full visibility into what my children were accessing — and I could block harmful content instantly."',
            color: '#FFB347',
        },
        {
            name: 'Ana Reyes',
            role: 'Single Mom',
            avatar: 'A',
            quote: '"As a single parent, I can\'t always be watching over their shoulder. AegistNet does it for me — quietly, effectively, and without making my kids feel spied on."',
            color: '#EE791A',
        },
    ];

    /* ─── Scroll-triggered section refs ─── */
    const [heroRef, heroVisible] = useOnScreen({ threshold: 0.15 });
    const [tipsRef, tipsVisible] = useOnScreen({ threshold: 0.1 });
    const [guidesRef, guidesVisible] = useOnScreen({ threshold: 0.1 });
    const [storiesRef, storiesVisible] = useOnScreen({ threshold: 0.15 });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#000', overflowX: 'hidden' }}>
            {/* ── Sticky Nav ── */}
            <AppBar
                position="sticky"
                sx={{
                    bgcolor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
                }}
            >
                <Toolbar>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            mr: 2,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                        }}
                    >
                        Back
                    </Button>
                    <Box
                        component="img"
                        src="/HeaderLogo.png"
                        alt="AegistNet"
                        sx={{ height: { xs: 26, sm: 32 }, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    />

                    {/* In-page section links (desktop only) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 4 }}>
                        {[
                            { label: 'Product Tips', hash: '#product-tips' },
                            { label: 'Parenting Tips', hash: '#parenting-tips' },
                            { label: 'Safety Guides', hash: '#safety-guides' },
                            { label: 'Family Stories', hash: '#family-stories' },
                        ].map((l) => (
                            <Button
                                key={l.hash}
                                size="small"
                                onClick={() => {
                                    const el = document.getElementById(l.hash.replace('#', ''));
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                sx={{
                                    color: 'rgba(255,255,255,0.6)',
                                    textTransform: 'none',
                                    fontWeight: 500,
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
                            onClick={() => navigate('/login')}
                            sx={{
                                textTransform: 'none',
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.18)',
                                '&:hover': { borderColor: 'rgba(255,255,255,0.35)' },
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
          SECTION 1 — PRODUCT TIPS (HERO)
          ═══════════════════════════════════════════════ */}
            <Box
                id="product-tips"
                ref={heroRef}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    py: { xs: 10, md: 16 },
                    background: 'linear-gradient(170deg, #000 0%, #1a0a00 50%, #0d0d0d 100%)',
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
                        <EmojiObjectsIcon sx={{ color: '#EE791A', fontSize: 18 }} />
                        <Typography sx={{ color: '#EE791A', fontWeight: 700, fontSize: '0.78rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                            Learn & Grow
                        </Typography>
                    </Box>

                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900, color: '#fff', mb: 3,
                            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
                            lineHeight: 1.08,
                        }}
                    >
                        Master Your{' '}
                        <Box
                            component="span"
                            sx={{
                                background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Digital Parenting
                        </Box>
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.72)', mb: 3,
                            fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.75,
                            maxWidth: 680, mx: 'auto',
                        }}
                    >
                        Get the most out of AegistNet with expert product tips, research-backed
                        parenting advice, comprehensive safety guides, and inspiring stories from
                        families just like yours.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(255,255,255,0.48)', mb: 5,
                            fontSize: '0.97rem', lineHeight: 1.8,
                            maxWidth: 660, mx: 'auto',
                        }}
                    >
                        Whether you're setting up AegistNet for the first time or looking for
                        advanced parenting strategies in the digital age, our resource center
                        has everything you need.
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
                                const el = document.getElementById('parenting-tips');
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
                            Explore Tips ↓
                        </Button>
                    </Box>

                    {/* Stats row */}
                    <Box
                        sx={{
                            display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 6 },
                            flexWrap: 'wrap',
                        }}
                    >
                        {[
                            { icon: <TipsAndUpdatesIcon sx={{ fontSize: 28 }} />, value: 'Expert', label: 'Product Tips' },
                            { icon: <SchoolIcon sx={{ fontSize: 28 }} />, value: 'Research', label: 'Based Advice' },
                            { icon: <FavoriteIcon sx={{ fontSize: 28 }} />, value: 'Real', label: 'Family Stories' },
                        ].map((s, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Box sx={{ color: '#EE791A', mb: 0.5 }}>{s.icon}</Box>
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>{s.value}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', letterSpacing: 0.5 }}>{s.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>

                {/* Product tips cards below hero */}
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: 10 }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800, color: '#fff', mb: 2,
                                fontSize: { xs: '1.5rem', md: '2rem' },
                            }}
                        >
                            Get More From{' '}
                            <Box component="span" sx={{ color: '#EE791A' }}>AegistNet</Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Simple tips to help you unlock the full power of every feature.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {productTips.map((f, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.025)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 4,
                                        height: '100%',
                                        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                                        cursor: 'default',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                            background: f.gradient,
                                            opacity: 0, transition: 'opacity 0.3s',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            border: `1px solid ${f.color}40`,
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            boxShadow: `0 24px 64px ${f.color}18`,
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
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1.2, fontSize: '1.05rem' }}>
                                            {f.title}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontSize: '0.9rem', flexGrow: 1 }}>
                                            {f.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Divider */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.25), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 2 — PARENTING TIPS
          ═══════════════════════════════════════════════ */}
            <Box
                id="parenting-tips"
                ref={tipsRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    position: 'relative', overflow: 'hidden', background: '#000',
                    opacity: tipsVisible ? 1 : 0,
                    transform: tipsVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}
            >
                {/* Decorative ring */}
                <Box
                    sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 700, height: 700, borderRadius: '50%',
                        border: '1px solid rgba(238,121,26,0.06)',
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
                                fontWeight: 900, color: '#fff', mb: 2,
                                fontSize: { xs: '1.8rem', md: '2.6rem' },
                            }}
                        >
                            Parenting in the{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Digital Age
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Research-backed advice to help you guide your children through the
                            complexities of growing up online.
                        </Typography>
                    </Box>

                    <Grid container spacing={4} justifyContent="center">
                        {parentingTips.map((tip, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Box
                                    sx={{
                                        textAlign: 'center', p: 4, borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        height: '100%',
                                        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                                        position: 'relative', overflow: 'hidden',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(238,121,26,0.22)',
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 16px 48px rgba(238,121,26,0.08)',
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
                                        {String(i + 1).padStart(2, '0')}
                                    </Typography>

                                    <Box sx={{ color: '#EE791A', mb: 2, opacity: 0.8 }}>{tip.icon}</Box>

                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1.5, fontSize: '1.05rem' }}>
                                        {tip.title}
                                    </Typography>

                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontSize: '0.93rem' }}>
                                        {tip.desc}
                                    </Typography>

                                    <Box sx={{ mt: 3, color: 'rgba(238,121,26,0.3)' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Connector line between items (desktop) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', mt: -1, mb: 2 }}>
                        <Box sx={{ width: '60%', height: 2, background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), rgba(238,121,26,0.2), transparent)', borderRadius: 1 }} />
                    </Box>

                    {/* Callout */}
                    <Box
                        sx={{
                            mt: 6, p: { xs: 4, md: 5 },
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(238,121,26,0.07) 0%, rgba(0,0,0,0.3) 100%)',
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
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.08rem', lineHeight: 1.85, maxWidth: 650, mx: 'auto', position: 'relative', zIndex: 1 }}>
                            Digital parenting isn't about spying — it's about{' '}
                            <Box component="span" sx={{ color: '#EE791A', fontWeight: 700 }}>
                                building trust
                            </Box>{' '}
                            while keeping your children safe from the dangers they're not yet equipped to handle.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Divider */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 3 — SAFETY GUIDES
          ═══════════════════════════════════════════════ */}
            <Box
                id="safety-guides"
                ref={guidesRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 50%, #0a0a0a 100%)',
                    opacity: guidesVisible ? 1 : 0,
                    transform: guidesVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900, color: '#fff', mb: 2,
                                fontSize: { xs: '1.8rem', md: '2.6rem' },
                            }}
                        >
                            Safety{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Guides
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Quick summaries, ratings, and recommendations about the apps, games,
                            and online content parents should keep an eye on.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {safetyGuides.map((g, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.025)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 4,
                                        height: '100%',
                                        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                                        cursor: 'default',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                            background: `linear-gradient(135deg, ${g.color}, ${g.color}80)`,
                                            opacity: 0, transition: 'opacity 0.3s',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            border: `1px solid ${g.color}40`,
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            boxShadow: `0 24px 64px ${g.color}18`,
                                            '&::before': { opacity: 1 },
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box
                                            sx={{
                                                width: 64, height: 64, borderRadius: 3,
                                                background: `linear-gradient(135deg, ${g.color}18, ${g.color}08)`,
                                                border: `1px solid ${g.color}25`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                mb: 2.5, color: g.color,
                                                transition: 'transform 0.3s',
                                                '&:hover': { transform: 'scale(1.08)' },
                                            }}
                                        >
                                            {g.icon}
                                        </Box>

                                        {/* Rating badge */}
                                        <Box
                                            sx={{
                                                display: 'inline-flex', alignSelf: 'flex-start',
                                                bgcolor: `${g.color}15`, border: `1px solid ${g.color}30`,
                                                borderRadius: 2, px: 1.5, py: 0.3, mb: 2,
                                            }}
                                        >
                                            <Typography sx={{ color: g.color, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                                {g.rating}
                                            </Typography>
                                        </Box>

                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1.2, fontSize: '1.05rem' }}>
                                            {g.title}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontSize: '0.9rem', flexGrow: 1 }}>
                                            {g.desc}
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
                            background: 'linear-gradient(135deg, rgba(238,121,26,0.07) 0%, rgba(0,0,0,0.3) 100%)',
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
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.08rem', lineHeight: 1.85, maxWidth: 650, mx: 'auto', position: 'relative', zIndex: 1 }}>
                            Knowledge is your first line of defense. Stay informed, stay{' '}
                            <Box component="span" sx={{ color: '#EE791A', fontWeight: 700 }}>
                                proactive
                            </Box>
                            , and keep your family safe online.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Divider */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 4 — FAMILY STORIES
          ═══════════════════════════════════════════════ */}
            <Box
                id="family-stories"
                ref={storiesRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
                    opacity: storiesVisible ? 1 : 0,
                    transform: storiesVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900, color: '#fff', mb: 2,
                                fontSize: { xs: '1.8rem', md: '2.6rem' },
                            }}
                        >
                            Family{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Stories
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Hear from real parents who trust AegistNet to protect their families
                            in the digital world.
                        </Typography>
                    </Box>

                    <Grid container spacing={4} justifyContent="center">
                        {familyStories.map((story, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Box
                                    sx={{
                                        p: 4, borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        height: '100%',
                                        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                                        position: 'relative', overflow: 'hidden',
                                        display: 'flex', flexDirection: 'column',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${story.color}30`,
                                            transform: 'translateY(-6px)',
                                            boxShadow: `0 16px 48px ${story.color}12`,
                                        },
                                    }}
                                >
                                    {/* Quote icon */}
                                    <FormatQuoteIcon sx={{ color: story.color, fontSize: 40, opacity: 0.4, mb: 2 }} />

                                    <Typography sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, fontSize: '0.98rem', flexGrow: 1, fontStyle: 'italic', mb: 3 }}>
                                        {story.quote}
                                    </Typography>

                                    {/* Author */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            sx={{
                                                width: 48, height: 48,
                                                background: `linear-gradient(135deg, ${story.color}, ${story.color}80)`,
                                                fontWeight: 800, fontSize: '1.1rem',
                                            }}
                                        >
                                            {story.avatar}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                                                {story.name}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                                                {story.role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Tagline + CTA */}
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 800, color: '#fff', fontSize: { xs: '1.15rem', md: '1.45rem' }, mb: 4 }}
                        >
                            Join thousands of families who{' '}
                            <Box component="span" sx={{ color: '#EE791A' }}>trust AegistNet.</Box>
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
                            Start Protecting Your Family
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* ── Footer ── */}
            <Box sx={{ py: 5, borderTop: '1px solid rgba(255,255,255,0.06)', bgcolor: '#000' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.83rem' }}>
                            © 2025 AegistNet. All rights reserved.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            {[
                                { label: 'Home', to: '/' },
                                { label: 'Product', to: '/product' },
                                { label: 'Log in', to: '/login' },
                                { label: 'Sign up', to: '/register' },
                            ].map((l) => (
                                <Button
                                    key={l.to}
                                    size="small"
                                    onClick={() => navigate(l.to)}
                                    sx={{
                                        color: 'rgba(255,255,255,0.45)', textTransform: 'none', fontSize: '0.83rem',
                                        '&:hover': { color: '#EE791A' },
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

export default LearnPage;
