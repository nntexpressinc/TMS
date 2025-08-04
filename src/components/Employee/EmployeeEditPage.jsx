import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert, Divider, Tabs, Tab, Avatar } from "@mui/material";
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
  { value: 'ACTIVE (DF)', label: 'ACTIVE (DF)' },
  { value: 'Terminate', label: 'Terminate' },
  { value: 'Applicant', label: 'Applicant' },
  { value: '', label: 'None' },
  { value: null, label: 'Null' }
];
const positions = [
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'FLEET MANAGMENT', label: 'Fleet Managment' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'HR', label: 'HR' },
  { value: 'UPDATER', label: 'Updater' },
  { value: 'ELD TEAM', label: 'ELD team' },
  { value: 'OTHER', label: 'Other' },
  { value: '', label: 'None' },
  { value: null, label: 'Null' }
];

const getProfilePhoto = (url) => {
  if (!url) return 'https://ui-avatars.com/api/?name=User&background=random';
  if (url.startsWith('http')) return url;
  return `https://nnt.nntexpressinc.com${url}`;
};

const EmployeeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState({});
  const [employeeData, setEmployeeData] = useState({});
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employee = await ApiService.getData(`/employee/${id}/`);
        setEmployeeData(employee);
        setUserData(employee.user || {});
        setLoading(false);
      } catch (error) {
        setError('Failed to load employee data. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };
  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData(prevData => ({ ...prevData, [name]: value }));
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
      
      // Ensure role is set to employee if not present
      if (!cleanUserData.role) {
        cleanUserData.role = 'employee';
      }
      
      // Remove any undefined or null values
      Object.keys(cleanUserData).forEach(key => {
        if (cleanUserData[key] === undefined || cleanUserData[key] === null) {
          delete cleanUserData[key];
        }
      });
      
      console.log('User data being sent:', cleanUserData);
      console.log('Selected user ID:', userData.id);
      
      let formData;
      if (profilePhotoFile) {
        formData = new FormData();
        Object.entries(cleanUserData).forEach(([key, value]) => {
          console.log(`Adding to FormData: ${key} = ${value}`);
          formData.append(key, value);
        });
        formData.append('profile_photo', profilePhotoFile);
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
        const response = await ApiService.putMediaData(`/auth/users/${userData.id}/`, formData);
        console.log('Response:', response);
      } else {
        // If no profile photo file, use regular PUT request
        console.log('No profile photo file, using regular PUT request');
        const response = await ApiService.putData(`/auth/users/${userData.id}/`, cleanUserData);
        console.log('Response:', response);
      }
      setSuccess(true);
      setLoading(false);
      toast.success('User information updated successfully!');
    } catch (err) {
      console.error('Error details:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to update user information. Please check your data and try again.');
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const updatedData = {
        nickname: employeeData.nickname,
        employee_status: employeeData.employee_status,
        position: employeeData.position,
        note: employeeData.note,
        employee_tags: employeeData.employee_tags,
        contact_number: employeeData.contact_number
      };
      await ApiService.putData(`/employee/${id}/`, updatedData);
      setSuccess(true);
      setLoading(false);
      toast.success('Employee information updated successfully!');
      setTimeout(() => {
        navigate(`/employee/${id}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update employee information. Please check your data and try again.');
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
          <Tab label="Employee Information" />
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
          <form onSubmit={handleEmployeeSubmit}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Employee Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nickname"
                    name="nickname"
                    value={employeeData.nickname || ''}
                    onChange={handleEmployeeChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employee Status</InputLabel>
                    <Select
                      name="employee_status"
                      value={employeeData.employee_status || ''}
                      onChange={handleEmployeeChange}
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
                    <InputLabel>Position</InputLabel>
                    <Select
                      name="position"
                      value={employeeData.position || ''}
                      onChange={handleEmployeeChange}
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
                    label="Note"
                    name="note"
                    value={employeeData.note || ''}
                    onChange={handleEmployeeChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee Tags"
                    name="employee_tags"
                    value={employeeData.employee_tags || ''}
                    onChange={handleEmployeeChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contact_number"
                    value={employeeData.contact_number || ''}
                    onChange={handleEmployeeChange}
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

export default EmployeeEditPage; 