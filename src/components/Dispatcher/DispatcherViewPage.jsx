import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Avatar,
  Alert,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ApiService } from '../../api/auth';
import { toast } from 'react-hot-toast';
import DispatcherPDF from './DispatcherPDF';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { MdPerson, MdWork } from 'react-icons/md';

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

const getStateFullName = (code) => {
  const found = US_STATES.find(s => s.code === code);
  return found ? `${found.code} - ${found.name}` : code;
};

const getProfilePhoto = (url) => {
  if (!url) return 'https://ui-avatars.com/api/?name=User&background=random';
  if (url.startsWith('http')) return url;
  return `https://nnt.nntexpressinc.com${url}`;
};

const DispatcherViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [dispatcherData, setDispatcherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dispatcher = await ApiService.getData(`/dispatcher/${id}/`);
        setDispatcherData(dispatcher);
        setLoading(false);
      } catch (err) {
        setError('Error loading data');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value || '').then(() => {
      toast.success(`${label} copied!`);
    });
  };

  const handleDownloadPDF = async () => {
    const blob = await pdf(
      <DispatcherPDF dispatcher={dispatcherData} user={dispatcherData?.user || {}} />
    ).toBlob();
    saveAs(blob, `dispatcher-${dispatcherData?.id || 'info'}.pdf`);
  };

  const renderValue = (value, type = 'text') => {
    if (value === null || value === undefined || value === '') return '-';
    
    switch (type) {
      case 'email':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#1976d2', textDecoration: 'underline' }}>
              {value}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(value, 'Email')}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      default:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#333' }}>
              {value.toString()}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(value, 'Value')}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const userData = dispatcherData?.user || {};

  const userSections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Email', value: userData.email, type: 'email' },
        { label: 'First Name', value: userData.first_name },
        { label: 'Last Name', value: userData.last_name },
        { label: 'Phone', value: userData.telephone },
        { label: 'Company Name', value: userData.company_name },
      ]
    },
    {
      title: 'Address Information',
      fields: [
        { label: 'Address', value: userData.address },
        { label: 'City', value: userData.city },
        { label: 'State', value: getStateFullName(userData.state) },
        { label: 'Country', value: userData.country },
        { label: 'Postal/Zip', value: userData.postal_zip },
      ]
    },
    {
      title: 'Additional Information',
      fields: [
        { label: 'Ext', value: userData.ext },
        { label: 'Fax', value: userData.fax },
        { label: 'Role', value: userData.role },
        { label: 'Company', value: userData.company },
      ]
    }
  ];

  const dispatcherSections = [
    {
      title: 'Dispatcher Details',
      fields: [
        { label: 'Nickname', value: dispatcherData.nickname },
        { label: 'Employee Status', value: dispatcherData.employee_status },
        { label: 'MC Number', value: dispatcherData.mc_number },
        { label: 'Position', value: dispatcherData.position },
        { label: 'Company Name', value: dispatcherData.company_name },
        { label: 'Office', value: dispatcherData.office },
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
          <Tooltip title="Back to Dispatchers">
            <IconButton 
              onClick={() => navigate('/dispatcher')}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={getProfilePhoto(userData.profile_photo)}
              alt={userData.first_name || userData.email}
              sx={{ width: 60, height: 60, border: '3px solid #1976d2' }}
            />
            <Typography variant="h4" fontWeight="bold" color="primary">
              {userData.first_name} {userData.last_name}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/dispatcher/edit/${id}`)}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="User Information" icon={<MdPerson />} iconPosition="start" />
          <Tab label="Dispatcher Information" icon={<MdWork />} iconPosition="start" />
        </Tabs>
        
        {tabValue === 0 && userData && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {userSections.map((section, index) => (
                <Grid item xs={12} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {section.icon}
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      <Grid container spacing={3}>
                        {section.fields.map((field, fieldIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={fieldIndex}>
                            <Box>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                {field.label}
                              </Typography>
                              {renderValue(field.value, field.type)}
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
        )}

        {tabValue === 1 && dispatcherData && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {dispatcherSections.map((section, index) => (
                <Grid item xs={12} key={index}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {section.icon}
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      <Grid container spacing={3}>
                        {section.fields.map((field, fieldIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={fieldIndex}>
                            <Box>
                              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                {field.label}
                              </Typography>
                              {renderValue(field.value, field.type)}
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
        )}
      </Paper>
    </Box>
  );
};

export default DispatcherViewPage; 