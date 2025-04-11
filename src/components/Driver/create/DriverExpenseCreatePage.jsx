import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button, MenuItem } from '@mui/material';
import { ApiService } from '../../../api/auth';
import { toast } from 'react-hot-toast';

const DriverExpenseCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    transaction_type: '+',
    description: '',
    amount: '',
    expense_date: '',
    driver: id
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ApiService.postData('/driver/expense/', formData);
      toast.success('Expense information added successfully');
      navigate(`/driver/${id}`);
    } catch (error) {
      toast.error('Error occurred while adding expense information');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Add New Expense
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              select
              label="Transaction Type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="+">Debt (+)</MenuItem>
              <MenuItem value="-">Expense (-)</MenuItem>
            </TextField>

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Date"
              name="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/driver/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverExpenseCreatePage; 