import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, MenuItem, FormControl, InputLabel, Select, OutlinedInput } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import './DispatcherCreatePage.css';
import TagInput from "./TagInput";

const DispatcherCreatePage = () => {
  const [dispatcherData, setDispatcherData] = useState({
    first_name: "",
    last_name: "",
    nickname: "",
    employee_status: "ACTIVE (DF)",
    mc_number: "ADMIN OR COMPANY MC",
    contact_number: "",
    position: "EMPLOYEE",
    company_name: "",
    email_address: "",
    password: "",
    office: "",
    address1: "",
    address2: "",
    country: "",
    state: "AL",
    city: "",
    zip_code: "",
    dispatcher_tags: 0
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDispatcherData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.postData("/dispatcher/", dispatcherData);
      if (response) {
        navigate("/dispatcher");
      }
    } catch (error) {
      console.error("Error creating dispatcher:", error);
    }
  };

  return (
    <Box className="create-dispatcher-container">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" gutterBottom>
                Create Dispatcher
            </Typography>
            <TagInput dispatcherData={dispatcherData} handleChange={handleChange} />
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
              value={dispatcherData.first_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={dispatcherData.last_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Nickname"
              name="nickname"
              value={dispatcherData.nickname}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Contact Number"
              name="contact_number"
              value={dispatcherData.contact_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email Address"
              name="email_address"
              type="email"
              value={dispatcherData.email_address}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={dispatcherData.password}
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
              <InputLabel>Employee Status</InputLabel>
              <Select
                name="employee_status"
                value={dispatcherData.employee_status}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="ACTIVE (DF)">ACTIVE (DF)</MenuItem>
                <MenuItem value="Terminate">Terminate</MenuItem>
                <MenuItem value="Applicant">Applicant</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="MC Number"
              name="mc_number"
              value={dispatcherData.mc_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Position</InputLabel>
              <Select
                name="position"
                value={dispatcherData.position}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Company Name"
              name="company_name"
              value={dispatcherData.company_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Office"
              name="office"
              value={dispatcherData.office}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
            <TextField
              label="Address 1"
              name="address1"
              value={dispatcherData.address1}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Address 2"
              name="address2"
              value={dispatcherData.address2}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Country"
              name="country"
              value={dispatcherData.country}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>State</InputLabel>
              <Select
                name="state"
                value={dispatcherData.state}
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
              value={dispatcherData.city}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Zip Code"
              name="zip_code"
              type="number"
              value={dispatcherData.zip_code}
              onChange={handleChange}
              fullWidth
              margin="normal"
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

export default DispatcherCreatePage;