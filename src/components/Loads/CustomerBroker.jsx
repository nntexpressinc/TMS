import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Paper, Button, OutlinedInput, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ApiService, ENDPOINTS } from '../../api/auth';

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

const CustomerBroker = ({ loadData, handleChange, showCustomerForm, handleToggleCustomerForm, handleAddToLoad }) => {
  const theme = useTheme();
  const [brokers, setBrokers] = useState([]);

  useEffect(() => {
    const fetchBrokers = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(ENDPOINTS.CUSTOMER_BROKER, storedAccessToken);
          setBrokers(data);
        } catch (error) {
          console.error("Error fetching brokers:", error);
        }
      }
    };

    fetchBrokers();
  }, []);

  const handleAddCustomer = async () => {
    const formData = new FormData();
    formData.append("company_name", loadData.new_customer_company_name?.trim() ? loadData.new_customer_company_name : null);
    formData.append("contact_number", loadData.new_customer_contact_number?.trim() ? loadData.new_customer_contact_number : null);
    formData.append("email_address", loadData.new_customer_email_address?.trim() ? loadData.new_customer_email_address : null);
    formData.append("mc_number", loadData.new_customer_mc_number?.trim() ? loadData.new_customer_mc_number : null);
    formData.append("address1", loadData.new_customer_address1?.trim() ? loadData.new_customer_address1 : null);
    formData.append("address2", loadData.new_customer_address2?.trim() ? loadData.new_customer_address2 : null);
    formData.append("country", loadData.new_customer_country?.trim() ? loadData.new_customer_country : null);
    formData.append("state", loadData.new_customer_state?.trim() ? loadData.new_customer_state : null);
    formData.append("city", loadData.new_customer_city?.trim() ? loadData.new_customer_city : null);
    formData.append("zip_code", loadData.new_customer_zip_code?.trim() ? loadData.new_customer_zip_code : null);

    try {
      const response = await ApiService.postData(ENDPOINTS.CUSTOMER_BROKER, formData);
      setBrokers([...brokers, response]);
      handleChange({ target: { name: 'customer_broker', value: response.id } });
      handleToggleCustomerForm();
    } catch (error) {
      console.error("Error creating customer broker:", error);
    }
  };

  const selectedBroker = brokers.find(b => b.id === loadData.customer_broker);

  const handleAddToLoadClick = () => {
    handleChange({ target: { name: 'customer_broker', value: selectedBroker } });
    handleAddToLoad(selectedBroker);
  };

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Customer Broker
      </Typography>
      <FormControl sx={{ mb: 2, width: '300px', mr: 2 }}>
        <InputLabel>Customer Broker</InputLabel>
        <Select
          name="customer_broker"
          value={loadData.customer_broker || ''}
          onChange={(e) => handleChange({ target: { name: 'customer_broker', value: e.target.value } })}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
        >
          {brokers.map(broker => (
            <MenuItem key={broker.id} value={broker.id}>
              {broker.company_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedBroker && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <Typography variant="subtitle1" gutterBottom>Broker Details</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2"><strong>Company Name:</strong> {selectedBroker.company_name}</Typography>
          <Typography variant="body2"><strong>Contact Number:</strong> {selectedBroker.contact_number}</Typography>
          <Typography variant="body2"><strong>Email:</strong> {selectedBroker.email_address}</Typography>
          <Typography variant="body2"><strong>MC Number:</strong> {selectedBroker.mc_number}</Typography>
          <Typography variant="body2"><strong>Address:</strong> {selectedBroker.address1}, {selectedBroker.city}, {selectedBroker.state}, {selectedBroker.zip_code}</Typography>
          {loadData.customer_broker !== selectedBroker.id && (
            <Button variant="contained" color="primary" onClick={handleAddToLoadClick} sx={{ mt: 2 }}>
              Add to Load
            </Button>
          )}
        </Box>
      )}
      <Button variant="contained" color="primary" onClick={handleToggleCustomerForm} sx={{ mt: 2 }}>
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCustomer}
            sx={{ mt: 2 }}
          >
            Save Customer
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default CustomerBroker;