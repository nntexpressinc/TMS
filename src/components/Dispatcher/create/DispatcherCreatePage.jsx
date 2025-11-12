import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Avatar,
  InputAdornment
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-hot-toast';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { US_STATES, EMPLOYMENT_STATUSES, DISPATCHER_POSITIONS, MC_NUMBERS } from '../../../constants/formConstants';
import { useAutoAssignRole } from '../../../hooks/useAutoAssignRole';
import { validateUserForm, buildErrorMessage, prepareUserFormData } from '../../../utils/formValidation';

const DispatcherCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    company_name: "",
    first_name: "",
    last_name: "",
    profile_photo: null,
    telephone: "",
    city: "",
    address: "",
    country: "USA",
    state: "",
    postal_zip: "",
    ext: "",
    fax: "",
    role: "",
    password: "",
    password2: ""
  });
  const [dispatcherData, setDispatcherData] = useState({
    user: null,
    nickname: "",
    employee_status: "ACTIVE (DF)",
    mc_number: "",
    position: "EMPLOYEE",
    company_name: "",
    office: "",
    dispatcher_tags: ""
  });
  const [error, setError] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Use custom hook for auto role assignment
  const { roles } = useAutoAssignRole('dispatcher', setUserData);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'password' && { password2: value })
    }));
  };
  const handleDispatcherChange = (e) => {
    const { name, value } = e.target;
    setDispatcherData(prev => ({ ...prev, [name]: value }));
  };
  const handleStateChange = (event, newValue) => {
    setUserData(prev => ({ ...prev, state: newValue ? newValue.code : '' }));
  };
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhotoFile(e.target.files[0]);
      setUserData(prev => ({ ...prev, profile_photo: e.target.files[0] }));
    }
  };
  const handleTogglePassword = () => setShowPassword((show) => !show);
  
  const validateForm = () => {
    const validation = validateUserForm(userData, true);
    if (!validation.isValid) {
      const errorMsg = buildErrorMessage(validation.errors);
      setError(errorMsg);
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Create user first using utility function
      const userFormData = prepareUserFormData(userData, profilePhotoFile);
      
      const userResponse = await ApiService.postRegister(
        "/auth/register/", 
        userFormData
      );
      
      if (!userResponse || !userResponse.user_id) {
        throw new Error('Failed to create user: No user ID received');
      }
      
      toast.success('User account created successfully');
      
      // 2. Create dispatcher with the user ID
      const formattedDispatcherData = {
        user: userResponse.user_id,
        nickname: dispatcherData.nickname || null,
        employee_status: EMPLOYMENT_STATUSES.some(e => e.value === dispatcherData.employee_status) 
          ? dispatcherData.employee_status 
          : null,
        mc_number: MC_NUMBERS.some(e => e.value === dispatcherData.mc_number) 
          ? dispatcherData.mc_number 
          : null,
        position: DISPATCHER_POSITIONS.some(e => e.value === dispatcherData.position) 
          ? dispatcherData.position 
          : null,
        company_name: dispatcherData.company_name || null,
        office: dispatcherData.office || null
      };
      
      const dispatcherResponse = await ApiService.postData(
        "/dispatcher/",
        formattedDispatcherData
      );
      
      if (!dispatcherResponse) {
        throw new Error('Failed to create dispatcher profile');
      }
      
      toast.success('Dispatcher profile created successfully');
      navigate("/dispatcher");
    } catch (error) {
      console.error("Error creating dispatcher:", error);
      let errorMessage = "Failed to create account.";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          if (error.response.data.email) {
            errorMessage = "A user with this email already exists. Please use another email.";
          } else {
            errorMessage = Object.entries(error.response.data)
              .map(([key, value]) => Array.isArray(value) ? `${key}: ${value.join(', ')}` : `${key}: ${value}`)
              .join('\n');
          }
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // SECTIONLAR DriverCreatePage dagidek
  const sections = [
    {
      title: 'Personal Information',
      subtitle: 'User Account Details',
      fields: [
        [
          { name: 'first_name', label: 'First Name', required: true, value: userData.first_name, onChange: handleUserChange },
          { name: 'last_name', label: 'Last Name', required: true, value: userData.last_name, onChange: handleUserChange },
          { name: 'email', label: 'Email', required: true, type: 'email', value: userData.email, onChange: handleUserChange }
        ],
        [
          { name: 'password', label: 'Password', required: true, type: 'password', value: userData.password, onChange: handleUserChange },
          { name: 'telephone', label: 'Phone Number', required: true, value: userData.telephone, onChange: handleUserChange },
          { name: 'company_name', label: 'Company Name', value: userData.company_name, onChange: handleUserChange }
        ],
        [
          { 
            name: 'role', 
            label: 'Role', 
            type: 'text',
            required: true,
            value: roles.find(role => role.id === userData.role)?.name || 'Dispatcher',
            disabled: true
          },
          { 
            name: 'profile_photo', 
            label: 'Profile Photo', 
            type: 'file',
            accept: 'image/*',
            onChange: handlePhotoChange,
            helperText: 'Upload a profile photo'
          }
        ]
      ]
    },
    {
      title: 'Dispatcher Information',
      subtitle: 'Professional Details',
      fields: [
        [
          { name: 'nickname', label: 'Nickname', value: dispatcherData.nickname, onChange: handleDispatcherChange },
          { 
            name: 'employee_status', 
            label: 'Employee Status', 
            type: 'select',
            options: EMPLOYMENT_STATUSES,
            value: dispatcherData.employee_status,
            onChange: handleDispatcherChange
          },
          { 
            name: 'mc_number', 
            label: 'MC Number', 
            type: 'select',
            options: MC_NUMBERS,
            value: dispatcherData.mc_number,
            onChange: handleDispatcherChange
          }
        ],
        [
          { 
            name: 'position', 
            label: 'Position', 
            type: 'select',
            options: DISPATCHER_POSITIONS,
            value: dispatcherData.position,
            onChange: handleDispatcherChange
          },
          { name: 'company_name', label: 'Company Name', value: dispatcherData.company_name, onChange: handleDispatcherChange },
          { name: 'office', label: 'Office', value: dispatcherData.office, onChange: handleDispatcherChange }
        ]
      ]
    },
    {
      title: 'Address Information',
      subtitle: 'Contact Details',
      fields: [
        [
          { name: 'address', label: 'Address', value: userData.address, onChange: handleUserChange },
          { name: 'city', label: 'City', value: userData.city, onChange: handleUserChange },
          { 
            name: 'state', 
            label: 'State', 
            type: 'select',
            options: US_STATES,
            value: userData.state,
            onChange: (e) => setUserData(prev => ({ ...prev, state: e.target.value }))
          }
        ],
        [
          { name: 'postal_zip', label: 'ZIP Code', type: 'number', value: userData.postal_zip, onChange: handleUserChange },
          { name: 'country', label: 'Country', disabled: true, value: userData.country, onChange: handleUserChange },
          { name: 'fax', label: 'Fax', value: userData.fax, onChange: handleUserChange }
        ]
      ]
    }
  ];

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 3,
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        gap: 2
      }}>
        <Tooltip title="Back to Dispatchers">
          <IconButton 
            onClick={() => navigate('/dispatcher')}
            sx={{ 
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Create New Dispatcher
        </Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {sections.map((section, sectionIndex) => (
            <Grid item xs={12} key={sectionIndex}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {section.title}
                    {sectionIndex === 0 && (
                      <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                        * Required field
                      </Typography>
                    )}
                  </Typography>
                  {section.subtitle && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {section.subtitle}
                    </Typography>
                  )}
                  <Divider sx={{ my: 2 }} />
                  {section.fields.map((row, rowIndex) => (
                    <Grid container spacing={2} key={rowIndex} sx={{ mb: 2 }}>
                      {row.map((field, fieldIndex) => (
                        <Grid item xs={12} md={12 / row.length} key={fieldIndex}>
                          {field.name === 'profile_photo' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ position: 'relative', mb: 1 }}>
                                <Avatar
                                  src={profilePhotoFile ? URL.createObjectURL(profilePhotoFile) : undefined}
                                  alt={userData.first_name || userData.email}
                                  sx={{ width: 100, height: 100, border: '2px solid #e0e0e0', boxShadow: 2 }}
                                />
                                <label htmlFor="profile-photo-upload">
                                  <input
                                    id="profile-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoChange}
                                  />
                                  <IconButton
                                    component="span"
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      right: 0,
                                      background: '#fff',
                                      border: '1px solid #e0e0e0',
                                      boxShadow: 1,
                                      '&:hover': { background: '#f0f0f0' }
                                    }}
                                  >
                                    <CloudUploadIcon fontSize="small" />
                                  </IconButton>
                                </label>
                              </Box>
                              <Typography variant="caption" color="textSecondary">
                                Upload a profile photo (max 5MB)
                              </Typography>
                            </Box>
                          ) : field.name === 'password' ? (
                            <TextField
                              fullWidth
                              label={field.label}
                              name={field.name}
                              type={showPassword ? 'text' : 'password'}
                              value={field.value}
                              onChange={field.onChange}
                              required={field.required}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={handleTogglePassword} edge="end">
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                          ) : field.type === 'select' ? (
                            <FormControl fullWidth required={field.required}>
                              <InputLabel>{field.label}</InputLabel>
                              <Select
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                label={field.label}
                              >
                                {field.options.map((option) => (
                                  <MenuItem key={option.value || option.code} value={option.value || option.code}>
                                    {option.label || `${option.code} - ${option.name}`}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              label={field.label}
                              name={field.name}
                              type={field.type || 'text'}
                              value={field.value}
                              onChange={field.onChange}
                              required={field.required}
                              disabled={field.disabled}
                              multiline={field.multiline}
                              rows={field.rows}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dispatcher')}
            sx={{ minWidth: 120 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ minWidth: 120 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Create Dispatcher'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default DispatcherCreatePage;