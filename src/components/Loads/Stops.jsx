import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const Stops = ({ loadData, handleChange, disabled }) => {
  const [stops, setStops] = useState([]);
  const [newStop, setNewStop] = useState({
    id: 0,
    stop_name: 'PICKUP',
    company_name: '',
    contact_name: '',
    reference_id: '',
    appointmentdate: '',
    time: '',
    address1: '',
    address2: '',
    country: '',
    state: '',
    city: '',
    zip_code: '',
    note: '',
    load: loadData?.id || 0
  });

  useEffect(() => {
    if (loadData?.id) {
      setNewStop((prevData) => ({
        ...prevData,
        load: loadData.id
      }));
    }
  }, [loadData]);

  const handleStopChange = (e) => {
    const { name, value } = e.target;
    setNewStop((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddStop = () => {
    setStops([...stops, newStop]);
    setNewStop({
      id: stops.length + 1,
      stop_name: 'PICKUP',
      company_name: '',
      contact_name: '',
      reference_id: '',
      appointmentdate: '',
      time: '',
      address1: '',
      address2: '',
      country: '',
      state: '',
      city: '',
      zip_code: '',
      note: '',
      load: loadData?.id || 0
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Stops
      </Typography>
      {stops.map((stop, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="body1">Stop {index + 1}</Typography>
          <Typography variant="body2">Stop Name: {stop.stop_name}</Typography>
          <Typography variant="body2">Company Name: {stop.company_name}</Typography>
          <Typography variant="body2">Contact Name: {stop.contact_name}</Typography>
          <Typography variant="body2">Reference ID: {stop.reference_id}</Typography>
          <Typography variant="body2">Appointment Date: {stop.appointmentdate}</Typography>
          <Typography variant="body2">Time: {stop.time}</Typography>
          <Typography variant="body2">Address 1: {stop.address1}</Typography>
          <Typography variant="body2">Address 2: {stop.address2}</Typography>
          <Typography variant="body2">Country: {stop.country}</Typography>
          <Typography variant="body2">State: {stop.state}</Typography>
          <Typography variant="body2">City: {stop.city}</Typography>
          <Typography variant="body2">Zip Code: {stop.zip_code}</Typography>
          <Typography variant="body2">Note: {stop.note}</Typography>
        </Box>
      ))}
      <FormControl sx={{ mb: 2, width: '300px', mr: 2 }}>
        <InputLabel>Stop Name</InputLabel>
        <Select
          name="stop_name"
          value={newStop.stop_name}
          onChange={handleStopChange}
        >
          <MenuItem value="PICKUP">Pickup</MenuItem>
          <MenuItem value="DELIVERY">Delivery</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Company Name"
        name="company_name"
        value={newStop.company_name}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Contact Name"
        name="contact_name"
        value={newStop.contact_name}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Reference ID"
        name="reference_id"
        value={newStop.reference_id}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Appointment Date"
        name="appointmentdate"
        value={newStop.appointmentdate}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Time"
        name="time"
        value={newStop.time}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Address 1"
        name="address1"
        value={newStop.address1}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Address 2"
        name="address2"
        value={newStop.address2}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Country"
        name="country"
        value={newStop.country}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="State"
        name="state"
        value={newStop.state}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="City"
        name="city"
        value={newStop.city}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Zip Code"
        name="zip_code"
        value={newStop.zip_code}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <TextField
        label="Note"
        name="note"
        value={newStop.note}
        onChange={handleStopChange}
        sx={{ mb: 2, width: '300px', mr: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleAddStop} sx={{ mt: 2 }}>
        Add Stop
      </Button>
    </Paper>
  );
};

export default Stops;