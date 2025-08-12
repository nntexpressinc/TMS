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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../../../api/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TrailerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrailer = async () => {
      try {
        const data = await ApiService.getData(`/trailer/${id}/`);
        setTrailer(data);
      } catch (error) {
        toast.error('Error loading trailer details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailer();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trailer?')) {
      try {
        await ApiService.deleteData(`/trailer/${id}/`);
        toast.success('Trailer deleted successfully');
        navigate('/trailer');
      } catch (error) {
        toast.error('Error deleting trailer: ' + error.message);
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Trailer Details', 105, 15, { align: 'center' });
    
    // Add trailer information
    const trailerData = [
      ['Unit Number', trailer.unit_number || '-'],
      ['Trailer Number', trailer.make || '-'],
      ['Model', trailer.model || '-'],
      ['Year', trailer.year || '-'],  
      ['VIN', trailer.vin || '-'],
      ['Type', trailer.type || '-'],
      ['Plate Number', trailer.plate_number || '-'],
      ['MC Number', trailer.mc_number || '-'],
      ['Owner', trailer.owner || '-'],
      ['Ownership', trailer.ownership || '-'],
      ['Registration Expiry', trailer.registration_expiry_date || '-'],
      ['Last Inspection', trailer.last_annual_inspection_date || '-'],
      ['Location', trailer.location || '-'],
      ['Notes', trailer.notes || '-']
    ];

    doc.autoTable({
      startY: 25,
      head: [['Field', 'Value']],
      body: trailerData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`trailer-${trailer.unit_number || id}-details.pdf`);
    toast.success('PDF downloaded successfully');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Unit Number', value: trailer.unit_number || '-' },
        { label: 'Trailer Number', value: trailer.make },
        { label: 'Model', value: trailer.model },
        { label: 'Year', value: trailer.year },
        { label: 'VIN', value: trailer.vin },
        { label: 'Type', value: trailer.type }
      ]
    },
    {
      title: 'Registration Details',
      fields: [
        { label: 'Plate Number', value: trailer.plate_number },
        { label: 'MC Number', value: trailer.mc_number },
        { label: 'Owner', value: trailer.owner },
        { label: 'Ownership', value: trailer.ownership },
        { label: 'Registration Expiry', value: trailer.registration_expiry_date },
        { label: 'Last Annual Inspection', value: trailer.last_annual_inspection_date }
      ]
    },
    {
      title: 'Additional Information',
      fields: [
        { label: 'Location', value: trailer.location },
        { label: 'Notes', value: trailer.notes }
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Trailers">
            <IconButton 
              onClick={() => navigate('/trailer')}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Trailer Details
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
            onClick={() => navigate(`/trailer/${id}/edit`)}
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
                        <Typography variant="body1">
                          {field.value || '-'}
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

export default TrailerView; 