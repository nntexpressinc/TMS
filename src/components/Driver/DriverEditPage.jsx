import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert, Divider, Tabs, Tab } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../../api/auth";
import Autocomplete from '@mui/material/Autocomplete';
import { toast } from 'react-hot-toast';
import Avatar from '@mui/material/Avatar';

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

const DriverEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState({
    email: "",
    company_name: "",
    first_name: "",
    last_name: "",
    telephone: "",
    callphone: "",
    city: "",
    address: "",
    country: "",
    state: "",
    postal_zip: "",
    ext: "",
    fax: "",
    role: "driver",
    company_id: 1
  });
  const [driverData, setDriverData] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
    email_address: "",
    driver_license_id: "",
    dl_class: "",
    driver_license_state: "",
    driver_license_expiration: "",
    address1: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    zip_code: "",
    employment_status: "",
    driver_status: "",
    driver_type: "",
    assigned_truck: "",
    assigned_trailer: "",
    assigned_dispatcher: "",
    other_id: "",
    notes: "",
    tariff: 0,
    mc_number: "",
    team_driver: "",
    permile: 0,
    cost: 0,
    payd: 0,
    escrow_deposit: 0,
    driver_tags: ""
  });

  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driver, trucksData, trailersData, dispatchersData, usersData] = await Promise.all([
          ApiService.getData(`/driver/${id}/`),
          ApiService.getData('/truck/'),
          ApiService.getData('/trailer/'),
          ApiService.getData('/dispatcher/'),
          ApiService.getData('/auth/users/')
        ]);
        setAllUsers(usersData);
        setDriverData(prevData => ({
          ...prevData,
          ...driver,
          birth_date: driver.birth_date || "",
          driver_license_expiration: driver.driver_license_expiration || "",
          escrow_deposit: driver.escrow_deposit || 0
        }));
        let userId = driver.user;
        if (typeof userId === 'object' && userId !== null) userId = userId.id;
        const user = usersData.find(u => u.id === userId);
        if (user) {
          setUserData(prevData => ({ ...prevData, ...user }));
          setSelectedUser(user);
        }
        setTrucks(trucksData);
        setTrailers(trailersData);
        setDispatchers(dispatchersData);
        setLoading(false);
      } catch (error) {
        setError('Failed to load driver data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDriverChange = (e) => {
    const { name, value } = e.target;
    setDriverData(prevData => ({
      ...prevData,
      [name]: value
    }));
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
      if (!selectedUser || !selectedUser.id) throw new Error('User must be selected');
      const allowedFields = [
        'email', 'company_name', 'first_name', 'last_name', 'telephone', 'city', 'address',
        'country', 'state', 'postal_zip', 'fax', 'role', 'company'
      ];
      const cleanUserData = {};
      allowedFields.forEach(field => {
        if (userData[field] !== undefined) cleanUserData[field] = userData[field];
      });
      
      // ext maydonini alohida ko'rib chiqamiz
      if (userData.ext && userData.ext.trim() !== '') {
        const extValue = parseInt(userData.ext);
        if (!isNaN(extValue)) {
          cleanUserData.ext = extValue;
        }
      }
      
      let formData;
      if (profilePhotoFile) {
        formData = new FormData();
        Object.entries(cleanUserData).forEach(([key, value]) => formData.append(key, value));
        formData.append('profile_photo', profilePhotoFile);
        await ApiService.putMediaData(`/auth/users/${selectedUser.id}/`, formData);
      } else {
        await ApiService.putData(`/auth/users/${selectedUser.id}/`, cleanUserData);
      }
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user information. Please check your data and try again.');
      setLoading(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const updatedData = Object.keys(driverData).reduce((acc, key) => {
        if ([
          'assigned_truck', 'assigned_trailer', 'assigned_dispatcher'
        ].includes(key)) {
          acc[key] = driverData[key] || null;
        } else if ([
          'tariff', 'permile', 'cost', 'payd', 'escrow_deposit'
        ].includes(key)) {
          acc[key] = driverData[key] === '' ? 0 : Number(driverData[key]);
        } else if (driverData[key] !== '') {
          acc[key] = driverData[key];
        }
        return acc;
      }, {});
      updatedData.user = selectedUser?.id;
      await ApiService.putData(`/driver/${id}/`, updatedData);
      setSuccess(true);
      setLoading(false);
      toast.success('Driver information updated successfully!');
      setTimeout(() => {
        navigate(`/driver/${id}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update driver information. Please check your data and try again.');
      setLoading(false);
    }
  };

  const getProfilePhoto = (url) => {
    if (!url) return 'https://ui-avatars.com/api/?name=User&background=random';
    if (url.startsWith('http')) return url;
    return `https://api1.biznes-armiya.uz${url}`;
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
          <Tab label="Driver Information" />
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
                    label="User (Email)"
                    value={userData.email}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="company_name"
                    value={userData.company_name}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={userData.first_name}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={userData.last_name}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="telephone"
                    value={userData.telephone}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Phone"
                    name="callphone"
                    value={userData.callphone}
                    onChange={handleUserChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={userData.address}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={userData.city}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={userData.state}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={userData.country}
                    onChange={handleUserChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal/Zip Code"
                    name="postal_zip"
                    value={userData.postal_zip}
                    onChange={handleUserChange}
                    required
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
          <form onSubmit={handleDriverSubmit}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Driver Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Birth Date"
                    name="birth_date"
                    type="date"
                    value={driverData.birth_date}
                    onChange={handleDriverChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Status</InputLabel>
                    <Select
                      name="employment_status"
                      value={driverData.employment_status}
                      onChange={handleDriverChange}
                      input={<OutlinedInput />}
                    >
                      <MenuItem value="ACTIVE (DF)">ACTIVE (DF)</MenuItem>
                      <MenuItem value="Terminate">Terminate</MenuItem>
                      <MenuItem value="Applicant">Applicant</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telegram Username"
                    name="telegram_username"
                    value={driverData.telegram_username}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Driver Status</InputLabel>
                    <Select
                      name="driver_status"
                      value={driverData.driver_status}
                      onChange={handleDriverChange}
                      input={<OutlinedInput />}
                    >
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="Home">Home</MenuItem>
                      <MenuItem value="In-Transit">In-Transit</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                      <MenuItem value="Shop">Shop</MenuItem>
                      <MenuItem value="Rest">Rest</MenuItem>
                      <MenuItem value="Dispatched">Dispatched</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="company_name"
                    value={driverData.company_name || ''}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver License ID"
                    name="driver_license_id"
                    value={driverData.driver_license_id}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>DL Class</InputLabel>
                    <Select
                      name="dl_class"
                      value={driverData.dl_class}
                      onChange={handleDriverChange}
                      input={<OutlinedInput />}
                    >
                      <MenuItem value="Unknown">Unknown</MenuItem>
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="E">E</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Driver Type</InputLabel>
                    <Select
                      name="driver_type"
                      value={driverData.driver_type}
                      onChange={handleDriverChange}
                      input={<OutlinedInput />}
                    >
                      <MenuItem value="COMPANY_DRIVER">Company Driver</MenuItem>
                      <MenuItem value="OWNER_OPERATOR">Owner Operator</MenuItem>
                      <MenuItem value="LEASE">Lease</MenuItem>
                      <MenuItem value="RENTAL">Rental</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Driver License State</InputLabel>
                    <Select
                      name="driver_license_state"
                      value={driverData.driver_license_state}
                      onChange={handleDriverChange}
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
                    label="Driver License Expiration"
                    name="driver_license_expiration"
                    type="date"
                    value={driverData.driver_license_expiration}
                    onChange={handleDriverChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Other ID"
                    name="other_id"
                    value={driverData.other_id || ''}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={driverData.notes || ''}
                    onChange={handleDriverChange}
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tariff"
                    name="tariff"
                    type="number"
                    value={driverData.tariff}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="MC Number"
                    name="mc_number"
                    value={driverData.mc_number || ''}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Team Driver"
                    name="team_driver"
                    value={driverData.team_driver || ''}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Per Mile"
                    name="permile"
                    type="number"
                    value={driverData.permile}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost"
                    name="cost"
                    type="number"
                    value={driverData.cost}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Payd"
                    name="payd"
                    type="number"
                    value={driverData.payd}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Escrow Deposit"
                    name="escrow_deposit"
                    type="number"
                    value={driverData.escrow_deposit}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Motive ID"
                    name="motive_id"
                    value={driverData.motive_id || ''}
                    onChange={handleDriverChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Truck</InputLabel>
                    <Select
                      name="assigned_truck"
                      value={driverData.assigned_truck}
                      onChange={handleDriverChange}
                      input={<OutlinedInput />}
                    >
                      {trucks.map((truck) => (
                        <MenuItem key={truck.id} value={truck.id}>
                          {truck.make} {truck.model}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Trailer</InputLabel>
                    <Select
                      name="assigned_trailer"
                      value={driverData.assigned_trailer}
                      onChange={handleDriverChange}
                      input={<OutlinedInput />}
                    >
                      {trailers.map((trailer) => (
                        <MenuItem key={trailer.id} value={trailer.id}>
                          {trailer.make} {trailer.model}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Dispatcher</InputLabel>
                    <Select
                      name="assigned_dispatcher"
                      value={driverData.assigned_dispatcher}
                      onChange={handleDriverChange}
                      input={<OutlinedInput />}
                    >
                      {dispatchers.map((dispatcher) => (
                        <MenuItem key={dispatcher.id} value={dispatcher.id}>
                          {dispatcher.first_name} {dispatcher.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Tags"
                    name="driver_tags"
                    value={driverData.driver_tags || ''}
                    onChange={handleDriverChange}
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

export default DriverEditPage;