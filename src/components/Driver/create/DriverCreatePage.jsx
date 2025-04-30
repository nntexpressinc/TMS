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
  Autocomplete,
  Divider,
  FormHelperText,
  CircularProgress,
  Avatar,
  InputAdornment
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-hot-toast';
import './DriverCreatePage.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const DriverCreatePage = () => {
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
    ext: 0,
    fax: "",
    role: "",
    password: "",
    password2: ""
  });

  const [driverData, setDriverData] = useState({
    user: null,
    birth_date: "",
    employment_status: "ACTIVE",
    telegram_username: "",
    driver_status: "AVAILABLE",
    company_name: "",
    driver_license_id: "",
    dl_class: "",
    driver_type: "COMPANY_DRIVER",
    driver_license_state: "",
    driver_license_expiration: "",
    other_id: "",
    notes: "",
    tariff: "",
    mc_number: "",
    team_driver: false,
    permile: 0,
    cost: 0,
    payd: 0,
    escrow_deposit: 0,
    motive_id: "",
    assigned_truck: null,
    assigned_trailer: null,
    assigned_dispatcher: null,
    driver_tags: null
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const addNotification = (message, type = 'success') => {
    setNotifications(prev => [...prev, { message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 6000);
  };

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  const employmentStatuses = [
    { value: 'ACTIVE (DF)', label: 'Active' },
    { value: 'Terminate', label: 'Terminate' },
    { value: 'Applicant', label: 'Applicant' }
  ];

  const driverStatuses = [
    { value: 'Available', label: 'Available' },
    { value: 'Home', label: 'Home' },
    { value: 'In-Transit', label: 'In-Transit' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Shop', label: 'Shop' },
    { value: 'Rest', label: 'Rest' },
    { value: 'Dispatched', label: 'Dispatched' }
  ];

  const driverTypes = [
    { value: 'COMPANY_DRIVER', label: 'Company Driver' },
    { value: 'OWNER_OPERATOR', label: 'Owner Operator' },
    { value: 'LEASE', label: 'Lease' },
    { value: 'RENTAL', label: 'Rental' }
  ];

  const dlClasses = [
    { value: 'Unknown', label: 'Unknown' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'Other', label: 'Other' }
  ];

  const teamDriverTypes = [
    { value: 'DRIVER_2', label: 'Driver_2' },
    { value: 'ASSIGNED_DISPATCHER', label: 'Assigned_dispatcher' },
    { value: 'PERCENT_SALARY', label: 'Percent_salary' }
  ];

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
      // If password field is being updated, also update password2
      ...(name === 'password' && { password2: value })
    }));
  };

  const handleDriverChange = (e) => {
    const { name, value } = e.target;
    setDriverData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateChange = (event, newValue) => {
    setUserData(prev => ({
      ...prev,
      state: newValue ? newValue.code : ''
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const formattedDate = value ? new Date(value).toISOString().split('T')[0] : '';
    setDriverData(prev => ({
      ...prev,
      [name]: formattedDate
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("File size should not exceed 5MB");
      return;
    }
    setProfilePhotoFile(file);
    setUserData(prev => ({
      ...prev,
      profile_photo: file
    }));
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
      // 1. Create user first
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
      
      // ext maydonini faqat raqam bo'lgan holatda qo'shamiz
      if (userData.ext && userData.ext.trim() !== '') {
        const extValue = parseInt(userData.ext);
        if (!isNaN(extValue)) {
          userFormData.append('ext', extValue);
        }
      }
      
      userFormData.append('fax', userData.fax || '');
      userFormData.append('role', parseInt(userData.role));
      userFormData.append('password', userData.password);
      userFormData.append('password2', userData.password);

      if (userData.profile_photo) {
        userFormData.append('profile_photo', userData.profile_photo);
      }

      const userResponse = await ApiService.postRegister(
        "/auth/register/", 
        userFormData
      );

      if (!userResponse || !userResponse.user_id) {
        throw new Error('Failed to create user: No user ID received');
      }

      console.log("User created successfully:", userResponse);
      toast.success('User account created successfully');

      // 2. Create driver with the user ID
      const formattedDriverData = {
        user: userResponse.user_id,
        birth_date: driverData.birth_date || null,
        employment_status: employmentStatuses.some(e => e.value === driverData.employment_status) ? driverData.employment_status : null,
        telegram_username: driverData.telegram_username || null,
        driver_status: driverStatuses.some(e => e.value === driverData.driver_status) ? driverData.driver_status : null,
        company_name: driverData.company_name || null,
        driver_license_id: driverData.driver_license_id || null,
        dl_class: dlClasses.some(e => e.value === driverData.dl_class) ? driverData.dl_class : null,
        driver_type: driverTypes.some(e => e.value === driverData.driver_type) ? driverData.driver_type : null,
        driver_license_state: states.some(s => s.code === driverData.driver_license_state) ? driverData.driver_license_state : null,
        driver_license_expiration: driverData.driver_license_expiration || null,
        other_id: driverData.other_id || null,
        notes: driverData.notes || null,
        tariff: driverData.tariff !== '' ? parseFloat(driverData.tariff) : null,
        mc_number: driverData.mc_number || null,
        team_driver: teamDriverTypes.some(e => e.value === driverData.team_driver) ? driverData.team_driver : null,
        permile: driverData.permile !== '' ? parseFloat(driverData.permile) : null,
        cost: driverData.cost !== '' ? parseFloat(driverData.cost) : null,
        payd: driverData.payd !== '' ? parseFloat(driverData.payd) : null,
        escrow_deposit: driverData.escrow_deposit !== '' ? parseFloat(driverData.escrow_deposit) : null,
        motive_id: driverData.motive_id || null,
        assigned_truck: driverData.assigned_truck ? parseInt(driverData.assigned_truck) : null,
        assigned_trailer: driverData.assigned_trailer ? parseInt(driverData.assigned_trailer) : null,
        assigned_dispatcher: driverData.assigned_dispatcher ? parseInt(driverData.assigned_dispatcher) : null,
        driver_tags: driverData.driver_tags !== '' ? parseInt(driverData.driver_tags) : null
      };

      console.log("Sending driver data:", formattedDriverData);

      const driverResponse = await ApiService.postData(
        "/driver/", 
        formattedDriverData
      );

      if (!driverResponse) {
        throw new Error('Failed to create driver profile');
      }

      console.log("Driver created successfully:", driverResponse);
      toast.success('Driver profile created successfully');
      navigate("/driver");
    } catch (error) {
      console.error("Error:", error);
      
      let errorMessage = "Failed to create account.";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          if (error.response.data.email) {
            errorMessage = "A user with this email already exists. Please use another email.";
          } else {
            errorMessage = Object.entries(error.response.data)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                }
                return `${key}: ${value}`;
              })
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
          { name: 'company_name', label: 'Company Name', required: true, value: userData.company_name, onChange: handleUserChange }
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
            onChange: handleFileChange,
            helperText: 'Upload a profile photo'
          }
        ]
      ]
    },
    {
      title: 'Address Information',
      subtitle: 'Contact Details',
      fields: [
        [
          { name: 'address', label: 'Address', required: true, value: userData.address, onChange: handleUserChange },
          { name: 'city', label: 'City', required: true, value: userData.city, onChange: handleUserChange },
          { 
            name: 'state', 
            label: 'State', 
            required: true,
            type: 'autocomplete',
            options: states,
            value: states.find(state => state.code === userData.state) || null,
            onChange: handleStateChange
          }
        ],
        [
          { name: 'postal_zip', label: 'ZIP Code', required: true, type: 'number', value: userData.postal_zip, onChange: handleUserChange },
          { name: 'country', label: 'Country', disabled: true, value: userData.country, onChange: handleUserChange },
          { name: 'fax', label: 'Fax', value: userData.fax, onChange: handleUserChange }
        ]
      ]
    },
    {
      title: 'Driver Information',
      subtitle: 'Professional Details',
      fields: [
        [
          { name: 'telegram_username', label: 'Telegram Username', value: driverData.telegram_username, onChange: handleDriverChange },
          { 
            name: 'employment_status', 
            label: 'Employment Status', 
            type: 'select',
            options: employmentStatuses,
            value: driverData.employment_status,
            onChange: handleDriverChange
          },
          { 
            name: 'driver_status', 
            label: 'Driver Status', 
            type: 'select',
            options: driverStatuses,
            value: driverData.driver_status,
            onChange: handleDriverChange
          }
        ],
        [
          { name: 'driver_license_id', label: 'Driver License ID', required: true, value: driverData.driver_license_id, onChange: handleDriverChange },
          { 
            name: 'dl_class', 
            label: 'License Class', 
            type: 'select',
            options: dlClasses,
            value: driverData.dl_class,
            onChange: handleDriverChange
          },
          { 
            name: 'driver_type', 
            label: 'Driver Type', 
            type: 'select',
            options: driverTypes,
            value: driverData.driver_type,
            onChange: handleDriverChange
          }
        ],
        [
          { name: 'driver_license_expiration', label: 'License Expiration', type: 'date', value: driverData.driver_license_expiration, onChange: handleDateChange },
          { name: 'birth_date', label: 'Birth Date', type: 'date', required: true, value: driverData.birth_date, onChange: handleDateChange },
          { name: 'mc_number', label: 'MC Number', value: driverData.mc_number, onChange: handleDriverChange }
        ]
      ]
    },
    {
      title: 'Financial Information',
      subtitle: 'Payment Details',
      fields: [
        [
          { name: 'permile', label: 'Per Mile Rate', type: 'number', value: driverData.permile, onChange: handleDriverChange },
          { name: 'cost', label: 'Cost', type: 'number', value: driverData.cost, onChange: handleDriverChange },
          { name: 'payd', label: 'Pay', type: 'number', value: driverData.payd, onChange: handleDriverChange }
        ],
        [
          { name: 'escrow_deposit', label: 'Escrow Deposit', type: 'number', value: driverData.escrow_deposit, onChange: handleDriverChange },
          { name: 'tariff', label: 'Tariff', type: 'number', value: driverData.tariff, onChange: handleDriverChange },
          { 
            name: 'team_driver', 
            label: 'Team Driver', 
            type: 'select',
            options: teamDriverTypes,
            value: driverData.team_driver,
            onChange: handleDriverChange
          }
        ]
      ]
    },
    {
      title: 'Additional Information',
      subtitle: 'Notes and Other Details',
      fields: [
        [
          { name: 'notes', label: 'Notes', multiline: true, rows: 4, value: driverData.notes, onChange: handleDriverChange }
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

      {notifications.map((notification, index) => (
        <Snackbar
          key={index}
          open={true}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: `${(index + 1) * 64}px` }}
        >
          <Alert 
            severity={notification.type}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        gap: 2
      }}>
        <Tooltip title="Back to Drivers">
          <IconButton 
            onClick={() => navigate('/driver')}
            sx={{ 
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Create New Driver
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
                                    onChange={handleFileChange}
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
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : field.type === 'autocomplete' ? (
                            <Autocomplete
                              options={field.options}
                              getOptionLabel={(option) => `${option.name} (${option.code})`}
                              value={field.value}
                              onChange={field.onChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={field.label}
                                  required={field.required}
                                />
                              )}
                            />
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
                              InputLabelProps={{
                                shrink: field.type === 'date' ? true : undefined,
                              }}
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
            onClick={() => navigate('/driver')}
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
              'Create Driver'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default DriverCreatePage;