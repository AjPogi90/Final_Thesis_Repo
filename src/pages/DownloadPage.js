import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AndroidIcon from '@mui/icons-material/Android';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';

/* ─────────────────────────────────────────
   CONFIG — update APK_URL when you host the file
───────────────────────────────────────── */
const APK_URL = 'https://drive.google.com/file/d/1Iaks1zt9V0kKhS39KHNWsCf_rHRodoAl/view?usp=sharing';
const APK_VERSION = '1.2';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(238,121,26,0); }
    50%       { box-shadow: 0 0 0 14px rgba(238,121,26,0.12); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero-phone { animation: float 5s ease-in-out infinite; }
  .fade-up-1  { animation: fadeUp 0.6s ease both; }
  .fade-up-2  { animation: fadeUp 0.6s 0.12s ease both; }
  .fade-up-3  { animation: fadeUp 0.6s 0.24s ease both; }
  .dl-btn:hover { transform: translateY(-2px) !important; }
  .dl-btn { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
`;

const faqs = [
  {
    q: 'Is it safe to install an APK from outside the Play Store?',
    a: 'Yes — as long as you download the APK from our official website. The app is digitally signed and does not collect any data beyond what is needed for parental monitoring.',
  },
  {
    q: 'What Android version do I need?',
    a: 'The KidSafe child app requires Android 8.0 (Oreo) or higher. We support Android 8, 9, 10, 11, 12, 13, and 14.',
  },
  {
    q: 'Will it slow down my child\'s phone?',
    a: 'The app is optimized for minimal battery and memory usage. Real-time screen analysis is efficient and typically uses less than 3% CPU in the background.',
  },
  {
    q: 'Can my child uninstall it?',
    a: 'During setup, you enable device administrator privileges which prevents easy uninstall. Your child would need your PIN to remove the app.',
  },
  {
    q: 'How does the app connect to the parent dashboard?',
    a: 'After installation, log in with the same account you use on this parent web app. The devices link automatically via Firebase.',
  },
];

const requirements = [
  { icon: <AndroidIcon />, label: 'Android 8.0+', sub: '(Oreo or higher)' },
  { icon: <StorageIcon />, label: '50 MB free', sub: 'Storage space' },
  { icon: <MemoryIcon />, label: '2 GB RAM', sub: 'Recommended' },
  { icon: <BoltIcon />, label: 'Internet', sub: 'Required for sync' },
];

const DownloadPage = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (APK_URL === 'YOUR_APK_DOWNLOAD_URL_HERE') {
      alert('APK download link not configured yet. Please contact the administrator.');
      return;
    }
    window.open(APK_URL, '_blank');
  };

  const handleCopyLink = () => {
    if (APK_URL === 'YOUR_APK_DOWNLOAD_URL_HERE') {
      navigator.clipboard.writeText(window.location.href);
    } else {
      navigator.clipboard.writeText(APK_URL);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', fontFamily: '"Inter", sans-serif' }}>

        {/* ── Navbar ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            color: '#111827',
          }}
        >
          <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 } }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ color: '#374151', textTransform: 'none', fontWeight: 600, mr: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
            >
              Back
            </Button>
            <Box component="img" src="/LoginLogoLIght.png" alt="AegisNet" sx={{ height: 34, objectFit: 'contain', cursor: 'pointer' }} onClick={() => navigate('/')} />
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => navigate('/')} sx={{ textTransform: 'none', color: '#374151', borderColor: 'rgba(0,0,0,0.2)', '&:hover': { borderColor: '#EE791A' } }}>
                Log in
              </Button>
              <Button variant="contained" size="small" onClick={() => navigate('/register')} sx={{ textTransform: 'none', bgcolor: '#EE791A', '&:hover': { bgcolor: '#D4651E' }, borderRadius: 1.5 }}>
                Sign Up
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* ═══ HERO ═══ */}
        <Box
          sx={{
            background: 'linear-gradient(160deg, #fff7ed 0%, #ffffff 55%, #fff7ed 100%)',
            py: { xs: 8, md: 12 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orbs */}
          <Box sx={{ position: 'absolute', top: -100, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,121,26,0.14) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,71,0.08) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

          <Container maxWidth="lg">
            <Grid container alignItems="center" spacing={{ xs: 6, md: 10 }}>

              {/* Left copy */}
              <Grid item xs={12} md={7}>
                <Chip
                  className="fade-up-1"
                  icon={<AndroidIcon sx={{ fontSize: '15px !important', color: '#EE791A !important' }} />}
                  label={`Version ${APK_VERSION} · Android 8.0+`}
                  size="small"
                  sx={{ mb: 3, bgcolor: '#FFF5F0', color: '#EE791A', fontWeight: 600, fontSize: '0.78rem', border: '1px solid #FFD080' }}
                />

                <Typography
                  className="fade-up-2"
                  variant="h1"
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    fontSize: { xs: '2.4rem', md: '3.4rem' },
                    lineHeight: 1.07,
                    letterSpacing: '-0.03em',
                    color: '#111827',
                    mb: 2.5,
                  }}
                >
                  Install the{' '}
                  <Box component="span" sx={{ background: 'linear-gradient(90deg, #EE791A, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    KidSafe
                  </Box>
                  {' '}Child App
                </Typography>

                <Typography
                  className="fade-up-3"
                  sx={{ fontFamily: '"Inter", sans-serif', color: '#6B7280', fontSize: '1.05rem', lineHeight: 1.8, mb: 4, maxWidth: 520 }}
                >
                  Install this app on your child's Android device to activate real-time AI content filtering,
                  app locking, and monitoring — all controlled from your parent dashboard.
                </Typography>

                {/* Trust badges */}
                <Box className="fade-up-3" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 5 }}>
                  {[
                    { Icon: VerifiedUserIcon, label: 'Verified & Signed' },
                    { Icon: ShieldIcon, label: 'No Ads or Trackers' },
                    { Icon: SecurityIcon, label: 'PIN-Protected' },
                  ].map(({ Icon, label }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                      <Icon sx={{ fontSize: 15, color: '#9CA3AF' }} />
                      <Typography sx={{ fontSize: '0.81rem', color: '#9CA3AF', fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* CTA buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    className="dl-btn"
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    id="download-apk-btn"
                    sx={{
                      bgcolor: '#EE791A',
                      color: '#fff',
                      px: 4,
                      py: 1.55,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      fontFamily: '"Inter", sans-serif',
                      boxShadow: '0 8px 32px rgba(238,121,26,0.35)',
                      animation: 'pulse-glow 3s ease-in-out infinite',
                      '&:hover': { bgcolor: '#D4651E', boxShadow: '0 14px 44px rgba(238,121,26,0.45)' },
                    }}
                  >
                    Download APK
                  </Button>

                  <Tooltip title={copied ? 'Copied!' : 'Copy download link'} placement="top">
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyLink}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        fontFamily: '"Inter", sans-serif',
                        color: copied ? '#22c55e' : '#374151',
                        borderColor: copied ? '#22c55e' : 'rgba(0,0,0,0.18)',
                        borderRadius: 2,
                        py: 1.55,
                        transition: 'all 0.25s',
                        '&:hover': { borderColor: '#EE791A', color: '#EE791A', bgcolor: 'rgba(238,121,26,0.04)' },
                      }}
                    >
                      {copied ? 'Link Copied!' : 'Copy Link'}
                    </Button>
                  </Tooltip>
                </Box>

                <Typography sx={{ mt: 2, fontSize: '0.77rem', color: '#9CA3AF', fontFamily: '"Inter", sans-serif' }}>
                  Requires Android 8.0 (Oreo) or higher · Free download
                </Typography>
              </Grid>

              {/* Right — Phone mockup + QR */}
              <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                {/* Stylized phone icon */}
                <Box
                  className="hero-phone"
                  sx={{
                    width: 140,
                    height: 140,
                    borderRadius: '36px',
                    background: 'linear-gradient(135deg, #EE791A, #D4651E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 24px 64px rgba(238,121,26,0.35)',
                  }}
                >
                  <PhoneAndroidIcon sx={{ fontSize: 72, color: '#fff' }} />
                </Box>

                {/* QR code placeholder */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(238,121,26,0.15)',
                    bgcolor: '#fffbf7',
                    textAlign: 'center',
                    maxWidth: 220,
                    width: '100%',
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 64, color: '#EE791A', mb: 1 }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: '"Inter", sans-serif', lineHeight: 1.5 }}>
                    Scan with your phone to open this page on the child's device, then tap Download
                  </Typography>
                </Paper>
              </Grid>

            </Grid>
          </Container>
        </Box>

        <Divider sx={{ borderColor: 'rgba(238,121,26,0.12)' }} />

        {/* ═══ SYSTEM REQUIREMENTS ═══ */}
        <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fafafa' }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', fontFamily: '"Inter", sans-serif', mb: 1.5, fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
                System{' '}
                <Box component="span" sx={{ background: 'linear-gradient(90deg, #EE791A, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Requirements
                </Box>
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: '1rem', fontFamily: '"Inter", sans-serif' }}>
                Make sure your child's device meets these minimum specs.
              </Typography>
            </Box>

            <Grid container spacing={3} justifyContent="center">
              {requirements.map((req, i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      border: '1px solid rgba(0,0,0,0.07)',
                      bgcolor: '#fff',
                      height: '100%',
                      transition: 'all 0.25s',
                      '&:hover': { borderColor: 'rgba(238,121,26,0.3)', boxShadow: '0 8px 24px rgba(238,121,26,0.1)', transform: 'translateY(-4px)' },
                    }}
                  >
                    <Box sx={{ color: '#EE791A', mb: 1.5, '& svg': { fontSize: 34 } }}>{req.icon}</Box>
                    <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>{req.label}</Typography>
                    <Typography sx={{ color: '#9CA3AF', fontSize: '0.78rem', fontFamily: '"Inter", sans-serif', mt: 0.3 }}>{req.sub}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Divider sx={{ borderColor: 'rgba(238,121,26,0.1)' }} />

        {/* ═══ INSTALLATION STEPS ═══ */}
        <Box sx={{ py: { xs: 7, md: 11 }, bgcolor: '#fff' }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 7 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', fontFamily: '"Inter", sans-serif', mb: 1.5, fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
                How to{' '}
                <Box component="span" sx={{ background: 'linear-gradient(90deg, #EE791A, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Install
                </Box>
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: '1rem', fontFamily: '"Inter", sans-serif', maxWidth: 500, mx: 'auto' }}>
                Follow these steps on your <strong>child's Android device</strong>. Setup takes about 3 minutes.
              </Typography>
            </Box>

            <Alert
              severity="info"
              sx={{ mb: 5, borderRadius: 2, bgcolor: 'rgba(238,121,26,0.06)', border: '1px solid rgba(238,121,26,0.18)', color: '#92400e', '& .MuiAlert-icon': { color: '#EE791A' } }}
            >
              <strong>Tip:</strong> Perform these steps on <strong>your child's phone</strong>, not your own device. You can scan the QR code above to open this page on their phone.
            </Alert>

            <Stepper orientation="vertical" sx={{ '& .MuiStepLabel-iconContainer .MuiSvgIcon-root': { color: '#EE791A' }, '& .MuiStepConnector-line': { borderColor: 'rgba(238,121,26,0.2)' } }}>
              {[
                {
                  label: 'Enable "Install Unknown Apps"',
                  icon: <SettingsIcon />,
                  content: (
                    <Box>
                      <Typography sx={{ color: '#374151', fontFamily: '"Inter", sans-serif', fontSize: '0.93rem', lineHeight: 1.75 }}>
                        Android blocks APKs from outside the Play Store by default. You need to allow it once:
                      </Typography>
                      <Box component="ol" sx={{ pl: 2.5, mt: 1.5, color: '#374151', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', lineHeight: 2 }}>
                        <li>Open <strong>Settings</strong> on the child's device</li>
                        <li>Go to <strong>Apps</strong> → <strong>Special app access</strong></li>
                        <li>Tap <strong>Install unknown apps</strong></li>
                        <li>Select your browser (e.g. Chrome) and toggle <strong>Allow from this source</strong></li>
                      </Box>
                      <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 1.5, fontSize: '0.82rem' }}>
                        You can disable this again after installation for security.
                      </Alert>
                    </Box>
                  ),
                },
                {
                  label: 'Download the APK',
                  icon: <DownloadIcon />,
                  content: (
                    <Box>
                      <Typography sx={{ color: '#374151', fontFamily: '"Inter", sans-serif', fontSize: '0.93rem', lineHeight: 1.75, mb: 2 }}>
                        On the child's phone, open this page and tap the download button below, or scan the QR code above.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        size="small"
                        sx={{ bgcolor: '#EE791A', textTransform: 'none', fontWeight: 700, borderRadius: 1.5, '&:hover': { bgcolor: '#D4651E' } }}
                      >
                        Download KidSafe v{APK_VERSION}
                      </Button>

                    </Box>
                  ),
                },
                {
                  label: 'Open and Install the APK',
                  icon: <PhoneAndroidIcon />,
                  content: (
                    <Box>
                      <Typography sx={{ color: '#374151', fontFamily: '"Inter", sans-serif', fontSize: '0.93rem', lineHeight: 1.75 }}>
                        After the download completes:
                      </Typography>
                      <Box component="ol" sx={{ pl: 2.5, mt: 1.5, color: '#374151', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', lineHeight: 2 }}>
                        <li>Pull down the notification shade and tap the downloaded file</li>
                        <li>Tap <strong>Install</strong> when Android asks for confirmation</li>
                        <li>If a Play Protect warning appears, tap <strong>Install anyway</strong></li>
                        <li>Tap <strong>Open</strong> once installation is complete</li>
                      </Box>
                    </Box>
                  ),
                },
                {
                  label: 'Log in & Activate Protection',
                  icon: <VerifiedUserIcon />,
                  content: (
                    <Box>
                      <Typography sx={{ color: '#374151', fontFamily: '"Inter", sans-serif', fontSize: '0.93rem', lineHeight: 1.75 }}>
                        Inside the KidSafe child app:
                      </Typography>
                      <Box component="ol" sx={{ pl: 2.5, mt: 1.5, color: '#374151', fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', lineHeight: 2 }}>
                        <li>Log in with the <strong>same AegisNet account</strong> you use on this parent dashboard</li>
                        <li>Grant the permissions the app requests (Accessibility, Screen Capture, etc.)</li>
                        <li>The child's device will appear in your parent dashboard automatically</li>
                        <li>Set your PIN to prevent the child from uninstalling the app</li>
                      </Box>
                      <Alert severity="success" sx={{ mt: 1.5, borderRadius: 1.5, fontSize: '0.82rem', bgcolor: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        🎉 Done! Your child's device is now protected by AegisNet.
                      </Alert>
                    </Box>
                  ),
                },
              ].map((step, i) => (
                <Step key={i} active>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#EE791A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>
                        {String(i + 1).padStart(2, '0')}
                      </Box>
                    )}
                  >
                    <Typography sx={{ fontWeight: 700, color: '#111827', fontFamily: '"Inter", sans-serif', fontSize: '1rem' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ pb: 3 }}>{step.content}</Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Container>
        </Box>

        <Divider sx={{ borderColor: 'rgba(238,121,26,0.1)' }} />

        {/* ═══ FAQ ═══ */}
        <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fafafa' }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', fontFamily: '"Inter", sans-serif', mb: 1.5, fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
                Frequently Asked{' '}
                <Box component="span" sx={{ background: 'linear-gradient(90deg, #EE791A, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Questions
                </Box>
              </Typography>
            </Box>

            {faqs.map((faq, i) => (
              <Accordion
                key={i}
                elevation={0}
                sx={{
                  mb: 1.5,
                  borderRadius: '12px !important',
                  border: '1px solid rgba(0,0,0,0.07)',
                  bgcolor: '#fff',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { borderColor: 'rgba(238,121,26,0.25)', bgcolor: '#fffbf7' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#EE791A' }} />}
                  sx={{ px: 3, py: 0.5 }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#111827', fontFamily: '"Inter", sans-serif', fontSize: '0.95rem' }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                  <Typography sx={{ color: '#6B7280', fontFamily: '"Inter", sans-serif', fontSize: '0.92rem', lineHeight: 1.75 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Container>
        </Box>

        <Divider sx={{ borderColor: 'rgba(238,121,26,0.1)' }} />

        {/* ═══ BOTTOM CTA ═══ */}
        <Box
          sx={{
            py: { xs: 8, md: 11 },
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff7ed 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,121,26,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '20px', bgcolor: '#EE791A', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, boxShadow: '0 16px 48px rgba(238,121,26,0.3)' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', fontFamily: '"Inter", sans-serif', mb: 2, fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
              Ready to protect your child?
            </Typography>
            <Typography sx={{ color: '#6B7280', fontFamily: '"Inter", sans-serif', fontSize: '1rem', lineHeight: 1.75, mb: 4 }}>
              Download the child app now and start monitoring in minutes. Your parent dashboard is ready and waiting.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                className="dl-btn"
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ bgcolor: '#EE791A', color: '#fff', px: 5, py: 1.6, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 8px 32px rgba(238,121,26,0.35)', '&:hover': { bgcolor: '#D4651E' } }}
              >
                Download Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ textTransform: 'none', fontWeight: 600, px: 4, py: 1.6, borderRadius: 2, color: '#374151', borderColor: 'rgba(0,0,0,0.18)', '&:hover': { borderColor: '#EE791A', color: '#EE791A', bgcolor: 'rgba(238,121,26,0.04)' } }}
              >
                Go to Dashboard
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', py: 2.5, bgcolor: '#f9fafb' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: '"Inter", sans-serif' }}>
                © {new Date().getFullYear()} AegisNet. All rights reserved.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {['Privacy Policy', 'Terms', 'Contact'].map(link => (
                  <Typography key={link} sx={{ fontSize: '0.78rem', color: '#9CA3AF', cursor: 'pointer', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#374151' } }}>{link}</Typography>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>

      </Box>
    </>
  );
};

export default DownloadPage;
