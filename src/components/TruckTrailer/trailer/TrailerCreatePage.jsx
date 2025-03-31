import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, MenuItem, Paper, FormControl, InputLabel, Select, OutlinedInput, NativeSelect, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import TagInput from "./TagInput";
import './CreateTruckPage.css';

const TrailerCreatePage = () => {
  const [trailerData, setTrailerData] = useState({
    make: "",
    type: "REEFER",
    ownership: "COMPANY",
    vin: "",
    owner: "RYDER",
    mc_number: "",
    year: "",
    model: "",
    unit_number: "",
    plate_number: "",
    last_annual_inspection_date: "",
    registration_expiry_date: "",
    notes: "",
    integration_eld: "ELD",
    integration_id: "",
    integration_api: "",
    driver: "",
    co_driver: "",
    drop_date: "",
    pickup_date: "",
    location: "",
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
    setTrailerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...trailerData,
      year: trailerData.year || 0,
      unit_number: trailerData.unit_number || 0,
      integration_id: 0,
      tags: trailerData.tags || 0,
    };
    try {
      const response = await ApiService.postData("/trailer/", formattedData);
      if (response) {
        navigate("/truck_trailer");
      }
    } catch (error) {
      console.error("Error creating trailer:", error);
    }
  };

  return (
    <Box className="create-truck-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" gutterBottom>
          Create Trailer
        </Typography>
        <TagInput trailerData={trailerData} handleChange={handleChange} />
      </Box>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Paper sx={{ p: 2, mb: 2, flex: '1 1 45%' }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <TextField
              label="Make"
              name="make"
              value={trailerData.make}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Type"
              name="type"
              value={trailerData.type}
              onChange={handleChange}
              select
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="REEFER">Reefer</MenuItem>
              <MenuItem value="DRYVAN">Dryvan</MenuItem>
              <MenuItem value="STEPDECK">Stepdeck</MenuItem>
              <MenuItem value="LOWBOY">Lowboy</MenuItem>
              <MenuItem value="CARHAUL">Carhaul</MenuItem>
              <MenuItem value="FLATBED">Flatbed</MenuItem>
            </TextField>
            <TextField
              label="Ownership"
              name="ownership"
              value={trailerData.ownership}
              onChange={handleChange}
              select
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="COMPANY">Company</MenuItem>
              <MenuItem value="OWNER_OPERATOR">Owner Operator</MenuItem>
            </TextField>
            <TextField
              label="VIN"
              name="vin"
              value={trailerData.vin}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Owner"
              name="owner"
              value={trailerData.owner}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="MC Number"
              name="mc_number"
              value={trailerData.mc_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Year"
              name="year"
              type="number"
              value={trailerData.year}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Model"
              name="model"
              value={trailerData.model}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Unit Number"
              name="unit_number"
              type="number"
              value={trailerData.unit_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Plate Number"
              name="plate_number"
              value={trailerData.plate_number}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Last Annual Inspection Date"
              name="last_annual_inspection_date"
              type="date"
              value={trailerData.last_annual_inspection_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              label="Registration Expiry Date"
              name="registration_expiry_date"
              type="date"
              value={trailerData.registration_expiry_date}
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
              Additional Details
            </Typography>
            <FormControl sx={{ mb: 2, width: '100%' }} required>
              <InputLabel>Driver</InputLabel>
              <Select
                name="driver"
                value={trailerData.driver}
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
              value={trailerData.co_driver}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Drop Date"
              name="drop_date"
              type="date"
              value={trailerData.drop_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Pickup Date"
              name="pickup_date"
              type="date"
              value={trailerData.pickup_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Location"
              name="location"
              value={trailerData.location}
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
              value={trailerData.notes}
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

export default TrailerCreatePage;