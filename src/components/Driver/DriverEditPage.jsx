import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert, Divider, Tabs, Tab } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../../api/auth";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driver, trucksData, trailersData, dispatchersData] = await Promise.all([
          ApiService.getData(`/driver/${id}/`),
          ApiService.getData('/truck/'),
          ApiService.getData('/trailer/'),
          ApiService.getData('/dispatcher/')
        ]);

        setDriverData(prevData => ({
          ...prevData,
          ...driver,
          birth_date: driver.birth_date || "",
          driver_license_expiration: driver.driver_license_expiration || "",
          escrow_deposit: driver.escrow_deposit || 0
        }));

        if (driver.user) {
          const user = await ApiService.getData(`/auth/user/${driver.user}/`);
          setUserData(prevData => ({
            ...prevData,
            ...user
          }));
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

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    try {
      await ApiService.putData(`/auth/user/${driverData.user}/`, userData);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Update error:', err);
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
        if (['assigned_truck', 'assigned_trailer', 'assigned_dispatcher'].includes(key)) {
          acc[key] = driverData[key] || null;
        }
        else if (['tariff', 'permile', 'cost', 'payd', 'escrow_deposit'].includes(key)) {
          acc[key] = driverData[key] === '' ? 0 : Number(driverData[key]);
        }
        else if (driverData[key] !== '') {
          acc[key] = driverData[key];
        }
        return acc;
      }, {});

      await ApiService.putData(`/driver/${id}/`, updatedData);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate(`/driver/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.detail || 'Failed to update driver information. Please check your data and try again.');
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
          <Tab label="Driver Information" />
        </Tabs>

        {tabValue === 0 && (
          <form onSubmit={handleUserSubmit}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleUserChange}
                    required
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
                    label="First Name"
                    name="first_name"
                    value={driverData.first_name}
                    onChange={handleDriverChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={driverData.last_name}
                    onChange={handleDriverChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contact_number"
                    value={driverData.contact_number}
                    onChange={handleDriverChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email_address"
                    type="email"
                    value={driverData.email_address}
                    onChange={handleDriverChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver License ID"
                    name="driver_license_id"
                    value={driverData.driver_license_id}
                    onChange={handleDriverChange}
                    required
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
                  <TextField
                    fullWidth
                    label="Driver License State"
                    name="driver_license_state"
                    value={driverData.driver_license_state}
                    onChange={handleDriverChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver License Expiration"
                    name="driver_license_expiration"
                    type="date"
                    value={driverData.driver_license_expiration}
                    onChange={handleDriverChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
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