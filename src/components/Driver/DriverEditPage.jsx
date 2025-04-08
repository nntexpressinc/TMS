import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import './create.DriverCreatePage.css';
import TagInput from "./TagInput";

const DriverEditPage = () => {
  const { id } = useParams();
  const [driverData, setDriverData] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
    birth_date: "",
    employment_status: "",
    telegram_username: "",
    driver_status: "",
    company_name: "",
    email_address: "",
    password: "",
    driver_license_id: "",
    dl_class: "",
    driver_type: "",
    driver_license_state: "",
    driver_license_expiration: "",
    address1: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    zip_code: "",
    other_id: "",
    notes: "",
    tariff: 0,
    mc_number: "",
    team_driver: "",
    permile: 0,
    cost: 0,
    payd: 0,
    escrow_deposit: 0,
    assigned_truck: "",
    assigned_trailer: "",
    assigned_dispatcher: "",
    driver_tags: ""
  });

  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          // Fetch driver data
          const driverDetails = await ApiService.getData(`/driver/${id}/`, storedAccessToken);
          setDriverData(prevData => ({
            ...prevData,
            ...driverDetails,
            birth_date: driverDetails.birth_date || "",
            driver_license_expiration: driverDetails.driver_license_expiration || "",
            escrow_deposit: driverDetails.escrow_deposit || 0
          }));

          // Fetch related data
          const trucksData = await ApiService.getData(`/truck/`, storedAccessToken);
          const trailersData = await ApiService.getData(`/trailer/`, storedAccessToken);
          const dispatchersData = await ApiService.getData(`/dispatcher/`, storedAccessToken);
          setTrucks(trucksData);
          setTrailers(trailersData);
          setDispatchers(dispatchersData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.updateData(`/driver/${id}/`, driverData);
      if (response) {
        navigate("/driver");
      }
    } catch (error) {
      console.error("Error updating driver:", error);
    }
  };

  return (
    <Box className="create-driver-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" gutterBottom>
          Edit Driver
        </Typography>
        <TagInput driverData={driverData} handleChange={handleChange} />
      </Box>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', alignItems:'flex-start', gap: 2 }}>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <TextField
              label="First Name"
              name="first_name"
              value={driverData.first_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={driverData.last_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Contact Number"
              name="contact_number"
              value={driverData.contact_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Birth Date"
              name="birth_date"
              type="date"
              value={driverData.birth_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Telegram Username"
              name="telegram_username"
              value={driverData.telegram_username}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email Address"
              name="email_address"
              type="email"
              value={driverData.email_address}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={driverData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              License Information
            </Typography>
            <TextField
              label="Driver License ID"
              name="driver_license_id"
              value={driverData.driver_license_id}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Driver License State</InputLabel>
              <Select
                name="driver_license_state"
                value={driverData.driver_license_state}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                {/* STATE_CHOICES ni Django modelidan olish kerak */}
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
            <TextField
              label="Driver License Expiration"
              name="driver_license_expiration"
              type="date"
              value={driverData.driver_license_expiration}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
            <TextField
              label="Address 1"
              name="address1"
              value={driverData.address1}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Address 2"
              name="address2"
              value={driverData.address2}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Country"
              name="country"
              value={driverData.country}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>State</InputLabel>
              <Select
                name="state"
                value={driverData.state}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
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
            <TextField
              label="City"
              name="city"
              value={driverData.city}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Zip Code"
              name="zip_code"
              value={driverData.zip_code}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Employment Information
            </Typography>
            <FormControl fullWidth margin="normal">
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
            <FormControl fullWidth margin="normal">
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
            <FormControl fullWidth margin="normal">
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
            <TextField
              label="Company Name"
              name="company_name"
              value={driverData.company_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <TextField
              label="Other ID"
              name="other_id"
              value={driverData.other_id}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Notes"
              name="notes"
              value={driverData.notes}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              label="Tariff"
              name="tariff"
              type="number"
              value={driverData.tariff}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="MC Number"
              name="mc_number"
              value={driverData.mc_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Team Driver</InputLabel>
              <Select
                name="team_driver"
                value={driverData.team_driver}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="DRIVER_2">Driver 2</MenuItem>
                <MenuItem value="ASSIGNED_DISPATCHER">Assigned Dispatcher</MenuItem>
                <MenuItem value="PERCENT_SALARY">Percent Salary</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Per Mile"
              name="permile"
              type="number"
              value={driverData.permile}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Cost"
              name="cost"
              type="number"
              value={driverData.cost}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Payd"
              name="payd"
              type="number"
              value={driverData.payd}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Escrow Deposit"
              name="escrow_deposit"
              type="number"
              value={driverData.escrow_deposit}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Truck</InputLabel>
              <Select
                name="assigned_truck"
                value={driverData.assigned_truck || ""}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="">None</MenuItem>
                {trucks.map((truck) => (
                  <MenuItem key={truck.id} value={truck.id}>
                    {truck.make} {truck.model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Trailer</InputLabel>
              <Select
                name="assigned_trailer"
                value={driverData.assigned_trailer || ""}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="">None</MenuItem>
                {trailers.map((trailer) => (
                  <MenuItem key={trailer.id} value={trailer.id}>
                    {trailer.make} {trailer.model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned Dispatcher</InputLabel>
              <Select
                name="assigned_dispatcher"
                value={driverData.assigned_dispatcher || ""}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="">None</MenuItem>
                {dispatchers.map((dispatcher) => (
                  <MenuItem key={dispatcher.id} value={dispatcher.id}>
                    {dispatcher.first_name} {dispatcher.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            onClick={() => navigate("/driver")} 
            variant="outlined" 
            color="secondary" 
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Update
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default DriverEditPage;