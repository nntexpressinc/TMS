import React, { useState } from 'react';
import { Box, TextField, Typography, Paper, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '@mui/material';
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

const Details = ({ loadData, handleChange, isDetailsComplete, drivers = [] }) => {
  const theme = useTheme();
  const [otherPays, setOtherPays] = useState([]);
  const [newOtherPay, setNewOtherPay] = useState({ amount: '', pay_type: '', note: '' });
  const [showOtherPayModal, setShowOtherPayModal] = useState(false);

  const handleDriverChange = (e) => {
    const selectedDriver = drivers.find(d => d.id === e.target.value);
    handleChange({
      target: {
        name: 'driver',
        value: selectedDriver ? { id: selectedDriver.id, first_name: selectedDriver.first_name, last_name: selectedDriver.last_name } : ''
      }
    });
  };

  const handleOtherPayChange = (e) => {
    const { name, value } = e.target;
    setNewOtherPay((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOtherPay = () => {
    setOtherPays([...otherPays, { ...newOtherPay, id: otherPays.length + 1 }]);
    setNewOtherPay({ amount: '', pay_type: '', note: '' });
  };

  const totalOtherPay = otherPays.reduce((acc, pay) => acc + parseFloat(pay.amount || 0), 0);

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
         <InputLabel>Driver</InputLabel>
        <Select
          label="Delivery Date"
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
          value={loadData.load_pay}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
        />
        <TextField
          label="Total Pay"
          name="total_pay"
          type="number"
          value={loadData.total_pay}
          onChange={handleChange}
          sx={{ mb: 1, width: '250px', mr: 1 }}
          required
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
                <MenuItem value="DRIVERASSISTANCE">Driver Assistance</MenuItem>
                <MenuItem value="TRAILERWASH">Trailer Wash</MenuItem>
                <MenuItem value="EXCORTFEE">Excort Fee</MenuItem>
                <MenuItem value="BONUS">Bonus</MenuItem>
                <MenuItem value="CHARGEBAG">Charge Bag</MenuItem>
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
            <Button onClick={handleAddOtherPay} variant="contained" color="primary">Add</Button>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {otherPays.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell>{pay.id}</TableCell>
                  <TableCell>{pay.amount}</TableCell>
                  <TableCell>{pay.pay_type}</TableCell>
                  <TableCell>{pay.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default Details;