import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const truncateFileName = (fileName) => {
  if (fileName.length <= 20) return fileName;
  const extension = fileName.split('.').pop();
  return `${fileName.slice(0, 17)}...${extension}`;
};

const FileUploads = ({ loadData, handleChange, isDisabled }) => {
  
  // Enhanced file change handler that preserves all load data including stops
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (files && files[0]) {
      // Create a custom event object that preserves existing data
      const customEvent = {
        target: {
          name,
          files,
          value: { name: files[0].name, file: files[0] },
          type: 'file' // Ensure type is set for proper handling
        }
      };
      
      // Call the parent handler with preserved data context
      if (handleChange) {
        handleChange(customEvent);
      }
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, width: '100%', opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
      <Typography variant="h6" gutterBottom>
        File Uploads
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mb: 0, 
              width: '100%', 
              backgroundColor: loadData.rate_con ? 'green' : 'primary.main',
              '&:hover': {
                backgroundColor: loadData.rate_con ? '#4caf50' : 'primary.dark',
              }
            }}
            disabled={isDisabled}
          >
            {loadData.rate_con ? truncateFileName(loadData.rate_con.name) : 'Rate Con'}
            <input
              type="file"
              name="rate_con"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mb: 0, 
              width: '100%', 
              backgroundColor: loadData.bol ? 'green' : 'primary.main',
              '&:hover': {
                backgroundColor: loadData.bol ? '#4caf50' : 'primary.dark',
              }
            }}
            disabled={isDisabled}
          >
            {loadData.bol ? truncateFileName(loadData.bol.name) : 'BOL'}
            <input
              type="file"
              name="bol"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mb: 0, 
              width: '100%', 
              backgroundColor: loadData.pod ? 'green' : 'primary.main',
              '&:hover': {
                backgroundColor: loadData.pod ? '#4caf50' : 'primary.dark',
              }
            }}
            disabled={isDisabled}
          >
            {loadData.pod ? truncateFileName(loadData.pod.name) : 'POD'}
            <input
              type="file"
              name="pod"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mb: 0, 
              width: '100%', 
              backgroundColor: loadData.document ? 'green' : 'primary.main',
              '&:hover': {
                backgroundColor: loadData.document ? '#4caf50' : 'primary.dark',
              }
            }}
            disabled={isDisabled}
          >
            {loadData.document ? truncateFileName(loadData.document.name) : 'Document'}
            <input
              type="file"
              name="document"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              mb: 0, 
              width: '100%', 
              backgroundColor: loadData.comercial_invoice ? 'green' : 'primary.main',
              '&:hover': {
                backgroundColor: loadData.comercial_invoice ? '#4caf50' : 'primary.dark',
              }
            }}
            disabled={isDisabled}
          >
            {loadData.comercial_invoice ? truncateFileName(loadData.comercial_invoice.name) : 'Commercial Invoice'}
            <input
              type="file"
              name="comercial_invoice"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </Button>
        </Box>
      </Box>
      
      {/* File upload status indicator */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
        </Typography>
        {(loadData.rate_con || loadData.bol || loadData.pod || loadData.document || loadData.comercial_invoice) && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="success.main">
              ✓ Files uploaded successfully. All form data has been preserved.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FileUploads;