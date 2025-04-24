import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../../../api/auth';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import TruckPDF from './TruckPDF';

const TruckView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTruck = async () => {
      try {
        const data = await ApiService.getData(`/truck/${id}/`);
        setTruck(data);
      } catch (error) {
        toast.error('Error loading truck details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTruck();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this truck?')) {
      try {
        await ApiService.deleteData(`/truck/${id}/`);
        navigate('/truck');
      } catch (error) {
        setError('Error deleting truck: ' + error.message);
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const blob = await pdf(<TruckPDF truck={truck} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `truck-${truck.vin}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Error generating PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderValue = (value, type = 'text') => {
    if (value === null || value === undefined || value === '') return '-';
    
    switch (type) {
      case 'date':
        return formatDate(value);
      case 'status':
        return (
          <Chip
            icon={value === 'AVAILABLE' ? <MdCheckCircle /> : <MdCancel />}
            label={value}
            color={value === 'AVAILABLE' ? 'success' : 'error'}
            size="small"
          />
        );
      default:
        return value.toString();
    }
  };

  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Make', value: truck?.make },
        { label: 'Model', value: truck?.model },
        { label: 'Unit Number', value: truck?.unit_number },
        { label: 'VIN', value: truck?.vin },
        { label: 'Year', value: truck?.year },
        { label: 'State', value: truck?.state },
      ]
    },
    {
      title: 'Registration & Inspection',
      fields: [
        { label: 'Registration Expiry', value: truck?.registration_expiry_date, type: 'date' },
        { label: 'Last Annual Inspection', value: truck?.last_annual_inspection_date, type: 'date' },
        { label: 'Plate Number', value: truck?.plate_number },
      ]
    },
    {
      title: 'Specifications',
      fields: [
        { label: 'Weight', value: truck?.weight },
        { label: 'Color', value: truck?.color },
        { label: 'MC Number', value: truck?.mc_number },
      ]
    },
    {
      title: 'Integration Details',
      fields: [
        { label: 'Integration ELD', value: truck?.integration_eld },
        { label: 'Integration ID', value: truck?.integration_id },
        { label: 'Integration API', value: truck?.integration_api },
      ]
    },
    {
      title: 'Assignment Information',
      fields: [
        { label: 'Status', value: truck?.assignment_status, type: 'status' },
        { label: 'Driver', value: truck?.driver },
        { label: 'Co-Driver', value: truck?.co_driver },
        { label: 'Location', value: truck?.location },
      ]
    },
    {
      title: 'Trip Details',
      fields: [
        { label: 'Pickup Date', value: truck?.pickup_date, type: 'date' },
        { label: 'Drop Date', value: truck?.drop_date, type: 'date' },
        { label: 'Mileage on Pickup', value: truck?.mileage_on_pickup },
        { label: 'Mileage on Drop', value: truck?.mileage_on_drop },
      ]
    },
    {
      title: 'Additional Information',
      fields: [
        { label: 'Notes', value: truck?.notes },
        { label: 'Comment', value: truck?.comment },
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Trucks">
            <IconButton 
              onClick={() => navigate('/truck')}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Truck Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={loading}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/truck/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
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
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          {field.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {renderValue(field.value, field.type)}
                        </Typography>
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

export default TruckView; 