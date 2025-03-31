import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import Details from './Details';
import CustomerBroker from './CustomerBroker';
import Stops from './Stops';

const LoadForm = ({ loadData, handleChange, showCustomerForm, handleToggleCustomerForm, isDetailsComplete, isCustomerBrokerComplete }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      <Details loadData={loadData} handleChange={handleChange} />
      <CustomerBroker loadData={loadData} handleChange={handleChange} showCustomerForm={showCustomerForm} handleToggleCustomerForm={handleToggleCustomerForm} />
      <Stops loadData={loadData} handleChange={handleChange} disabled={!isDetailsComplete || !isCustomerBrokerComplete} />
      <Box sx={{ width: '100%', mt: 2 }}>
        <Divider />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Fillers
        </Typography>
        {/* Add any additional filler content here */}
      </Box>
    </Box>
  );
};

export default LoadForm;