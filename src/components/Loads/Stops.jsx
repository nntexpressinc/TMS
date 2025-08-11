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
      
      // Fetch existing stops when component mounts or loadData changes
      fetchStops();
    }
  }, [loadData?.id]);

  // Function to fetch existing stops
  const fetchStops = async () => {
    if (!loadData?.id) return;
    
    try {
      // Replace with your actual API endpoint for fetching stops
      const response = await fetch(`/api/load/${loadData.id}/stops/`);
      if (response.ok) {
        const fetchedStops = await response.json();
        setStops(fetchedStops);
      }
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  // Function to format datetime for display (exactly as entered)
  const formatDateTimeForDisplay = (date, time) => {
    if (!date && !time) return 'N/A';
    
    const dateStr = date || '';
    const timeStr = time || '';
    
    if (dateStr && timeStr) {
      // Convert date from YYYY-MM-DD to DD.MM.YYYY and combine with time
      const dateParts = dateStr.split('-');
      if (dateParts.length === 3) {
        const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
        return `${formattedDate} ${timeStr}`;
      }
    }
    
    return dateStr || timeStr || 'N/A';
  };

  // Function to format datetime for storage (ISO format)
  const formatDateTimeForStorage = (date, time) => {
    if (!date || !time) return null;
    
    // Combine date and time into ISO string
    const datetime = new Date(`${date}T${time}`);
    return datetime.toISOString();
  };

  const handleStopChange = (e) => {
    const { name, value } = e.target;
    setNewStop((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddStop = async () => {
    try {
      const stopToAdd = {
        ...newStop,
        // Combine date and time for storage
        appointmentdatetime: formatDateTimeForStorage(newStop.appointmentdate, newStop.time)
      };

      // Save to backend
      const response = await fetch(`/api/load/${loadData.id}/stops/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stopToAdd)
      });

      if (response.ok) {
        const savedStop = await response.json();
        setStops(prevStops => [...prevStops, savedStop]);
        
        // Reset form
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
      } else {
        console.error('Failed to save stop');
        // Fallback: add to local state only
        setStops(prevStops => [...prevStops, stopToAdd]);
      }
    } catch (error) {
      console.error('Error adding stop:', error);
      // Fallback: add to local state only
      const stopToAdd = {
        ...newStop,
        appointmentdatetime: formatDateTimeForStorage(newStop.appointmentdate, newStop.time)
      };
      setStops(prevStops => [...prevStops, stopToAdd]);
    }

    // Reset form regardless of save success
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

  const handleRemoveStop = async (stopIndex, stopId) => {
    try {
      if (stopId) {
        // Remove from backend
        const response = await fetch(`/api/stops/${stopId}/`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          console.error('Failed to delete stop from backend');
        }
      }
      
      // Remove from local state
      setStops(prevStops => prevStops.filter((_, index) => index !== stopIndex));
    } catch (error) {
      console.error('Error removing stop:', error);
      // Still remove from local state even if backend call fails
      setStops(prevStops => prevStops.filter((_, index) => index !== stopIndex));
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Stops
      </Typography>
      
      {/* Display existing stops */}
      {stops.map((stop, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Stop {index + 1}
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              size="small"
              onClick={() => handleRemoveStop(index, stop.id)}
            >
              Remove
            </Button>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
            <Typography variant="body2"><strong>Stop Name:</strong> {stop.stop_name}</Typography>
            <Typography variant="body2"><strong>Company Name:</strong> {stop.company_name}</Typography>
            <Typography variant="body2"><strong>Contact Name:</strong> {stop.contact_name}</Typography>
            <Typography variant="body2"><strong>Reference ID:</strong> {stop.reference_id}</Typography>
            <Typography variant="body2">
              <strong>Appointment:</strong> {formatDateTimeForDisplay(stop.appointmentdate, stop.time)}
            </Typography>
            <Typography variant="body2"><strong>Address 1:</strong> {stop.address1}</Typography>
            <Typography variant="body2"><strong>Address 2:</strong> {stop.address2}</Typography>
            <Typography variant="body2"><strong>Country:</strong> {stop.country}</Typography>
            <Typography variant="body2"><strong>State:</strong> {stop.state}</Typography>
            <Typography variant="body2"><strong>City:</strong> {stop.city}</Typography>
            <Typography variant="body2"><strong>Zip Code:</strong> {stop.zip_code}</Typography>
            <Typography variant="body2"><strong>Note:</strong> {stop.note}</Typography>
          </Box>
        </Box>
      ))}

      {/* Add new stop form */}
      <Box sx={{ mt: 3, p: 2, border: '2px dashed #ccc', borderRadius: '4px' }}>
        <Typography variant="subtitle1" gutterBottom>
          Add New Stop
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, mb: 2 }}>
          <FormControl>
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
          />
          
          <TextField
            label="Contact Name"
            name="contact_name"
            value={newStop.contact_name}
            onChange={handleStopChange}
          />
          
          <TextField
            label="Reference ID"
            name="reference_id"
            value={newStop.reference_id}
            onChange={handleStopChange}
          />
          
          <TextField
            label="Appointment Date"
            name="appointmentdate"
            type="date"
            value={newStop.appointmentdate}
            onChange={handleStopChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          
          <TextField
            label="Time"
            name="time"
            type="time"
            value={newStop.time}
            onChange={handleStopChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          
          <TextField
            label="Address 1"
            name="address1"
            value={newStop.address1}
            onChange={handleStopChange}
          />
          
          <TextField
            label="Address 2"
            name="address2"
            value={newStop.address2}
            onChange={handleStopChange}
          />
          
          <TextField
            label="Country"
            name="country"
            value={newStop.country}
            onChange={handleStopChange}
          />
          
          <TextField
            label="State"
            name="state"
            value={newStop.state}
            onChange={handleStopChange}
          />
          
          <TextField
            label="City"
            name="city"
            value={newStop.city}
            onChange={handleStopChange}
          />
          
          <TextField
            label="Zip Code"
            name="zip_code"
            value={newStop.zip_code}
            onChange={handleStopChange}
          />
        </Box>
        
        <TextField
          fullWidth
          label="Note"
          name="note"
          multiline
          rows={2}
          value={newStop.note}
          onChange={handleStopChange}
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddStop}
          disabled={!newStop.company_name}
        >
          Add Stop
        </Button>
      </Box>
    </Paper>
  );
};

export default Stops;