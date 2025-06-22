import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TrailerCreatePage = () => {
  const [trailerData, setTrailerData] = useState({
    make: "",
    type: "REEFER",
    ownership: "COMPANY",
    vin: "",
    owner: "",
    mc_number: "",
    year: new Date().getFullYear(),
    model: "",
    unit: null,
    plate_number: "",
    last_annual_inspection_date: "",
    registration_expiry_date: "",
    notes: "",
    integration_eld: "",
    integration_id: null,
    integration_api: "",
    driver: "",
    co_driver: "",
    drop_date: "",
    pickup_date: "",
    location: "",
    tags: null
  });

  const [error, setError] = useState(null);
  const [units, setUnits] = useState([]);
  const navigate = useNavigate();

  const trailerTypes = [
    { value: 'REEFER', label: 'Reefer' },
    { value: 'DRYVAN', label: 'Dryvan' },
    { value: 'STEPDECK', label: 'Stepdeck' },
    { value: 'LOWBOY', label: 'Lowboy' },
    { value: 'CARHAUL', label: 'Carhaul' },
    { value: 'FLATBED', label: 'Flatbed' }
  ];

  const ownershipTypes = [
    { value: 'COMPANY', label: 'Company' },
    { value: 'OWNER_OPERATOR', label: 'Owner-operator' },
    { value: 'LEASE', label: 'Lease' },
    { value: 'RENTAL', label: 'Rental' }
  ];

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await ApiService.getData('/unit/');
        setUnits(data);
      } catch (error) {
        setError("Error fetching units: " + error.message);
      }
    };

    fetchUnits();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrailerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const formattedDate = value ? new Date(value).toISOString().split('T')[0] : '';
    setTrailerData(prev => ({
      ...prev,
      [name]: formattedDate
    }));
  };

  const handleUnitChange = (event, newValue) => {
    setTrailerData(prev => ({
      ...prev,
      unit: newValue ? newValue.id : null,
      unit_number: newValue ? newValue.unit_number : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...trailerData,
        pickup_date: trailerData.pickup_date || null,
        drop_date: trailerData.drop_date || null,
        registration_expiry_date: trailerData.registration_expiry_date || null,
        last_annual_inspection_date: trailerData.last_annual_inspection_date || null,
        year: parseInt(trailerData.year) || new Date().getFullYear(),
        unit_number: trailerData.unit_number,
        integration_id: parseInt(trailerData.integration_id) || null,
      };

      const response = await ApiService.postData("/trailer/", formattedData);
      if (response) {
        const selectedUnit = units.find(unit => unit.id === trailerData.unit);
        if (selectedUnit) {
          const updatedUnit = {
            ...selectedUnit,
            trailer: [...selectedUnit.trailer, response.id]
          };
          await ApiService.putData(`/unit/${selectedUnit.id}/`, updatedUnit);
        }
        navigate("/trailer");
      }
    } catch (error) {
      console.error("Error creating trailer:", error);
      if (error.response?.data) {
        const errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value.join(', ')}`)
          .join('\n');
        setError(errorMessage);
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 3,
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        gap: 2
      }}>
        <Tooltip title="Back to Trailers">
          <IconButton 
            onClick={() => navigate('/trailer')}
            sx={{ 
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Create New Trailer
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Basic Information
                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    * Required field
                  </Typography>
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Make"
                      name="make"
                      value={trailerData.make}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Type</InputLabel>
                      <Select
                        name="type"
                        value={trailerData.type}
                        onChange={handleChange}
                        label="Type"
                      >
                        {trailerTypes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Ownership</InputLabel>
                      <Select
                        name="ownership"
                        value={trailerData.ownership}
                        onChange={handleChange}
                        label="Ownership"
                      >
                        {ownershipTypes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="VIN"
                      name="vin"
                      value={trailerData.vin}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <TextField
                      label="Owner"
                      name="owner"
                      value={trailerData.owner}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid> */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="MC Number"
                      name="mc_number"
                      value={trailerData.mc_number}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Year"
                      name="year"
                      type="number"
                      value={trailerData.year}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Model"
                      name="model"
                      value={trailerData.model}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={units}
                      getOptionLabel={(option) => `Unit ${option.unit_number}`}
                      onChange={handleUnitChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Unit Number"
                          required
                          helperText="Select unit from list"
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          Unit {option.unit_number}
                        </li>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Plate Number"
                      name="plate_number"
                      value={trailerData.plate_number}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Dates & Integration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Last Annual Inspection Date"
                      name="last_annual_inspection_date"
                      type="date"
                      value={trailerData.last_annual_inspection_date}
                      onChange={handleDateChange}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Registration Expiry Date"
                      name="registration_expiry_date"
                      type="date"
                      value={trailerData.registration_expiry_date}
                      onChange={handleDateChange}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Integration ELD"
                      name="integration_eld"
                      value={trailerData.integration_eld}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Integration ID"
                      name="integration_id"
                      type="number"
                      value={trailerData.integration_id || ''}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Integration API"
                      name="integration_api"
                      value={trailerData.integration_api}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Assignment Information
                </Typography>
                <Grid container spacing={2}>
              
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Location"
                      name="location"
                      value={trailerData.location}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Notes"
                      name="notes"
                      value={trailerData.notes}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/trailer')}
            sx={{ minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ minWidth: 120 }}
          >
            Create Trailer
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TrailerCreatePage;