import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert, Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../../api/auth";

const DriverEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [driverData, setDriverData] = useState({
    // Personal Information
    first_name: "",
    last_name: "",
    contact_number: "",
    email_address: "",
    driver_license_id: "",
    dl_class: "",
    driver_license_state: "",
    driver_license_expiration: "",

    // Location Information
    address1: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    zip_code: "",

    // Company Information
    employment_status: "",
    driver_status: "",
    driver_type: "",
    assigned_truck: "",
    assigned_trailer: "",
    assigned_dispatcher: "",

    // Additional Information
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    try {
      // Create a new object with only the fields that have values
      const updatedData = Object.keys(driverData).reduce((acc, key) => {
        // Convert empty strings to null for specific fields
        if (['assigned_truck', 'assigned_trailer', 'assigned_dispatcher'].includes(key)) {
          acc[key] = driverData[key] || null;
        }
        // Convert numeric fields
        else if (['tariff', 'permile', 'cost', 'payd', 'escrow_deposit'].includes(key)) {
          acc[key] = driverData[key] === '' ? 0 : Number(driverData[key]);
        }
        // Handle other fields
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
      window.scrollTo(0, 0);
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
          Driver information updated successfully. Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={driverData.first_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={driverData.last_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact_number"
                value={driverData.contact_number}
                onChange={handleChange}
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
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver License ID"
                name="driver_license_id"
                value={driverData.driver_license_id}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>DL Class</InputLabel>
                <Select
                  name="dl_class"
                  value={driverData.dl_class}
                  onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Location Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Location Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address 1"
                name="address1"
                value={driverData.address1}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address 2"
                name="address2"
                value={driverData.address2}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={driverData.country}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={driverData.state}
                  onChange={handleChange}
                  input={<OutlinedInput />}
                >
                  {/* US States */}
                  <MenuItem value="AL">Alabama</MenuItem>
                  <MenuItem value="AK">Alaska</MenuItem>
                  <MenuItem value="AZ">Arizona</MenuItem>
                  <MenuItem value="AR">Arkansas</MenuItem>
                  <MenuItem value="CA">California</MenuItem>
                  <MenuItem value="CO">Colorado</MenuItem>
                  <MenuItem value="CT">Connecticut</MenuItem>
                  <MenuItem value="DE">Delaware</MenuItem>
                  <MenuItem value="FL">Florida</MenuItem>
                  <MenuItem value="GA">Georgia</MenuItem>
                  <MenuItem value="HI">Hawaii</MenuItem>
                  <MenuItem value="ID">Idaho</MenuItem>
                  <MenuItem value="IL">Illinois</MenuItem>
                  <MenuItem value="IN">Indiana</MenuItem>
                  <MenuItem value="IA">Iowa</MenuItem>
                  <MenuItem value="KS">Kansas</MenuItem>
                  <MenuItem value="KY">Kentucky</MenuItem>
                  <MenuItem value="LA">Louisiana</MenuItem>
                  <MenuItem value="ME">Maine</MenuItem>
                  <MenuItem value="MD">Maryland</MenuItem>
                  <MenuItem value="MA">Massachusetts</MenuItem>
                  <MenuItem value="MI">Michigan</MenuItem>
                  <MenuItem value="MN">Minnesota</MenuItem>
                  <MenuItem value="MS">Mississippi</MenuItem>
                  <MenuItem value="MO">Missouri</MenuItem>
                  <MenuItem value="MT">Montana</MenuItem>
                  <MenuItem value="NE">Nebraska</MenuItem>
                  <MenuItem value="NV">Nevada</MenuItem>
                  <MenuItem value="NH">New Hampshire</MenuItem>
                  <MenuItem value="NJ">New Jersey</MenuItem>
                  <MenuItem value="NM">New Mexico</MenuItem>
                  <MenuItem value="NY">New York</MenuItem>
                  <MenuItem value="NC">North Carolina</MenuItem>
                  <MenuItem value="ND">North Dakota</MenuItem>
                  <MenuItem value="OH">Ohio</MenuItem>
                  <MenuItem value="OK">Oklahoma</MenuItem>
                  <MenuItem value="OR">Oregon</MenuItem>
                  <MenuItem value="PA">Pennsylvania</MenuItem>
                  <MenuItem value="RI">Rhode Island</MenuItem>
                  <MenuItem value="SC">South Carolina</MenuItem>
                  <MenuItem value="SD">South Dakota</MenuItem>
                  <MenuItem value="TN">Tennessee</MenuItem>
                  <MenuItem value="TX">Texas</MenuItem>
                  <MenuItem value="UT">Utah</MenuItem>
                  <MenuItem value="VT">Vermont</MenuItem>
                  <MenuItem value="VA">Virginia</MenuItem>
                  <MenuItem value="WA">Washington</MenuItem>
                  <MenuItem value="WV">West Virginia</MenuItem>
                  <MenuItem value="WI">Wisconsin</MenuItem>
                  <MenuItem value="WY">Wyoming</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={driverData.city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zip Code"
                name="zip_code"
                value={driverData.zip_code}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Company Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Company Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Status</InputLabel>
                <Select
                  name="employment_status"
                  value={driverData.employment_status}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
        </Paper>

        {/* Additional Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Other ID"
                name="other_id"
                value={driverData.other_id}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={driverData.notes}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tariff"
                name="tariff"
                type="number"
                value={driverData.tariff}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MC Number"
                name="mc_number"
                value={driverData.mc_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Team Driver"
                name="team_driver"
                value={driverData.team_driver}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Per Mile"
                name="permile"
                type="number"
                value={driverData.permile}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost"
                name="cost"
                type="number"
                value={driverData.cost}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payd"
                name="payd"
                type="number"
                value={driverData.payd}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Escrow Deposit"
                name="escrow_deposit"
                type="number"
                value={driverData.escrow_deposit}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/driver/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || success}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default DriverEditPage;