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
import { ApiService, ENDPOINTS } from '../../../api/auth';
import { toast } from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DriverPayEditPage = () => {
  const { id, payId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [payData, setPayData] = useState(null);
  const [formData, setFormData] = useState({
    pay_type: 'Percentage',
    currency: 'USD',
    standart: '',
    additional_charges: '',
    picks_per: '',
    drops_per: '',
    wait_time: '',
    driver: parseInt(id, 10)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driver, pay] = await Promise.all([
          ApiService.getData(ENDPOINTS.DRIVER_DETAIL(id)),
          ApiService.getData(ENDPOINTS.DRIVER_PAY_DETAIL(payId))
        ]);
        
        setDriverData(driver);
        setPayData(pay);
        
        setFormData({
          pay_type: pay.pay_type || 'Percentage',
          currency: 'USD',
          standart: pay.standart || '',
          additional_charges: pay.additional_charges || '',
          picks_per: pay.picks_per || '',
          drops_per: pay.drops_per || '',
          wait_time: pay.wait_time || '',
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
  }, [id, payId]);

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
      navigate(`/driver/${id}`);
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
        <IconButton onClick={() => navigate(`/driver/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Edit Payment for {driverData?.user?.first_name} {driverData?.user?.last_name}
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
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              {saving ? <CircularProgress size={24} /> : 'Update Payment'}
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

export default DriverPayEditPage; 