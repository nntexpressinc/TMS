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
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { ApiService, ENDPOINTS } from '../../../api/auth';
import { toast } from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TruckPayCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [truckData, setTruckData] = useState(null);
  const [formData, setFormData] = useState({
    pay_type: 'Percentage',
    currency: 'USD',
    standart: '',
    additional_charges: '',
    picks_per: '',
    drops_per: '',
    wait_time: '',
    empty: false,
    truck: parseInt(id, 10)
  });

  useEffect(() => {
    const fetchTruckData = async () => {
      try {
        const truck = await ApiService.getData(`/truck/${id}/`);
        setTruckData(truck);
      } catch (error) {
        console.error('Error fetching truck data:', error);
        toast.error('Error loading truck data');
      }
    };

    fetchTruckData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert empty strings to null for numeric fields
      const submitData = {
        ...formData,
        standart: formData.standart || null,
        additional_charges: formData.additional_charges || null,
        picks_per: formData.picks_per || null,
        drops_per: formData.drops_per || null,
        wait_time: formData.wait_time || null
      };

      await ApiService.postData(ENDPOINTS.DRIVER_PAY, submitData);
      toast.success('Payment created successfully');
      navigate(`/truck/${id}`);
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(error.message || 'Error creating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(`/truck/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Create Payment for Truck {truckData?.unit_number || ''}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  name="pay_type"
                  value={formData.pay_type}
                  onChange={handleInputChange}
                  label="Payment Type"
                >
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="Per Mile">Per Mile</MenuItem>
                  <MenuItem value="Hourly">Hourly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Standard"
                name="standart"
                type="number"
                value={formData.standart}
                onChange={handleInputChange}
                placeholder="Enter standard amount"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Additional Charges"
                name="additional_charges"
                type="number"
                value={formData.additional_charges}
                onChange={handleInputChange}
                placeholder="Enter additional charges"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Picks Per"
                name="picks_per"
                type="number"
                value={formData.picks_per}
                onChange={handleInputChange}
                placeholder="Enter picks per"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Drops Per"
                name="drops_per"
                type="number"
                value={formData.drops_per}
                onChange={handleInputChange}
                placeholder="Enter drops per"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Wait Time"
                name="wait_time"
                type="number"
                value={formData.wait_time}
                onChange={handleInputChange}
                placeholder="Enter wait time"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="empty"
                    checked={formData.empty}
                    onChange={handleInputChange}
                  />
                }
                label="Empty"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/truck/${id}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Payment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TruckPayCreatePage;
