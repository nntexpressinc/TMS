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
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { ApiService, ENDPOINTS } from '../../../api/auth';
import { toast } from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TruckPayEditPage = () => {
  const { id, payId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [truckData, setTruckData] = useState(null);
  const [payData, setPayData] = useState(null);
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
    const fetchData = async () => {
      try {
        const [truck, pay] = await Promise.all([
          ApiService.getData(`/truck/${id}/`),
          ApiService.getData(ENDPOINTS.DRIVER_PAY_DETAIL(payId))
        ]);
        
        setTruckData(truck);
        setPayData(pay);
        
        setFormData({
          pay_type: pay.pay_type || 'Percentage',
          currency: 'USD',
          standart: pay.standart || '',
          additional_charges: pay.additional_charges || '',
          picks_per: pay.picks_per || '',
          drops_per: pay.drops_per || '',
          wait_time: pay.wait_time || '',
          empty: pay.empty || false,
          truck: parseInt(id, 10)
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, payId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

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

      await ApiService.putData(ENDPOINTS.DRIVER_PAY_DETAIL(payId), submitData);
      toast.success('Payment updated successfully');
      navigate(`/truck/${id}`);
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(error.message || 'Error updating payment');
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
        <IconButton onClick={() => navigate(`/truck/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Edit Payment for Truck {truckData?.unit_number || ''}
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
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : 'Update Payment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TruckPayEditPage;
