import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ApiService } from '../../api/auth';
import { useParams } from 'react-router-dom';

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

const Details = ({ loadData, handleChange, isDetailsComplete, drivers = [] }) => {
  const theme = useTheme();
  const { id } = useParams();
  const [otherPays, setOtherPays] = useState([]);
  const [newOtherPay, setNewOtherPay] = useState({ amount: '', pay_type: '', note: '' });
  const [showOtherPayModal, setShowOtherPayModal] = useState(false);
  const [isOtherPayCreated, setIsOtherPayCreated] = useState(false);
  const [dispatchers, setDispatchers] = useState([]);

  useEffect(() => {
    const fetchOtherPays = async () => {
      try {
        const response = await ApiService.getData('/otherpay/');
        // Filter other pays for current load ID
        const filteredOtherPays = response.filter(pay => pay.load === parseInt(id));
        setOtherPays(filteredOtherPays);
        setIsOtherPayCreated(filteredOtherPays.length > 0);
      } catch (error) {
        console.error('Error fetching other pays:', error);
      }
    };

    fetchOtherPays();
  }, [id]);

  useEffect(() => {
    const fetchDispatchers = async () => {
      try {
        const data = await ApiService.getData(`/dispatcher/`);
        setDispatchers(data);
      } catch (error) {
        console.error("Error fetching dispatchers data:", error);
      }
    };

    fetchDispatchers();
  }, []);

  const handleDriverChange = (e) => {
    const selectedDriver = drivers.find(d => d.id === e.target.value);
    handleChange({
      target: {
        name: 'driver',
        value: selectedDriver ? { id: selectedDriver.id, first_name: selectedDriver.first_name, last_name: selectedDriver.last_name } : ''
      }
    });
  };

  const handleDispatcherChange = (e) => {
    const selectedDispatcher = dispatchers.find(d => d.id === e.target.value);
    handleChange({
      target: {
        name: 'dispatcher',
        value: selectedDispatcher ? {
          id: selectedDispatcher.id,
          first_name: selectedDispatcher.first_name,
          last_name: selectedDispatcher.last_name,
        } : ''
      }
    });
  };

  const handleOtherPayChange = (e) => {
    const { name, value } = e.target;
    setNewOtherPay((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOtherPay = (pay) => {
    setOtherPays([...otherPays, pay]);
  };

  const totalOtherPay = otherPays.reduce((acc, pay) => acc + parseFloat(pay.amount || 0), 0);

  const additionalLoadPay = otherPays.reduce((acc, pay) => {
    if (pay.pay_type === 'DETENTION' || pay.pay_type === '' || pay.pay_type === 'EXTRAMILES') {
      return acc + parseFloat(pay.amount || 0);
    }
    return acc;
  }, 0);

  const totalPay = isOtherPayCreated ? parseFloat(loadData.load_pay || 0) + totalOtherPay : loadData.total_pay;

  const handleAddOtherPayClick = async () => {
    try {
      const formData = new FormData();
      formData.append('amount', newOtherPay.amount);
      formData.append('pay_type', newOtherPay.pay_type);
      formData.append('note', newOtherPay.note);
      formData.append('load', id);

      const response = await ApiService.postMediaData('/otherpay/', formData);
      setOtherPays([...otherPays, response]);
      setShowOtherPayModal(false);
      setNewOtherPay({ amount: '', pay_type: '', note: '' });
      setIsOtherPayCreated(true);
    } catch (error) {
      console.error('Error adding other pay:', error);
      if (error.response?.data?.load) {
        alert(error.response.data.load[0]);
      } else {
        alert('Failed to add other pay. Please try again.');
      }
    }
  };

  const handleDeleteOtherPay = async (payId) => {
    try {
      await ApiService.deleteData(`/otherpay/${payId}/`);
      const updatedOtherPays = otherPays.filter(p => p.id !== payId);
      setOtherPays(updatedOtherPays);
      setIsOtherPayCreated(updatedOtherPays.length > 0);
    } catch (error) {
      console.error('Error deleting other pay:', error);
      alert('Failed to delete other pay. Please try again.');
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Details
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Load Information</Typography>
        <TextField
          label="Load ID"
          name="load_id"
          value={loadData.load_id}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
        />
        <TextField
          label="Reference ID"
          name="reference_id"
          value={loadData.reference_id}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
        />
        <FormControl sx={{ mb: 1, width: '250px', mr: 1 }} required>
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
          label="Total Miles"
          name="total_miles"
          type="number"
          value={loadData.total_miles}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
        />
      </Box>
      <hr />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Date Information</Typography>
        <TextField
          label="Pickup Date"
          name="created_date"
          type="date"
          value={loadData.created_date}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          InputLabelProps={{
            shrink: true,
          }}
          required
        />
        <TextField
          label="Delivery Date"
          name="updated_date"
          type="date"
          value={loadData.updated_date}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          InputLabelProps={{
            shrink: true,
          }}
          required
        />
        <FormControl sx={{ mb: 1, width: '250px', mr: 1 }} required>
          <InputLabel>Dispatcher</InputLabel>
          <Select
            name="dispatcher"
            value={loadData.dispatcher?.id || ''}
            onChange={handleDispatcherChange}
            input={<OutlinedInput />}
            MenuProps={MenuProps}
          >
            {dispatchers.map((dispatcher) => (
              <MenuItem key={dispatcher.id} value={dispatcher.id}>
                {`${dispatcher.first_name} ${dispatcher.last_name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ mb: 1, width: '250px', mr: 1 }} required>
          <InputLabel>Driver</InputLabel>
          <Select
            name="driver"
            value={loadData.driver?.id || ''}
            onChange={handleDriverChange}
            input={<OutlinedInput />}
            MenuProps={MenuProps}
          >
            {drivers.map((driver) => (
              <MenuItem key={driver.id} value={driver.id}>
                {`${driver.first_name} ${driver.last_name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <hr />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Pay Information</Typography>
        <TextField
          label="Per Mile"
          name="per_mile"
          type="number"
          value={loadData.per_mile}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
        />
        <TextField
          label="Load Pay"
          name="load_pay"
          type="number"
          value={parseFloat(loadData.load_pay || 0) + additionalLoadPay}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
          InputProps={{
            readOnly: isOtherPayCreated,
          }}
        />
        <TextField
          label="Total Pay"
          name="total_pay"
          type="number"
          value={totalPay}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
          InputProps={{
            readOnly: isOtherPayCreated,
          }}
        />
        <TextField
          label="Total Other Pay (USD)"
          value={`$${totalOtherPay.toFixed(2)}`}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          InputProps={{
            readOnly: true,
          }}
        />
        <Button variant="outlined" onClick={() => setShowOtherPayModal(true)} sx={{ mb: 1 }}>
          + Add Other Pay
        </Button>
      </Box>
      <hr />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Other Pay</Typography>
        <Dialog open={showOtherPayModal} onClose={() => setShowOtherPayModal(false)}>
          <DialogTitle>Add Other Pay</DialogTitle>
          <DialogContent>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={newOtherPay.amount}
              onChange={handleOtherPayChange}
              sx={{ mb: 1, width: '250px', mr: 1 }}
            />
            <FormControl sx={{ mb: 1, width: '250px', mr: 1 }}>
              <InputLabel>Pay Type</InputLabel>
              <Select
                name="pay_type"
                value={newOtherPay.pay_type}
                onChange={handleOtherPayChange}
                input={<OutlinedInput />}
                MenuProps={MenuProps}
              >
                <MenuItem value="DETENTION">Detention</MenuItem>
                <MenuItem value="EQUIPMENT">Equipment</MenuItem>
                <MenuItem value="LAYOVER">Layover</MenuItem>
                <MenuItem value="LUMPER">Lumper</MenuItem>
                <MenuItem value="DRIVERASSIST">Driver Assist</MenuItem>
                <MenuItem value="TRAILERWASH">Trailer Wash</MenuItem>
                <MenuItem value="ESCORTFEE">Escort Fee</MenuItem>
                <MenuItem value="BONUS">Bonus</MenuItem>
                <MenuItem value="CHARGEBACK">Charge Back</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            {newOtherPay.pay_type === 'CHARGEBAG' && (
              <TextField
                label="Note"
                name="note"
                value={newOtherPay.note}
                onChange={handleOtherPayChange}
                sx={{ mb: 1, width: '250px', mr: 1 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowOtherPayModal(false)}>Cancel</Button>
            <Button onClick={handleAddOtherPayClick} variant="contained" color="primary">Add</Button>
          </DialogActions>
        </Dialog>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Pay Type</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {otherPays.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell>{pay.id}</TableCell>
                  <TableCell>{pay.amount}</TableCell>
                  <TableCell>{pay.pay_type}</TableCell>
                  <TableCell>{pay.note}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteOtherPay(pay.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Route Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Pickup Location"
            name="pickup_location"
            value={loadData.pickup_location || ""}
            onChange={handleChange}
            variant="outlined"
          />

          <TextField
            label="Pickup Date"
            type="date"
            name="pickup_date"
            value={loadData.pickup_date ? new Date(loadData.pickup_date).toISOString().split('T')[0] : ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Delivery Location"
            name="delivery_location"
            value={loadData.delivery_location || ""}
            onChange={handleChange}
            variant="outlined"
          />

          <TextField
            label="Delivery Date"
            type="date"
            name="delivery_date"
            value={loadData.delivery_date ? new Date(loadData.delivery_date).toISOString().split('T')[0] : ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            variant="outlined"
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default Details;