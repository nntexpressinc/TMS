import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert, Divider, Stepper, Step, StepLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import { toast } from "react-hot-toast";
import './DriverCreatePage.css';
import TagInput from "./TagInput";

const DriverCreatePage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
    company_id: 1,
    password: ""
  });
  const [driverData, setDriverData] = useState({
    birth_date: "",
    employment_status: "",
    telegram_username: "",
    driver_status: "",
    company_name: "",
    driver_license_id: "",
    dl_class: "",
    driver_type: "",
    driver_license_state: "",
    driver_license_expiration: "",
    other_id: "",
    notes: "",
    tariff: "",
    mc_number: "",
    team_driver: "",
    permile: "",
    cost: "",
    payd: "",
    escrow_deposit: "",
    motive_id: "",
    assigned_truck: "",
    assigned_trailer: "",
    assigned_dispatcher: "",
    driver_tags: ""
  });

  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [createdUserId, setCreatedUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucksData, trailersData, dispatchersData] = await Promise.all([
          ApiService.getData('/truck/'),
          ApiService.getData('/trailer/'),
          ApiService.getData('/dispatcher/')
        ]);
        setTrucks(trucksData);
        setTrailers(trailersData);
        setDispatchers(dispatchersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const userDataToSend = {
        email: userData.email,
        company_name: userData.company_name,
        first_name: userData.first_name,
        last_name: userData.last_name,
        telephone: userData.telephone,
        callphone: userData.callphone,
        city: userData.city,
        address: userData.address,
        country: userData.country,
        state: userData.state,
        postal_zip: userData.postal_zip ? parseInt(userData.postal_zip) : null,
        ext: userData.ext ? parseInt(userData.ext) : null,
        fax: userData.fax,
        role: "driver",
        company_id: 1,
        password: userData.password
      };
      
      const response = await ApiService.postRegister('/auth/register/', userDataToSend);
      setCreatedUserId(response.id);
      
      setDriverData(prevData => ({
        ...prevData,
        user: response.id,
        first_name: response.first_name,
        last_name: response.last_name,
        contact_number: response.telephone,
        email_address: response.email,
        company_name: response.company_name
      }));

      setSuccess(true);
      handleNext();
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setError(err.response?.data?.detail || err.response?.data?.password || err.response?.data?.email || err.response?.data?.ext || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (!storedAccessToken) {
        throw new Error("No access token found");
      }

      // Get user ID from localStorage
      const userId = localStorage.getItem("userid");
      if (!userId) {
        throw new Error("No user ID found");
      }

      const driverDataToSend = {
        ...driverData,
        user: parseInt(userId), // Add user ID from localStorage
        birth_date: driverData.birth_date || null,
        employment_status: driverData.employment_status || null,
        telegram_username: driverData.telegram_username || null,
        driver_status: driverData.driver_status || null,
        driver_license_id: driverData.driver_license_id || null,
        dl_class: driverData.dl_class || null,
        driver_type: driverData.driver_type || null,
        driver_license_state: driverData.driver_license_state || null,
        driver_license_expiration: driverData.driver_license_expiration || null,
        other_id: driverData.other_id || null,
        notes: driverData.notes || null,
        tariff: driverData.tariff ? parseFloat(driverData.tariff) : null,
        mc_number: driverData.mc_number || null,
        team_driver: driverData.team_driver || null,
        permile: driverData.permile ? parseFloat(driverData.permile) : null,
        cost: driverData.cost ? parseFloat(driverData.cost) : null,
        payd: driverData.payd ? parseFloat(driverData.payd) : null,
        escrow_deposit: driverData.escrow_deposit ? parseFloat(driverData.escrow_deposit) : null,
        motive_id: driverData.motive_id || null,
        assigned_truck: driverData.assigned_truck || null,
        assigned_trailer: driverData.assigned_trailer || null,
        assigned_dispatcher: driverData.assigned_dispatcher || null
      };

      const response = await ApiService.postData("/driver/", driverDataToSend, storedAccessToken);
      toast.success("Driver created successfully");
      navigate("/driver");
    } catch (error) {
      console.error("Error creating driver:", error);
      setError(error.message || "Failed to create driver");
      toast.error(error.message || "Failed to create driver");
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Create User Account', 'Add Driver Information'];

  return (
    <Box className="create-driver-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" gutterBottom>
          Create Driver
        </Typography>
        <TagInput driverData={driverData} handleChange={handleDriverChange} />
      </Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <form onSubmit={handleUserSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
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
                  label="Password"
                  name="password"
                  type="password"
                  value={userData.password}
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
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User Account'}
            </Button>
          </Box>
        </form>
      )}

      {activeStep === 1 && (
        <form onSubmit={handleDriverSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
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
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
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
                    input={<OutlinedInput label="DL Class" />}
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
                    input={<OutlinedInput label="Employment Status" />}
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
                    input={<OutlinedInput label="Driver Status" />}
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
                    input={<OutlinedInput label="Driver Type" />}
                  >
                    <MenuItem value="COMPANY_DRIVER">Company Driver</MenuItem>
                    <MenuItem value="OWNER_OPERATOR">Owner Operator</MenuItem>
                    <MenuItem value="LEASE">Lease</MenuItem>
                    <MenuItem value="RENTAL">Rental</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Other ID"
                  name="other_id"
                  value={driverData.other_id}
                  onChange={handleDriverChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={driverData.notes}
                  onChange={handleDriverChange}
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
                  onChange={handleDriverChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="MC Number"
                  name="mc_number"
                  value={driverData.mc_number}
                  onChange={handleDriverChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Team Driver"
                  name="team_driver"
                  value={driverData.team_driver}
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
                  value={driverData.motive_id}
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
                    input={<OutlinedInput label="Assigned Truck" />}
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
                    input={<OutlinedInput label="Assigned Trailer" />}
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
                    input={<OutlinedInput label="Assigned Dispatcher" />}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Driver'}
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default DriverCreatePage;