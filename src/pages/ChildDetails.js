import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useChildData, updateChildName, updateChildGender, deleteChild } from '../hooks/useFirebase';
import { useTheme } from '../contexts/ThemeContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ChildDetails = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [loadingAction, setLoadingAction] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [editingGender, setEditingGender] = useState(false);
  const [tempGender, setTempGender] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: child, loading, error } = useChildData(childId);

  const handleDeleteChild = async () => {
    setLoadingAction(true);
    const result = await deleteChild(childId);
    setLoadingAction(false);
    if (result.success) {
      navigate('/children');
    } else {
      setSuccessMessage(`Failed to remove child: ${result.error?.message || 'Unknown error'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditName = () => {
    setEditingName(true);
    setTempName(child.name || '');
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      setSuccessMessage('Name cannot be empty');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    setLoadingAction(true);
    const result = await updateChildName(childId, tempName.trim());
    setLoadingAction(false);
    if (result.success) {
      setEditingName(false);
      setSuccessMessage('Child name updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setSuccessMessage(`Failed to update name: ${result.error?.message || 'Unknown error'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setTempName('');
  };

  const handleEditGender = () => {
    setEditingGender(true);
    setTempGender(child.gender || 'boy');
  };

  const handleSaveGender = async () => {
    setLoadingAction(true);
    const result = await updateChildGender(childId, tempGender);
    setLoadingAction(false);
    if (result.success) {
      setEditingGender(false);
      setSuccessMessage('Child gender updated');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setSuccessMessage(`Failed to update gender: ${result.error?.message || 'Unknown error'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleCancelEditGender = () => {
    setEditingGender(false);
    setTempGender('');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error || !child) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background, py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ bgcolor: 'rgba(255,0,0,0.08)', color: colors.text, mb: 3 }}>
            Error loading child data
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              color: colors.text,
              borderColor: colors.divider,
              '&:hover': {
                bgcolor: colors.hover,
                borderColor: colors.primary,
              }
            }}
            variant="outlined"
          >
            Back to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.background, py: 4 }}>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              textTransform: 'none',
              color: colors.primary,
              '&:hover': {
                bgcolor: colors.hover,
              }
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 3, bgcolor: 'rgba(76,175,80,0.08)', color: colors.text }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        <Card sx={{ mb: 3, bgcolor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: colors.inputBg, borderRadius: 1, border: `1px solid ${colors.divider}` }}>
                <Typography variant="body2" sx={{ mb: 0.5, color: colors.textSecondary }}>
                  Child Name
                </Typography>
                {editingName ? (
                  <Stack direction="row" gap={1} alignItems="center">
                    <TextField
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      size="small"
                      fullWidth
                      disabled={loadingAction}
                      variant="filled"
                      sx={{
                        '& .MuiFilledInput-root': {
                          bgcolor: colors.background,
                          borderRadius: 1,
                          '&:before, &:after': {
                            display: 'none',
                          },
                        },
                        '& input': {
                          color: colors.text,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveName}
                      disabled={loadingAction}
                      sx={{
                        bgcolor: colors.primary,
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#c05905ff',
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancelEdit}
                      disabled={loadingAction}
                      sx={{
                        borderColor: colors.divider,
                        color: colors.text,
                        '&:hover': {
                          borderColor: colors.primary,
                          bgcolor: colors.hover,
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                      {child.name}
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleEditName}
                      disabled={loadingAction}
                      sx={{
                        color: colors.primary,
                        '&:hover': {
                          bgcolor: colors.hover,
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </Stack>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: colors.inputBg, borderRadius: 1, border: `1px solid ${colors.divider}` }}>
                <Typography variant="body2" sx={{ mb: 0.5, color: colors.textSecondary }}>
                  Child Email
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, wordBreak: 'break-all', color: colors.text }}>
                  {child.email}
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: colors.inputBg, borderRadius: 1, border: `1px solid ${colors.divider}` }}>
                <Typography variant="body2" sx={{ mb: 0.5, color: colors.textSecondary }}>
                  Gender / NSFM Protection Filter Target
                </Typography>
                {editingGender ? (
                  <Stack direction="row" gap={1} alignItems="center">
                    <FormControl size="small" variant="filled" sx={{ flexGrow: 1, '& .MuiFilledInput-root': { bgcolor: colors.background, borderRadius: 1, '&:before, &:after': { display: 'none', }, }, '& .MuiSelect-select': { color: colors.text }, }}>
                      <Select
                        value={tempGender}
                        onChange={(e) => setTempGender(e.target.value)}
                        disabled={loadingAction}
                        displayEmpty
                      >
                        <MenuItem value="boy">Boy (Filters Bikinis)</MenuItem>
                        <MenuItem value="girl">Girl (Filters Men in Underwear)</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveGender}
                      disabled={loadingAction}
                      sx={{
                        bgcolor: colors.primary,
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#c05905ff',
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancelEditGender}
                      disabled={loadingAction}
                      sx={{
                        borderColor: colors.divider,
                        color: colors.text,
                        '&:hover': {
                          borderColor: colors.primary,
                          bgcolor: colors.hover,
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                      {child.gender ? child.gender.charAt(0).toUpperCase() + child.gender.slice(1) : 'Boy (Default)'}
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleEditGender}
                      disabled={loadingAction}
                      sx={{
                        color: colors.primary,
                        '&:hover': {
                          bgcolor: colors.hover,
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </Stack>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: colors.inputBg, borderRadius: 1, border: `1px solid ${colors.divider}` }}>
                <Typography variant="body2" sx={{ mb: 0.5, color: colors.textSecondary }}>
                  Linked Parent Account
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, wordBreak: 'break-all', color: colors.text }}>
                  {child.parentEmail}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end" mt={3} mb={4}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loadingAction}
            sx={{
              borderColor: 'error.main',
              '&:hover': {
                bgcolor: 'error.main',
                color: '#fff',
              }
            }}
          >
            Remove Child Device
          </Button>
        </Box>

        <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
          <DialogTitle sx={{ bgcolor: colors.cardBg, color: colors.text }}>Remove Child Device?</DialogTitle>
          <DialogContent sx={{ bgcolor: colors.cardBg }}>
            <DialogContentText sx={{ color: colors.textSecondary }}>
              Are you sure you want to remove this child device? This action cannot be undone and will permanently delete the device's history and settings from your dashboard.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ bgcolor: colors.cardBg }}>
            <Button onClick={() => setShowDeleteConfirm(false)} sx={{ color: colors.textSecondary }}>Cancel</Button>
            <Button onClick={handleDeleteChild} color="error" variant="contained" disabled={loadingAction}>Remove</Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
};

export default ChildDetails;
