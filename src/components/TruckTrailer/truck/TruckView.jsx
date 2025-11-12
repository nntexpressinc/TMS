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
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService, ENDPOINTS } from '../../../api/auth';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import { MdCheckCircle, MdCancel, MdPayment, MdReceipt } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import TruckPDF from './TruckPDF';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const TruckView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [payData, setPayData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');

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

  useEffect(() => {
    const fetchPaymentsAndExpenses = async () => {
      try {
        const [payments, expenses] = await Promise.all([
          ApiService.getData(ENDPOINTS.DRIVER_PAY),
          ApiService.getData(ENDPOINTS.DRIVER_EXPENSE)
        ]);
        setPayData(payments || []);
        setExpenseData(expenses || []);
      } catch (error) {
        console.error('Error fetching payments/expenses:', error);
      }
    };

    fetchPaymentsAndExpenses();
  }, []);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this truck?')) {
      try {
        await ApiService.deleteData(`/truck/${id}/`);
        toast.success('Truck deleted successfully');
        navigate('/truck');
      } catch (error) {
        setError('Error deleting truck: ' + error.message);
        toast.error('Error deleting truck: ' + error.message);
      }
    }
  };

  const handleCreatePay = () => {
    navigate(`/truck/${id}/pay/create`);
  };

  const handleEditPay = (payId) => {
    navigate(`/truck/${id}/pay/${payId}/edit`);
  };

  const handleCreateAddition = () => {
    navigate(`/truck/${id}/expense/create?type=addition`);
  };

  const handleCreateDeduction = () => {
    navigate(`/truck/${id}/expense/create?type=deduction`);
  };

  const handleEditExpense = (expenseId) => {
    navigate(`/truck/${id}/expense/${expenseId}/edit`);
  };

  const handleDeleteItem = async () => {
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
      }
    } catch (err) {
      console.error('Delete error:', err);
      const itemTypeText = itemType === 'pay' ? 'payment' : 'expense';
      toast.error(`Failed to delete ${itemTypeText}`);
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

  // Payment columns for DataGrid
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
    { field: 'pay_type', headerName: 'Payment Type', width: 150 },
    { field: 'standart', headerName: 'Standard', width: 120 },
    { field: 'additional_charges', headerName: 'Additional Charges', width: 150 },
    { field: 'picks_per', headerName: 'Picks Per', width: 120 },
    { field: 'drops_per', headerName: 'Drops Per', width: 120 },
    { field: 'wait_time', headerName: 'Wait Time', width: 120 },
    {
      field: 'empty',
      headerName: 'Empty',
      width: 100,
      renderCell: (params) => (
        params.row.empty ? <MdCheckCircle color="green" /> : <MdCancel color="red" />
      )
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

  // Expense columns for DataGrid
  const getExpenseColumns = (transactionType) => [
    {
      field: 'index',
      headerName: 'No.',
      width: 70,
      valueGetter: (params) => {
        const filteredData = filteredExpenseData.filter(e => e.transaction_type === transactionType);
        const rowIndex = filteredData.findIndex(row => row.id === params.row.id);
        return rowIndex + 1;
      }
    },
    { field: 'description', headerName: 'Description', width: 200 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueGetter: (params) => {
        const amount = params.row.amount || 0;
        const transactionType = params.row.transaction_type || '-';
        return transactionType === '+' ? `+$${amount}` : `-$${amount}`;
      }
    },
    { field: 'expense_date', headerName: 'Date', width: 120 },
    {
      field: 'invoice_status',
      headerName: 'Invoice Status',
      width: 130,
      valueGetter: (params) => {
        const status = params.row.invoice_status || 'Unpaid';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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

  const truckId = parseInt(id, 10);
  const filteredPayData = payData.filter(pay => pay.truck === truckId);
  const filteredExpenseData = expenseData.filter(expense => expense.truck === truckId);

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

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: '#f8f9fa',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
            }
          }}
        >
          <Tab label="Truck Details" />
          <Tab label="Payments" />
          <Tab label="Additions" />
          <Tab label="Deductions" />
        </Tabs>

        {/* Truck Details Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
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
        )}

        {/* Payments Tab */}
        {tabValue === 1 && (
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
                  onClick={() => exportToExcel(filteredPayData, 'truck-payments.xlsx')}
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

        {/* Additions Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdReceipt />
                Additions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateAddition}
                  size="small"
                >
                  Create Addition
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => exportToExcel(filteredExpenseData.filter(e => e.transaction_type === '+'), 'truck-additions.xlsx')}
                >
                  Excel
                </Button>
              </Box>
            </Box>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <DataGrid
                rows={filteredExpenseData.filter(e => e.transaction_type === '+')}
                columns={getExpenseColumns('+')}
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

        {/* Deductions Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdReceipt />
                Deductions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateDeduction}
                  size="small"
                >
                  Create Deduction
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => exportToExcel(filteredExpenseData.filter(e => e.transaction_type === '-'), 'truck-deductions.xlsx')}
                >
                  Excel
                </Button>
              </Box>
            </Box>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <DataGrid
                rows={filteredExpenseData.filter(e => e.transaction_type === '-')}
                columns={getExpenseColumns('-')}
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
      </Paper>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete {itemType === 'pay' ? 'Payment' : 'Expense'}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete this {itemType === 'pay' ? 'payment' : 'expense'}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteItem} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TruckView; 