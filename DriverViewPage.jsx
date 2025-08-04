import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditIftaModal from '../IFTA/EditIftaModal';
import CreateIftaModal from '../IFTA/CreateIftaModal';
// Add Toastify and its CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Move API service import inside src
import { ApiService } from '../../api/auth';

import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import DriverPDF from './DriverPDF';

// Add ENDPOINTS object
const ENDPOINTS = {
  DRIVER_DETAIL: (id) => `/driver/${id}/`,
  USER_DETAIL: (id) => `/auth/user/${id}/`,
  DRIVER_PAY: '/driver/pay/',
  DRIVER_PAY_DETAIL: (id) => `/driver/pay/${id}/`,
  DRIVER_EXPENSE: '/driver/expense/',
  DRIVER_EXPENSE_DETAIL: (id) => `/driver/expense/${id}/`,
  DISPATCHER_DETAIL: (id) => `/dispatcher/${id}/`,
};

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
  { code: 'KY Surcharge', name: 'Kentucky Surcharge' },
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
  return `https://blackhawks.nntexpressinc.com${url}`;
};

const DriverViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [driverData, setDriverData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [payData, setPayData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [trailerData, setTrailerData] = useState(null);
  const [dispatcherData, setDispatcherData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');
  const [roles, setRoles] = useState([]);
  const [iftaRecords, setIftaRecords] = useState([]);
  const [showIftaModal, setShowIftaModal] = useState(false);
  const [selectedIftaRecord, setSelectedIftaRecord] = useState(null);
  const [showEditIftaModal, setShowEditIftaModal] = useState(false);

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
      field: 'invoice_number',
      headerName: 'Invoice',
      width: 130,
      valueGetter: (params) => params.row.invoice_number || '-'
    },
    {
      field: 'weekly_number',
      headerName: 'Week',
      width: 130,
      valueGetter: (params) => params.row.weekly_number || '-'
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

  // Function to refetch IFTA data
  const fetchIftaData = async () => {
    try {
      const iftaData = await ApiService.getData(`/ifta?driver=${id}`);
      setIftaRecords(iftaData);
    } catch (err) {
      console.error('Error fetching IFTA data:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driver, pay, expense, rolesData, iftaData] = await Promise.all([
          ApiService.getData(ENDPOINTS.DRIVER_DETAIL(id)),
          ApiService.getData(`${ENDPOINTS.DRIVER_PAY}?driver=${id}`),
          ApiService.getData(`${ENDPOINTS.DRIVER_EXPENSE}?driver=${id}`),
          ApiService.getData(`/auth/role/`),
          ApiService.getData(`/ifta?driver=${id}`)
        ]);

        setDriverData(driver);
        setRoles(rolesData);
        setIftaRecords(iftaData);

        if (driver.user && typeof driver.user === 'number') {
          const user = await ApiService.getData(ENDPOINTS.USER_DETAIL(driver.user));
          setUserData(user);
        }

        setPayData(pay);
        setExpenseData(expense);

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

  const handleEditIftaRecord = (record) => {
    setSelectedIftaRecord(record);
    setShowEditIftaModal(true);
  };

  const handleDeleteIftaRecord = (record) => {
    setSelectedIftaRecord(record);
    setItemType('ifta');
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (itemType === 'ifta') {
        await ApiService.deleteData(`/ifta/${selectedIftaRecord.id}/`);
        await fetchIftaData(); // Refetch IFTA data instead of manual filtering
        toast.success('IFTA record deleted successfully');
      } else if (itemType === 'pay') {
        await ApiService.deleteData(ENDPOINTS.DRIVER_PAY_DETAIL(selectedItem.id));
        setPayData(payData.filter(pay => pay.id !== selectedItem.id));
        toast.success('Payment deleted successfully');
      } else {
        await ApiService.deleteData(ENDPOINTS.DRIVER_EXPENSE_DETAIL(selectedItem.id));
        setExpenseData(expenseData.filter(expense => expense.id !== selectedItem.id));
        toast.success('Expense deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error deleting record');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      setItemType('');
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
      />
    ).toBlob();
    saveAs(blob, `driver-${driverData?.id || 'info'}.pdf`);
  };

  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value || '').then(() => {
      toast.success(`${label} copied!`);
    });
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

  const thStyle = {
    border: '1px solid #e0e0e0',
    padding: '8px',
    fontWeight: 600,
    textAlign: 'center',
    background: '#f9fafb'
  };
  const tdStyle = {
    border: '1px solid #e0e0e0',
    padding: '8px',
    textAlign: 'center'
  };

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/driver')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {driverData?.user?.first_name} {driverData?.user?.last_name}
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
            onClick={() => navigate(`/driver/${id}/edit`)}
          >
            Edit
          </Button>
        </Box>
      </Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="User Information" />
          <Tab label="Driver Information" />
          <Tab label="Payments" />
          <Tab label="Expenses" />
          <Tab label="IFTA" />
        </Tabs>
        {tabValue === 0 && driverData && driverData.user && (
          <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 3 }}>
                <Avatar
                  src={getProfilePhoto(driverData.user.profile_photo)}
                  alt={driverData.user.first_name || driverData.user.email}
                  sx={{ width: 80, height: 80, border: '2px solid #e0e0e0' }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{driverData.user.first_name || driverData.user.email}</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                {[
                  { label: 'Email', value: driverData.user.email },
                  { label: 'Company Name', value: driverData.user.company_name },
                  { label: 'First Name', value: driverData.user.first_name },
                  { label: 'Last Name', value: driverData.user.last_name },
                  { label: 'Phone', value: driverData.user.telephone },
                  { label: 'City', value: driverData.user.city },
                  { label: 'Address', value: driverData.user.address },
                  { label: 'Country', value: driverData.user.country },
                  { label: 'State', value: getStateFullName(driverData.user.state) },
                  { label: 'Postal/Zip', value: driverData.user.postal_zip },
                  { label: 'Ext', value: driverData.user.ext },
                  { label: 'Fax', value: driverData.user.fax },
                  { label: 'Role', value: roles.find(r => r.id === driverData.user.role)?.name },
                  { label: 'Company', value: driverData.user.company },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>{item.label}:</Typography>
                    <Typography sx={{ color: '#333', wordBreak: 'break-all' }}>{item.value || '-'}</Typography>
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
        {tabValue === 1 && driverData && (
          <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, boxShadow: 4, border: '1px solid #e0e0e0' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Driver Information</Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                {[
                  { label: 'Birth Date', value: driverData?.birth_date },
                  { label: 'Employment Status', value: driverData?.employment_status },
                  { label: 'Telegram', value: driverData?.telegram_username },
                  { label: 'Driver Status', value: driverData?.driver_status },
                  { label: 'Driver License ID', value: driverData?.driver_license_id },
                  { label: 'DL Class', value: driverData?.dl_class },
                  { label: 'Driver Type', value: driverData?.driver_type },
                  { label: 'License State', value: getStateFullName(driverData?.driver_license_state) },
                  { label: 'License Expiration', value: driverData?.driver_license_expiration },
                  { label: 'Other ID', value: driverData?.other_id },
                  { label: 'Notes', value: driverData?.notes },
                  { label: 'Tariff', value: driverData?.tariff },
                  { label: 'MC Number', value: driverData?.mc_number },
                  { label: 'Team Driver', value: driverData?.team_driver },
                  { label: 'Per Mile', value: driverData?.permile },
                  { label: 'Cost', value: driverData?.cost },
                  { label: 'Payd', value: driverData?.payd },
                  { label: 'Escrow Deposit', value: driverData?.escrow_deposit },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>{item.label}:</Typography>
                    <Typography sx={{ color: '#333', wordBreak: 'break-all' }}>{item.value || '-'}</Typography>
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
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Payments</Typography>
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
            <DataGrid
              rows={filteredPayData}
              columns={payColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              autoHeight
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                border: '1px solid #e0e0e0',
                background: '#fafbfc',
              }}
            />
          </Box>
        )}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>Expenses</Typography>
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
                  onClick={() => exportToExcel(filteredExpenseData, 'expenses.xlsx')}
                >
                  Excel
                </Button>
              </Box>
            </Box>
            <DataGrid
              rows={filteredExpenseData}
              columns={expenseColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              autoHeight
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                border: '1px solid #e0e0e0',
                background: '#fafbfc',
              }}
            />
          </Box>
        )}
        {tabValue === 4 && (
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
              rows={iftaRecords.filter(r => r && r.id != null)}
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
        <DialogTitle>Delete {itemType === 'pay' ? 'Payment' : itemType === 'expense' ? 'Expense' : 'IFTA Record'}</DialogTitle>
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