import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  CircularProgress,
  MenuItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Autocomplete,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../../../api/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

const TrailerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    type: '',
    ownership: '',
    vin: '',
    owner: '',
    mc_number: '',
    year: '',
    model: '',
    unit: null,
    plate_number: '',
    last_annual_inspection_date: '',
    registration_expiry_date: '',
    notes: '',
    location: '',
  });

  const [units, setUnits] = useState([]);

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
    const fetchData = async () => {
      try {
        const [trailerData, unitsData] = await Promise.all([
          ApiService.getData(`/trailer/${id}/`),
          ApiService.getData('/unit/')
        ]);
        setFormData(trailerData);
        setUnits(unitsData);
      } catch (error) {
        setError('Error loading data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  const handleUnitChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      unit: newValue ? newValue.id : null,
      unit_number: newValue ? newValue.unit_number : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedData = {
        ...formData,
        year: parseInt(formData.year) || null,
        unit_number: formData.unit_number,
        registration_expiry_date: formData.registration_expiry_date || null,
        last_annual_inspection_date: formData.last_annual_inspection_date || null,
      };

      const response = await ApiService.putData(`/trailer/${id}/`, formattedData);
      
      const selectedUnit = units.find(unit => unit.id === formData.unit);
      if (selectedUnit) {
        const updatedUnit = {
          ...selectedUnit,
          trailer: [...selectedUnit.trailer, parseInt(id)]
        };
        await ApiService.putData(`/unit/${selectedUnit.id}/`, updatedUnit);
      }

      toast.success('Trailer updated successfully');
      navigate(`/trailer/${id}`);
    } catch (error) {
      setError('Error updating trailer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { name: 'make', label: 'Trailer Number', required: true },
        { name: 'model', label: 'Model', required: true },
        { 
          name: 'unit',
          label: 'Unit Number',
          required: true,
          type: 'autocomplete',
          options: units,
          getOptionLabel: (option) => `Unit ${option.unit_number}`,
          renderOption: (props, option) => (
            <li {...props}>
              Unit {option.unit_number}
            </li>
          )
        },
        { name: 'vin', label: 'VIN', required: true },
        { name: 'year', label: 'Year', required: true, type: 'number' },
        { 
          name: 'type', 
          label: 'Type', 
          required: true,
          type: 'select',
          options: trailerTypes
        },
      ]
    },
    {
      title: 'Ownership Information',
      fields: [
        { 
          name: 'ownership', 
          label: 'Ownership Type',
          type: 'select',
          options: ownershipTypes
        },
        { name: 'owner', label: 'Owner' },
        { name: 'mc_number', label: 'MC Number' },
        { name: 'plate_number', label: 'Plate Number' },
      ]
    },
    {
      title: 'Registration & Inspection',
      fields: [
        { name: 'registration_expiry_date', label: 'Registration Expiry', type: 'date' },
        { name: 'last_annual_inspection_date', label: 'Last Annual Inspection', type: 'date' },
      ]
    },
    {
      title: 'Additional Information',
      fields: [
        { name: 'location', label: 'Location' },
        { name: 'notes', label: 'Notes', multiline: true },
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Trailer Details">
            <IconButton 
              onClick={() => navigate(`/trailer/${id}`)}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Edit Trailer
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Save Changes
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {sections.map((section, index) => (
            <Grid item xs={12} key={index}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={3}>
                    {section.fields.map((field) => (
                      <Grid item xs={12} sm={6} md={4} key={field.name}>
                        {field.type === 'autocomplete' ? (
                          <Autocomplete
                            options={field.options}
                            getOptionLabel={field.getOptionLabel}
                            onChange={handleUnitChange}
                            value={units.find(unit => unit.id === formData.unit) || 
                                   units.find(unit => unit.unit_number === formData.unit_number) || null}
                            renderOption={field.renderOption}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={field.label}
                                required={field.required}
                                helperText="Select unit from list"
                              />
                            )}
                          />
                        ) : field.type === 'select' ? (
                          <FormControl fullWidth required={field.required}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                              name={field.name}
                              value={formData[field.name] || ''}
                              onChange={handleChange}
                              label={field.label}
                            >
                              {field.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            fullWidth
                            label={field.label}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={field.type === 'date' ? handleDateChange : handleChange}
                            required={field.required}
                            type={field.type || 'text'}
                            multiline={field.multiline}
                            rows={field.multiline ? 4 : 1}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </form>
    </Box>
  );
};

export default TrailerEdit; 