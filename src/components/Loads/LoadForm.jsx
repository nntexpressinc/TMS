import React from 'react';
import { Box, Divider, Typography, TextField } from '@mui/material';
import Details from './Details';
import CustomerBroker from './CustomerBroker';
import Stops from './Stops';

const LoadForm = ({ loadData, drivers, dispatchers, handleChange, activeStep, showCustomerForm, handleToggleCustomerForm, isDetailsComplete, isCustomerBrokerComplete, isReadOnly = false, handleAddToLoad, handleAddOtherPay }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      <Details 
        loadData={loadData} 
        handleChange={handleChange} 
        isDetailsComplete={isDetailsComplete}
        drivers={drivers}
        dispatchers={dispatchers}
        handleAddOtherPay={handleAddOtherPay}
      />
      <CustomerBroker loadData={loadData} handleChange={handleChange} showCustomerForm={showCustomerForm} handleToggleCustomerForm={handleToggleCustomerForm} handleAddToLoad={handleAddToLoad} />
      <Stops loadData={loadData} handleChange={handleChange} disabled={!isDetailsComplete || !isCustomerBrokerComplete} />
    </Box>
  );
};

export default LoadForm;