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

const TruckExpenseEditPage = () => {
  const { id, expenseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [truckData, setTruckData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [formData, setFormData] = useState({
    transaction_type: '+',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    from_date: '',
    to_date: '',
    truck: parseInt(id, 10)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [truck, expense] = await Promise.all([
          ApiService.getData(`/truck/${id}/`),
          ApiService.getData(ENDPOINTS.DRIVER_EXPENSE_DETAIL(expenseId))
        ]);
        setTruckData(truck);
        setExpenseData(expense);
        setFormData({
          transaction_type: expense.transaction_type || '+',
          description: expense.description || '',
          amount: expense.amount || '',
          expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
          from_date: expense.from_date || '',
          to_date: expense.to_date || '',
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
  }, [id, expenseId]);

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
        amount: parseFloat(formData.amount) || 0
      };
      await ApiService.putData(ENDPOINTS.DRIVER_EXPENSE_DETAIL(expenseId), submitData);
      toast.success('Expense updated successfully');
      navigate(`/truck/${id}`);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error(error.message || 'Error updating expense');
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
          Edit {formData.transaction_type === '+' ? 'Addition' : 'Deduction'} for Truck {truckData?.unit_number || ''}
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
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : 'Update'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TruckExpenseEditPage;
