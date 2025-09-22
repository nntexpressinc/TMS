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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ApiService, ENDPOINTS } from '../../api/auth';
import { getIftaRecords } from '../../api/ifta';
import { toast } from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import DriverPDF from './DriverPDF';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MdCheckCircle, MdCancel, MdPerson, MdDirectionsCar, MdPayment, MdReceipt, MdAssessment } from 'react-icons/md';
import CreateIftaModal from '../IFTA/CreateIftaModal';
import EditIftaModal from '../IFTA/EditIftaModal';

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

const DriverViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [driverData, setDriverData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [payData, setPayData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [iftaData, setIftaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [trailerData, setTrailerData] = useState(null);
  const [dispatcherData, setDispatcherData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');
  const [roles, setRoles] = useState([]);
  const [showIftaModal, setShowIftaModal] = useState(false);
  const [showEditIftaModal, setShowEditIftaModal] = useState(false);
  const [selectedIftaRecord, setSelectedIftaRecord] = useState(null);

  const payColumns = [
    {
      field: 'index',
      headerName: 'No.',
      width: 70,
      valueGetter: (params) => {
        const rowIndex = filteredPayData.findIndex(row => row.id === params.row.id);
        return rowIndex + 1;
      }
    },
    {
      field: 'pay_type',
      headerName: 'Payment Type',
      width: 130,
      valueGetter: (params) => {
        const types = {
          'Percentage': 'Percentage',
          'Per Mile': 'Per Mile',
          'Hourly': 'Hourly'
        };
        return types[params.row.pay_type] || params.row.pay_type;
      }
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 100,
      valueGetter: (params) => 'USD'
    },
    {
      field: 'standart',
      headerName: 'Standard',
      width: 100,
      valueGetter: (params) => params.row.standart || '-'
    },
    {
      field: 'additional_charges',
      headerName: 'Additional Charges',
      width: 150,
      valueGetter: (params) => params.row.additional_charges || '-'
    },
    {
      field: 'picks_per',
      headerName: 'Picks Per',
      width: 100,
      valueGetter: (params) => params.row.picks_per || '-'
    },
    {
      field: 'drops_per',
      headerName: 'Drops Per',
      width: 100,
      valueGetter: (params) => params.row.drops_per || '-'
    },
    {
      field: 'wait_time',
      headerName: 'Wait Time',
      width: 120,
      valueGetter: (params) => params.row.wait_time || '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditPay(params.row.id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => {
                setSelectedItem(params.row);
                setItemType('pay');
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const expenseColumns = [
    {
      field: 'index',
      headerName: 'No.',
      width: 70,
      valueGetter: (params) => {
        const rowIndex = filteredExpenseData.findIndex(row => row.id === params.row.id);
        return rowIndex + 1;
      }
    },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 100 },
    { field: 'transaction_type', headerName: 'Type', width: 80 },
    { field: 'expense_date', headerName: 'Date', width: 120 },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: 180,
      valueGetter: (params) => {
        if (!params.row.created_at) return '-';
        const date = new Date(params.row.created_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditExpense(params.row.id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => {
                setSelectedItem(params.row);
                setItemType('expense');
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const iftaColumns = [
    {
      field: 'index',
      headerName: 'No.',
      width: 70,
      valueGetter: (params) => {
        const rowIndex = iftaData.findIndex(row => row.id === params.row.id);
        return rowIndex + 1;
      }
    },
    {
      field: 'quarter',
      headerName: 'Quarter',
      width: 120,
      valueGetter: (params) => params.row.quarter || '-'
    },
    {
      field: 'state',
      headerName: 'State',
      width: 100,
      valueGetter: (params) => getStateFullName(params.row.state) || '-'
    },
    {
      field: 'total_miles',
      headerName: 'Total Miles',
      width: 130,
      valueGetter: (params) => {
        const miles = parseFloat(params.row.total_miles);
        return isNaN(miles) ? '-' : miles.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
    },
    {
      field: 'taxible_gallon',
      headerName: 'Taxable Gallons',
      width: 140,
      valueGetter: (params) => {
        const gallons = parseFloat(params.row.taxible_gallon);
        return isNaN(gallons) ? '-' : gallons.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
      }
    },
    {
      field: 'tax_paid_gallon',
      headerName: 'Tax Paid Gallons',
      width: 150,
      valueGetter: (params) => {
        const gallons = parseFloat(params.row.tax_paid_gallon);
        return isNaN(gallons) ? '-' : gallons.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
      }
    },
    {
      field: 'net_taxible_gallon',
      headerName: 'Net Taxable Gallons',
      width: 160,
      valueGetter: (params) => {
        const gallons = parseFloat(params.row.net_taxible_gallon);
        return isNaN(gallons) ? '-' : gallons.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
    },
    {
      field: 'tax',
      headerName: 'Tax Amount',
      width: 130,
      valueGetter: (params) => {
        const tax = parseFloat(params.row.tax);
        return isNaN(tax) ? '-' : `$${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    },
    {
      field: 'invoice_number',
      headerName: 'Invoice Number',
      width: 140,
      valueGetter: (params) => params.row.invoice_number || '-'
    },
    {
      field: 'weekly_number',
      headerName: 'Weekly Number',
      width: 130,
      valueGetter: (params) => params.row.weekly_number || '-'
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: 180,
      valueGetter: (params) => {
        if (!params.row.created_at) return '-';
        const date = new Date(params.row.created_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditIftaRecord(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDeleteIftaRecord(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driver, pay, expense, ifta, rolesData] = await Promise.all([
          ApiService.getData(ENDPOINTS.DRIVER_DETAIL(id)),
          ApiService.getData(`${ENDPOINTS.DRIVER_PAY}?driver=${id}`),
          ApiService.getData(`${ENDPOINTS.DRIVER_EXPENSE}?driver=${id}`),
          getIftaRecords(id),
          ApiService.getData(`/auth/role/`)
        ]);

        setDriverData(driver);
        setRoles(rolesData);

        if (driver.user && typeof driver.user === 'number') {
          const user = await ApiService.getData(ENDPOINTS.USER_DETAIL(driver.user));
          setUserData(user);
        }

        setPayData(pay);
        setExpenseData(expense);
        setIftaData(ifta);

        if (driver.assigned_truck) {
          const truck = await ApiService.getData(`/truck/${driver.assigned_truck}/`);
          setTruckData(truck);
        }
        if (driver.assigned_trailer) {
          const trailer = await ApiService.getData(`/trailer/${driver.assigned_trailer}/`);
          setTrailerData(trailer);
        }
        if (driver.assigned_dispatcher) {
          const dispatcher = await ApiService.getData(ENDPOINTS.DISPATCHER_DETAIL(driver.assigned_dispatcher));
          setDispatcherData(dispatcher);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditPay = (payId) => {
    navigate(`/driver/${id}/pay/${payId}/edit`);
  };

  const handleEditExpense = (expenseId) => {
    navigate(`/driver/${id}/expense/${expenseId}/edit`);
  };

  const handleCreatePay = () => {
    navigate(`/driver/${id}/pay/create`);
  };

  const handleCreateExpense = () => {
    navigate(`/driver/${id}/expense/create`);
  };

  const handleEditIfta = (iftaId) => {
    navigate(`/driver/${id}/ifta/${iftaId}/edit`);
  };

  const handleCreateIfta = () => {
    setShowIftaModal(true);
  };

  const handleEditIftaRecord = (record) => {
    setSelectedIftaRecord(record);
    setShowEditIftaModal(true);
  };

  const handleDeleteIftaRecord = (record) => {
    setSelectedItem(record);
    setItemType('ifta');
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      if (itemType === 'pay') {
        await ApiService.deleteData(ENDPOINTS.DRIVER_PAY_DETAIL(selectedItem.id));
        setPayData(payData.filter(pay => pay.id !== selectedItem.id));
        toast.success('Payment deleted successfully');
      } else if (itemType === 'expense') {
        await ApiService.deleteData(ENDPOINTS.DRIVER_EXPENSE_DETAIL(selectedItem.id));
        setExpenseData(expenseData.filter(expense => expense.id !== selectedItem.id));
        toast.success('Expense deleted successfully');
      } else if (itemType === 'ifta') {
        await ApiService.deleteData(`/ifta/${selectedItem.id}/`);
        setIftaData(iftaData.filter(ifta => ifta.id !== selectedItem.id));
        toast.success('IFTA record deleted successfully');
      }
    } catch (err) {
      console.error('Delete error:', err);
      const itemTypeText = itemType === 'pay' ? 'payment' : itemType === 'expense' ? 'expense' : 'IFTA record';
      toast.error(`Failed to delete ${itemTypeText}`);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      setItemType('');
    }
  };

  const fetchIftaData = async () => {
    try {
      const iftaData = await getIftaRecords(id);
      setIftaData(iftaData);
    } catch (err) {
      console.error('Error fetching IFTA data:', err);
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const handleDownloadPDF = async () => {
    const blob = await pdf(
      <DriverPDF
        driver={driverData}
        user={userData}
        payments={payData}
        expenses={expenseData}
        iftaRecords={iftaData}
      />
    ).toBlob();
    saveAs(blob, `driver-${driverData?.id || 'info'}.pdf`);
  };

  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value || '').then(() => {
      toast.success(`${label} copied!`);
    });
  };

  const renderValue = (value, type = 'text') => {
    if (value === null || value === undefined || value === '') return '-';

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'status':
        return (
          <Chip
            icon={value === 'ACTIVE' ? <MdCheckCircle /> : <MdCancel />}
            label={value}
            color={value === 'ACTIVE' ? 'success' : 'error'}
            size="small"
          />
        );
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

  const driverId = parseInt(id, 10);
  const filteredPayData = payData.filter(pay => pay.driver === driverId);
  const filteredExpenseData = expenseData.filter(expense => expense.driver === driverId);

  const userSections = [
    {
      title: 'Personal Information',

      fields: [
        { label: 'Email', value: driverData?.user?.email, type: 'email' },
        { label: 'First Name', value: driverData?.user?.first_name },
        { label: 'Last Name', value: driverData?.user?.last_name },
        { label: 'Phone', value: driverData?.user?.telephone },
        { label: 'Company Name', value: driverData?.user?.company_name },
      ]
    },
    {
      title: 'Address Information',

      fields: [
        { label: 'Address', value: driverData?.user?.address },
        { label: 'City', value: driverData?.user?.city },
        { label: 'State', value: getStateFullName(driverData?.user?.state) },
        { label: 'Country', value: driverData?.user?.country },
        { label: 'Postal/Zip', value: driverData?.user?.postal_zip },
      ]
    },
    {
      title: 'Additional Information',

      fields: [
        { label: 'Ext', value: driverData?.user?.ext },
        { label: 'Fax', value: driverData?.user?.fax },
        { label: 'Role', value: roles.find(r => r.id === driverData?.user?.role)?.name },
        { label: 'Company', value: driverData?.user?.company },
      ]
    }
  ];

  const driverSections = [
    {
      title: 'Driver License Information',

      fields: [
        { label: 'Driver License ID', value: driverData?.driver_license_id },
        { label: 'DL Class', value: driverData?.dl_class },
        { label: 'License State', value: getStateFullName(driverData?.driver_license_state) },
        { label: 'License Expiration', value: driverData?.driver_license_expiration, type: 'date' },
        { label: 'Other ID', value: driverData?.other_id },
      ]
    },
    {
      title: 'Employment Details',

      fields: [
        { label: 'Employment Status', value: driverData?.employment_status },
        { label: 'Driver Status', value: driverData?.driver_status },
        { label: 'Driver Type', value: driverData?.driver_type },
        { label: 'Team Driver', value: driverData?.team_driver },
        { label: 'Birth Date', value: driverData?.birth_date, type: 'date' },
      ]
    },
    {
      title: 'Contact & Communication',

      fields: [
        { label: 'Telegram', value: driverData?.telegram_username },
        { label: 'Notes', value: driverData?.notes },
      ]
    },
    {
      title: 'Financial Information',
      icon: <MdPayment />,
      fields: [
        { label: 'Tariff', value: driverData?.tariff },
        { label: 'MC Number', value: driverData?.mc_number },
        { label: 'Per Mile', value: driverData?.permile },
        { label: 'Cost', value: driverData?.cost },
        { label: 'Payd', value: driverData?.payd },
        { label: 'Escrow Deposit', value: driverData?.escrow_deposit },
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
          <Tooltip title="Back to Drivers">
            <IconButton
              onClick={() => navigate('/driver')}
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
              src={getProfilePhoto(driverData?.user?.profile_photo)}
              alt={driverData?.user?.first_name || driverData?.user?.email}
              sx={{ width: 60, height: 60, border: '3px solid #1976d2' }}
            />
            <Typography variant="h4" fontWeight="bold" color="primary">
              {driverData?.user?.first_name} {driverData?.user?.last_name}
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
            onClick={() => navigate(`/driver/${id}/edit`)}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="User Information" icon={<MdPerson />} iconPosition="start" />
          <Tab label="Driver Information" icon={<MdDirectionsCar />} iconPosition="start" />
          <Tab label="Payments" icon={<MdPayment />} iconPosition="start" />
          <Tab label="Income" icon={<MdReceipt />} iconPosition="start" />
          <Tab label="Expense" icon={<MdReceipt />} iconPosition="start" />
          <Tab label="IFTA" icon={<MdAssessment />} iconPosition="start" />
        </Tabs>

        {tabValue === 0 && driverData && driverData.user && (
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

        {tabValue === 1 && driverData && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {driverSections.map((section, index) => (
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

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdPayment />
                Payments
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreatePay}
                  size="small"
                >
                  Create Payment
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => exportToExcel(filteredPayData, 'payments.xlsx')}
                >
                  Excel
                </Button>
              </Box>
            </Box>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <DataGrid
                rows={filteredPayData}
                columns={payColumns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                autoHeight
                sx={{
                  borderRadius: 2,
                  border: 'none',
                  background: 'transparent',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                  },
                }}
              />
            </Card>
          </Box>
        )}


        {/* Income Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdReceipt />
                Income
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateExpense}
                  size="small"
                >
                  Create Income
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => exportToExcel(filteredExpenseData.filter(e => e.transaction_type === '+'), 'income.xlsx')}
                >
                  Excel
                </Button>
              </Box>
            </Box>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <DataGrid
                rows={filteredExpenseData.filter(e => e.transaction_type === '+')}
                columns={expenseColumns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                autoHeight
                sx={{
                  borderRadius: 2,
                  border: 'none',
                  background: 'transparent',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                  },
                }}
              />
            </Card>
          </Box>
        )}

        {/* Expense Tab */}
        {tabValue === 4 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdReceipt />
                Expense
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateExpense}
                  size="small"
                >
                  Create Expense
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => exportToExcel(filteredExpenseData.filter(e => e.transaction_type === '-'), 'expenses.xlsx')}
                >
                  Excel
                </Button>
              </Box>
            </Box>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <DataGrid
                rows={filteredExpenseData.filter(e => e.transaction_type === '-')}
                columns={expenseColumns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                autoHeight
                sx={{
                  borderRadius: 2,
                  border: 'none',
                  background: 'transparent',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #e0e0e0',
                  },
                }}
              />
            </Card>
          </Box>
        )}
        {tabValue === 5 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>IFTA Records</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowIftaModal(true)}
                size="small"
              >
                Create IFTA Record
              </Button>
            </Box>
            <DataGrid
              rows={iftaData.filter(r => r && r.id != null)}
              columns={[
                { field: 'quarter', headerName: 'Quarter', width: 120 },
                { field: 'state', headerName: 'State', width: 140 },
                { field: 'total_miles', headerName: 'Total Miles', width: 120 },
                { field: 'tax_paid_gallon', headerName: 'Tax Paid Gallon', width: 140, valueGetter: (params) => params.row.tax_paid_gallon || '-' },
                { field: 'tax', headerName: 'Tax', width: 100, valueGetter: (params) => params.row.tax || '-' },
                { field: 'invoice_number', headerName: 'Invoice Number', width: 140 },
                { field: 'weekly_number', headerName: 'Weekly Number', width: 140 },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 120,
                  sortable: false,
                  renderCell: (params) => (
                    <Box>
                      <IconButton onClick={() => handleEditIftaRecord(params.row)} size="small"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteIftaRecord(params.row)} size="small" color="error"><DeleteIcon /></IconButton>
                    </Box>
                  ),
                },
              ]}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              autoHeight
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                border: '1px solid #e0e0e0',
                background: '#fafbfc',
              }}
              getRowId={row => row.id}
            />

            {/* Create Modal */}
            {showIftaModal && (
              <Dialog
                open={showIftaModal}
                onClose={() => setShowIftaModal(false)}
                maxWidth="sm"
                fullWidth
                BackdropProps={{ style: { backdropFilter: 'blur(4px)' } }}
                PaperProps={{ sx: { borderRadius: 3, p: 3, boxShadow: 6 } }}
              >
                <CreateIftaModal
                  preSelectedDriver={parseInt(id, 10)}
                  drivers={[driverData]}
                  quarters={[
                    { value: 'Quarter 1', label: 'Quarter 1' },
                    { value: 'Quarter 2', label: 'Quarter 2' },
                    { value: 'Quarter 3', label: 'Quarter 3' },
                    { value: 'Quarter 4', label: 'Quarter 4' }
                  ]}
                  states={US_STATES}
                  onClose={() => setShowIftaModal(false)}
                  onSuccess={async () => {
                    await fetchIftaData(); // Refetch IFTA data
                    setShowIftaModal(false);
                    toast.success('IFTA records created successfully');
                  }}
                />
              </Dialog>
            )}

            {/* Edit Modal */}
            {showEditIftaModal && selectedIftaRecord && (
              <Dialog
                open={showEditIftaModal}
                onClose={() => setShowEditIftaModal(false)}
                maxWidth="sm"
                fullWidth
                BackdropProps={{ style: { backdropFilter: 'blur(4px)' } }}
                PaperProps={{ sx: { borderRadius: 3, p: 3, boxShadow: 6 } }}
              >
                <EditIftaModal
                  record={selectedIftaRecord}
                  drivers={[driverData]}
                  quarters={[
                    { value: 'Quarter 1', label: 'Quarter 1' },
                    { value: 'Quarter 2', label: 'Quarter 2' },
                    { value: 'Quarter 3', label: 'Quarter 3' },
                    { value: 'Quarter 4', label: 'Quarter 4' }
                  ]}
                  states={US_STATES}
                  onClose={() => setShowEditIftaModal(false)}
                  onSuccess={async () => {
                    await fetchIftaData(); // Refetch IFTA data
                    setShowEditIftaModal(false);
                    toast.success('IFTA record updated successfully');
                  }}
                />
              </Dialog>
            )}
          </Box>
        )}


      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete {itemType === 'pay' ? 'Payment' : itemType === 'expense' ? 'Expense' : 'IFTA Record'}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete this {itemType === 'pay' ? 'payment' : itemType === 'expense' ? 'expense' : 'IFTA record'}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DriverViewPage; 