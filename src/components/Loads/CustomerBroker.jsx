import React from 'react';
import { Box, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Paper, Button, OutlinedInput } from '@mui/material';
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

const CustomerBroker = ({ loadData, handleChange, showCustomerForm, handleToggleCustomerForm }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%', opacity: loadData.id && loadData.company_name && loadData.reference_id && loadData.instructions && loadData.bills ? 1 : 0.5, pointerEvents: loadData.id && loadData.company_name && loadData.reference_id && loadData.instructions && loadData.bills ? 'auto' : 'none' }}>
      <Typography variant="h6" gutterBottom>
        Customer Broker
      </Typography>
      <FormControl sx={{ mb: 2, width: '300px', mr: 2 }}>
        <InputLabel>Customer Broker</InputLabel>
        <Select
          name="customer_broker"
          value={loadData.customer_broker}
          onChange={handleChange}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
        >
          {/* Assuming you have a list of customer brokers */}
          {/* {customerBrokers.map(broker => (
            <MenuItem key={broker.id} value={broker.id}>
              {broker.company_name}
            </MenuItem>
          ))} */}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleToggleCustomerForm}>
        {showCustomerForm ? 'Hide Customer Form' : 'Add New Customer'}
      </Button>
      {showCustomerForm && (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Company Name"
            name="new_customer_company_name"
            value={loadData.new_customer_company_name}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="Contact Number"
            name="new_customer_contact_number"
            value={loadData.new_customer_contact_number}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="Email Address"
            name="new_customer_email_address"
            value={loadData.new_customer_email_address}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="MC Number"
            name="new_customer_mc_number"
            value={loadData.new_customer_mc_number}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="Address 1"
            name="new_customer_address1"
            value={loadData.new_customer_address1}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="Address 2"
            name="new_customer_address2"
            value={loadData.new_customer_address2}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="Country"
            name="new_customer_country"
            value={loadData.new_customer_country}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="State"
            name="new_customer_state"
            value={loadData.new_customer_state}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="City"
            name="new_customer_city"
            value={loadData.new_customer_city}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <TextField
            label="Zip Code"
            name="new_customer_zip_code"
            value={loadData.new_customer_zip_code}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
          />
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Save Customer
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default CustomerBroker;