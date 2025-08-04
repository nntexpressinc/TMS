import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { ApiService, ENDPOINTS } from '../../api/auth';
import { getIftaRecordById, updateIftaRecord } from '../../api/ifta';
import { toast } from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const US_STATES = [
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

const QUARTERS = [
  'Quarter 1',
  'Quarter 2', 
  'Quarter 3',
  'Quarter 4'
];

const DriverIftaEditPage = () => {
  const { id, iftaId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [iftaData, setIftaData] = useState(null);
  const [formData, setFormData] = useState({
    quarter: 'Quarter 1',
    state: '',
    total_miles: '',
    tax_paid_gallon: '',
    invoice_number: '',
    weekly_number: '',
    driver: parseInt(id, 10)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driver, ifta] = await Promise.all([
          ApiService.getData(ENDPOINTS.DRIVER_DETAIL(id)),
          getIftaRecordById(iftaId)
        ]);
        
        setDriverData(driver);
        setIftaData(ifta);
        
        setFormData({
          quarter: ifta.quarter || 'Quarter 1',
          state: ifta.state || '',
          total_miles: ifta.total_miles || '',
          tax_paid_gallon: ifta.tax_paid_gallon || '',
          invoice_number: ifta.invoice_number || '',
          weekly_number: ifta.weekly_number || '',
          driver: parseInt(id, 10)
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, iftaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        total_miles: parseFloat(formData.total_miles) || 0,
        tax_paid_gallon: parseFloat(formData.tax_paid_gallon) || 0,
        weekly_number: parseInt(formData.weekly_number) || 0
      };

      await updateIftaRecord(iftaId, submitData);
      toast.success('IFTA record updated successfully');
      navigate(`/driver/${id}`);
    } catch (error) {
      console.error('Error updating IFTA record:', error);
      toast.error(error.message || 'Error updating IFTA record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(`/driver/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Edit IFTA Record for {driverData?.user?.first_name} {driverData?.user?.last_name}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Quarter</InputLabel>
                <Select
                  name="quarter"
                  value={formData.quarter}
                  onChange={handleInputChange}
                  label="Quarter"
                >
                  {QUARTERS.map((quarter) => (
                    <MenuItem key={quarter} value={quarter}>
                      {quarter}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  label="State"
                >
                  {US_STATES.map((state) => (
                    <MenuItem key={state.code} value={state.code}>
                      {state.code} - {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Miles"
                name="total_miles"
                type="number"
                value={formData.total_miles}
                onChange={handleInputChange}
                placeholder="Enter total miles"
                inputProps={{
                  step: "0.1",
                  min: "0"
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax Paid Gallons"
                name="tax_paid_gallon"
                type="number"
                value={formData.tax_paid_gallon}
                onChange={handleInputChange}
                placeholder="Enter tax paid gallons"
                inputProps={{
                  step: "0.001",
                  min: "0"
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleInputChange}
                placeholder="Enter invoice number"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weekly Number"
                name="weekly_number"
                type="number"
                value={formData.weekly_number}
                onChange={handleInputChange}
                placeholder="Enter weekly number"
                inputProps={{
                  min: "0"
                }}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              {saving ? <CircularProgress size={24} /> : 'Update IFTA Record'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/driver/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverIftaEditPage; 