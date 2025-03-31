import React from 'react';
import { Box, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Details = ({ loadData, handleChange, isDetailsComplete }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Details
      </Typography>
      <TextField
        label="Load ID"
        name="load_id"
        value={loadData.load_id}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        required
      />
      <TextField
        label="Reference ID"
        name="reference_id"
        value={loadData.reference_id}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        required
      />
      <FormControl sx={{ mb: 2, width: '300px', mr: 2 }} required>
        <InputLabel>Equipment Type</InputLabel>
        <Select
          name="equipment_type"
          value={loadData.equipment_type}
          onChange={handleChange}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
        >
          <MenuItem value="DRYVAN">Dryvan</MenuItem>
          <MenuItem value="REEFER">Reefer</MenuItem>
          <MenuItem value="CARHAUL">Carhaul</MenuItem>
          <MenuItem value="FLATBED">Flatbed</MenuItem>
          <MenuItem value="STEPDECK">Stepdeck</MenuItem>
          <MenuItem value="POWERONLY">PowerOnly</MenuItem>
          <MenuItem value="RGN">RGN</MenuItem>
          <MenuItem value="TANKERSTYLE">TankerStyle</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Pickup Time"
        name="pickup_time"
        type="datetime-local"
        value={loadData.pickup_time}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
        required
      />
      <TextField
        label="Delivery Time"
        name="delivery_time"
        type="datetime-local"
        value={loadData.delivery_time}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
        required
      />
      <TextField
        label="Load Pay"
        name="load_pay"
        type="number"
        value={loadData.load_pay}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        required
      />
      <TextField
        label="Total Pay"
        name="total_pay"
        type="number"
        value={loadData.total_pay}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        required
      />
      <TextField
        label="Per Mile"
        name="per_mile"
        type="number"
        value={loadData.per_mile}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        required
      />
      <TextField
        label="Total Miles"
        name="total_miles"
        type="number"
        value={loadData.total_miles}
        onChange={handleChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
        required
      />
    </Paper>
  );
};

export default Details;