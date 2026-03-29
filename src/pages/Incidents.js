import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChildrenList, useNsfwIncidents, deleteNsfwIncident } from '../hooks/useFirebase';
import ConfirmationModal from '../components/ConfirmationModal';

const Incidents = () => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { children, loading: loadingChildren } = useChildrenList(user?.email);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [incidentToDelete, setIncidentToDelete] = useState(null);

    // Track which images are unblurred
    const [unblurredImages, setUnblurredImages] = useState({});

    const { incidents, loading: loadingIncidents } = useNsfwIncidents(selectedChildId);

    // Auto-select first child if available
    React.useEffect(() => {
        if (children && children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const toggleBlur = (incidentId) => {
        setUnblurredImages((prev) => ({
            ...prev,
            [incidentId]: !prev[incidentId],
        }));
    };

    const handleDeleteClick = (incidentId) => {
        setIncidentToDelete(incidentId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!incidentToDelete) return;
        setActionLoading(true);
        try {
            await deleteNsfwIncident(selectedChildId, incidentToDelete);
        } catch (error) {
            console.error('Delete error:', error);
        }
        setShowDeleteConfirm(false);
        setIncidentToDelete(null);
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
                        NSFW Incidents Alert
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                        Real-time reports of detected NSFW content on child devices
                    </Typography>
                </Box>

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
                            You need to add a child device before viewing alerts.
                        </Typography>
                    </Alert>
                )}

                {selectedChildId && (
                    <>
                        {loadingIncidents ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: colors.primary }} />
                            </Box>
                        ) : incidents.length === 0 ? (
                            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                                <Typography variant="h6" sx={{ color: colors.text }} gutterBottom>
                                    No Incidents Found
                                </Typography>
                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                    There are no NSFW incidents reported for this child yet. Good news!
                                </Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {incidents.map((incident) => (
                                    <Grid item xs={12} sm={6} md={4} key={incident.id}>
                                        <Card sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                                            <Box sx={{ position: 'relative', height: 250, bgcolor: colors.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {incident.imageUrl ? (
                                                    <>
                                                        <CardMedia
                                                            component="img"
                                                            height="250"
                                                            image={incident.imageUrl}
                                                            alt="Incident Screenshot"
                                                            sx={{
                                                                filter: unblurredImages[incident.id] ? 'none' : 'blur(20px)',
                                                                transition: 'filter 0.3s',
                                                                objectFit: 'cover',
                                                                width: '100%',
                                                                height: '100%'
                                                            }}
                                                        />
                                                        <Button
                                                            variant="contained"
                                                            startIcon={unblurredImages[incident.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                            onClick={() => toggleBlur(incident.id)}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                bgcolor: 'rgba(0, 0, 0, 0.6)',
                                                                color: '#fff',
                                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                                            }}
                                                        >
                                                            {unblurredImages[incident.id] ? 'Hide' : 'Reveal'}
                                                        </Button>
                                                    </>
                                                ) : incident.uploadError ? (
                                                    <Box textAlign="center" p={2}>
                                                        <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                                                        <Typography variant="body2" color="error">
                                                            Image Upload Failed:<br/>
                                                            {incident.uploadError}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Box textAlign="center" p={2}>
                                                        <CircularProgress size={30} sx={{ mb: 1 }} />
                                                        <Typography variant="body2" color="textSecondary">
                                                            Uploading Image...
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            <CardContent>
                                                <Typography variant="h6" sx={{ color: colors.text }}>
                                                    {incident.appName}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                                    {new Date(incident.timestamp).toLocaleString()}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <WarningIcon color="warning" fontSize="small" />
                                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                        Confidence: {Math.round(incident.confidence * 100)}%
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                    Device: {incident.deviceModel}
                                                </Typography>
                                            </CardContent>

                                            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                                <Typography variant="button" sx={{ color: '#f44336', fontWeight: 600 }}>
                                                    {incident.actionTaken || 'Blocked'}
                                                </Typography>
                                                <IconButton
                                                    onClick={() => handleDeleteClick(incident.id)}
                                                    disabled={actionLoading}
                                                    sx={{ color: colors.textSecondary, '&:hover': { color: '#f44336' } }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}

                {/* Confirm Delete Modal */}
                <ConfirmationModal
                    open={showDeleteConfirm}
                    title="Delete Incident Record"
                    message="Are you sure you want to delete this incident? This action cannot be undone."
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { setShowDeleteConfirm(false); setIncidentToDelete(null); }}
                    danger={true}
                    confirmText="Delete"
                />
            </Container>
        </Box>
    );
};

export default Incidents;
