import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert } from '@mui/material';
import { ApiService } from '../../../api/auth';

const DriverExpenseEditPage = () => {
  const { id, expenseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    transaction_type: '',
    description: '',
    amount: 0,
    expense_date: '',
    driver: parseInt(id)
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expense = await ApiService.getData(`/driver/expense/${expenseId}/`);
        setFormData({
          ...expense,
          driver: parseInt(id)
        });
        setLoading(false);
      } catch (err) {
        setError('Xarajat ma\'lumotlarini yuklashda xatolik yuz berdi');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, expenseId]);

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
      await ApiService.updateData(`/driver/expense/${expenseId}/`, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/driver/${id}`);
      }, 2000);
    } catch (err) {
      setError('Xarajat ma\'lumotini saqlashda xatolik yuz berdi');
    }
  };

  if (loading) return <Typography>Yuklanmoqda...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Xarajat ma'lumotlarini tahrirlash
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Xarajat ma'lumoti muvaffaqiyatli saqlandi
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tranzaksiya turi</InputLabel>
                <Select
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  input={<OutlinedInput />}
                >
                  <MenuItem value="INCOME">Kirim</MenuItem>
                  <MenuItem value="EXPENSE">Chiqim</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Miqdor"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                inputProps={{
                  step: "0.01"
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tavsif"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sana"
                name="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/driver/${id}`)}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Saqlash
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverExpenseEditPage; 