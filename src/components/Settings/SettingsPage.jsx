import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { ApiService } from '../../api/auth';

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    ext: '',
    fax: '',
    address: '',
    city: '',
    state: '',
    postal_zip: '',
    country: '',
    company_name: '',
    profile_photo: null
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const data = await ApiService.getData(`/auth/users/${userId}/`);
      setUser(data);
      
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        telephone: data.telephone || '',
        ext: data.ext || '',
        fax: data.fax || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postal_zip: data.postal_zip || '',
        country: data.country || '',
        company_name: data.company_name || '',
        profile_photo: null
      });
      setLoading(false);
    } catch (error) {
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        profile_photo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userId = localStorage.getItem('userid');
      const formDataToSend = new FormData();

      // Add all form data fields except profile_photo
      Object.entries(formData).forEach(([key, value]) => {
        // Skip null, undefined, empty strings and profile_photo
        if (value === null || value === undefined || value === '' || key === 'profile_photo') {
          return;
        }

        // Handle ext field specially
        if (key === 'ext' && value) {
          const extValue = parseInt(String(value));
          if (!isNaN(extValue)) {
            formDataToSend.append('ext', extValue);
          }
          return;
        }

        formDataToSend.append(key, value);
      });

      // Add the profile photo if it exists as a File object
      if (formData.profile_photo instanceof File) {
        formDataToSend.append('profile_photo', formData.profile_photo);
      }

      // Log FormData entries for debugging
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Use putMediaData for handling multipart/form-data
      await ApiService.putMediaData(`/auth/users/${userId}/`, formDataToSend);
      
      setSuccess('Profile updated successfully');
      setEditMode(false);
      fetchUserData(); // Refresh user data
    } catch (error) {
      console.error('API Error:', error);
      setError(error.response?.data?.message || error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userId = localStorage.getItem('userid');
      await ApiService.patchData(`/auth/users/${userId}/`, {
        password: passwordData.new_password
      });

      setSuccess('Password updated successfully');
      setShowPasswordDialog(false);
      setPasswordData({
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const getFormattedProfilePhotoUrl = (url) => {
    if (!url) return "";
    return url.replace('https://0.0.0.0:8000/', 'https://nnt.nntexpressinc.com/');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h5" fontWeight={600}>
            Profile Settings
          </Typography>
          {!editMode && (
            <Button 
              variant="contained" 
              onClick={() => setEditMode(true)}
              sx={{ textTransform: 'none' }}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {(error || success) && (
          <Alert 
            severity={error ? "error" : "success"} 
            sx={{ mb: 3 }}
            onClose={() => {
              setError('');
              setSuccess('');
            }}
          >
            {error || success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={formData.profile_photo ? URL.createObjectURL(formData.profile_photo) : getFormattedProfilePhotoUrl(user?.profile_photo)}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              {editMode && (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Change Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </Button>
              )}
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
                    Personal Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2, mt: 2 }}>
                    Contact Details
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Ext"
                    name="ext"
                    value={formData.ext}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Fax"
                    name="fax"
                    value={formData.fax}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2, mt: 2 }}>
                    Address Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postal_zip"
                    value={formData.postal_zip}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2, mt: 2 }}>
                    Company Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {editMode && (
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => {
                  setEditMode(false);
                  fetchUserData(); // Reset form data
                }}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ textTransform: 'none' }}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </form>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Security
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowPasswordDialog(true)}
            sx={{ textTransform: 'none' }}
          >
            Change Password
          </Button>
        </Box>

        <Dialog 
          open={showPasswordDialog} 
          onClose={() => !saving && setShowPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <form id="password-form" onSubmit={handlePasswordSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="New Password"
                name="new_password"
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleTogglePassword('new')} edge="end">
                        {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Confirm New Password"
                name="confirm_password"
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleTogglePassword('confirm')} edge="end">
                        {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowPasswordDialog(false)}
              disabled={saving}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="password-form"
              variant="contained"
              disabled={saving}
              sx={{ textTransform: 'none' }}
            >
              {saving ? <CircularProgress size={24} /> : 'Update Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
