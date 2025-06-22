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

const DriverExpenseCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [formData, setFormData] = useState({
    transaction_type: '+',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    driver: parseInt(id, 10)
  });

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const driver = await ApiService.getData(ENDPOINTS.DRIVER_DETAIL(id));
        setDriverData(driver);
      } catch (error) {
        console.error('Error fetching driver data:', error);
        toast.error('Error loading driver data');
      }
    };

    fetchDriverData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0
      };

      await ApiService.postData(ENDPOINTS.DRIVER_EXPENSE, submitData);
      toast.success('Expense created successfully');
      navigate(`/driver/${id}`);
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error(error.message || 'Error creating expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(`/driver/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Create Expense for {driverData?.user?.first_name} {driverData?.user?.last_name}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleInputChange}
                  label="Transaction Type"
                >
                  <MenuItem value="+">Income (+)</MenuItem>
                  <MenuItem value="-">Expense (-)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                inputProps={{
                  step: "0.01",
                  min: "0"
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expense Date"
                name="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                multiline
                rows={3}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Expense'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/driver/${id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverExpenseCreatePage; 