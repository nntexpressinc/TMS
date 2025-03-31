import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const truncateFileName = (fileName) => {
  if (fileName.length <= 20) return fileName;
  const extension = fileName.split('.').pop();
  return `${fileName.slice(0, 17)}...${extension}`;
};

const FileUploads = ({ loadData, handleChange, isDisabled }) => {
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
            sx={{ mb: 0, width: '100%', backgroundColor: loadData.rate_con ? 'green' : 'primary.main' }}
            disabled={isDisabled}
          >
            {loadData.rate_con ? truncateFileName(loadData.rate_con.name) : 'Rate Con'}
            <input
              type="file"
              name="rate_con"
              hidden
              onChange={handleChange}
            />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 0, width: '100%', backgroundColor: loadData.bol ? 'green' : 'primary.main' }}
            disabled={isDisabled}
          >
            {loadData.bol ? truncateFileName(loadData.bol.name) : 'BOL'}
            <input
              type="file"
              name="bol"
              hidden
              onChange={handleChange}
            />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 0, width: '100%', backgroundColor: loadData.pod ? 'green' : 'primary.main' }}
            disabled={isDisabled}
          >
            {loadData.pod ? truncateFileName(loadData.pod.name) : 'POD'}
            <input
              type="file"
              name="pod"
              hidden
              onChange={handleChange}
            />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 0, width: '100%', backgroundColor: loadData.document ? 'green' : 'primary.main' }}
            disabled={isDisabled}
          >
            {loadData.document ? truncateFileName(loadData.document.name) : 'Document'}
            <input
              type="file"
              name="document"
              hidden
              onChange={handleChange}
            />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 0, width: '100%', backgroundColor: loadData.comercial_invoice ? 'green' : 'primary.main' }}
            disabled={isDisabled}
          >
            {loadData.comercial_invoice ? truncateFileName(loadData.comercial_invoice.name) : 'Commercial Invoice'}
            <input
              type="file"
              name="comercial_invoice"
              hidden
              onChange={handleChange}
            />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FileUploads;