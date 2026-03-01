import React, { useState } from 'react';
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
  Chip,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const HomePage = () => {
  const navigate = useNavigate();
  const [productOpen, setProductOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleMenuToggle = () => {
    setProductOpen((v) => {
      const next = !v;
      if (next) {
        setLearnOpen(false);
        setSupportOpen(false);
      }
      return next;
    });
  };

  const handleLearnToggle = () => {
    setLearnOpen((v) => {
      const next = !v;
      if (next) {
        setProductOpen(false);
        setSupportOpen(false);
      }
      return next;
    });
  };

  const handleSupportToggle = () => {
    setSupportOpen((v) => {
      const next = !v;
      if (next) {
        setProductOpen(false);
        setLearnOpen(false);
      }
      return next;
    });
  };

  const PlanCard = ({ title, price, subtitle, highlighted }) => (
    <Card
      elevation={highlighted ? 8 : 2}
      sx={{
        borderRadius: 2,
        overflow: 'visible',
        position: 'relative',
        minHeight: 380,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: highlighted ? 16 : 8,
        },
      }}
    >
      {highlighted && (
        <Box sx={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)' }}>
          <Chip label="BEST VALUE" sx={{ bgcolor: '#ffd54f', color: '#000', fontWeight: 700, fontSize: '0.75rem' }} />
        </Box>
      )}

      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: highlighted ? '#c05905ff' : '#fff',
          color: highlighted ? '#fff' : 'inherit',
          p: 4,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            {title}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {price}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.8, mb: 3, display: 'block' }}>
            {subtitle}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {title === 'Basic'
              ? 'The tools you need for core protection.'
              : 'Advanced safety features with full customization.'}
          </Typography>
        </Box>

        <Box>
          <Button
            variant={highlighted ? 'contained' : 'outlined'}
            size="large"
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: highlighted ? '#fff' : 'transparent',
              color: highlighted ? '#c05905ff' : '#c05905ff',
              borderColor: '#c05905ff',
              '&:hover': {
                bgcolor: highlighted ? '#f5f5f5' : 'rgba(192, 89, 5, 0.05)',
              },
              mb: 2,
            }}
            onClick={() => navigate('/register')}
          >
            Buy now
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{
              textTransform: 'none',
              color: highlighted ? 'rgba(255,255,255,0.8)' : '#c05905ff',
            }}
          >
            See what's included
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000000' }}>
      {/* Header/Navigation */}
      <AppBar position="static" sx={{ bgcolor: '#000000', color: '#fff', boxShadow: 'none' }}>
        <Toolbar>
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/HeaderLogo.png"
              alt="AegistNet"
              sx={{ height: { xs: 28, sm: 36 }, display: 'block' }}
              onClick={() => navigate('/')}
              role="button"
            />
          </Box>

          <Button
            color="inherit"
            onClick={handleMenuToggle}
            sx={{
              textTransform: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              px: 0,
              '&:hover': { bgcolor: 'transparent' },
              borderBottom: productOpen ? '3px solid #ffa66bff' : 'none',
              pb: productOpen ? '6px' : 0,
              display: { xs: 'none', md: 'block' },
            }}
          >
            Product
            <ExpandMoreIcon fontSize="small" sx={{ transform: productOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', ml: 0.5 }} />
          </Button>

          {/* Pricing removed as requested */}

          <Button
            color="inherit"
            onClick={handleLearnToggle}
            sx={{
              textTransform: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              px: 0,
              '&:hover': { bgcolor: 'transparent' },
              borderBottom: learnOpen ? '3px solid #c48510ff' : 'none',
              pb: learnOpen ? '6px' : 0,
              display: { xs: 'none', md: 'block' },
            }}
          >
            Learn
            <ExpandMoreIcon fontSize="small" sx={{ transform: learnOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', ml: 0.5 }} />
          </Button>

          <Button
            color="inherit"
            onClick={handleSupportToggle}
            sx={{
              textTransform: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              px: 0,
              '&:hover': { bgcolor: 'transparent' },
              borderBottom: supportOpen ? '3px solid #c05905ff' : 'none',
              pb: supportOpen ? '6px' : 0,
              display: { xs: 'none', md: 'block' },
            }}
          >
            Support
            <ExpandMoreIcon fontSize="small" sx={{ transform: supportOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', ml: 0.5 }} />
          </Button>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.18)',
                '&:hover': { borderColor: 'rgba(255,255,255,0.28)' },
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
                '&:hover': { bgcolor: '#c05905ff' },
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
      {productOpen && (
        <Box sx={{ width: '100%', bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderTop: '1px solid #eee' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              <Box sx={{ p: 2.5, borderRight: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Why AegistNet
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Kids spend a lot of time on screens, and keeping them safe matters. This app uses real-time AI to filter explicit content and help you stay in control of what they see.
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }} onClick={() => navigate('/product#discover')}>
                  Discover more
                </Button>
              </Box>
              <Box sx={{ p: 2.5, borderRight: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Features
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Lock apps when you need to, block inappropriate content automatically, track your child’s location, and review their activity in a way that fits your family’s routine.
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }} onClick={() => navigate('/product#features')}>
                  View all features
                </Button>
              </Box>
              <Box sx={{ p: 2.5, borderRight: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Get started
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Set up takes only a few minutes. Create an account, download the app on child device, turn it on, and it starts monitoring and protecting right away.
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }} onClick={() => navigate('/product#get-started')}>
                  Learn how
                </Button>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Downloads
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Available for Android 9.0+ devices. The app uses real-time screen analysis to monitor and filter harmful content as it appears. You can install it on your child’s phone or tablet
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }} onClick={() => navigate('/product#downloads')}>
                  Go to downloads
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* Inline Learn Mega Menu (pushes content down) */}
      {learnOpen && (
        <Box sx={{ width: '100%', bgcolor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderTop: '1px solid #eee' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              <Box sx={{ p: 2.5, borderRight: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Product tips
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Get the latest updates, new features, and simple guides that help you make the most of your AegistNet app.
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }}>
                  Read product tips
                </Button>
              </Box>
              <Box sx={{ p: 2.5, borderRight: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Parenting tips
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Learn from reliable information and research about kids’ online habits, digital safety, and how AI can help protect them.
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }}>
                  Read parenting tips
                </Button>
              </Box>
              <Box sx={{ p: 2.5, borderRight: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Safety guides
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  Quick summaries, ratings, and recommendations about the apps, games, and online content parents should keep an eye on.
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }}>
                  Read our guides and reviews
                </Button>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', color: '#000' }}>
                  <span style={{ fontSize: '1.2rem' }}></span> Family stories
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 2, lineHeight: 1.5, fontSize: '0.9rem' }}>
                  “AegistNet gives me the peace of mind I’ve been looking for. I know my kids are safe when they’re online.”
                </Typography>
                <Button color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 600, p: 0, fontSize: '0.9rem' }}>
                  Read more family stories
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* Hero Section */}
      <Box sx={{ background: '#000000', color: '#fff', minHeight: '72vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2rem', md: '3.75rem' }, lineHeight: 1.05 }}>
                AegistNet: AI Parental Control for a Safer Digital World
              </Typography>

              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontSize: '1.05rem' }}>
                Give your child the freedom to explore while keeping them safe. Our app Work in real time and filters inappropriate content. It is more about guidance and monitoring, and built to give parents peace of mind.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  // inline style to ensure it overrides any theme primary/blue defaults
                  style={{ backgroundColor: '#EE791A', color: '#fff' }}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  TRY NOW
                </Button>

                <Button variant="text" sx={{ color: '#EE791A', textTransform: 'none', fontWeight: 700 }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #EE791A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      ▶
                    </Box>
                    See it in action
                  </Box>
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Box sx={{ position: 'relative', width: { xs: 300, md: 420 }, height: { xs: 300, md: 420 } }}>
                  {/* Glow effect background */}
                  <Box sx={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'radial-gradient(circle at 30% 30%, rgba(255,107,107,0.25), rgba(255,107,107,0.05))', filter: 'blur(40px)', zIndex: 0 }} />
                  {/* Image */}
                  <Box
                    component="img"
                    src="/hero-illustration.png.png"
                    alt="AegistNet Hero"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      position: 'relative',
                      zIndex: 1,
                      filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))',
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Resources section removed */}
    </Box>
  );
};

export default HomePage;
