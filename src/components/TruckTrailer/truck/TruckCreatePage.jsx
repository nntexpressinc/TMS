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
  Autocomplete,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../../../api/auth";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './CreateTruckPage.css';

const TruckCreatePage = () => {
  const [truckData, setTruckData] = useState({
    make: "",
    model: "",
    unit: null,
    plate_number: "",
    vin: "",
    year: new Date().getFullYear(),
    state: "",
    weight: "",
    registration_expiry_date: "",
    last_annual_inspection_date: "",
    color: "",
    integration_eld: "",
    integration_id: null,
    integration_api: "",
    ownership_type: "COMPANY",
    mc_number: "",
    pickup_odometer: "",
    owner: "",
    notes: "",
    assignment_status: "AVAILABLE",
    driver: "",
    co_driver: "",
    location: "",
    pickup_date: "",
    drop_date: "",
    mileage_on_pickup: "",
    mileage_on_drop: "",
    comment: "",
    tags: null
  });

  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [units, setUnits] = useState([]);
  const navigate = useNavigate();

  const states = [
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

  const integrationEldOptions = [
    { value: 'ELD', label: 'Eld' },
    { value: 'MOBILE', label: 'Mobile' },
    { value: 'TELEMATICS', label: 'Telematics' },
    { value: 'OTHER', label: 'Other' }
  ];

  const ownershipTypeOptions = [
    { value: 'COMPANY', label: 'Company' },
    { value: 'OWNER_OPERATOR', label: 'Owner-operator' },
    { value: 'LEASE', label: 'Lease' },
    { value: 'RENTAL', label: 'Rental' }
  ];

  const assignmentStatusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversData, unitsData] = await Promise.all([
          ApiService.getData('/driver/'),
          ApiService.getData('/unit/')
        ]);
        setDrivers(driversData);
        setUnits(unitsData);
      } catch (error) {
        setError("Error fetching data: " + error.message);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTruckData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    // Sanani YYYY-MM-DD formatiga o'tkazish
    const formattedDate = value ? new Date(value).toISOString().split('T')[0] : '';
    setTruckData(prev => ({
      ...prev,
      [name]: formattedDate
    }));
  };

  const handleDriverChange = (event, newValue) => {
    setTruckData(prev => ({
      ...prev,
      driver: newValue ? newValue.id : ''
    }));
  };

  const handleStateChange = (event, newValue) => {
    setTruckData(prev => ({
      ...prev,
      state: newValue ? newValue.code : ''
    }));
  };

  const handleUnitChange = (event, newValue) => {
    setTruckData(prev => ({
      ...prev,
      unit: newValue ? newValue.id : null,
      unit_number: newValue ? newValue.unit_number.toString() : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...truckData,
        pickup_date: truckData.pickup_date || null,
        drop_date: truckData.drop_date || null,
        mileage_on_pickup: truckData.mileage_on_pickup || 0,
        mileage_on_drop: truckData.mileage_on_drop || 0,
        registration_expiry_date: truckData.registration_expiry_date || null,
        last_annual_inspection_date: truckData.last_annual_inspection_date || null,
        year: parseInt(truckData.year) || new Date().getFullYear(),
        weight: parseInt(truckData.weight) || 0,
        unit_number: truckData.unit_number ? truckData.unit_number.toString() : null,
      };

      const response = await ApiService.postData("/truck/", formattedData);
      if (response) {
        // Unit ma'lumotlarini yangilash
        const selectedUnit = units.find(unit => unit.id === truckData.unit);
        if (selectedUnit) {
          const updatedUnit = {
            ...selectedUnit,
            truck: [...selectedUnit.truck, response.id]
          };
          await ApiService.putData(`/unit/${selectedUnit.id}/`, updatedUnit);
        }
        navigate("/truck");
      }
    } catch (error) {
      console.error("Error creating truck:", error);
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
        <Tooltip title="Back to Trucks">
          <IconButton 
            onClick={() => navigate('/truck')}
            sx={{ 
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Create New Truck
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
                      value={truckData.make}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Model"
                      name="model"
                      value={truckData.model}
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
                    <Autocomplete
                      options={drivers}
                      getOptionLabel={(option) => 
                        `${option.user?.first_name} ${option.user?.last_name}`
                      }
                      onChange={handleDriverChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Driver"
                          required
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          {option.user?.first_name} {option.user?.last_name}
                        </li>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Co-Driver"
                      name="co_driver"
                      value={truckData.co_driver}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <TextField
                      label="Plate Number"
                      name="plate_number"
                      value={truckData.plate_number}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid> */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="VIN"
                      name="vin"
                      value={truckData.vin}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Year"
                      name="year"
                      type="number"
                      value={truckData.year}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={states}
                      getOptionLabel={(option) => option.name}
                      onChange={handleStateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="State"
                          required
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Registration Expiry Date"
                      name="registration_expiry_date"
                      type="date"
                      value={truckData.registration_expiry_date}
                      onChange={handleDateChange}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Last Annual Inspection Date"
                      name="last_annual_inspection_date"
                      type="date"
                      value={truckData.last_annual_inspection_date}
                      onChange={handleDateChange}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
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
                  Additional Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Color"
                      name="color"
                      value={truckData.color}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Weight"
                      name="weight"
                      type="number"
                      value={truckData.weight}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="MC Number"
                      name="mc_number"
                      value={truckData.mc_number}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Integration ELD</InputLabel>
                      <Select
                        name="integration_eld"
                        value={truckData.integration_eld}
                        onChange={handleChange}
                        label="Integration ELD"
                      >
                        {integrationEldOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Integration ID"
                      name="integration_id"
                      type="number"
                      value={truckData.integration_id}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Integration API"
                      name="integration_api"
                      value={truckData.integration_api}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Ownership Type</InputLabel>
                      <Select
                        name="ownership_type"
                        value={truckData.ownership_type}
                        onChange={handleChange}
                        label="Ownership Type"
                      >
                        {ownershipTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Pickup Odometer"
                      name="pickup_odometer"
                      value={truckData.pickup_odometer}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* <Grid item xs={12}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Assignment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Assignment Status</InputLabel>
                      <Select
                        name="assignment_status"
                        value={truckData.assignment_status}
                        onChange={handleChange}
                        label="Assignment Status"
                      >
                        {assignmentStatusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
               
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Location"
                      name="location"
                      value={truckData.location}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Pickup Date"
                      name="pickup_date"
                      type="date"
                      value={truckData.pickup_date}
                      onChange={handleDateChange}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Drop Date"
                      name="drop_date"
                      type="date"
                      value={truckData.drop_date}
                      onChange={handleDateChange}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Mileage on Pickup"
                      name="mileage_on_pickup"
                      type="number"
                      value={truckData.mileage_on_pickup}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Mileage on Drop"
                      name="mileage_on_drop"
                      type="number"
                      value={truckData.mileage_on_drop}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid> */}

          <Grid item xs={12}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Additional Notes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Notes"
                      name="notes"
                      value={truckData.notes}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Comment"
                      name="comment"
                      value={truckData.comment}
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
            onClick={() => navigate('/truck')}
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
            Create Truck
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TruckCreatePage;