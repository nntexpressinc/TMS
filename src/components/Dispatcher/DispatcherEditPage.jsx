import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert, Divider, Tabs, Tab, CircularProgress, Avatar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../../api/auth";
import { toast } from 'react-hot-toast';

const US_STATES = [
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

const employeeStatuses = [
  { value: 'ACTIVE (DF)', label: 'Active' },
  { value: 'Terminate', label: 'Terminate' },
  { value: 'Applicant', label: 'Applicant' }
];
const positions = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' }
];
const mcNumbers = [
  { value: 'ADMIN OR COMPANY MC', label: 'Admin or Company MC' }
];

const getProfilePhoto = (url) => {
  if (!url) return 'https://ui-avatars.com/api/?name=User&background=random';
  if (url.startsWith('http')) return url;
  return `https://nnt.nntexpressinc.com${url}`;
};

const DispatcherEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState({});
  const [dispatcherData, setDispatcherData] = useState({});
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dispatcher = await ApiService.getData(`/dispatcher/${id}/`);
        setDispatcherData(dispatcher);
        setUserData(dispatcher.user || {});
        setLoading(false);
      } catch (error) {
        setError('Failed to load dispatcher data. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };
  const handleDispatcherChange = (e) => {
    const { name, value } = e.target;
    setDispatcherData(prevData => ({ ...prevData, [name]: value }));
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhotoFile(e.target.files[0]);
      setUserData(prev => ({ ...prev, profile_photo: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const allowedFields = [
        'email', 'company_name', 'first_name', 'last_name', 'telephone', 'callphone', 'city', 'address',
        'country', 'state', 'postal_zip', 'ext', 'fax', 'role', 'company'
      ];
      const cleanUserData = {};
      allowedFields.forEach(field => {
        if (userData[field] !== undefined && userData[field] !== null && userData[field] !== '') {
          cleanUserData[field] = userData[field];
        }
      });
      
      // Ensure required fields are present
      const requiredFields = ['email', 'company_name', 'first_name', 'last_name', 'telephone', 'city', 'address', 'country', 'state', 'postal_zip'];
      const missingFields = requiredFields.filter(field => !cleanUserData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // ext maydonini alohida ko'rib chiqamiz
      if (userData.ext && userData.ext.trim() !== '') {
        const extValue = parseInt(userData.ext);
        if (!isNaN(extValue)) {
          cleanUserData.ext = extValue;
        }
      }
      
      // Ensure role is set to dispatcher if not present
      if (!cleanUserData.role) {
        cleanUserData.role = 'dispatcher';
      }
      
      // Remove any undefined or null values
      Object.keys(cleanUserData).forEach(key => {
        if (cleanUserData[key] === undefined || cleanUserData[key] === null) {
          delete cleanUserData[key];
        }
      });
      
      let formData;
      if (profilePhotoFile) {
        formData = new FormData();
        Object.entries(cleanUserData).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('profile_photo', profilePhotoFile);
        await ApiService.putMediaData(`/auth/users/${userData.id}/`, formData);
      } else {
        await ApiService.putData(`/auth/users/${userData.id}/`, cleanUserData);
      }
      setSuccess(true);
      setLoading(false);
      toast.success('User information updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to update user information. Please check your data and try again.');
      setLoading(false);
    }
  };

  const handleDispatcherSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const updatedData = {
        nickname: dispatcherData.nickname,
        employee_status: dispatcherData.employee_status,
        mc_number: dispatcherData.mc_number,
        position: dispatcherData.position,
        company_name: dispatcherData.company_name,
        office: dispatcherData.office
      };
      await ApiService.putData(`/dispatcher/${id}/`, updatedData);
      setSuccess(true);
      setLoading(false);
      toast.success('Dispatcher information updated successfully!');
      setTimeout(() => {
        navigate(`/dispatcher/${id}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update dispatcher information. Please check your data and try again.');
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Information updated successfully. Redirecting...
        </Alert>
      )}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="User Information" />
          <Tab label="Dispatcher Information" />
        </Tabs>
        {tabValue === 0 && (
          <form onSubmit={handleUserSubmit} encType="multipart/form-data">
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={profilePhotoFile ? URL.createObjectURL(profilePhotoFile) : getProfilePhoto(userData.profile_photo)}
                      alt={userData.first_name || userData.email}
                      sx={{ width: 80, height: 80, mb: 1, border: '2px solid #e0e0e0' }}
                    />
                    <Button variant="outlined" component="label" size="small">
                      Upload Photo
                      <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={userData.email}
                    onChange={handleUserChange}
                    type="email"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="company_name"
                    value={userData.company_name || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={userData.first_name || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={userData.last_name || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="telephone"
                    value={userData.telephone || ''}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Phone"
                    name="callphone"
                    value={userData.callphone || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={userData.address || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={userData.city || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select
                      name="state"
                      value={userData.state || ''}
                      onChange={handleUserChange}
                      input={<OutlinedInput />}
                    >
                      {US_STATES.map((state) => (
                        <MenuItem key={state.code} value={state.code}>
                          {state.code} - {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={userData.country || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal/Zip Code"
                    name="postal_zip"
                    value={userData.postal_zip || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ext"
                    name="ext"
                    value={userData.ext || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fax"
                    name="fax"
                    value={userData.fax || ''}
                    onChange={handleUserChange}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        )}
        {tabValue === 1 && (
          <form onSubmit={handleDispatcherSubmit}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Dispatcher Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nickname"
                    name="nickname"
                    value={dispatcherData.nickname || ''}
                    onChange={handleDispatcherChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employee Status</InputLabel>
                    <Select
                      name="employee_status"
                      value={dispatcherData.employee_status || ''}
                      onChange={handleDispatcherChange}
                      input={<OutlinedInput />}
                    >
                      {employeeStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>MC Number</InputLabel>
                    <Select
                      name="mc_number"
                      value={dispatcherData.mc_number || ''}
                      onChange={handleDispatcherChange}
                      input={<OutlinedInput />}
                    >
                      {mcNumbers.map((mc) => (
                        <MenuItem key={mc.value} value={mc.value}>{mc.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Position</InputLabel>
                    <Select
                      name="position"
                      value={dispatcherData.position || ''}
                      onChange={handleDispatcherChange}
                      input={<OutlinedInput />}
                    >
                      {positions.map((pos) => (
                        <MenuItem key={pos.value} value={pos.value}>{pos.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="company_name"
                    value={dispatcherData.company_name || ''}
                    onChange={handleDispatcherChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Office"
                    name="office"
                    value={dispatcherData.office || ''}
                    onChange={handleDispatcherChange}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default DispatcherEditPage; 