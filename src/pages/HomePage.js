import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import LanguageIcon from '@mui/icons-material/Language';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import StarIcon from '@mui/icons-material/Star';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

/* ═══════════════════════════════
   Keyframe CSS
═══════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

  @keyframes skyShift {
    0%   { background-position: 0% 50%;   }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%;   }
  }
  @keyframes cloudDrift {
    0%   { transform: translateX(-220px); opacity: 0;  }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translateX(110vw);  opacity: 0;  }
  }
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-24px); }
  }
  @keyframes bubbleRise {
    0%   { transform: translateY(0)     scale(1);    opacity: 0.85; }
    100% { transform: translateY(-80vh) scale(0.35); opacity: 0; }
  }
  @keyframes sunSpin {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
  @keyframes rainbowPulse {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 0.82; }
  }
  @keyframes shapeBounce {
    0%, 100% { transform: translateY(0px) rotate(0deg);  }
    30%       { transform: translateY(-28px) rotate(-6deg); }
    60%       { transform: translateY(-12px) rotate(4deg);  }
  }
  @keyframes heroFloat {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-14px); }
  }
  @keyframes grassWave {
    0%, 100% { border-radius: 50% 50% 0 0 / 30px 30px 0 0; }
    50%       { border-radius: 50% 50% 0 0 / 44px 44px 0 0; }
  }
  @keyframes titleShimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes orbitSpin {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
  .hero-shield { animation: heroFloat 5s ease-in-out infinite; }
  .shimmer-title {
    background: linear-gradient(90deg, #1e3a8a 0%, #2563EB 25%, #7c3aed 50%, #db2777 75%, #1e3a8a 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: titleShimmer 4s linear infinite;
  }
`;

/* ── Clouds ── */
const clouds = [
  { top: '8%',  dur: '28s', delay: '0s',  size: 140, opacity: 0.92 },
  { top: '18%', dur: '40s', delay: '8s',  size: 100, opacity: 0.80 },
  { top: '5%',  dur: '34s', delay: '15s', size: 180, opacity: 0.85 },
  { top: '28%', dur: '50s', delay: '22s', size: 120, opacity: 0.75 },
  { top: '12%', dur: '44s', delay: '35s', size: 160, opacity: 0.88 },
];

/* ── CSS Geometric floating shapes (no emoji) ── */
const floatingShapes = [
  { size: 48,  top: '12%',  left: '4%',   color: '#FFD93D', delay: '0s',   dur: '6s',  type: 'circle'  },
  { size: 36,  top: '22%',  left: '91%',  color: '#FF6B6B', delay: '1s',   dur: '8s',  type: 'star'    },
  { size: 44,  top: '68%',  left: '7%',   color: '#6BCB77', delay: '2s',   dur: '7s',  type: 'diamond' },
  { size: 30,  top: '75%',  left: '87%',  color: '#4D96FF', delay: '0.5s', dur: '9s',  type: 'circle'  },
  { size: 40,  top: '45%',  left: '93%',  color: '#CC5DE8', delay: '1.5s', dur: '5s',  type: 'star'    },
  { size: 26,  top: '55%',  left: '2%',   color: '#F783AC', delay: '3s',   dur: '10s', type: 'diamond' },
];

const clipPaths = {
  star:    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
};

/* ── Rising bubbles ── */
const bubbles = Array.from({ length: 16 }, (_, i) => ({
  left:  `${(i * 6.5 + 2) % 98}%`,
  delay: `${(i * 0.65) % 7}s`,
  dur:   `${5 + (i % 5)}s`,
  size:  10 + (i % 4) * 8,
  color: ['rgba(99,230,190,0.5)', 'rgba(116,192,252,0.5)', 'rgba(247,131,172,0.5)',
          'rgba(204,93,232,0.4)', 'rgba(255,217,61,0.45)'][i % 5],
}));

/* ── Hero orbit icons ── */
const orbitIcons = [
  { Icon: LockIcon,          color: '#2563EB', angle: 0   },
  { Icon: VisibilityIcon,    color: '#7c3aed', angle: 60  },
  { Icon: PhoneDisabledIcon, color: '#db2777', angle: 120 },
  { Icon: LanguageIcon,      color: '#059669', angle: 180 },
  { Icon: FamilyRestroomIcon,color: '#D97706', angle: 240 },
  { Icon: StarIcon,          color: '#0284C7', angle: 300 },
];

/* Cloud shape component */
const CloudShape = ({ size, opacity }) => (
  <Box sx={{ position: 'relative', width: size, height: size * 0.55, opacity }}>
    <Box sx={{ position: 'absolute', bottom: 0, left: '10%', width: '80%', height: '50%', bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 999 }} />
    <Box sx={{ position: 'absolute', bottom: '28%', left: '20%', width: '44%', height: '60%', bgcolor: 'rgba(255,255,255,0.95)', borderRadius: '50%' }} />
    <Box sx={{ position: 'absolute', bottom: '18%', left: '45%', width: '32%', height: '55%', bgcolor: 'rgba(255,255,255,0.95)', borderRadius: '50%' }} />
  </Box>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [productOpen, setProductOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleMenuToggle = () => setProductOpen(v => { const n = !v; if (n) { setLearnOpen(false); setSupportOpen(false); } return n; });
  const handleLearnToggle = () => setLearnOpen(v => { const n = !v; if (n) { setProductOpen(false); setSupportOpen(false); } return n; });
  const handleSupportToggle = () => setSupportOpen(v => { const n = !v; if (n) { setProductOpen(false); setLearnOpen(false); } return n; });

  return (
    <>
      <style>{CSS}</style>
      <Box sx={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(-30deg, #87CEEB, #B3E5FC, #FFF9C4, #FFCC80, #F48FB1, #87CEEB)',
        backgroundSize: '400% 400%',
        animation: 'skyShift 14s ease infinite',
      }}>

        {/* ── Sun + Rotating rays ── */}
        <Box sx={{ position: 'absolute', top: 60, right: '8%', zIndex: 1, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 160, height: 160, transform: 'translate(-50%, -50%)', background: 'conic-gradient(rgba(255,220,50,0.35) 0deg, transparent 25deg, rgba(255,220,50,0.35) 30deg, transparent 55deg, rgba(255,220,50,0.35) 60deg, transparent 85deg, rgba(255,220,50,0.35) 90deg, transparent 115deg, rgba(255,220,50,0.35) 120deg, transparent 145deg, rgba(255,220,50,0.35) 150deg, transparent 175deg, rgba(255,220,50,0.35) 180deg, transparent 205deg, rgba(255,220,50,0.35) 210deg, transparent 235deg, rgba(255,220,50,0.35) 240deg, transparent 265deg, rgba(255,220,50,0.35) 270deg, transparent 295deg, rgba(255,220,50,0.35) 300deg, transparent 325deg, rgba(255,220,50,0.35) 330deg, transparent 355deg)', borderRadius: '50%', animation: 'sunSpin 18s linear infinite' }} />
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle at 38% 35%, #FFF176, #FFD600)', boxShadow: '0 0 40px rgba(255,214,0,0.7), 0 0 80px rgba(255,214,0,0.35)' }} />
        </Box>

        {/* ── Rainbow arc ── */}
        <Box sx={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, zIndex: 1, pointerEvents: 'none', animation: 'rainbowPulse 5s ease-in-out infinite' }}>
          {['#FF6B6B', '#FF922B', '#FFD93D', '#6BCB77', '#4D96FF', '#845EC2'].map((c, i) => (
            <Box key={i} sx={{ position: 'absolute', top: i * 12, left: i * 12, right: i * 12, height: '100%', borderTop: `14px solid ${c}`, borderLeft: `14px solid ${c}`, borderRight: `14px solid ${c}`, borderRadius: '50% 50% 0 0', opacity: 0.55 }} />
          ))}
        </Box>

        {/* ── Drifting clouds ── */}
        {clouds.map((c, i) => (
          <Box key={i} sx={{ position: 'absolute', top: c.top, left: 0, zIndex: 2, animation: `cloudDrift ${c.dur} linear ${c.delay} infinite`, filter: 'drop-shadow(0 8px 12px rgba(0,80,180,0.08))' }}>
            <CloudShape size={c.size} opacity={c.opacity} />
          </Box>
        ))}

        {/* ── CSS geometric floating shapes ── */}
        {floatingShapes.map((s, i) => (
          <Box key={i} sx={{
            position: 'absolute', top: s.top, left: s.left,
            width: s.size, height: s.size,
            bgcolor: s.color,
            borderRadius: s.type === 'circle' ? '50%' : 0,
            clipPath: s.type !== 'circle' ? clipPaths[s.type] : undefined,
            zIndex: 3,
            animation: `shapeBounce ${s.dur} ease-in-out ${s.delay} infinite`,
            boxShadow: `0 4px 16px ${s.color}88`,
            opacity: 0.85,
          }} />
        ))}

        {/* ── Rising bubbles ── */}
        {bubbles.map((b, i) => (
          <Box key={i} sx={{ position: 'absolute', bottom: 0, left: b.left, width: b.size, height: b.size, borderRadius: '50%', bgcolor: b.color, zIndex: 2, border: '1.5px solid rgba(255,255,255,0.6)', animation: `bubbleRise ${b.dur} ease-in ${b.delay} infinite`, boxShadow: 'inset -2px -3px 6px rgba(255,255,255,0.4)' }} />
        ))}

        {/* ── Animated green hills ── */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', bottom: 0, left: '-10%', width: '55%', height: 120, bgcolor: '#81C784', borderRadius: '50% 50% 0 0 / 60px 60px 0 0', animation: 'grassWave 6s ease-in-out 1s infinite', opacity: 0.85 }} />
          <Box sx={{ position: 'absolute', bottom: 0, right: '-10%', width: '60%', height: 140, bgcolor: '#66BB6A', borderRadius: '50% 50% 0 0 / 70px 70px 0 0', animation: 'grassWave 7s ease-in-out 0s infinite', opacity: 0.9 }} />
          <Box sx={{ height: 48, bgcolor: '#4CAF50', opacity: 0.95 }} />
        </Box>

        {/* ═══ NAVBAR ═══ */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.4)', color: '#1e3a8a', boxShadow: '0 2px 20px rgba(0,80,200,0.08)', position: 'relative', zIndex: 10 }}>
          <Toolbar>
            {/* CSS + MUI icon logo — no emoji */}
            <Box onClick={() => navigate('/')} role="button" sx={{ mr: 2, display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(37,99,235,0.4)' }}>
                <SecurityIcon sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', fontFamily: '"Nunito", sans-serif', background: 'linear-gradient(90deg, #1e3a8a, #2563EB, #7c3aed)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px' }}>
                AegistNet
              </Typography>
            </Box>

            {[
              { label: 'Product', open: productOpen, toggle: handleMenuToggle },
              { label: 'Learn',   open: learnOpen,   toggle: handleLearnToggle },
              { label: 'Support', open: supportOpen,  toggle: handleSupportToggle },
            ].map(item => (
              <Button key={item.label} onClick={item.toggle} sx={{ textTransform: 'none', color: '#1e3a8a', fontWeight: 700, fontSize: '0.95rem', px: 0, '&:hover': { bgcolor: 'transparent', color: '#2563EB' }, borderBottom: item.open ? '3px solid #2563EB' : 'none', pb: item.open ? '6px' : 0, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                {item.label}
                <ExpandMoreIcon fontSize="small" sx={{ transform: item.open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </Button>
            ))}

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => navigate('/login')} sx={{ textTransform: 'none', color: '#1e3a8a', borderColor: 'rgba(30,58,138,0.35)', '&:hover': { borderColor: '#2563EB', bgcolor: 'rgba(37,99,235,0.06)' }, fontWeight: 600 }}>Log in</Button>
              <Button variant="contained" onClick={() => navigate('/register')} sx={{ textTransform: 'none', fontWeight: 700, background: 'linear-gradient(90deg, #2563EB, #7c3aed)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', borderRadius: 2, px: 3, '&:hover': { background: 'linear-gradient(90deg, #1D4ED8, #6d28d9)', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>SIGN UP</Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ── Mega menus ── */}
        {productOpen && (
          <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderTop: '1px solid rgba(255,255,255,0.6)', position: 'relative', zIndex: 10 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                {[
                  { title: 'Why AegistNet', desc: 'Kids spend a lot of time on screens, and keeping them safe matters. AI-powered real-time content filtering.', link: '/product#discover', cta: 'Discover more' },
                  { title: 'Features', desc: 'Lock apps, block inappropriate content, track location, and review activity in a way that fits your family.', link: '/product#features', cta: 'View all features' },
                  { title: 'Get started', desc: 'Set up takes only a few minutes. Create an account, install on child device, and it starts protecting right away.', link: '/product#get-started', cta: 'Learn how' },
                  { title: 'Downloads', desc: 'Available for Android 9.0+ devices. Real-time screen analysis to monitor and filter harmful content as it appears.', link: '/product#downloads', cta: 'Go to downloads' },
                ].map((col) => (
                  <Box key={col.title} sx={{ p: 2.5, borderRight: '1px solid #f0f0f0', '&:last-child': { borderRight: 'none' } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1rem', color: '#1e3a8a' }}>{col.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>{col.desc}</Typography>
                    <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }} onClick={() => navigate(col.link)}>{col.cta}</Button>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {learnOpen && (
          <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderTop: '1px solid rgba(255,255,255,0.6)', position: 'relative', zIndex: 10 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                {[
                  { title: 'Product tips', desc: 'Get the latest updates, new features, and simple guides to make the most of AegistNet.', link: '/learn#product-tips', cta: 'Read product tips' },
                  { title: 'Parenting tips', desc: "Learn about kids' online habits, digital safety, and how AI can help protect them.", link: '/learn#parenting-tips', cta: 'Read parenting tips' },
                  { title: 'Safety guides', desc: 'Ratings and recommendations about apps, games, and online content parents should watch.', link: '/learn#safety-guides', cta: 'Read our guides' },
                  { title: 'Family stories', desc: "AegistNet gives me the peace of mind I've been looking for. I know my kids are safe online.", link: '/learn#family-stories', cta: 'Read more stories' },
                ].map((col) => (
                  <Box key={col.title} sx={{ p: 2.5, borderRight: '1px solid #f0f0f0', '&:last-child': { borderRight: 'none' } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1rem', color: '#1e3a8a' }}>{col.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>{col.desc}</Typography>
                    <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }} onClick={() => navigate(col.link)}>{col.cta}</Button>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {supportOpen && (
          <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderTop: '1px solid rgba(255,255,255,0.6)', position: 'relative', zIndex: 10 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                {[
                  { title: 'Contact us', desc: 'Reach out through email, live chat, or phone. Our team is ready to help with any question.', link: '/support#contact-us', cta: 'Get in touch' },
                  { title: 'FAQ', desc: 'Find quick answers to common questions about installation, features, data privacy and devices.', link: '/support#faq', cta: 'Browse FAQ' },
                  { title: 'Troubleshooting', desc: 'Step-by-step fixes for content filtering, location updates, syncing problems and battery optimization.', link: '/support#troubleshooting', cta: 'Fix common issues' },
                  { title: 'Community', desc: 'Join parent forums, submit requests, sign up for beta testing, and connect with local groups.', link: '/support#community', cta: 'Join the community' },
                ].map((col) => (
                  <Box key={col.title} sx={{ p: 2.5, borderRight: '1px solid #f0f0f0', '&:last-child': { borderRight: 'none' } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1rem', color: '#1e3a8a' }}>{col.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>{col.desc}</Typography>
                    <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }} onClick={() => navigate(col.link)}>{col.cta}</Button>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {/* ═══ HERO ═══ */}
        <Box sx={{ position: 'relative', zIndex: 5, minHeight: '78vh', display: 'flex', alignItems: 'center', pb: 12 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">

              {/* Left: Text */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(37,99,235,0.25)', borderRadius: 999, px: 2.5, py: 0.8, mb: 3, boxShadow: '0 2px 12px rgba(37,99,235,0.12)' }}>
                  <SecurityIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem', letterSpacing: 0.5 }}>
                    AI-Powered Parental Control
                  </Typography>
                </Box>

                <Typography variant="h2" className="shimmer-title" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2rem', md: '3.2rem' }, lineHeight: 1.1, fontFamily: '"Nunito", sans-serif' }}>
                  AegistNet: AI Parental Control for a Safer Digital World
                </Typography>

                <Typography variant="h6" sx={{ color: '#1e3a8a', mb: 4, fontSize: '1.05rem', lineHeight: 1.7, opacity: 0.85, bgcolor: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(4px)', borderRadius: 2, px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.6)' }}>
                  Give your child the freedom to explore while keeping them safe. Our app works in real time and filters inappropriate content — built to give parents peace of mind.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => navigate('/register')} sx={{ px: 4, py: 1.6, borderRadius: 3, textTransform: 'none', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(90deg, #2563EB, #7c3aed)', boxShadow: '0 6px 24px rgba(37,99,235,0.45)', fontFamily: '"Nunito", sans-serif', '&:hover': { background: 'linear-gradient(90deg, #1D4ED8, #6d28d9)', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(37,99,235,0.55)' }, transition: 'all 0.25s ease' }}>
                    TRY NOW
                  </Button>
                  <Button variant="contained" onClick={() => navigate('/product')} sx={{ color: '#1e3a8a', textTransform: 'none', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '2px solid rgba(37,99,235,0.35)', borderRadius: 3, px: 3, py: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', borderColor: '#2563EB', transform: 'translateY(-2px)' }, transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7c3aed)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>▶</Box>
                    See it in action
                  </Button>
                </Box>

                {/* Trust badges — MUI icons, no emoji */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                  {[
                    { Icon: LockOutlinedIcon, label: 'Safe & Secure' },
                    { Icon: BoltIcon,         label: 'Real-time AI' },
                    { Icon: PhoneAndroidIcon, label: 'Android 9+' },
                  ].map(({ Icon, label }) => (
                    <Box key={label} sx={{ bgcolor: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 999, px: 2, py: 0.6, display: 'flex', alignItems: 'center', gap: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <Icon sx={{ fontSize: 15, color: '#2563EB' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.8rem' }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Right: Animated CSS shield — no emoji */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, alignItems: 'center' }}>
                  <Box className="hero-shield" sx={{ position: 'relative', width: { xs: 300, md: 380 }, height: { xs: 300, md: 380 } }}>

                    {/* Glow halo */}
                    <Box sx={{ position: 'absolute', inset: '-30px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(124,58,237,0.15) 50%, transparent 72%)', filter: 'blur(24px)', animation: 'rainbowPulse 3s ease-in-out infinite' }} />

                    {/* Orbit rings */}
                    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(37,99,235,0.3)', animation: 'orbitSpin 18s linear infinite' }} />
                    <Box sx={{ position: 'absolute', inset: '16px', borderRadius: '50%', border: '1.5px dashed rgba(124,58,237,0.2)', animation: 'orbitSpin 12s linear reverse infinite' }} />

                    {/* Central shield shape (CSS polygon, no emoji) */}
                    <Box sx={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 150, height: 170,
                      background: 'linear-gradient(160deg, #2563EB 0%, #7c3aed 55%, #db2777 100%)',
                      clipPath: 'polygon(50% 0%, 100% 20%, 100% 60%, 50% 100%, 0% 60%, 0% 20%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 12px 40px rgba(37,99,235,0.5)',
                      animation: 'rainbowPulse 4s ease-in-out infinite',
                      zIndex: 2,
                    }}>
                      <SecurityIcon sx={{ color: '#fff', fontSize: 64, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }} />
                    </Box>

                    {/* Orbiting MUI icon cards */}
                    {orbitIcons.map(({ Icon, color, angle }, i) => {
                      const rad = (angle * Math.PI) / 180;
                      const x = 50 + 37 * Math.cos(rad);
                      const y = 50 + 37 * Math.sin(rad);
                      return (
                        <Box key={i} sx={{
                          position: 'absolute', left: `${x}%`, top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: 52, height: 52, borderRadius: '14px',
                          bgcolor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)',
                          border: `2px solid ${color}44`,
                          boxShadow: `0 6px 20px ${color}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
                          animation: `shapeBounce ${4 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
                        }}>
                          <Icon sx={{ color, fontSize: 26 }} />
                        </Box>
                      );
                    })}

                    {/* Accent dots */}
                    {[0, 1, 2].map(i => (
                      <Box key={i} sx={{
                        position: 'absolute', top: `${18 + i * 28}%`, right: `${-4 + i * 2}%`,
                        width: 12, height: 12, borderRadius: '50%',
                        bgcolor: ['#FFD93D', '#6BCB77', '#FF6B6B'][i],
                        boxShadow: `0 0 12px ${ ['#FFD93D', '#6BCB77', '#FF6B6B'][i] }`,
                        zIndex: 4,
                        animation: `shapeBounce ${3 + i}s ease-in-out ${i * 0.6}s infinite`,
                      }} />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
