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
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ApiService } from '../../api/auth';
import { toast } from 'react-hot-toast';
import DispatcherPDF from './DispatcherPDF';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';

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
  return `https://api1.biznes-armiya.uz${url}`;
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dispatcher')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {dispatcherData?.nickname || '-'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
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
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="User Information" />
          <Tab label="Dispatcher Information" />
        </Tabs>
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 3 }}>
                <Avatar
                  src={getProfilePhoto(userData.profile_photo)}
                  alt={userData.first_name || userData.email}
                  sx={{ width: 80, height: 80, border: '2px solid #e0e0e0' }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{userData.first_name || userData.email || '-'}</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                {[
                  { label: 'Email', value: userData.email },
                  { label: 'Company Name', value: userData.company_name },
                  { label: 'First Name', value: userData.first_name },
                  { label: 'Last Name', value: userData.last_name },
                  { label: 'Phone', value: userData.telephone },
                  { label: 'City', value: userData.city },
                  { label: 'Address', value: userData.address },
                  { label: 'Country', value: userData.country },
                  { label: 'State', value: getStateFullName(userData.state) },
                  { label: 'Postal/Zip', value: userData.postal_zip },
                  { label: 'Ext', value: userData.ext },
                  { label: 'Fax', value: userData.fax },
                  { label: 'Role', value: userData.role },
                  { label: 'Company', value: userData.company },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>{item.label}:</Typography>
                    <Typography sx={{ color: '#333', wordBreak: 'break-all' }}>{item.value ?? '-'}</Typography>
                    {item.value && (
                      <IconButton size="small" onClick={() => copyToClipboard(item.value, item.label)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Dispatcher Information</Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                {[
                  { label: 'Nickname', value: dispatcherData.nickname },
                  { label: 'Employee Status', value: dispatcherData.employee_status },
                  { label: 'MC Number', value: dispatcherData.mc_number },
                  { label: 'Position', value: dispatcherData.position },
                  { label: 'Company Name', value: dispatcherData.company_name },
                  { label: 'Office', value: dispatcherData.office },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>{item.label}:</Typography>
                    <Typography sx={{ color: '#333', wordBreak: 'break-all' }}>{item.value ?? '-'}</Typography>
                    {item.value && (
                      <IconButton size="small" onClick={() => copyToClipboard(item.value, item.label)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DispatcherViewPage; 