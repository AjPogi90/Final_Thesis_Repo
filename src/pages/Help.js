import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PeopleIcon from '@mui/icons-material/People';
import AppsIcon from '@mui/icons-material/Apps';

import FilterListIcon from '@mui/icons-material/FilterList';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '../contexts/ThemeContext';

const Help = () => {
    const { colors } = useTheme();
    const [expanded, setExpanded] = useState('getting-started');

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const features = [
        {
            icon: <PeopleIcon sx={{ fontSize: 40, color: colors.primary }} />,
            title: 'Child Management',
            description: 'Add and manage your children\'s devices with ease. Track their digital activities and set individual preferences for each child.',
        },
        {
            icon: <AppsIcon sx={{ fontSize: 40, color: colors.primary }} />,
            title: 'App Control',
            description: 'Block or allow specific apps on your children\'s devices. Manage app permissions and monitor app usage patterns.',
        },

        {
            icon: <FilterListIcon sx={{ fontSize: 40, color: colors.primary }} />,
            title: 'Content Filters',
            description: 'Set up web filters to protect your children from inappropriate content. Customize filter levels for each child.',
        },
    ];

    const faqs = [
        {
            question: 'How do I add a new child device?',
            answer: 'Navigate to the Children page and click the "Add Child Device" button in the top right corner. follow instructions to link child\'s device.',
        },
        {
            question: 'Can I block specific apps on my child\'s phone?',
            answer: 'Yes! Go to the Apps page, select your child from the dropdown menu, and you\'ll see all installed apps on their device. Click the toggle switch next to any app to block or unblock it. Changes are applied immediately to the device.',
        },

        {
            question: 'What are content filters and how do I set them?',
            answer: 'Content filters block access to inappropriate websites and content. Go to the Filters page, select a child, and toggle on the filters you want to enable (Adult Content, Gambling, Violence, Social Media, etc.). You can also apply the same filter settings to all your children at once.',
        },
        {
            question: 'Can I set time limits for app usage?',
            answer: 'Currently, you can block apps entirely, but time-based restrictions are coming in a future update. For now, you can manually block apps during homework or bedtime hours.',
        },
        {
            question: 'How do I change between light and dark mode?',
            answer: 'Go to Settings and use the theme toggle switch. Your preference is saved automatically and applies across all your devices.',
        },
        {
            question: 'Is my child\'s data private and secure?',
            answer: 'Absolutely. All data is encrypted both in transit and at rest. We follow industry-standard security practices and never share your family\'s data with third parties.',
        },
        {
            question: 'What should I do if the app is not syncing?',
            answer: 'First, ensure both devices have an active internet connection. Try refreshing the page or restarting the child\'s device. If the issue persists, you can unpair and re-pair the device from the Children page.',
        },
    ];

    const quickStart = [
        'Create your parent account and log in',
        'Install AegistNet app on your child device',
        'Register Child Account and Enter parent email',
        'Login Child Account ',
        'Set up app controls and content filters',

        'Explore the dashboard to see activity overview',
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.background, color: colors.text }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, mb: 1 }}>
                        Help & Support
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                        Everything you need to know about using AegistNet Parental Controls
                    </Typography>
                </Box>

                {/* Quick Start Guide */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SecurityIcon sx={{ fontSize: 32, color: colors.primary, mr: 1.5 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
                            Getting Started
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                        Follow these steps to set up parental controls for your family:
                    </Typography>
                    <List>
                        {quickStart.map((step, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckCircleIcon sx={{ color: colors.primary, fontSize: 20 }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${index + 1}. ${step}`}
                                    primaryTypographyProps={{
                                        sx: { color: colors.text, fontSize: '0.95rem' }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Features Overview */}
                <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text, mb: 3 }}>
                    Key Features
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    bgcolor: colors.cardBg,
                                    border: `1px solid ${colors.cardBorder}`,
                                    borderRadius: 2,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 8px 16px ${colors.primary}20`,
                                    },
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                    {feature.icon}
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, mt: 2, mb: 1 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* FAQ Section */}
                <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text, mb: 3 }}>
                    Frequently Asked Questions
                </Typography>
                <Box sx={{ mb: 4 }}>
                    {faqs.map((faq, index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === `faq-${index}`}
                            onChange={handleAccordionChange(`faq-${index}`)}
                            sx={{
                                bgcolor: colors.cardBg,
                                border: `1px solid ${colors.cardBorder}`,
                                borderRadius: 2,
                                mb: 1,
                                '&:before': { display: 'none' },
                                boxShadow: 'none',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: colors.text }} />}
                                sx={{
                                    '&:hover': {
                                        bgcolor: colors.hover,
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <HelpOutlineIcon sx={{ color: colors.primary, mr: 1.5, fontSize: 20 }} />
                                    <Typography sx={{ fontWeight: 600, color: colors.text }}>
                                        {faq.question}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ borderTop: `1px solid ${colors.divider}` }}>
                                <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* Contact Support */}
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <EmailIcon sx={{ fontSize: 36, color: colors.primary }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, lineHeight: 1.2 }}>
                                Contact Support
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                We'll respond within 24 hours at{' '}
                                <Box component="a" href="mailto:aegistnet@gmail.com" sx={{ color: colors.primary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                    aegistnet@gmail.com
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Privacy Notice */}
                <Alert
                    severity="info"
                    icon={<SecurityIcon />}
                    sx={{
                        mt: 3,
                        bgcolor: `${colors.primary}15`,
                        border: `1px solid ${colors.primary}40`,
                        '& .MuiAlert-icon': {
                            color: colors.primary,
                        },
                        '& .MuiAlert-message': {
                            color: colors.text,
                        },
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Privacy & Security
                    </Typography>
                    <Typography variant="body2">
                        All data is encrypted and stored securely. We never share your information with third parties.
                        For more details, please review our Privacy Policy.
                    </Typography>
                </Alert>
            </Container>
        </Box>
    );
};

export default Help;
