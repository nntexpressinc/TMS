import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, Button, IconButton, Tooltip, Grid, Divider, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ApiService } from '../../api/auth';
import { toast } from 'react-hot-toast';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Alert } from '@mui/material';

const DriverViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [driverData, setDriverData] = useState(null);
  const [payData, setPayData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [trailerData, setTrailerData] = useState(null);
  const [dispatcherData, setDispatcherData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driver, pay, expense] = await Promise.all([
          ApiService.getData(`/driver/${id}/`),
          ApiService.getData(`/driver/pay/?driver=${id}`),
          ApiService.getData(`/driver/expense/?driver=${id}`)
        ]);
        
        setDriverData(driver);
        setPayData(pay);
        setExpenseData(expense);

        // Fetch related data if IDs exist
        if (driver.assigned_truck) {
          const truck = await ApiService.getData(`/truck/${driver.assigned_truck}/`);
          setTruckData(truck);
        }
        if (driver.assigned_trailer) {
          const trailer = await ApiService.getData(`/trailer/${driver.assigned_trailer}/`);
          setTrailerData(trailer);
        }
        if (driver.assigned_dispatcher) {
          const dispatcher = await ApiService.getData(`/dispatcher/${driver.assigned_dispatcher}/`);
          setDispatcherData(dispatcher);
        }

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

  const handleDeletePay = async (payId) => {
    try {
      await ApiService.deleteData(`/driver/pay/${payId}/`);
      setPayData(payData.filter(pay => pay.id !== payId));
      toast.success('Payment information deleted');
    } catch (err) {
      setError('Error deleting payment information');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await ApiService.deleteData(`/driver/expense/${expenseId}/`);
      setExpenseData(expenseData.filter(expense => expense.id !== expenseId));
      toast.success('Expense information deleted');
    } catch (err) {
      setError('Error deleting expense information');
    }
  };

  const payColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
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
      width: 100
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
            <IconButton onClick={() => navigate(`/driver/${id}/pay/${params.row.id}/edit`)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeletePay(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const expenseColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 100 },
    { field: 'expense_date', headerName: 'Date', width: 120 },
    { field: 'created_at', headerName: 'Created At', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => navigate(`/driver/${id}/expense/${params.row.id}/edit`)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteExpense(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const driverId = parseInt(id, 10);
  const filteredPayData = payData.filter(pay => pay.driver === driverId);
  const positiveExpenses = expenseData.filter(expense => expense.transaction_type === '+' && expense.driver === driverId);
  const negativeExpenses = expenseData.filter(expense => expense.transaction_type === '-' && expense.driver === driverId);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          {driverData?.first_name} {driverData?.last_name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/driver/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Driver Information" />
          <Tab label="Payments" />
          <Tab label="ADDITION" />
          <Tab label="DEDUCTION" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                <Typography variant="body1">{driverData?.first_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                <Typography variant="body1">{driverData?.last_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{driverData?.contact_number || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{driverData?.email_address || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Driver Status</Typography>
                <Chip label={driverData?.driver_status || '-'} color={driverData?.driver_status === 'Available' ? 'success' : 'default'} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Driver Type</Typography>
                <Typography variant="body1">{driverData?.driver_type || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">License ID</Typography>
                <Typography variant="body1">{driverData?.driver_license_id || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">License Expiration</Typography>
                <Typography variant="body1">{driverData?.driver_license_expiration || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">DL Class</Typography>
                <Typography variant="body1">{driverData?.dl_class || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">DL State</Typography>
                <Typography variant="body1">{driverData?.driver_license_state || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Address 1</Typography>
                <Typography variant="body1">{driverData?.address1 || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Address 2</Typography>
                <Typography variant="body1">{driverData?.address2 || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Country</Typography>
                <Typography variant="body1">{driverData?.country || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Employment Status</Typography>
                <Typography variant="body1">{driverData?.employment_status || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Assigned Truck</Typography>
                <Typography variant="body1">
                  {truckData ? `${truckData.make} ${truckData.model} (${truckData.number})` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Assigned Trailer</Typography>
                <Typography variant="body1">
                  {trailerData ? `${trailerData.make} ${trailerData.model} (${trailerData.number})` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Assigned Dispatcher</Typography>
                <Typography variant="body1">
                  {dispatcherData ? `${dispatcherData.first_name} ${dispatcherData.last_name}` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Other ID</Typography>
                <Typography variant="body1">{driverData?.other_id || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                <Typography variant="body1">{driverData?.notes || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Tariff</Typography>
                <Typography variant="body1">{driverData?.tariff || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">MC Number</Typography>
                <Typography variant="body1">{driverData?.mc_number || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Team Driver</Typography>
                <Typography variant="body1">{driverData?.team_driver || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Per Mile</Typography>
                <Typography variant="body1">{driverData?.permile || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Cost</Typography>
                <Typography variant="body1">{driverData?.cost || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Payd</Typography>
                <Typography variant="body1">{driverData?.payd || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Escrow Deposit</Typography>
                <Typography variant="body1">{driverData?.escrow_deposit || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/driver/${id}/pay/create`)}
              >
                New Payment
              </Button>
            </Box>
            <DataGrid
              rows={filteredPayData}
              columns={payColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
            />
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/driver/${id}/expense/create`)}
              >
                New Expense
              </Button>
            </Box>
            <DataGrid
              rows={positiveExpenses}
              columns={expenseColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
            />
          </Box>
        )}

        {tabValue === 3 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/driver/${id}/expense/create`)}
              >
                New Expense
              </Button>
            </Box>
            <DataGrid
              rows={negativeExpenses}
              columns={expenseColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              autoHeight
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DriverViewPage; 