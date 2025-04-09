import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert } from '@mui/material';
import { ApiService } from '../../../api/auth';

const DriverPayEditPage = () => {
  const { id, payId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pay_type: null,
    currency: null,
    standart: null,
    additional_charges: null,
    picks_per: null,
    drops_per: null,
    wait_time: null,
    driver: parseInt(id)
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pay = await ApiService.getData(`/driver/pay/${payId}/`);
        setFormData({
          ...pay,
          driver: parseInt(id)
        });
        setLoading(false);
      } catch (err) {
        setError('To\'lov ma\'lumotlarini yuklashda xatolik yuz berdi');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, payId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ApiService.updateData(`/driver/pay/${payId}/`, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/driver/${id}`);
      }, 2000);
    } catch (err) {
      setError('To\'lov ma\'lumotini saqlashda xatolik yuz berdi');
    }
  };

  if (loading) return <Typography>Yuklanmoqda...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          To'lov ma'lumotlarini tahrirlash
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            To'lov ma'lumoti muvaffaqiyatli saqlandi
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>To'lov turi</InputLabel>
                <Select
                  name="pay_type"
                  value={formData.pay_type || ''}
                  onChange={handleChange}
                  input={<OutlinedInput />}
                >
                  <MenuItem value="">Tanlanmagan</MenuItem>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="Per Mile">Per Mile</MenuItem>
                  <MenuItem value="Hourly">Hourly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Valyuta</InputLabel>
                <Select
                  name="currency"
                  value={formData.currency || ''}
                  onChange={handleChange}
                  input={<OutlinedInput />}
                >
                  <MenuItem value="">Tanlanmagan</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="CAD">CAD</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Standart"
                name="standart"
                type="number"
                value={formData.standart || ''}
                onChange={handleChange}
                inputProps={{
                  step: "0.01"
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Qo'shimcha to'lovlar"
                name="additional_charges"
                type="number"
                value={formData.additional_charges || ''}
                onChange={handleChange}
                inputProps={{
                  step: "0.01"
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Olish uchun"
                name="picks_per"
                type="number"
                value={formData.picks_per || ''}
                onChange={handleChange}
                inputProps={{
                  min: -9223372036854776000,
                  max: 9223372036854776000
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tushirish uchun"
                name="drops_per"
                type="number"
                value={formData.drops_per || ''}
                onChange={handleChange}
                inputProps={{
                  min: -9223372036854776000,
                  max: 9223372036854776000
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kutish vaqti"
                name="wait_time"
                type="number"
                value={formData.wait_time || ''}
                onChange={handleChange}
                inputProps={{
                  min: -9223372036854776000,
                  max: 9223372036854776000
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

export default DriverPayEditPage; 