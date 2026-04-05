import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Tooltip,
    IconButton,
    Chip,
    Divider,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShieldIcon from '@mui/icons-material/Shield';
import TuneIcon from '@mui/icons-material/Tune';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChildrenList, useChildData, updateContentFilters, updateFilterLevel } from '../hooks/useFirebase';

// ─── Filter level definitions ───────────────────────────────────────────────
const FILTER_LEVELS = [
    {
        value: 1,
        label: 'Strict',
        ageRange: 'Ages 7–11',
        description: 'Blocks suggestive, semi-nude & explicit content',
        detail: 'All three model classes are blocked for all genders. Any skin-revealing or sexualised image is intercepted.',
        color: '#ef4444',
        chipBg: 'rgba(239,68,68,0.12)',
    },
    {
        value: 2,
        label: 'Moderate',
        ageRange: 'Ages 12–14',
        description: 'Blocks bikinis/briefs & explicit content',
        detail: 'Boys: swimwear + nudity blocked. Girls: men\'s underwear + nudity blocked. Swimsuits on girls are allowed.',
        color: '#f59e0b',
        chipBg: 'rgba(245,158,11,0.12)',
    },
    {
        value: 3,
        label: 'Tolerant',
        ageRange: 'Ages 15–17',
        description: 'Blocks explicit nudity only',
        detail: 'Only fully explicit nudity (class 1) is blocked for all genders. Swimwear and underwear are allowed.',
        color: '#22c55e',
        chipBg: 'rgba(34,197,94,0.12)',
    },
];

/** Derive a suggested filter level from the child's age string */
function suggestLevelFromAge(ageStr) {
    const age = parseInt(ageStr, 10);
    if (isNaN(age)) return 2;
    if (age <= 11) return 1;
    if (age <= 14) return 2;
    return 3;
}

// ─── Static filter card definitions (web filter keeps its own card) ──────────
const webFilterDef = {
    key: 'webFilter',
    label: 'Web Filtering',
    Icon: LanguageIcon,
    colorKey: 'primary',
    description: 'Monitors and blocks access to malicious or inappropriate websites.',
    details: 'Uses the accessibility service to track URLs in browsers and block matches against the blacklist.',
};

// ─── Component ───────────────────────────────────────────────────────────────
const Filters = () => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const { children, loading: loadingChildren } = useChildrenList(user?.email);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [applyToAll, setApplyToAll] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [levelSaving, setLevelSaving] = useState(false);

    const { data: childData, loading: loadingChild } = useChildData(selectedChildId);

    // Auto-select first child
    useEffect(() => {
        if (children && children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const filters = childData?.contentFilters || { nudity: false };
    const nudityActive = filters.nudity || false;

    // Resolve filter level: stored value → age suggestion → default 2
    const storedLevel = filters.filterLevel;
    const ageSuggestedLevel = suggestLevelFromAge(childData?.age);
    const activeLevel = storedLevel != null ? Number(storedLevel) : ageSuggestedLevel;
    const currentLevelDef = FILTER_LEVELS.find(l => l.value === activeLevel) || FILTER_LEVELS[1];

    const selectedChild = children?.find((c) => c.id === selectedChildId);
    const activeFiltersCount = [filters.nudity, filters.webFilter].filter(Boolean).length;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleFilterToggle = async (filterKey, newValue) => {
        if (!selectedChildId) return;
        setSaveLoading(true);
        const updatedFilters = { ...filters, [filterKey]: newValue };

        if (applyToAll && children) {
            let successCount = 0;
            for (const child of children) {
                const result = await updateContentFilters(child.id, updatedFilters);
                if (result.success) successCount++;
            }
            setSuccessMessage(`Filter updated for ${successCount} child(ren)`);
        } else {
            const result = await updateContentFilters(selectedChildId, updatedFilters);
            if (result.success) setSuccessMessage('Filter settings updated successfully');
        }

        setTimeout(() => setSuccessMessage(''), 3000);
        setSaveLoading(false);
    };

    const handleLevelChange = async (newLevel) => {
        if (!selectedChildId) return;
        setLevelSaving(true);
        const result = await updateFilterLevel(selectedChildId, newLevel);
        if (result.success) {
            setSuccessMessage(`Filter level set to "${FILTER_LEVELS.find(l => l.value === newLevel)?.label}"`);
        }
        setTimeout(() => setSuccessMessage(''), 3000);
        setLevelSaving(false);
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loadingChildren) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: colors.primary }} />
            </Box>
        );
    }

    // ── Shared Select sx ──────────────────────────────────────────────────────
    const selectSx = {
        bgcolor: colors.inputBg,
        color: colors.text,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.divider },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
        '& .MuiSvgIcon-root': { color: colors.text },
    };
    const menuPropsSx = { PaperProps: { sx: { bgcolor: colors.cardBg, color: colors.text } } };
    const menuItemSx = { bgcolor: colors.cardBg, color: colors.text, '&:hover': { bgcolor: colors.hover } };
    const switchSx = {
        '& .MuiSwitch-switchBase.Mui-checked': { color: colors.success },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.success },
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: colors.background, color: colors.text }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: colors.text }}>
                        Content Filters
                    </Typography>
                    <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 2 }}>
                        Protect your children from harmful content online. Enable filters to block
                        inappropriate material.
                    </Typography>
                    <Alert severity="info" sx={{ borderRadius: 2, bgcolor: 'rgba(33,150,243,0.08)', color: colors.text }}>
                        <Typography variant="body2">
                            <strong>How it works:</strong> Content filters work on the child's device to
                            monitor and block harmful content in real-time. Changes take effect
                            immediately on connected devices.
                        </Typography>
                    </Alert>
                </Box>

                {/* Success Message */}
                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.08)', color: colors.text }} onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}

                {/* Child Selector */}
                {children && children.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth sx={{ mb: 2, maxWidth: 400 }}>
                            <InputLabel sx={{ color: colors.textSecondary }}>Select Child</InputLabel>
                            <Select
                                value={selectedChildId}
                                onChange={(e) => setSelectedChildId(e.target.value)}
                                label="Select Child"
                                sx={selectSx}
                                MenuProps={menuPropsSx}
                            >
                                {children.map((child) => (
                                    <MenuItem key={child.id} value={child.id} sx={menuItemSx}>
                                        {child.name} ({child.deviceModel || child.device || 'Unknown Device'})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={applyToAll}
                                    onChange={(e) => setApplyToAll(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary },
                                    }}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2" sx={{ color: colors.text }}>
                                        Apply changes to all children ({children.length})
                                    </Typography>
                                    <Tooltip title="When enabled, any filter you toggle will be applied to all your children, not just the selected one.">
                                        <InfoOutlinedIcon fontSize="small" sx={{ color: colors.textSecondary }} />
                                    </Tooltip>
                                </Box>
                            }
                            sx={{ alignItems: 'center', m: 0 }}
                        />
                    </Box>
                ) : (
                    <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(33,150,243,0.08)', color: colors.text }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: colors.text }}>
                            No Children Connected
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Connect a child's device to enable content filtering and protection.
                        </Typography>
                    </Alert>
                )}

                {/* Filter Cards */}
                {selectedChildId && selectedChild && (
                    <>
                        {loadingChild ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: colors.primary }} />
                            </Box>
                        ) : (
                            <>
                                {/* Protection Status Banner */}
                                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: colors.primary, color: 'white' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                Protection Status
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                {selectedChild.name}
                                                {selectedChild.age ? ` · Age ${selectedChild.age}` : ''}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                                {activeFiltersCount}/2
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Filters Active
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                                    {/* ── Nudity Filter Card (with level dropdown) ── */}
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            border: 2,
                                            borderColor: nudityActive ? colors.success : colors.cardBorder,
                                            bgcolor: colors.cardBg,
                                            transition: 'all 0.3s',
                                            '&:hover': { boxShadow: '0 4px 12px rgba(238,121,26,0.2)' },
                                        }}
                                    >
                                        {/* Top row: icon + label + toggle */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <VisibilityOffIcon sx={{ fontSize: 32, color: colors.error }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                                                        Nudity Filter
                                                    </Typography>
                                                    {nudityActive && (
                                                        <Chip
                                                            label="Active"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                bgcolor: `${colors.success}22`,
                                                                color: colors.success,
                                                                border: `1px solid ${colors.success}`,
                                                            }}
                                                        />
                                                    )}
                                                    <Tooltip title="Uses on-device AI to detect and block inappropriate images in real-time." arrow>
                                                        <IconButton size="small" sx={{ color: colors.textSecondary }}>
                                                            <InfoOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                                    Blocks inappropriate images, adult content, and explicit material
                                                </Typography>
                                            </Box>

                                            <Switch
                                                checked={nudityActive}
                                                onChange={(e) => handleFilterToggle('nudity', e.target.checked)}
                                                disabled={saveLoading}
                                                sx={switchSx}
                                            />
                                        </Box>

                                        {/* Level selector — only when filter is ON */}
                                        {nudityActive && (
                                            <>
                                                <Divider sx={{ my: 2, borderColor: colors.divider }} />

                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                                                    {/* Tune icon label */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pt: 1, minWidth: 130 }}>
                                                        <TuneIcon sx={{ fontSize: 18, color: colors.primary }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                                                            Strictness Level
                                                        </Typography>
                                                    </Box>

                                                    {/* Dropdown */}
                                                    <FormControl size="small" sx={{ minWidth: 200 }}>
                                                        <Select
                                                            value={activeLevel}
                                                            onChange={(e) => handleLevelChange(Number(e.target.value))}
                                                            disabled={levelSaving}
                                                            sx={selectSx}
                                                            MenuProps={menuPropsSx}
                                                            displayEmpty
                                                        >
                                                            {FILTER_LEVELS.map((lvl) => (
                                                                <MenuItem key={lvl.value} value={lvl.value} sx={menuItemSx}>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Box
                                                                                sx={{
                                                                                    width: 8,
                                                                                    height: 8,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: lvl.color,
                                                                                    flexShrink: 0,
                                                                                }}
                                                                            />
                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                Level {lvl.value} — {lvl.label}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="caption" sx={{ color: colors.textSecondary, pl: 2.2 }}>
                                                                            {lvl.ageRange}
                                                                        </Typography>
                                                                    </Box>
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>

                                                    {/* Current level info chip */}
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.5 }}>
                                                        <Chip
                                                            icon={<ShieldIcon sx={{ fontSize: '14px !important', color: `${currentLevelDef.color} !important` }} />}
                                                            label={currentLevelDef.description}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: currentLevelDef.chipBg,
                                                                color: currentLevelDef.color,
                                                                border: `1px solid ${currentLevelDef.color}40`,
                                                                fontWeight: 500,
                                                                fontSize: '0.72rem',
                                                            }}
                                                        />
                                                        {storedLevel == null && (
                                                            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.68rem', pl: 0.5 }}>
                                                                ✦ Auto-suggested from age
                                                            </Typography>
                                                        )}
                                                        {levelSaving && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CircularProgress size={10} sx={{ color: colors.primary }} />
                                                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                                                    Saving…
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Level detail explanation */}
                                                <Box
                                                    sx={{
                                                        mt: 1.5,
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        bgcolor: `${currentLevelDef.color}0D`,
                                                        border: `1px solid ${currentLevelDef.color}30`,
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ color: colors.textSecondary, lineHeight: 1.6 }}>
                                                        <strong style={{ color: currentLevelDef.color }}>Level {currentLevelDef.value} – {currentLevelDef.label}:</strong>{' '}
                                                        {currentLevelDef.detail}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}
                                    </Paper>

                                    {/* ── Web Filter Card (unchanged) ── */}
                                    <Paper
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            border: 2,
                                            borderColor: (filters.webFilter || false) ? colors.success : colors.cardBorder,
                                            bgcolor: colors.cardBg,
                                            transition: 'all 0.3s',
                                            '&:hover': { boxShadow: '0 4px 12px rgba(238,121,26,0.2)' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <LanguageIcon sx={{ fontSize: 32, color: colors.primary }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                                                        {webFilterDef.label}
                                                    </Typography>
                                                    {(filters.webFilter || false) && (
                                                        <Chip
                                                            label="Active"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                bgcolor: `${colors.success}22`,
                                                                color: colors.success,
                                                                border: `1px solid ${colors.success}`,
                                                            }}
                                                        />
                                                    )}
                                                    <Tooltip title={webFilterDef.details} arrow>
                                                        <IconButton size="small" sx={{ color: colors.textSecondary }}>
                                                            <InfoOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: colors.textSecondary }} paragraph>
                                                    {webFilterDef.description}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                                    {webFilterDef.details}
                                                </Typography>
                                            </Box>
                                            <Switch
                                                checked={filters.webFilter || false}
                                                onChange={(e) => handleFilterToggle('webFilter', e.target.checked)}
                                                disabled={saveLoading}
                                                sx={switchSx}
                                            />
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* Info Footer */}
                                <Paper sx={{ p: 3, mt: 3, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: 2 }}>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }} paragraph>
                                        <strong style={{ color: colors.text }}>Note:</strong> Content filters provide an additional layer of
                                        protection but may not catch all inappropriate content. We recommend
                                        combining filters with open communication and active monitoring.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                        <strong style={{ color: colors.text }}>Privacy:</strong> Filter settings are stored securely and only
                                        accessible by you and the child's device. No content is monitored or
                                        logged by our servers.
                                    </Typography>
                                </Paper>
                            </>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default Filters;
