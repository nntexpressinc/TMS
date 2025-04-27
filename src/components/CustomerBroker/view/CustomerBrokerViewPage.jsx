import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService, ENDPOINTS } from '../../../api/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CustomerBrokerViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBroker = async () => {
      try {
        const data = await ApiService.getData(ENDPOINTS.CUSTOMER_BROKER_DETAIL(id));
        setBroker(data);
      } catch (error) {
        toast.error('Error loading broker details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBroker();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this broker?')) {
      try {
        await ApiService.deleteData(ENDPOINTS.CUSTOMER_BROKER_DETAIL(id));
        toast.success('Broker deleted successfully');
        navigate('/customer_broker');
      } catch (error) {
        toast.error('Error deleting broker: ' + error.message);
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!broker) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Broker Details', 105, 15, { align: 'center' });
    
    // Add broker information
    const brokerData = [
      ['Company Name', broker.company_name || '-'],
      ['MC Number', broker.mc_number || '-'],
      ['Contact Number', broker.contact_number || '-'],
      ['Email Address', broker.email_address || '-'],
      ['Address 1', broker.address1 || '-'],
      ['Address 2', broker.address2 || '-'],
      ['City', broker.city || '-'],
      ['State', broker.state || '-'],
      ['Zip Code', broker.zip_code || '-'],
      ['Country', broker.country || '-'],
      ['Billing Type', broker.billing_type || '-'],
      ['Terms Days', broker.terms_days || '-'],
      ['POD File', broker.pod_file ? 'Yes' : 'No'],
      ['Rate Con', broker.rate_con ? 'Yes' : 'No']
    ];

    doc.autoTable({
      startY: 25,
      head: [['Field', 'Value']],
      body: brokerData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`broker-${broker.mc_number || id}-details.pdf`);
    toast.success('PDF downloaded successfully');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!broker) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Back to Brokers">
              <IconButton 
                onClick={() => navigate('/customer_broker')}
                sx={{ 
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Broker Details
            </Typography>
          </Box>
        </Box>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="h6" color="error" align="center">
              Broker not found
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Company Name', value: broker.company_name },
        { label: 'MC Number', value: broker.mc_number },
        { label: 'Contact Number', value: broker.contact_number },
        { label: 'Email Address', value: broker.email_address },
      ]
    },
    {
      title: 'Address Information',
      fields: [
        { label: 'Address 1', value: broker.address1 },
        { label: 'Address 2', value: broker.address2 },
        { label: 'City', value: broker.city },
        { label: 'State', value: broker.state },
        { label: 'Zip Code', value: broker.zip_code },
        { label: 'Country', value: broker.country },
      ]
    },
    {
      title: 'Billing Information',
      fields: [
        { 
          label: 'Billing Type', 
          value: broker.billing_type,
          type: 'chip',
          options: {
            'NONE': { label: 'None', color: '#64748B' },
            'FACTORING_COMPANY': { label: 'Factoring Company', color: '#3B82F6' },
            'EMAIL': { label: 'Email', color: '#10B981' },
            'MANUAL': { label: 'Manual', color: '#F59E0B' }
          }
        },
        { label: 'Terms Days', value: broker.terms_days },
        { label: 'POD File', value: broker.pod_file ? 'Yes' : 'No' },
        { label: 'Rate Con', value: broker.rate_con ? 'Yes' : 'No' },
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Brokers">
            <IconButton 
              onClick={() => navigate('/customer_broker')}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Broker Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/customer_broker/${id}/edit`)}
            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {sections.map((section, index) => (
          <Grid item xs={12} key={index}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  {section.fields.map((field, fieldIndex) => (
                    <Grid item xs={12} sm={6} md={4} key={fieldIndex}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {field.label}
                        </Typography>
                        {field.type === 'chip' ? (
                          <Chip
                            label={field.options[field.value]?.label || field.value || 'N/A'}
                            sx={{
                              backgroundColor: `${field.options[field.value]?.color}15` || '#64748B15',
                              color: field.options[field.value]?.color || '#64748B',
                              height: '20px',
                              minWidth: 'auto',
                              maxWidth: '100%',
                              '& .MuiChip-label': {
                                fontSize: '0.7rem',
                                padding: '0 8px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {field.value || '-'}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CustomerBrokerViewPage; 