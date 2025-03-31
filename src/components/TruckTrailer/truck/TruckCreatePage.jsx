import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, MenuItem, Paper, FormControl, InputLabel, Select, OutlinedInput, NativeSelect, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import TagInput from "./TagInput";
import './CreateTruckPage.css';

const TruckCreatePage = () => {
  const [truckData, setTruckData] = useState({
    make: "",
    model: "",
    unit_number: "",
    plate_number: "",
    vin: "",
    year: "",
    state: "AL",
    weight: "",
    registration_expiry_date: "",
    last_annual_inspection_date: "",
    color: "",
    ownership_type: "COMPANY",
    mc_number: "",
    pickup_odometer: "",
    owner: "COMPANY",
    notes: "",
    assignment_status: "AVAILABLE",
    driver: "",
    co_driver: "",
    location: "",
    pickup_date: "",
    drop_date: "",
    mileage_on_pickup: "",
    mileage_on_drop: "",
    tags: null,
  });

  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrivers = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/driver/`, storedAccessToken);
          setDrivers(data);
        } catch (error) {
          console.error("Error fetching drivers data:", error);
        }
      }
    };

    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTruckData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...truckData,
      pickup_date: truckData.pickup_date || null,
      drop_date: truckData.drop_date || null,
      mileage_on_pickup: truckData.mileage_on_pickup || 0,
      mileage_on_drop: truckData.mileage_on_drop || 0,
      integration_id: 0,
      integration_eld: "ELD",
      integration_api: "",
    };
    try {
      const response = await ApiService.postData("/truck/", formattedData);
      if (response) {
        navigate("/truck_trailer");
      }
    } catch (error) {
      console.error("Error creating truck:", error);
    }
  };

  return (
    <Box className="create-truck-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" gutterBottom>
          Create Truck
        </Typography>
        <TagInput truckData={truckData} handleChange={handleChange} />
      </Box>
      <form onSubmit={handleSubmit} >
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', alignItems:'flex-start', gap: 2 }}>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <TextField
              label="Make"
              name="make"
              value={truckData.make}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Model"
              name="model"
              value={truckData.model}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Unit Number"
              name="unit_number"
              type="number"
              value={truckData.unit_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="MC Number"
              name="mc_number"
              value={truckData.mc_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControl sx={{ mb: 2, width: '100%' }} required>
              <InputLabel>Driver</InputLabel>
              <Select
                name="driver"
                value={truckData.driver}
                onChange={handleChange}
                input={<OutlinedInput />}
              >
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.first_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Co-Driver"
              name="co_driver"
              value={truckData.co_driver}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Plate Number"
              name="plate_number"
              value={truckData.plate_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="VIN"
              name="vin"
              value={truckData.vin}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Registration Expiry Date"
              name="registration_expiry_date"
              type="date"
              value={truckData.registration_expiry_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Last Annual Inspection Date"
              name="last_annual_inspection_date"
              type="date"
              value={truckData.last_annual_inspection_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Ownership Type"
              name="ownership_type"
              value={truckData.ownership_type}
              onChange={handleChange}
              select
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="COMPANY">Company</MenuItem>
              <MenuItem value="OWNER_OPERATOR">Owner Operator</MenuItem>
            </TextField>
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Technical Details
            </Typography>
            <TextField
              label="Assignment Status"
              name="assignment_status"
              value={truckData.assignment_status}
              onChange={handleChange}
              select
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="AVAILABLE">Available</MenuItem>
              <MenuItem value="ASSIGNED">Assigned</MenuItem>
            </TextField>
            <TextField
              label="Year"
              name="year"
              type="number"
              value={truckData.year}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Weight"
              name="weight"
              type="number"
              value={truckData.weight}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Color"
              name="color"
              value={truckData.color}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Pickup Odometer"
              name="pickup_odometer"
              type="number"
              value={truckData.pickup_odometer}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Paper>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
            <Divider />
            
            <FormControl fullWidth>
              <InputLabel variant="standard" htmlFor="state">
                State
              </InputLabel>
              <NativeSelect
                value={truckData.state}
                onChange={handleChange}
                inputProps={{
                  name: 'state',
                  id: 'state',
                }}
              >
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </NativeSelect>
            </FormControl>
            <TextField
              label="Location"
              name="location"
              value={truckData.location}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <Typography variant="h6" gutterBottom>
              Note
            </Typography>
            <Divider />
            <TextField
              label="Notes"
              name="notes"
              value={truckData.notes}
              onChange={handleChange}
              fullWidth
              margin="normal"
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

export default TruckCreatePage;