import React, { useState, useEffect } from "react";
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

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

const employeeStatuses = [
  { value: 'ACTIVE (DF)', label: 'ACTIVE (DF)' },
  { value: 'Terminate', label: 'Terminate' },
  { value: 'Applicant', label: 'Applicant' },
  { value: '', label: 'None' },
  { value: null, label: 'Null' }
];
const positions = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: '', label: 'None' },
  { value: null, label: 'Null' }
];
const mcNumbers = [
  { value: 'ADMIN OR COMPANY MC', label: 'Admin or Company MC' },
  { value: '', label: 'None' },
  { value: null, label: 'Null' }
];

const DispatcherCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
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

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await ApiService.getData("/auth/role/");
        setRoles(response);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

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
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
      setError("Please fill in all required fields");
      return false;
    }
    if (userData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!userData.email.includes('@')) {
      setError("Please enter a valid email address");
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
      // 1. Create user first - FormData ishlatamiz
      const userFormData = new FormData();
      userFormData.append('email', userData.email);
      userFormData.append('company_name', userData.company_name || '');
      userFormData.append('first_name', userData.first_name);
      userFormData.append('last_name', userData.last_name);
      userFormData.append('telephone', userData.telephone);
      userFormData.append('city', userData.city);
      userFormData.append('address', userData.address);
      userFormData.append('country', userData.country);
      userFormData.append('state', userData.state);
      userFormData.append('postal_zip', userData.postal_zip);
      
      // ext maydonini butun son sifatida qo'shamiz yoki umuman qo'shmaymiz
      if (userData.ext && userData.ext.trim() !== '') {
        // Raqamga aylantirish uchun harakat qilamiz
        const extValue = parseInt(userData.ext);
        if (!isNaN(extValue)) {
          userFormData.append('ext', extValue);
        }
      }
      
      userFormData.append('fax', userData.fax || '');
      userFormData.append('role', userData.role);
      userFormData.append('password', userData.password);
      userFormData.append('password2', userData.password);
      
      // Profile photo o'zgargan bo'lsa
      if (profilePhotoFile) {
        // Rasmni ham birga yuboramiz
        userFormData.append('profile_photo', profilePhotoFile);
      }
      
      // FormData ishlatib API ga yuboramiz
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
        employee_status: employeeStatuses.some(e => e.value === dispatcherData.employee_status) ? dispatcherData.employee_status || null : null,
        mc_number: mcNumbers.some(e => e.value === dispatcherData.mc_number) ? dispatcherData.mc_number || null : null,
        position: positions.some(e => e.value === dispatcherData.position) ? dispatcherData.position || null : null,
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
            type: 'select',
            required: true,
            value: userData.role,
            onChange: handleUserChange,
            options: roles.map(role => ({ value: role.id, label: role.name }))
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
            options: employeeStatuses,
            value: dispatcherData.employee_status,
            onChange: handleDispatcherChange
          },
          { 
            name: 'mc_number', 
            label: 'MC Number', 
            type: 'select',
            options: mcNumbers,
            value: dispatcherData.mc_number,
            onChange: handleDispatcherChange
          }
        ],
        [
          { 
            name: 'position', 
            label: 'Position', 
            type: 'select',
            options: positions,
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