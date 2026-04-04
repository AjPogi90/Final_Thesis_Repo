import React, { useState, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Grid,
    CircularProgress,
    Alert,
    Paper,
    Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import { useChildrenList } from '../hooks/useFirebase';
import ChildCard from '../components/ChildCard';
import AddChildDeviceModal from '../components/AddChildDeviceModal';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Children = () => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { children, loading, error } = useChildrenList(user?.email);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    const filteredChildren = useMemo(() => {
        if (!children) return [];
        const query = searchTerm.toLowerCase().trim();
        if (!query) return children;

        return children.filter((child) => {
            const name = (child.name || '').toLowerCase();
            const email = (child.email || '').toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }, [children, searchTerm]);

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: colors.primary }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.background, color: colors.text }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.text }}>
                        Children
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                        Manage and monitor all connected child devices
                    </Typography>
                </Box>

                {/* Search and Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                    }}
                >
                    <TextField
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="medium"
                        variant="filled"
                        sx={{
                            flexGrow: 1,
                            maxWidth: { sm: 400 },
                            '& .MuiFilledInput-root': {
                                bgcolor: colors.inputBg,
                                borderRadius: 1,
                                '&:before, &:after': {
                                    display: 'none',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: colors.textSecondary,
                            },
                            '& input': {
                                color: colors.text,
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: colors.textSecondary }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowAddModal(true)}
                        sx={{
                            bgcolor: colors.primary,
                            color: '#fff',
                            px: 3,
                            '&:hover': {
                                bgcolor: '#c05905ff',
                            }
                        }}
                    >
                        Connect Child Device
                    </Button>
                </Box>

                {/* Error Display */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(255,0,0,0.08)', color: colors.text }}>
                        Error loading children: {error.message}
                    </Alert>
                )}

                {/* Children Grid */}
                {filteredChildren.length === 0 ? (
                    <Paper
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            bgcolor: colors.cardBg,
                            border: `1px solid ${colors.cardBorder}`,
                            borderRadius: 2,
                            color: colors.text,
                        }}
                    >
                        <Typography variant="h6" sx={{ color: colors.text }} gutterBottom>
                            {searchTerm
                                ? 'No children match your search'
                                : 'No child devices connected yet'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
                            {searchTerm
                                ? 'Try a different search term'
                                : 'Install the AegistNet app on your child\'s device to get started'}
                        </Typography>
                        {!searchTerm && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setShowAddModal(true)}
                                sx={{
                                    bgcolor: colors.primary,
                                    color: '#fff',
                                    '&:hover': {
                                        bgcolor: '#c05905ff',
                                    }
                                }}
                            >
                                Connect Child Device
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <>
                        {/* Stats Summary */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                Showing {filteredChildren.length} of {children.length} device
                                {children.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>

                        {/* Child Cards Grid */}
                        <Grid container spacing={3}>
                            {filteredChildren.map((child) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={child.id}>
                                    <ChildCard
                                        child={child}
                                        onViewDetails={() => navigate(`/child/${child.id}`)}
                                        onViewApps={() => navigate(`/child/${child.id}?tab=apps`)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}

                {/* Add Child Device Modal */}
                <AddChildDeviceModal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                />
            </Container>
        </Box>
    );
};

export default Children;
