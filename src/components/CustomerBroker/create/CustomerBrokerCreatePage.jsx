import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import './CustomerBrokerCreatePage.css';

const CustomerBrokerCreatePage = () => {
  const [brokerData, setBrokerData] = useState({
    company_name: "",
    contact_number: "",
    email_address: "",
    mc_number: "",
    pod_file: false,
    rate_con: false,
    address1: "",
    address2: "",
    country: "",
    state: "AL",
    zip_code: "",
    city: "",
    billing_type: "NONE",
    terms_days: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrokerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.postData("/customer_broker/", brokerData);
      if (response) {
        navigate("/customer_broker");
      }
    } catch (error) {
      console.error("Error creating customer broker:", error);
    }
  };

  return (
    <Box className="create-broker-container">
      <Typography variant="h4" gutterBottom>
        Create Broker
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <TextField
              label="Company Name"
              name="company_name"
              value={brokerData.company_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Contact Number"
              name="contact_number"
              type="number"
              value={brokerData.contact_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email Address"
              name="email_address"
              type="email"
              value={brokerData.email_address}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="MC Number"
              name="mc_number"
              value={brokerData.mc_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Proof of Delivery (POD) File</InputLabel>
              <Select
                name="pod_file"
                value={brokerData.pod_file}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Rate Confirmation</InputLabel>
              <Select
                name="rate_con"
                value={brokerData.rate_con}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
            <TextField
              label="Address 1"
              name="address1"
              value={brokerData.address1}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Address 2"
              name="address2"
              value={brokerData.address2}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Country"
              name="country"
              value={brokerData.country}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>State</InputLabel>
              <Select
                name="state"
                value={brokerData.state}
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
              label="Zip Code"
              name="zip_code"
              type="number"
              value={brokerData.zip_code}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="City"
              name="city"
              value={brokerData.city}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Billing
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Billing Type</InputLabel>
              <Select
                name="billing_type"
                value={brokerData.billing_type}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="NONE">None</MenuItem>
                <MenuItem value="FACTORING_COMPANY">Factoring Company</MenuItem>
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="MANUAL">Manual</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Terms Days"
              name="terms_days"
              type="date"
              value={brokerData.terms_days}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Paper>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Create
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CustomerBrokerCreatePage;