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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService, ENDPOINTS } from '../../../api/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

const CustomerBrokerEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_number: '',
    email_address: '',
    mc_number: '',
    pod_file: false,
    rate_con: false,
    address1: '',
    address2: '',
    country: 'USA',
    state: '',
    zip_code: '',
    city: '',
    billing_type: 'NONE',
    terms_days: '',
  });

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

  const billingTypes = [
    { value: 'NONE', label: 'None' },
    { value: 'FACTORING_COMPANY', label: 'Factoring Company' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'MANUAL', label: 'Manual' }
  ];

  useEffect(() => {
    const fetchBroker = async () => {
      try {
        const data = await ApiService.getData(ENDPOINTS.CUSTOMER_BROKER_DETAIL(id));
        setFormData(data);
      } catch (error) {
        setError('Error loading broker details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBroker();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      state: newValue ? newValue.code : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedData = {
        ...formData,
        terms_days: formData.terms_days ? new Date(formData.terms_days).toISOString() : null,
        contact_number: parseInt(formData.contact_number) || null,
        zip_code: parseInt(formData.zip_code) || null,
      };

      await ApiService.putData(ENDPOINTS.CUSTOMER_BROKER_DETAIL(id), formattedData);
      toast.success('Broker updated successfully');
      navigate(`/customer_broker/${id}`);
    } catch (error) {
      setError('Error updating broker: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { name: 'company_name', label: 'Company Name', required: true, maxLength: 50 },
        { name: 'contact_number', label: 'Contact Number', required: true, type: 'number' },
        { name: 'email_address', label: 'Email Address', required: true, type: 'email', maxLength: 254 },
        { name: 'mc_number', label: 'MC Number', required: true, maxLength: 50 },
      ]
    },
    {
      title: 'Address Information',
      fields: [
        { name: 'address1', label: 'Address Line 1', required: true, maxLength: 100 },
        { name: 'address2', label: 'Address Line 2', maxLength: 100 },
        { name: 'city', label: 'City', required: true, maxLength: 50 },
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
        { name: 'zip_code', label: 'ZIP Code', required: true, type: 'number' },
        { name: 'country', label: 'Country', required: true, maxLength: 50 },
      ]
    },
    {
      title: 'Billing Information',
      fields: [
        { 
          name: 'billing_type', 
          label: 'Billing Type',
          type: 'select',
          options: billingTypes,
          required: true
        },
        { name: 'terms_days', label: 'Terms (Days)', type: 'date', required: true },
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
          <Tooltip title="Back to Broker Details">
            <IconButton 
              onClick={() => navigate(`/customer_broker/${id}`)}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Edit Broker
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
                        {field.type === 'select' ? (
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
                            onChange={handleChange}
                            required={field.required}
                            type={field.type || 'text'}
                            inputProps={{
                              maxLength: field.maxLength
                            }}
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

export default CustomerBrokerEditPage; 