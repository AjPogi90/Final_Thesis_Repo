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
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import BugReportIcon from '@mui/icons-material/BugReport';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import GroupsIcon from '@mui/icons-material/Groups';
import ForumIcon from '@mui/icons-material/Forum';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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

const SupportPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
    const contactCards = [
        {
            icon: <EmailIcon sx={{ fontSize: 38 }} />,
            title: 'Email Support',
            desc: 'Send us a detailed message and our team will respond within 24 hours. Best for non-urgent questions and account inquiries.',
            action: 'aegisnet@gmail.com',
            color: '#FF6B35',
            gradient: 'linear-gradient(135deg, #FF6B35, #FF8F5E)',
        },
        {
            icon: <ChatIcon sx={{ fontSize: 38 }} />,
            title: 'Live Chat',
            desc: 'Connect with a support agent instantly during business hours for quick answers and real-time troubleshooting.',
            action: 'Available 8AM – 8PM',
            color: '#FFB347',
            gradient: 'linear-gradient(135deg, #FFB347, #FFD080)',
        },
        {
            icon: <HeadsetMicIcon sx={{ fontSize: 38 }} />,
            title: 'Phone Support',
            desc: 'Speak directly with our support team for urgent issues or complex account-related matters that need immediate attention.',
            action: 'Mon – Fri, 9AM – 6PM',
            color: '#EE791A',
            gradient: 'linear-gradient(135deg, #EE791A, #FF9F4A)',
        },
        {
            icon: <AccessTimeIcon sx={{ fontSize: 38 }} />,
            title: 'Response Times',
            desc: 'Email: under 24 hours. Live chat: under 5 minutes during business hours. Phone: immediate. We prioritize your family\'s safety.',
            action: 'Priority support available',
            color: '#D4651E',
            gradient: 'linear-gradient(135deg, #D4651E, #E88A4A)',
        },
    ];

    const faqs = [
        {
            q: 'How do I install AegisNet on my child\'s device?',
            a: 'Download the app from the link provided in your parent dashboard, install it on your child\'s Android device (9.0+), and follow the guided setup wizard. The whole process takes under 3 minutes.',
        },
        {
            q: 'Will my child know the app is monitoring their device?',
            a: 'AegisNet runs quietly in the background. While we encourage transparency with your children, the app is designed to be lightweight and non-intrusive so it doesn\'t disrupt their experience.',
        },
        {
            q: 'How does the real-time AI content filtering work?',
            a: 'Our AI analyzes on-screen content in real time — not just in browsers, but across native apps too. When explicit or harmful content is detected, it\'s automatically blocked and you receive an alert.',
        },
        {
            q: 'Can I set different rules for different children?',
            a: 'Yes! Each child profile has its own set of customizable rules. Set stricter filters for younger children and more relaxed settings for teens, all from your single parent dashboard.',
        },
        {
            q: 'What happens if my child\'s device loses internet connection?',
            a: 'Core protection features like app locks and scheduled restrictions continue to work offline. Activity logs and location data will sync automatically once the connection is restored.',
        },
        {
            q: 'Is my family\'s data secure?',
            a: 'Absolutely. All data is encrypted end-to-end, stored securely on Firebase servers, and never shared with third parties. We follow strict data protection standards to keep your family\'s information private.',
        },
    ];

    const troubleshooting = [
        {
            icon: <BugReportIcon sx={{ fontSize: 42 }} />,
            title: 'App Not Filtering Content',
            desc: 'Ensure accessibility permissions are enabled in Settings > Accessibility > AegisNet. Restart the app and verify the protection status shows "Active" on your dashboard.',
        },
        {
            icon: <WifiOffIcon sx={{ fontSize: 42 }} />,
            title: 'Location Not Updating',
            desc: 'Check that location permissions are set to "Allow all the time" in device settings. Ensure GPS is turned on and battery optimization is disabled for AegisNet.',
        },
        {
            icon: <SyncProblemIcon sx={{ fontSize: 42 }} />,
            title: 'Dashboard Not Syncing',
            desc: 'Pull down to refresh your dashboard. If data is still stale, check that your child\'s device has an active internet connection and the AegisNet service is running.',
        },
        {
            icon: <BatteryAlertIcon sx={{ fontSize: 42 }} />,
            title: 'High Battery Usage',
            desc: 'Go to AegisNet settings and reduce the location update frequency. Disable screen analysis for apps that don\'t need monitoring to optimize battery performance.',
        },
    ];

    const communityItems = [
        {
            icon: <ForumIcon sx={{ fontSize: 38 }} />,
            title: 'Parent Forums',
            desc: 'Connect with other parents who use AegisNet. Share tips, ask questions, and learn strategies for safe digital parenting.',
            color: '#FF6B35',
        },
        {
            icon: <RateReviewIcon sx={{ fontSize: 38 }} />,
            title: 'Feature Requests',
            desc: 'Have an idea that would make AegisNet even better? Submit your suggestions and vote on features proposed by other parents.',
            color: '#FFB347',
        },
        {
            icon: <VolunteerActivismIcon sx={{ fontSize: 38 }} />,
            title: 'Beta Testing',
            desc: 'Be the first to try new features before they\'re released. Join our beta program and help us shape the future of online child safety.',
            color: '#EE791A',
        },
        {
            icon: <GroupsIcon sx={{ fontSize: 38 }} />,
            title: 'Local Parent Groups',
            desc: 'Find or create local parent groups in your community to discuss digital safety and share experiences face-to-face.',
            color: '#D4651E',
        },
    ];

    /* ─── Scroll-triggered section refs ─── */
    const [heroRef, heroVisible] = useOnScreen({ threshold: 0.15 });
    const [faqRef, faqVisible] = useOnScreen({ threshold: 0.1 });
    const [troubleRef, troubleVisible] = useOnScreen({ threshold: 0.1 });
    const [communityRef, communityVisible] = useOnScreen({ threshold: 0.15 });

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

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 4 }}>
                        {[
                            { label: 'Contact Us', hash: '#contact-us' },
                            { label: 'FAQ', hash: '#faq' },
                            { label: 'Troubleshooting', hash: '#troubleshooting' },
                            { label: 'Community', hash: '#community' },
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
                            onClick={() => navigate('/login')}
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
          SECTION 1 — CONTACT US (HERO)
          ═══════════════════════════════════════════════ */}
            <Box
                id="contact-us"
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
                        <SupportAgentIcon sx={{ color: '#EE791A', fontSize: 18 }} />
                        <Typography sx={{ color: '#EE791A', fontWeight: 700, fontSize: '0.78rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                            Support Center
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
                        We're Here to{' '}
                        <Box
                            component="span"
                            sx={{
                                background: 'linear-gradient(135deg, #EE791A, #D4651E)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Help
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
                        Whether you need help setting up, have a question about features, or
                        want to report an issue — our dedicated support team is ready to assist
                        you every step of the way.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(0,0,0,0.6)', mb: 5,
                            fontSize: '0.97rem', lineHeight: 1.8,
                            maxWidth: 660, mx: 'auto',
                        }}
                    >
                        Your family's safety is our priority. Reach out through any of the
                        channels below, and we'll make sure you get the help you need — quickly
                        and effectively.
                    </Typography>

                    {/* CTA buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 8 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => {
                                const el = document.getElementById('faq');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            sx={{
                                bgcolor: '#EE791A', color: '#fff',
                                px: 5, py: 1.6, borderRadius: 2,
                                textTransform: 'none', fontWeight: 700, fontSize: '1rem',
                                boxShadow: '0 8px 32px rgba(238,121,26,0.35)',
                                '&:hover': { bgcolor: '#D4651E', boxShadow: '0 14px 44px rgba(238,121,26,0.45)' },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Browse FAQ
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => {
                                const el = document.getElementById('troubleshooting');
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
                            Troubleshooting ↓
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
                            { icon: <HeadsetMicIcon sx={{ fontSize: 28 }} />, value: '< 5 min', label: 'Chat Response' },
                            { icon: <EmailIcon sx={{ fontSize: 28 }} />, value: '< 24 hrs', label: 'Email Response' },
                            { icon: <GroupsIcon sx={{ fontSize: 28 }} />, value: '24/7', label: 'Community' },
                        ].map((s, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Box sx={{ color: '#EE791A', mb: 0.5 }}>{s.icon}</Box>
                                <Typography sx={{ color: '#000', fontWeight: 800, fontSize: '1.25rem' }}>{s.value}</Typography>
                                <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.78rem', letterSpacing: 0.5 }}>{s.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>

                {/* Contact cards */}
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: 10 }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800, color: '#000', mb: 2,
                                fontSize: { xs: '1.5rem', md: '2rem' },
                            }}
                        >
                            Get in{' '}
                            <Box component="span" sx={{ color: '#EE791A' }}>Touch</Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '1rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Choose the support channel that works best for you.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {contactCards.map((c, i) => (
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
                                            background: c.gradient,
                                            opacity: 0, transition: 'opacity 0.3s',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            border: `1px solid ${c.color}40`,
                                            bgcolor: '#ffffff',
                                            boxShadow: `0 24px 64px ${c.color}25`,
                                            '&::before': { opacity: 1 },
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box
                                            sx={{
                                                width: 64, height: 64, borderRadius: 3,
                                                background: `linear-gradient(135deg, ${c.color}18, ${c.color}08)`,
                                                border: `1px solid ${c.color}25`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                mb: 2.5, color: c.color,
                                                transition: 'transform 0.3s',
                                                '&:hover': { transform: 'scale(1.08)' },
                                            }}
                                        >
                                            {c.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#000', mb: 1.2, fontSize: '1.05rem' }}>
                                            {c.title}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.7, fontSize: '0.9rem', flexGrow: 1, mb: 2 }}>
                                            {c.desc}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'inline-flex', alignSelf: 'flex-start',
                                                bgcolor: `${c.color}12`, border: `1px solid ${c.color}25`,
                                                borderRadius: 2, px: 1.5, py: 0.4,
                                            }}
                                        >
                                            <Typography sx={{ color: c.color, fontWeight: 600, fontSize: '0.78rem' }}>
                                                {c.action}
                                            </Typography>
                                        </Box>
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
          SECTION 2 — FAQ
          ═══════════════════════════════════════════════ */}
            <Box
                id="faq"
                ref={faqRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    background: '#fafafa',
                    opacity: faqVisible ? 1 : 0,
                    transform: faqVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 900, color: '#000', mb: 2,
                                fontSize: { xs: '1.8rem', md: '2.6rem' },
                            }}
                        >
                            Frequently Asked{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Questions
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.05rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Quick answers to the most common questions from parents using AegisNet.
                        </Typography>
                    </Box>

                    {faqs.map((faq, i) => (
                        <Accordion
                            key={i}
                            sx={{
                                bgcolor: '#ffffff',
                                border: '1px solid rgba(0,0,0,0.06)',
                                borderRadius: '12px !important',
                                mb: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                '&::before': { display: 'none' },
                                '&:hover': {
                                    border: '1px solid rgba(238,121,26,0.3)',
                                    bgcolor: '#ffffff',
                                    boxShadow: '0 4px 12px rgba(238,121,26,0.05)',
                                },
                                transition: 'all 0.3s ease',
                                overflow: 'hidden',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#EE791A' }} />}
                                sx={{
                                    px: 3, py: 1,
                                    '& .MuiAccordionSummary-content': { my: 1.5 },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <HelpOutlineIcon sx={{ color: '#EE791A', fontSize: 22, flexShrink: 0 }} />
                                    <Typography sx={{ color: '#000', fontWeight: 700, fontSize: '1rem' }}>
                                        {faq.q}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                <Typography sx={{ color: 'rgba(0,0,0,0.7)', lineHeight: 1.8, fontSize: '0.95rem', pl: 4.5 }}>
                                    {faq.a}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Container>
            </Box>

            {/* Divider */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 3 — TROUBLESHOOTING
          ═══════════════════════════════════════════════ */}
            <Box
                id="troubleshooting"
                ref={troubleRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    position: 'relative', overflow: 'hidden', background: '#ffffff',
                    opacity: troubleVisible ? 1 : 0,
                    transform: troubleVisible ? 'translateY(0)' : 'translateY(30px)',
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
                                fontWeight: 900, color: '#000', mb: 2,
                                fontSize: { xs: '1.8rem', md: '2.6rem' },
                            }}
                        >
                            Common{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Fixes
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.05rem', maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
                            Quick solutions to the most reported issues. Try these steps before
                            reaching out to support.
                        </Typography>
                    </Box>

                    <Grid container spacing={4} justifyContent="center">
                        {troubleshooting.map((item, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Box
                                    sx={{
                                        p: 4, borderRadius: 4,
                                        bgcolor: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                                        height: '100%',
                                        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                                        position: 'relative', overflow: 'hidden',
                                        display: 'flex', gap: 3, alignItems: 'flex-start',
                                        '&:hover': {
                                            bgcolor: '#ffffff',
                                            border: '1px solid rgba(238,121,26,0.3)',
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 16px 48px rgba(238,121,26,0.12)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 64, height: 64, borderRadius: 3, flexShrink: 0,
                                            background: 'linear-gradient(135deg, rgba(238,121,26,0.12), rgba(238,121,26,0.04))',
                                            border: '1px solid rgba(238,121,26,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#EE791A',
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#000', mb: 1, fontSize: '1.05rem' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.75, fontSize: '0.93rem' }}>
                                            {item.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Callout */}
                    <Box
                        sx={{
                            mt: 6, p: { xs: 4, md: 5 },
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #fffcf9 0%, #fff0e5 100%)',
                            border: '1px solid rgba(238,121,26,0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
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
                        <Typography sx={{ color: 'rgba(0,0,0,0.7)', fontSize: '1.08rem', lineHeight: 1.85, maxWidth: 650, mx: 'auto', position: 'relative', zIndex: 1 }}>
                            Still having trouble? Don't worry — our{' '}
                            <Box component="span" sx={{ color: '#EE791A', fontWeight: 700 }}>
                                support team
                            </Box>{' '}
                            is standing by to help you resolve any issue personally.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Divider */}
            <Box sx={{ background: 'linear-gradient(90deg, transparent, rgba(238,121,26,0.2), transparent)', height: 1 }} />

            {/* ═══════════════════════════════════════════════
          SECTION 4 — COMMUNITY
          ═══════════════════════════════════════════════ */}
            <Box
                id="community"
                ref={communityRef}
                sx={{
                    py: { xs: 10, md: 14 },
                    background: '#fafafa',
                    opacity: communityVisible ? 1 : 0,
                    transform: communityVisible ? 'translateY(0)' : 'translateY(30px)',
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
                            Join Our{' '}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(135deg, #EE791A, #FFB347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Community
                            </Box>
                        </Typography>
                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.05rem', maxWidth: 550, mx: 'auto', lineHeight: 1.7 }}>
                            Connect with other parents, share experiences, and help shape
                            the future of AegisNet together.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {communityItems.map((item, i) => (
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
                                            background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                                            opacity: 0, transition: 'opacity 0.3s',
                                        },
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            border: `1px solid ${item.color}40`,
                                            bgcolor: '#ffffff',
                                            boxShadow: `0 24px 64px ${item.color}25`,
                                            '&::before': { opacity: 1 },
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box
                                            sx={{
                                                width: 64, height: 64, borderRadius: 3,
                                                background: `linear-gradient(135deg, ${item.color}18, ${item.color}08)`,
                                                border: `1px solid ${item.color}25`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                mb: 2.5, color: item.color,
                                                transition: 'transform 0.3s',
                                                '&:hover': { transform: 'scale(1.08)' },
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#000', mb: 1.2, fontSize: '1.05rem' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ color: 'rgba(0,0,0,0.6)', lineHeight: 1.7, fontSize: '0.9rem', flexGrow: 1 }}>
                                            {item.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Tagline + CTA */}
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 800, color: '#000', fontSize: { xs: '1.15rem', md: '1.45rem' }, mb: 4 }}
                        >
                            Your family's safety is{' '}
                            <Box component="span" sx={{ color: '#EE791A' }}>our mission.</Box>
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
                            Get Started Free
                        </Button>
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
                                { label: 'Product', to: '/product' },
                                { label: 'Learn', to: '/learn' },
                                { label: 'Log in', to: '/login' },
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

export default SupportPage;
