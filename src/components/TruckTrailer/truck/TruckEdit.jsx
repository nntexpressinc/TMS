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
  Autocomplete,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../../../api/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

const TruckEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    unit: null,
    vin: '',
    year: '',
    state: '',
    registration_expiry_date: '',
    last_annual_inspection_date: '',
    plate_number: '',
    weight: '',
    color: '',
    mc_number: '',
    integration_eld: '',
    integration_id: '',
    integration_api: '',
    assignment_status: '',
    driver: '',
    co_driver: '',
    location: '',
    pickup_date: '',
    drop_date: '',
    mileage_on_pickup: '',
    mileage_on_drop: '',
    notes: '',
    comment: '',
  });

  const [units, setUnits] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [truckData, unitsData] = await Promise.all([
          ApiService.getData(`/truck/${id}/`),
          ApiService.getData('/unit/')
        ]);
        setFormData(truckData);
        setUnits(unitsData);
      } catch (error) {
        toast.error('Error loading data: ' + error.message);
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
      unit_number: newValue ? newValue.unit_number.toString() : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Unit number ni string formatida saqlash
      const updatedFormData = {
        ...formData,
        unit_number: formData.unit_number ? formData.unit_number.toString() : null
      };
      
      const response = await ApiService.putData(`/truck/${id}/`, updatedFormData);
      
      // Unit ma'lumotlarini yangilash
      const selectedUnit = units.find(unit => unit.id === formData.unit);
      if (selectedUnit) {
        const updatedUnit = {
          ...selectedUnit,
          truck: [...selectedUnit.truck, parseInt(id)]
        };
        await ApiService.putData(`/unit/${selectedUnit.id}/`, updatedUnit);
      }

      toast.success('Truck updated successfully');
      navigate(`/truck/${id}`);
    } catch (error) {
      toast.error('Error updating truck: ' + error.message);
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
        { name: 'make', label: 'Make', required: true },
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
          name: 'state', 
          label: 'State', 
          required: true,
          type: 'select',
          options: states.map(state => ({
            value: state.code,
            label: `${state.name} (${state.code})`
          }))
        },
      ]
    },
    {
      title: 'Registration & Inspection',
      fields: [
        { name: 'registration_expiry_date', label: 'Registration Expiry', type: 'date' },
        { name: 'last_annual_inspection_date', label: 'Last Annual Inspection', type: 'date' },
        { name: 'plate_number', label: 'Plate Number' },
      ]
    },
    {
      title: 'Specifications',
      fields: [
        { name: 'weight', label: 'Weight', type: 'number' },
        { name: 'color', label: 'Color' },
        { name: 'mc_number', label: 'MC Number' },
      ]
    },
    {
      title: 'Additional Information',
      fields: [
        { name: 'notes', label: 'Notes', multiline: true },
        { name: 'comment', label: 'Comment', multiline: true },
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Truck Details">
            <IconButton 
              onClick={() => navigate(`/truck/${id}`)}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Edit Truck
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
                          <FormControl fullWidth>
                            <InputLabel required={field.required}>
                              {field.label}
                            </InputLabel>
                            <Select
                              name={field.name}
                              value={formData[field.name] || ''}
                              onChange={handleChange}
                              required={field.required}
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

export default TruckEdit; 