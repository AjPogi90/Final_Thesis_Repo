import React, { useState, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Grid,
    Chip,
    Switch,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChildrenList, useChildData, updateBlockedApp } from '../hooks/useFirebase';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatDistanceToNow } from 'date-fns';

const Apps = () => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { children, loading: loadingChildren } = useChildrenList(user?.email);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmUnblockAll, setShowConfirmUnblockAll] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);

    const { data: childData, loading: loadingChild } = useChildData(selectedChildId);

    // Auto-select first child if available
    React.useEffect(() => {
        if (children && children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const appsArray = useMemo(() => {
        if (!childData?.apps) return [];
        return Array.isArray(childData.apps)
            ? childData.apps
            : Object.entries(childData.apps).map(([key, value]) => ({
                ...value,
                appId: key,
            }));
    }, [childData]);

    const filteredApps = useMemo(() => {
        let apps = appsArray;

        // Filter by blocked status if enabled
        if (showOnlyBlocked) {
            apps = apps.filter((app) => app.blocked);
        }

        // Filter by search term
        const query = searchTerm.toLowerCase().trim();
        if (!query) return apps;
        return apps.filter((app) =>
            app.appName?.toLowerCase().includes(query) ||
            app.packageName?.toLowerCase().includes(query)
        );
    }, [appsArray, searchTerm, showOnlyBlocked]);

    const blockedApps = filteredApps.filter((app) => app.blocked);

    const handleAppToggle = async (appIndex, newBlockedState) => {
        setActionLoading(true);
        try {
            const result = await updateBlockedApp(selectedChildId, appIndex, newBlockedState);
            if (result.success) {
                setSuccessMessage(newBlockedState ? 'App blocked successfully' : 'App unblocked successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Toggle error:', error);
        }
        setActionLoading(false);
    };

    const handleUnblockAll = async () => {
        setActionLoading(true);
        const blockedAppsToUnblock = appsArray.filter((app) => app.blocked);

        for (const app of blockedAppsToUnblock) {
            const originalIndex = appsArray.findIndex(
                (a) => a.appName === app.appName && a.packageName === app.packageName
            );
            if (originalIndex !== -1) {
                await updateBlockedApp(selectedChildId, app.appId || originalIndex, false);
            }
        }

        setSuccessMessage(`Unblocked ${blockedAppsToUnblock.length} app(s)`);
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowConfirmUnblockAll(false);
        setActionLoading(false);
    };

    if (loadingChildren) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: colors.primary }} />
            </Box>
        );
    }

    const selectedChild = children?.find((c) => c.id === selectedChildId);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.background, color: colors.text }}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.text }}>
                        App Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                        Control which apps your children can access
                    </Typography>
                </Box>

                {/* Success Message */}
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.08)', color: colors.text }} onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}

                {/* Child Selector */}
                {children && children.length > 0 ? (
                    <FormControl fullWidth sx={{ mb: 3, maxWidth: 400 }}>
                        <InputLabel sx={{ color: colors.textSecondary }}>Select Child</InputLabel>
                        <Select
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            label="Select Child"
                            sx={{
                                bgcolor: colors.inputBg,
                                color: colors.text,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.divider,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.primary,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colors.primary,
                                },
                                '& .MuiSvgIcon-root': {
                                    color: colors.text,
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: colors.cardBg,
                                        color: colors.text,
                                    },
                                },
                            }}
                        >
                            {children.map((child) => (
                                <MenuItem key={child.id} value={child.id} sx={{ bgcolor: colors.cardBg, color: colors.text, '&:hover': { bgcolor: colors.hover } }}>
                                    {child.name} ({child.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(33,150,243,0.08)', color: colors.text }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: colors.text }}>
                            No Children Connected
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            You need to add a child device before managing apps.
                        </Typography>
                    </Alert>
                )}

                {selectedChildId && (
                    <>
                        {/* Actions Bar */}
                        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'stretch', sm: 'center' },
                                }}
                            >
                                <TextField
                                    placeholder="Search apps..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="medium"
                                    variant="filled"
                                    sx={{
                                        flexGrow: 1,
                                        '& .MuiFilledInput-root': {
                                            bgcolor: colors.inputBg,
                                            borderRadius: 1,
                                            '&:before, &:after': {
                                                display: 'none',
                                            },
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
                                    variant={showOnlyBlocked ? "contained" : "outlined"}
                                    startIcon={<BlockIcon />}
                                    onClick={() => setShowOnlyBlocked(!showOnlyBlocked)}
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        borderColor: showOnlyBlocked ? colors.primary : colors.divider,
                                        bgcolor: showOnlyBlocked ? colors.primary : 'transparent',
                                        color: showOnlyBlocked ? '#fff' : colors.text,
                                        '&:hover': {
                                            borderColor: colors.primary,
                                            bgcolor: showOnlyBlocked ? '#c05905ff' : colors.hover,
                                        }
                                    }}
                                >
                                    {showOnlyBlocked ? 'Show all apps' : 'View blocked apps'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<BlockIcon />}
                                    onClick={() => setShowConfirmUnblockAll(true)}
                                    disabled={blockedApps.length === 0 || actionLoading}
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    Unblock All
                                </Button>
                            </Box>
                        </Paper>

                        {/* Apps List */}
                        {loadingChild ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: colors.primary }} />
                            </Box>
                        ) : filteredApps.length === 0 ? (
                            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                                <Typography variant="h6" sx={{ color: colors.text }} gutterBottom>
                                    {searchTerm ? 'No apps match your search' : 'No apps found'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                    {searchTerm
                                        ? 'Try a different search term'
                                        : 'Apps will appear here once the child device reports them'}
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper
                                sx={{
                                    borderRadius: 2,
                                    maxHeight: 'calc(100vh - 400px)',
                                    overflow: 'auto',
                                    bgcolor: colors.cardBg,
                                    border: `1px solid ${colors.cardBorder}`,
                                }}
                            >
                                {/* Sticky Header */}
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: colors.cardBg,
                                        borderBottom: `1px solid ${colors.divider}`,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ color: colors.textSecondary }}>
                                        {filteredApps.length} app(s) • {blockedApps.length} blocked
                                    </Typography>
                                </Box>

                                {/* Apps Grid */}
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        {filteredApps.map((app, index) => {
                                            const originalIndex = appsArray.findIndex(
                                                (a) => a.appName === app.appName && a.packageName === app.packageName
                                            );

                                            return (
                                                <Grid item xs={12} sm={6} md={4} key={app.appId || originalIndex}>
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            border: 1,
                                                            borderColor: app.blocked ? '#f44336' : colors.cardBorder,
                                                            bgcolor: colors.inputBg,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 12px rgba(238,121,26,0.2)',
                                                                transform: 'translateY(-2px)',
                                                            },
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                <Typography
                                                                    variant="subtitle1"
                                                                    sx={{ fontWeight: 600, color: colors.text }}
                                                                    noWrap
                                                                >
                                                                    {app.appName}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{ color: colors.textSecondary, display: 'block', mb: 1 }}
                                                                    noWrap
                                                                >
                                                                    {app.packageName}
                                                                </Typography>
                                                                <Chip
                                                                    label={app.blocked ? 'Blocked' : 'Allowed'}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        bgcolor: app.blocked ? 'rgba(244,67,54,0.2)' : 'rgba(76,175,80,0.2)',
                                                                        color: app.blocked ? '#f44336' : '#4caf50',
                                                                        border: `1px solid ${app.blocked ? '#f44336' : '#4caf50'}`,
                                                                    }}
                                                                />
                                                                {app.blockedAt && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ color: colors.textSecondary, display: 'block', mt: 0.5 }}
                                                                    >
                                                                        {formatDistanceToNow(new Date(app.blockedAt), {
                                                                            addSuffix: true,
                                                                        })}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <Switch
                                                                checked={app.blocked || false}
                                                                onChange={(e) =>
                                                                    handleAppToggle(
                                                                        app.appId || originalIndex,
                                                                        e.target.checked
                                                                    )
                                                                }
                                                                disabled={actionLoading}
                                                                sx={{
                                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                                        color: '#f44336',
                                                                    },
                                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                        bgcolor: '#f44336',
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </Box>
                            </Paper>
                        )}
                    </>
                )}

                {/* Unblock All Confirmation Modal */}
                <ConfirmationModal
                    open={showConfirmUnblockAll}
                    title="Unblock All Apps?"
                    message={`This will unblock ${blockedApps.length} app(s) for ${selectedChild?.name}. Are you sure you want to continue?`}
                    onConfirm={handleUnblockAll}
                    onCancel={() => setShowConfirmUnblockAll(false)}
                    danger={true}
                    confirmText="Unblock All"
                />
            </Container>
        </Box>
    );
};

export default Apps;
