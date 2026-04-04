import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ADMIN_EMAIL } from '../contexts/AuthContext';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockIcon from '@mui/icons-material/Lock';

/* ─────────────────────────────────────────
   Global styles
───────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes orb1 {
    0%, 100% { transform: translate(0px, 0px);    }
    50%       { transform: translate(30px, -20px); }
  }
  @keyframes orb2 {
    0%, 100% { transform: translate(0px, 0px);    }
    50%       { transform: translate(-20px, 25px); }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  .fade-slide   { animation: fadeSlideUp 0.7s ease both; }
  .fade-slide-1 { animation: fadeSlideUp 0.7s 0.1s  ease both; }
  .fade-slide-2 { animation: fadeSlideUp 0.7s 0.25s ease both; }
  .fade-slide-3 { animation: fadeSlideUp 0.7s 0.4s  ease both; }
  .login-card   { animation: cardIn      0.6s 0.2s  ease both; }

  .cta-btn {
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  }
  .cta-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 28px rgba(17,24,39,0.22) !important;
  }

  .outline-btn {
    transition: all 0.2s ease !important;
  }
  .outline-btn:hover {
    background: rgba(37,99,235,0.05) !important;
    border-color: #2563EB !important;
    color: #2563EB !important;
  }

  /* MUI TextField overrides for clean outlined style */
  .clean-field .MuiOutlinedInput-root {
    border-radius: 10px;
    background: #F9FAFB;
    font-family: 'Inter', sans-serif;
    font-size: 0.93rem;
    transition: background 0.18s;
  }
  .clean-field .MuiOutlinedInput-root:hover {
    background: #F3F4F6;
  }
  .clean-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: #D1D5DB;
  }
  .clean-field .MuiOutlinedInput-root.Mui-focused {
    background: #fff;
  }
  .clean-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #EE791A;
    border-width: 1.5px;
  }
  .clean-field .MuiOutlinedInput-notchedOutline {
    border-color: #E5E7EB;
  }
  .clean-field .MuiInputLabel-root {
    font-family: 'Inter', sans-serif;
    font-size: 0.87rem;
    color: #9CA3AF;
  }
  .clean-field .MuiInputLabel-root.Mui-focused {
    color: #111827;
    font-weight: 500;
  }
`;

/* ─────────────────────────────────────────
   Auth helpers (reused from Login.js)
───────────────────────────────────────── */
const getFriendlyError = (code) => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Incorrect email or password.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    default: return 'Something went wrong. Please try again.';
  }
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
const HomePage = () => {
  const navigate = useNavigate();

  /* ── Navbar state ── */
  const [productOpen, setProductOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [mobileMenuEl, setMobileMenuEl] = useState(null);

  const handleMenuToggle = () => setProductOpen(v => { const n = !v; if (n) { setLearnOpen(false); setSupportOpen(false); } return n; });
  const handleLearnToggle = () => setLearnOpen(v => { const n = !v; if (n) { setProductOpen(false); setSupportOpen(false); } return n; });
  const handleSupportToggle = () => setSupportOpen(v => { const n = !v; if (n) { setProductOpen(false); setLearnOpen(false); } return n; });

  /* ── Login card state ── */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      navigate(result.user.email === ADMIN_EMAIL ? '/admin' : '/dashboard');
    } catch (err) { setError(getFriendlyError(err.code)); }
    finally { setLoading(false); }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault(); setError(''); setResetSuccess(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Reset link sent — check your inbox.');
      setResetEmail('');
      setTimeout(() => setResetMode(false), 2500);
    } catch (err) { setError(getFriendlyError(err.code)); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>

      <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA', fontFamily: '"Inter", sans-serif', display: 'flex', flexDirection: 'column' }}>

        {/* ═══ NAVBAR ═══ */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #E5E7EB',
            color: '#111827',
            zIndex: 100,
          }}
        >
          <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 } }}>
            {/* Logo */}
            <Box onClick={() => navigate('/')} role="button" sx={{ mr: 4, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Box component="img" src="/LoginLogoLIght.png" alt="AegisNet" sx={{ height: 38, objectFit: 'contain' }} />
            </Box>

            {/* Desktop nav links */}
            {[
              { label: 'Product', open: productOpen, toggle: handleMenuToggle },
              { label: 'Learn', open: learnOpen, toggle: handleLearnToggle },
              { label: 'Support', open: supportOpen, toggle: handleSupportToggle },
            ].map(item => (
              <Button
                key={item.label}
                onClick={item.toggle}
                disableRipple
                sx={{
                  textTransform: 'none',
                  color: item.open ? '#2563EB' : '#374151',
                  fontWeight: 500,
                  fontSize: '0.92rem',
                  px: 1.5,
                  fontFamily: '"Inter", sans-serif',
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 0.3,
                  '&:hover': { bgcolor: 'transparent', color: '#2563EB' },
                }}
              >
                {item.label}
                <ExpandMoreIcon sx={{ fontSize: 16, transform: item.open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </Button>
            ))}

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <IconButton
                onClick={(e) => setMobileMenuEl(e.currentTarget)}
                sx={{ display: { xs: 'flex', md: 'none' }, color: '#374151' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            <Menu
              anchorEl={mobileMenuEl}
              open={Boolean(mobileMenuEl)}
              onClose={() => setMobileMenuEl(null)}
              PaperProps={{ sx: { mt: 1, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
            >
              <MenuItem onClick={() => { setMobileMenuEl(null); navigate('/product'); }}>Product</MenuItem>
              <MenuItem onClick={() => { setMobileMenuEl(null); navigate('/learn'); }}>Learn</MenuItem>
              <MenuItem onClick={() => { setMobileMenuEl(null); navigate('/support'); }}>Support</MenuItem>
              <MenuItem onClick={() => { setMobileMenuEl(null); navigate('/register'); }}>Register</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Mega menus ── */}
        {productOpen && (
          <Box sx={{ width: '100%', bgcolor: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', position: 'sticky', top: 64, zIndex: 99 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', py: 1 }}>
                {[
                  { title: 'Why AegisNet', desc: 'AI-powered real-time content filtering built for modern families.', link: '/product#discover', cta: 'Discover more' },
                  { title: 'Features', desc: 'App locks, content filters, and activity reviews.', link: '/product#features', cta: 'View all features' },
                  { title: 'Get started', desc: 'Set up takes minutes. Create an account and start protecting right away.', link: '/product#get-started', cta: 'Learn how' },
                  { title: 'Downloads', desc: 'Available for Android 9.0+ devices with real-time screen analysis.', link: '/product#downloads', cta: 'Go to downloads' },
                ].map((col) => (
                  <Box key={col.title} sx={{ p: 2.5, borderRight: '1px solid #F3F4F6', '&:last-child': { borderRight: 'none' } }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.8, fontSize: '0.9rem', color: '#111827', fontFamily: '"Inter", sans-serif' }}>{col.title}</Typography>
                    <Typography sx={{ color: '#6B7280', mb: 1.5, lineHeight: 1.6, fontSize: '0.83rem', fontFamily: '"Inter", sans-serif' }}>{col.desc}</Typography>
                    <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.83rem', color: '#2563EB', fontFamily: '"Inter", sans-serif', '&:hover': { bgcolor: 'transparent' } }}
                      onClick={() => navigate(col.link)}
                    >{col.cta}</Button>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {learnOpen && (
          <Box sx={{ width: '100%', bgcolor: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', position: 'sticky', top: 64, zIndex: 99 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', py: 1 }}>
                {[
                  { title: 'Product tips', desc: 'Latest updates and simple guides to get the most out of AegisNet.', link: '/learn#product-tips', cta: 'Read product tips' },
                  { title: 'Parenting tips', desc: "Kids' online habits, digital safety, and how AI can help protect them.", link: '/learn#parenting-tips', cta: 'Read parenting tips' },
                  { title: 'Safety guides', desc: 'Reviews of apps, games, and online content parents should know.', link: '/learn#safety-guides', cta: 'Read our guides' },
                  { title: 'Family stories', desc: "Real parents share how AegisNet gave them peace of mind online.", link: '/learn#family-stories', cta: 'Read more stories' },
                ].map((col) => (
                  <Box key={col.title} sx={{ p: 2.5, borderRight: '1px solid #F3F4F6', '&:last-child': { borderRight: 'none' } }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.8, fontSize: '0.9rem', color: '#111827', fontFamily: '"Inter", sans-serif' }}>{col.title}</Typography>
                    <Typography sx={{ color: '#6B7280', mb: 1.5, lineHeight: 1.6, fontSize: '0.83rem', fontFamily: '"Inter", sans-serif' }}>{col.desc}</Typography>
                    <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.83rem', color: '#2563EB', fontFamily: '"Inter", sans-serif', '&:hover': { bgcolor: 'transparent' } }}
                      onClick={() => navigate(col.link)}
                    >{col.cta}</Button>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {supportOpen && (
          <Box sx={{ width: '100%', bgcolor: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', position: 'sticky', top: 64, zIndex: 99 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', py: 1 }}>
                {[
                  { title: 'Contact us', desc: 'Reach out via email or live chat our team is ready to help.', link: '/support#contact-us', cta: 'Get in touch' },
                  { title: 'FAQ', desc: 'Quick answers about installation, features, privacy, and devices.', link: '/support#faq', cta: 'Browse FAQ' },
                  { title: 'Troubleshooting', desc: 'Step-by-step fixes for filtering, syncing, and battery issues.', link: '/support#troubleshooting', cta: 'Fix common issues' },
                  { title: 'Community', desc: 'Forums, beta testing, and local parent groups join us.', link: '/support#community', cta: 'Join the community' },
                ].map((col) => (
                  <Box key={col.title} sx={{ p: 2.5, borderRight: '1px solid #F3F4F6', '&:last-child': { borderRight: 'none' } }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.8, fontSize: '0.9rem', color: '#111827', fontFamily: '"Inter", sans-serif' }}>{col.title}</Typography>
                    <Typography sx={{ color: '#6B7280', mb: 1.5, lineHeight: 1.6, fontSize: '0.83rem', fontFamily: '"Inter", sans-serif' }}>{col.desc}</Typography>
                    <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.83rem', color: '#2563EB', fontFamily: '"Inter", sans-serif', '&:hover': { bgcolor: 'transparent' } }}
                      onClick={() => navigate(col.link)}
                    >{col.cta}</Button>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {/* ═══ HERO ═══ */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#fff',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Background orbs – kept left side only so right form stays clean */}
          <Box sx={{
            position: 'absolute', top: '-140px', left: '-100px',
            width: 560, height: 560, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(238,121,26,0.07) 0%, transparent 70%)',
            animation: 'orb1 10s ease-in-out infinite', pointerEvents: 'none',
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-120px', left: '-80px',
            width: 460, height: 460, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,179,71,0.05) 0%, transparent 70%)',
            animation: 'orb2 13s ease-in-out infinite', pointerEvents: 'none',
          }} />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
            <Grid container alignItems="center" sx={{ minHeight: 'calc(100vh - 64px - 56px)', py: { xs: 8, md: 0 } }}>

              {/* ── Left: Hero copy ── */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', py: { xs: 6, md: 10 }, pr: { md: 8 } }}>
                <Box sx={{ maxWidth: 520, width: '100%' }}>
                  <Chip
                    className="fade-slide"
                    icon={<SecurityIcon sx={{ fontSize: '14px !important', color: '#EE791A !important' }} />}
                    label="AI-Powered Parental Control"
                    size="small"
                    sx={{
                      mb: 3,
                      bgcolor: '#FFF5F0',
                      color: '#EE791A',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      border: '1px solid #FFD080',
                      fontFamily: '"Inter", sans-serif',
                      '& .MuiChip-icon': { color: '#EE791A' },
                    }}
                  />

                  <Typography
                    className="fade-slide-1"
                    variant="h1"
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 800,
                      fontSize: { xs: '2.6rem', md: '3.6rem' },
                      lineHeight: 1.08,
                      letterSpacing: '-0.03em',
                      color: '#111827',
                      mb: 3,
                    }}
                  >
                    Keep your kids{' '}
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(90deg, #EE791A, #FFB347)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      safe online
                    </Box>
                    <Box component="span" sx={{ color: '#111827' }}>.</Box>
                  </Typography>

                  <Typography
                    className="fade-slide-2"
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '1.05rem',
                      color: '#6B7280',
                      lineHeight: 1.8,
                      mb: 5,
                      maxWidth: 460,
                    }}
                  >
                    AegisNet uses real-time AI to filter harmful content, set App limits,
                    and give parents full visibility without micromanaging every click.
                  </Typography>

                  {/* Trust badges */}
                  <Box className="fade-slide-3" sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {[
                      { Icon: LockOutlinedIcon, label: 'Safe & Secure' },
                      { Icon: BoltIcon, label: 'Real-time AI' },
                      { Icon: PhoneAndroidIcon, label: 'Android 9+' },
                    ].map(({ Icon, label }) => (
                      <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                        <Icon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>
                          {label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* ── Right: Login form (frameless, blended) ── */}
              <Grid
                item xs={12} md={6}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  py: { xs: 6, md: 10 },
                  pl: { md: '64px !important' },
                }}
              >
                <Box
                  className="login-card"
                  sx={{ width: '100%', maxWidth: 340 }}
                >
                  {/* Card header */}
                  {!resetMode ? (
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.85rem', color: '#6B7280', mb: 2 }}>
                      Sign in to continue to AegisNet
                    </Typography>
                  ) : (
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.85rem', color: '#6B7280', mb: 2 }}>
                      Enter your email to get a reset link
                    </Typography>
                  )}

                  {/* Alerts */}
                  {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px', fontSize: '0.78rem', py: 0.5 }}>{error}</Alert>}
                  {resetSuccess && <Alert severity="success" sx={{ mb: 1.5, borderRadius: '8px', fontSize: '0.78rem', py: 0.5 }}>{resetSuccess}</Alert>}

                  {/* Sign‑in form */}
                  {!resetMode ? (
                    <Box component="form" onSubmit={handleLogin}>
                      <TextField
                        className="clean-field"
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        size="small"
                        sx={{ mb: 1.5 }}
                      />
                      <TextField
                        className="clean-field"
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#9CA3AF' }}>
                                {showPassword ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Button
                        className="cta-btn"
                        type="submit"
                        fullWidth
                        disabled={loading}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.87rem',
                          fontFamily: '"Inter", sans-serif',
                          bgcolor: '#EE791A',
                          color: '#fff',
                          borderRadius: '8px',
                          py: 1.05,
                          mb: 2,
                          '&:hover': { bgcolor: '#CC6612' },
                          '&:disabled': { bgcolor: '#D1D5DB', color: '#9CA3AF' },
                        }}
                      >
                        {loading ? <CircularProgress size={17} sx={{ color: '#fff' }} /> : 'Sign in'}
                      </Button>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link
                          component="button"
                          type="button"
                          onClick={() => navigate('/register')}
                          underline="none"
                          sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.76rem', color: '#EE791A', fontWeight: 500, '&:hover': { color: '#CC6612' } }}
                        >
                          Create account
                        </Link>
                        <Link
                          component="button"
                          type="button"
                          onClick={() => { setResetMode(true); setError(''); }}
                          underline="none"
                          sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.76rem', color: '#9CA3AF', '&:hover': { color: '#374151' } }}
                        >
                          Forgot password?
                        </Link>
                      </Box>
                    </Box>
                  ) : (
                    /* ── Reset form ── */
                    <Box component="form" onSubmit={handlePasswordReset}>
                      <TextField
                        className="clean-field"
                        fullWidth
                        label="Email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        disabled={loading}
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <Button
                        className="cta-btn"
                        type="submit"
                        fullWidth
                        disabled={loading}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.87rem',
                          fontFamily: '"Inter", sans-serif',
                          bgcolor: '#EE791A',
                          color: '#fff',
                          borderRadius: '8px',
                          py: 1.05,
                          mb: 1.5,
                          '&:hover': { bgcolor: '#CC6612' },
                        }}
                      >
                        {loading ? <CircularProgress size={17} sx={{ color: '#fff' }} /> : 'Send reset link'}
                      </Button>

                      <Button
                        fullWidth
                        type="button"
                        onClick={() => { setResetMode(false); setError(''); setResetSuccess(''); }}
                        disableRipple
                        sx={{
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.78rem',
                          fontFamily: '"Inter", sans-serif',
                          color: '#9CA3AF',
                          '&:hover': { bgcolor: 'transparent', color: '#374151' },
                        }}
                      >
                        ← Back to sign in
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>

            </Grid>
          </Container>
        </Box>

        {/* ── Minimal footer ── */}
        <Box sx={{ borderTop: '1px solid #E5E7EB', py: 2.5, bgcolor: '#FAFAFA' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: '"Inter", sans-serif' }}>
                © {new Date().getFullYear()} AegisNet. All rights reserved.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {['Privacy Policy', 'Terms', 'Contact'].map(link => (
                  <Typography
                    key={link}
                    sx={{ fontSize: '0.78rem', color: '#9CA3AF', cursor: 'pointer', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#374151' } }}
                  >
                    {link}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>

      </Box>
    </>
  );
};

export default HomePage;
