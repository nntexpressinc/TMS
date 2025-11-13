import React from 'react';
import { Container, Paper, Box, Typography } from '@mui/material';
import CompanyManagement from './CompanyManagement';

const CompanyManagementPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2, 
          border: '1px solid rgba(0, 0, 0, 0.12)' 
        }}
      >
        <CompanyManagement />
      </Paper>
    </Container>
  );
};

export default CompanyManagementPage;
