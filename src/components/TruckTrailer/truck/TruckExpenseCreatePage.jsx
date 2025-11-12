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

const TruckExpenseCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [truckData, setTruckData] = useState(null);
  
  // Get transaction type from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const transactionType = urlParams.get('type') === 'deduction' ? '-' : '+';
  
  const [formData, setFormData] = useState({
    transaction_type: transactionType,
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    from_date: '',
    to_date: '',
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
      navigate(`/truck/${id}`);
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
        <IconButton onClick={() => navigate(`/truck/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Create {transactionType === '+' ? 'Addition' : 'Deduction'} for Truck {truckData?.unit_number || ''}
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Date"
                name="from_date"
                type="date"
                value={formData.from_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="To Date"
                name="to_date"
                type="date"
                value={formData.to_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
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
                  {loading ? <CircularProgress size={24} /> : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TruckExpenseCreatePage;
