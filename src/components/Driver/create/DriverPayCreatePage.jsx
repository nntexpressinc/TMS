import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button, MenuItem, FormControl, InputLabel, Select, OutlinedInput, Grid, Alert } from '@mui/material';
import { ApiService } from '../../../api/auth';

const DriverPayCreatePage = () => {
  const { id } = useParams();
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

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      await ApiService.postData('/driver/pay/', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/driver/${id}`);
      }, 2000);
    } catch (err) {
      setError('Error occurred while saving payment information');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Add New Payment
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment information added successfully
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
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
                <InputLabel>Currency</InputLabel>
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
                label="Standard"
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
                label="Additional Charges"
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
                label="For Picks"
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
                label="For Drops"
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
                label="Wait Time"
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
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverPayCreatePage; 