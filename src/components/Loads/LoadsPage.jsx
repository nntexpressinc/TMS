import React, { useEffect, useState, useRef } from "react";
import { Typography, Box, Button, TextField, MenuItem, InputAdornment, Chip, IconButton, Menu, Popover, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, FormControl, InputLabel, Select, Grid, Alert, Snackbar, CircularProgress } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ApiService } from "../../api/auth";
import { useNavigate } from 'react-router-dom';
import './LoadsPage.css';
import { useSidebar } from "../SidebarContext";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import {
  MdLocalShipping,
  MdDirectionsCar,
  MdAssignmentTurnedIn,
  MdDoneAll,
  MdFileUpload,
  MdAltRoute,
  MdFileDownload,
  MdCheckCircle,
  MdHome
} from 'react-icons/md';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

// CreateLoadModal komponenti
const CreateLoadModal = ({ open, onClose, onCreateSuccess }) => {
  const [loadData, setLoadData] = useState({
    load_id: "",
    reference_id: "",
    customer_broker: null,
    unit_id: null,
    truck_id: null,
    trailer_id: null,
    driver_id: null,
    team_id: null,
    equipment_type: ""
  });
  const [brokers, setBrokers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [newBroker, setNewBroker] = useState({
    company_name: "",
    contact_number: "",
    email_address: "",
    mc_number: "",
    address1: "",
    address2: "",
    country: "USA",
    state: "",
    city: "",
    zip_code: "",
    billing_type: "NONE"
  });

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const data = await ApiService.getData("/customer_broker/");
        setBrokers(data);
      } catch (error) {
        console.error("Error fetching brokers:", error);
        setError("Failed to load brokers. Please try again.");
      }
    };

    const fetchUnits = async () => {
      try {
        const data = await ApiService.getData("/unit/");
        setUnits(data);
      } catch (error) {
        console.error("Error fetching units:", error);
        setError("Failed to load units. Please try again.");
      }
    };

    if (open) {
      fetchBrokers();
      fetchUnits();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBrokerChange = (event, newValue) => {
    setLoadData(prev => ({
      ...prev,
      customer_broker: newValue
    }));
  };

  const handleUnitChange = (event, newValue) => {
    if (!newValue) {
      // Reset unit-related fields if no unit is selected
      setLoadData(prev => ({
        ...prev,
        unit_id: null,
        truck_id: null,
        trailer_id: null,
        driver_id: null,
        team_id: null,
        equipment_type: ''
      }));
      return;
    }

    const unitId = newValue.id;
    
    // Set unit ID
    setLoadData(prev => ({
      ...prev,
      unit_id: unitId,
      // Add team_id from unit if it exists
      team_id: newValue.team_id || null
    }));

    // Auto-populate truck if unit has a truck
    if (newValue.truck && newValue.truck.length > 0) {
      const truckId = newValue.truck[0]; // Get first truck ID
      setLoadData(prev => ({
        ...prev,
        truck_id: truckId
      }));
    }

    // Auto-populate trailer if unit has a trailer
    if (newValue.trailer && newValue.trailer.length > 0) {
      const trailerId = newValue.trailer[0]; // Get first trailer ID
      
      // Set trailer ID in form data
      setLoadData(prev => ({
        ...prev,
        trailer_id: trailerId
      }));
      
      // Get trailer information and set equipment type based on trailer type
      const fetchTrailerInfo = async () => {
        try {
          const trailerInfo = await ApiService.getData(`/trailer/${trailerId}/`);
          if (trailerInfo && trailerInfo.type) {
            setLoadData(prev => ({
              ...prev,
              equipment_type: trailerInfo.type // Set equipment type from trailer type
            }));
          }
        } catch (error) {
          console.error('Error fetching trailer info:', error);
        }
      };
      
      fetchTrailerInfo();
    }

    // Auto-populate driver if unit has a driver
    if (newValue.driver && newValue.driver.length > 0) {
      const driverId = newValue.driver[0]; // Get first driver ID
      setLoadData(prev => ({
        ...prev,
        driver_id: driverId
      }));
    }
  };

  const handleCreateLoad = async () => {
    if (!loadData.reference_id || !loadData.customer_broker || !loadData.load_id) {
      setError("Load ID, Reference ID and Customer/Broker are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.postData("/load/", {
        load_id: loadData.load_id,
        reference_id: loadData.reference_id,
        customer_broker: loadData.customer_broker.id,
        unit_id: loadData.unit_id,
        truck: loadData.truck_id,
        trailer: loadData.trailer_id,
        driver: loadData.driver_id,
        team_id: loadData.team_id,
        equipment_type: loadData.equipment_type,
        load_status: "OPEN",
        company_name: loadData.customer_broker.company_name
      });
      
      console.log("Load created:", response);
      onCreateSuccess(response);
      onClose();
    } catch (error) {
      console.error("Error creating load:", error);
      setError("Failed to create load. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBroker = () => {
    setShowBrokerModal(true);
  };

  const handleCloseBrokerModal = () => {
    setShowBrokerModal(false);
  };

  const handleBrokerFormChange = (e) => {
    const { name, value } = e.target;
    setNewBroker(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveBroker = async () => {
    if (!newBroker.company_name || !newBroker.mc_number) {
      setError("Company name and MC number are required");
      return;
    }
    
    try {
      // Convert numeric strings to numbers
      const formattedData = {
        ...newBroker,
        contact_number: newBroker.contact_number ? parseInt(newBroker.contact_number) : null,
        zip_code: newBroker.zip_code ? parseInt(newBroker.zip_code) : null
      };
      
      const response = await ApiService.postData("/customer_broker/", formattedData);
      setBrokers(prev => [...prev, response]);
      setLoadData(prev => ({
        ...prev,
        customer_broker: response
      }));
      setShowBrokerModal(false);
      setNewBroker({
        company_name: "",
        contact_number: "",
        email_address: "",
        mc_number: "",
        address1: "",
        address2: "",
        country: "USA",
        state: "",
        city: "",
        zip_code: "",
        billing_type: "NONE"
      });
    } catch (error) {
      console.error("Error creating broker:", error);
      setError("Failed to create broker. Please try again.");
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MdLocalShipping size={24} color="#3B82F6" />
            <Typography variant="h6">Create New Load</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Load ID"
                name="load_id"
                value={loadData.load_id}
                onChange={handleChange}
                required
                error={!loadData.load_id}
                helperText={!loadData.load_id ? "Load ID is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference ID"
                name="reference_id"
                value={loadData.reference_id}
                onChange={handleChange}
                required
                error={!loadData.reference_id}
                helperText={!loadData.reference_id ? "Reference ID is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={brokers}
                  getOptionLabel={(option) => option.company_name || ""}
                  value={loadData.customer_broker}
                  onChange={handleBrokerChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Customer/Broker" 
                      required
                      error={!loadData.customer_broker}
                      helperText={!loadData.customer_broker ? "Customer/Broker is required" : ""}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{option.company_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          MC: {option.mc_number} | {option.email_address}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                <IconButton 
                  color="primary"
                  onClick={handleAddBroker}
                  sx={{ mt: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={units}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.unit_number || option.id}${option.description ? ` - ${option.description}` : ''}`;
                }}
                value={units.find(unit => unit.id === loadData.unit_id) || null}
                onChange={handleUnitChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Unit"
                    placeholder="Search and select unit"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1" fontWeight="medium">
                        {option.unit_number || option.id}
                      </Typography>
                      {option.description && (
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateLoad}
            disabled={loading || !loadData.reference_id || !loadData.customer_broker || !loadData.load_id}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Create Load
          </Button>
        </DialogActions>
      </Dialog>

      {/* Broker creation modal */}
      <Dialog
        open={showBrokerModal}
        onClose={handleCloseBrokerModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon color="primary" />
            <Typography variant="h6">Add New Broker</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="company_name"
                value={newBroker.company_name}
                onChange={handleBrokerFormChange}
                required
                error={!newBroker.company_name}
                helperText={!newBroker.company_name ? "Company name is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MC Number"
                name="mc_number"
                value={newBroker.mc_number}
                onChange={handleBrokerFormChange}
                required
                error={!newBroker.mc_number}
                helperText={!newBroker.mc_number ? "MC Number is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact_number"
                value={newBroker.contact_number}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email_address"
                type="email"
                value={newBroker.email_address}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                name="address1"
                value={newBroker.address1}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                name="address2"
                value={newBroker.address2}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={newBroker.city}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={newBroker.state}
                  onChange={handleBrokerFormChange}
                  label="State"
                >
                  {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip_code"
                value={newBroker.zip_code}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Billing Type</InputLabel>
                <Select
                  name="billing_type"
                  value={newBroker.billing_type}
                  onChange={handleBrokerFormChange}
                  label="Billing Type"
                >
                  <MenuItem value="NONE">None</MenuItem>
                  <MenuItem value="FACTORING_COMPANY">Factoring Company</MenuItem>
                  <MenuItem value="EMAIL">Email</MenuItem>
                  <MenuItem value="MANUAL">Manual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBrokerModal}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBroker}
            disabled={!newBroker.company_name || !newBroker.mc_number}
          >
            Save Broker
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const LoadsPage = () => {
  const [loads, setLoads] = useState([]);
  const [filteredLoads, setFilteredLoads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const [copiedId, setCopiedId] = useState(null);

  // Read permissions from localStorage
  useEffect(() => {
    const permissionsEnc = localStorage.getItem("permissionsEnc");
    if (permissionsEnc) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
        setPermissions(decoded);
      } catch (e) {
        setPermissions({});
      }
    } else {
      setPermissions({});
    }
  }, []);

  const loadStatuses = [
    { value: 'open', label: 'Open', icon: <MdLocalShipping />, color: '#3B82F6' },
    { value: 'covered', label: 'Covered', icon: <MdDirectionsCar />, color: '#10B981' },
    { value: 'dispatched', label: 'Dispatched', icon: <MdAssignmentTurnedIn />, color: '#6366F1' },
    { value: 'loading', label: 'Loading', icon: <MdFileUpload />, color: '#F59E0B' },
    { value: 'on_route', label: 'On Route', icon: <MdAltRoute />, color: '#3B82F6' },
    { value: 'unloading', label: 'Unloading', icon: <MdFileDownload />, color: '#F59E0B' },
    { value: 'delivered', label: 'Delivered', icon: <MdDoneAll />, color: '#10B981' },
    { value: 'completed', label: 'Completed', icon: <MdCheckCircle />, color: '#059669' },
    { value: 'in_yard', label: 'In Yard', icon: <MdHome />, color: '#6B7280' }
  ];

  const invoiceStatuses = [
    { value: 'NOT_DETERMINED', label: 'Not Determined', color: '#9CA3AF' },
    { value: 'INVOICED', label: 'Invoiced', color: '#3B82F6' },
    { value: 'PAID', label: 'Paid', color: '#10B981' },
    { value: 'UNPAID', label: 'Unpaid', color: '#EF4444' }
  ];

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const calculateTotals = () => {
    if (!filteredLoads || filteredLoads.length === 0) return { totalPay: 0, driverPay: 0, totalMiles: 0 };

    return filteredLoads.reduce((acc, load) => ({
      totalPay: acc.totalPay + (parseFloat(load.total_pay) || 0),
      driverPay: acc.driverPay + (parseFloat(load.driver_pay) || 0),
      totalMiles: acc.totalMiles + (parseFloat(load.total_miles) || 0)
    }), { totalPay: 0, driverPay: 0, totalMiles: 0 });
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    filterLoads(status === selectedStatus ? null : status, selectedInvoiceStatus);
  };

  const handleInvoiceStatusFilter = (status) => {
    setSelectedInvoiceStatus(status === selectedInvoiceStatus ? null : status);
    filterLoads(selectedStatus, status === selectedInvoiceStatus ? null : status);
  };

  const filterLoads = (loadStatus, invoiceStatus) => {
    let filtered = [...loads];

    if (loadStatus) {
      filtered = filtered.filter(load => 
        load.load_status?.toLowerCase() === loadStatus.toLowerCase()
      );
    }

    if (invoiceStatus) {
      filtered = filtered.filter(load => 
        load.invoice_status === invoiceStatus
      );
    }

    setFilteredLoads(filtered);
  };

  const searchCategories = [
    { value: "all", label: "All Fields" },
    { value: "company_name", label: "Company Name" },
    { value: "reference_id", label: "Reference ID" },
    { value: "load_id", label: "Load ID" },
    { value: "customer_broker", label: "Customer Broker" },
    { value: "driver", label: "Driver" },
    { value: "dispatcher", label: "Dispatcher" },
    { value: "created_by", label: "Created By" },
    { value: "load_status", label: "Load Status" },
    { value: "trip_status", label: "Trip Status" },
    { value: "invoice_status", label: "Invoice Status" },
    { value: "trip_bil_status", label: "Trip Bill Status" }
  ];

  useEffect(() => {
    const fetchLoadsData = async () => {
      setLoading(true);
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/load/`, storedAccessToken);
          console.log("API Response:", data);

          const formattedData = data.map(load => {
            return {
              id: load.id,
              created_by: load.created_by?.nickname || '',
              customer_broker: load.customer_broker?.company_name || '',
              driver: load.driver || null,  // O'zgartirildi: butun driver obyektini saqlaymiz
              dispatcher: load.dispatcher?.nickname || '',
              created_by_id: load.created_by?.id,
              customer_broker_id: load.customer_broker?.id,
              driver_id: load.driver?.id,
              dispatcher_id: load.dispatcher?.id,
              company_name: load.company_name,
              reference_id: load.reference_id,
              instructions: load.instructions,
              bills: load.bills,
              created_date: load.created_date,
              load_id: load.load_id,
              trip_id: load.trip_id,
              co_driver: load.co_driver,
              truck: load.truck || null,  // O'zgartirildi: butun truck obyektini saqlaymiz
              load_status: load.load_status,
              equipment_type: load.equipment_type,
              trip_status: load.trip_status,
              invoice_status: load.invoice_status,
              trip_bil_status: load.trip_bil_status,
              load_pay: load.load_pay,
              driver_pay: load.driver_pay,
              total_pay: load.total_pay,
              per_mile: load.per_mile,
              mile: load.mile,
              empty_mile: load.empty_mile,
              total_miles: load.total_miles,
              flagged: load.flagged,
              flagged_reason: load.flagged_reason,
              note: load.note,
              chat: load.chat,
              ai: load.ai,
              rate_con: load.rate_con,
              bol: load.bol,
              pod: load.pod,
              document: load.document,
              comercial_invoice: load.comercial_invoice,
              tags: load.tags
            };
          });
          console.log("Formatted Data:", formattedData);
          setLoads(formattedData);
          setFilteredLoads(formattedData);
        } catch (error) {
          console.error("Error fetching loads data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchLoadsData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (tableRef.current) {
        tableRef.current.style.height = `${window.innerHeight - tableRef.current.getBoundingClientRect().top - 20}px`;
        tableRef.current.style.width = `${window.innerWidth - (isSidebarOpen ? 250 : 60) - 48}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredLoads(loads);
      return;
    }

    const filtered = loads.filter(load => {
      if (searchCategory === "all") {
        return Object.values(load).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        return String(load[searchCategory])
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
    });

    setFilteredLoads(filtered);
  }, [searchTerm, searchCategory, loads]);

  const handleCreateLoad = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateLoadSuccess = (newLoad) => {
    navigate(`/loads/view/${newLoad.id}`);
  };

  const handleEditLoad = (loadId) => {
    navigate(`/loads/edit/${loadId}`);
  };

  const handleViewLoad = (loadId) => {
    navigate(`/loads/view/${loadId}`);
  };

  const getStatusStyle = (status) => {
    const statusConfig = loadStatuses.find(s => s.value.toLowerCase() === status?.toLowerCase());
    if (!statusConfig) return {};

    return {
      backgroundColor: `${statusConfig.color}15`,
      color: statusConfig.color,
      borderRadius: '16px',
      padding: '6px 12px',
      fontWeight: 600,
      width: 'fit-content',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      '& svg': {
        fontSize: '16px'
      }
    };
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewDispatcher = (id) => {
    if (id) {
      navigate(`/dispatcher/${id}`);
    }
  };

  const handleViewDriver = (id) => {
    if (id) {
      navigate(`/driver/${id}`);
    }
  };

  const handleViewCustomerBroker = (id) => {
    if (id) {
      navigate(`/customer-broker/${id}`);
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          py: '4px'
        }}>
          <Typography sx={{
            whiteSpace: 'nowrap',
            overflow: 'visible'
          }}>
            {params.value}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleCopyId(params.value)}
            sx={{
              padding: '4px',
              color: copiedId === params.value ? '#10B981' : '#6B7280',
              '&:hover': {
                backgroundColor: copiedId === params.value ? '#D1FAE5' : '#F3F4F6'
              }
            }}
          >
            {copiedId === params.value ? (
              <CheckIcon sx={{ fontSize: '16px' }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: '16px' }} />
            )}
          </IconButton>
        </Box>
      )
    },
    {
      field: 'load_id',
      headerName: 'Load ID',
      width: 280,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const loadId = params.value || '-';
        const formatLoadId = (id) => {
          if (id === '-') return id;
          if (id.length <= 10) return id;
          const firstPart = id.substring(0, 5);
          const lastPart = id.substring(id.length - 5);
          return `${firstPart}...${lastPart}`;
        };
        return (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            py: '4px'
          }}>
            <Typography
              sx={{ 
                whiteSpace: 'nowrap',
                overflow: 'visible',
                cursor: 'pointer',
                color: '#3B82F6',
                textDecoration: 'underline'
              }}
              onClick={() => handleViewLoad(params.row.id)}
            >
              {formatLoadId(loadId)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleCopyId(loadId)}
              sx={{
                padding: '4px',
                color: copiedId === loadId ? '#10B981' : '#6B7280',
                '&:hover': {
                  backgroundColor: copiedId === loadId ? '#D1FAE5' : '#F3F4F6'
                }
              }}
            >
              {copiedId === loadId ? (
                <CheckIcon sx={{ fontSize: '16px' }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: '16px' }} />
              )}
            </IconButton>
          </Box>
        );
      }
    },
    { field: 'company_name', headerName: 'Company Name', width: 120 },
 
    {
      field: 'created_by',
      headerName: 'Created By',
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => handleViewDispatcher(params.row.created_by_id)}
        >
          {params.value}
        </Box>
      )
    },
    {
      field: 'created_date',
      headerName: 'Created Date',
      width: 180,
      valueGetter: (params) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    },
    {
      field: 'customer_broker',
      headerName: 'Customer Broker',
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => handleViewCustomerBroker(params.row.customer_broker_id)}
        >
          {params.value}
        </Box>
      )
    },
    {
      field: 'driver',
      headerName: 'Driver',
      width: 150,
      valueGetter: (params) => {
        const driver = params.row.driver;
        if (!driver) return '-';
        const firstName = driver.user?.first_name || '';
        const lastName = driver.user?.last_name || '';
        return `${firstName} ${lastName}`.trim() || '-';
      },
      renderCell: (params) => {
        const driver = params.row.driver;
        if (!driver) return '-';
        
        const firstName = driver.user?.first_name || '';
        const lastName = driver.user?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        const formatName = (name) => {
          if (!name || name === '-') return '-';
          if (name.length <= 15) return name;
          return `${name.substring(0, 12)}...`;
        };

        return (
          <Tooltip title={fullName}>
            <Box
              sx={{
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => handleViewDriver(driver.id)}
            >
              {formatName(fullName)}
            </Box>
          </Tooltip>
        );
      }
    },
    { 
      field: 'truck', 
      headerName: 'Truck', 
      width: 120,
      valueGetter: (params) => {
        const truck = params.row.truck;
        return truck ? `${truck.make || ''} ${truck.model || ''} ${truck.unit_number || ''}`.trim() : '-';
      }
    },
    {
      field: 'load_status',
      headerName: 'Load Status',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      pinned: 'right',
      renderCell: (params) => {
        const statusValue = params.value || 'Unknown';
        const statusConfig = loadStatuses.find(s => s.value.toLowerCase() === statusValue.toLowerCase());
        return (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            paddingTop: '4px'
          }}>
            <Chip
              label={
                statusConfig?.label
                  ? statusConfig.label.toUpperCase()
                  : statusValue.toUpperCase()
              }
              icon={statusConfig?.icon}
              sx={{
                ...getStatusStyle(statusValue),
                height: '20px',
                minWidth: 'auto',
                maxWidth: '100%',
                '& .MuiChip-label': {
                  fontSize: '0.7rem',
                  padding: '0 4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textTransform: 'uppercase',
                },
                '& .MuiChip-icon': {
                  fontSize: '12px',
                  marginLeft: '2px',
                },
              }}
            />
          </Box>
        );
      }
    },
    {
      field: 'dispatcher',
      headerName: 'Dispatcher',
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => handleViewDispatcher(params.row.dispatcher_id)}
        >
          {params.value}
        </Box>
      )
    },
    { field: 'equipment_type', headerName: 'Equipment Type', width: 120 },
    { field: 'trip_status', headerName: 'Trip Status', width: 120 },
    { field: 'invoice_status', headerName: 'Invoice Status', width: 120 },
    { field: 'trip_bil_status', headerName: 'Trip Bill Status', width: 120 },
    { field: 'load_pay', headerName: 'Load Pay', width: 100 },
    { field: 'driver_pay', headerName: 'Driver Pay', width: 100 },
    { field: 'total_pay', headerName: 'Total Pay', width: 100 },
    { field: 'per_mile', headerName: 'Per Mile', width: 100 },
    { field: 'mile', headerName: 'Mile', width: 100 },
    { field: 'empty_mile', headerName: 'Empty Mile', width: 100 },
    { field: 'total_miles', headerName: 'Total Miles', width: 100 },
    { field: 'document', headerName: 'Document', width: 100 },
    { field: 'bills', headerName: 'Bills', width: 100 },
    { field: 'tags', headerName: 'Tags', width: 100 },
  ];

  const CustomFooter = () => {
    const totals = calculateTotals();

    return (
      <Box sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #E0E0E0'
      }}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Typography>
            <strong>Total Pay:</strong> ${totals.totalPay.toFixed(2)}
          </Typography>
          <Typography>
            <strong>Driver Pay:</strong> ${totals.driverPay.toFixed(2)}
          </Typography>
          <Typography>
            <strong>Total Miles:</strong> {totals.totalMiles.toFixed(0)}
          </Typography>
        </Box>
        <div className="MuiDataGrid-pagination" />
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', width: '100%', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={tableRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Loads
        </Typography>
           <Box sx={{
          display: 'flex',
          width: '80%',
          gap: 2,
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '6px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <TextField
            select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            variant="outlined"
            sx={{
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#F9FAFB',
                maxHeight: '32px'
              }
            }}
          >
            {searchCategories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            placeholder="Search loads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#F9FAFB',
                maxHeight: '32px'
              }
            }}
          />
          <IconButton
            onClick={handleFilterClick}
            sx={{
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              height: '32px',
              width: '32px'
            }}
          >
            <FilterListIcon />
          </IconButton>
      </Box>
          {permissions.load_create && (
            <Button variant="contained" color="primary" onClick={handleCreateLoad}>
              Create Load
            </Button>
          )}
      </Box>

      <CreateLoadModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateSuccess={handleCreateLoadSuccess}
      />

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        mb: 2,
        backgroundColor: 'white',
        p: 2,
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 4,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          }
        }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
              Load Status
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: { xs: 'nowrap', md: 'wrap' },
              minWidth: 'max-content'
            }}>
              {loadStatuses.map((status) => (
                <Chip
                  key={status.value}
                  label={status.label}
                  icon={status.icon}
                  onClick={() => handleStatusFilter(status.value)}
                  sx={{
                    backgroundColor: selectedStatus === status.value ? status.color : 'transparent',
                    color: selectedStatus === status.value ? 'white' : 'inherit',
                    borderColor: status.color,
                    border: '1px solid',
                    whiteSpace: 'nowrap',
                    '& .MuiChip-icon': {
                      color: selectedStatus === status.value ? 'white' : status.color,
                    },
                    '&:hover': {
                      backgroundColor: status.color,
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'white',
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
              Invoice Status
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: { xs: 'nowrap', md: 'wrap' },
              minWidth: 'max-content'
            }}>
              {invoiceStatuses.map((status) => (
                <Chip
                  key={status.value}
                  label={status.label}
                  onClick={() => handleInvoiceStatusFilter(status.value)}
                  sx={{
                    backgroundColor: selectedInvoiceStatus === status.value ? status.color : 'transparent',
                    color: selectedInvoiceStatus === status.value ? 'white' : 'inherit',
                    borderColor: status.color,
                    border: '1px solid',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: status.color,
                      color: 'white',
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, overflow: 'hidden' }}>
        <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
          {loading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1000,
              borderRadius: '12px'
            }}>
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: '#3B82F6',
                  mb: 2
                }} 
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#6B7280',
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                Loading loads...
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#9CA3AF',
                  mt: 1,
                  textAlign: 'center'
                }}
              >
                Please wait while we fetch your data
              </Typography>
            </Box>
          )}
          <DataGrid
            rows={filteredLoads}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            components={{
              Footer: CustomFooter,
              Toolbar: GridToolbar
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            disableColumnMenu={false}
            disableColumnSelector={false}
            disableDensitySelector={false}
            disableSelectionOnClick
            columnBuffer={5}
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              '& .MuiDataGrid-row': {
                maxHeight: '45px !important',
                minHeight: '45px !important',
              },
              '& .MuiDataGrid-cell': {
                py: '8px',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F9FAFB',
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  color: '#111827'
                },
                '& .MuiDataGrid-columnSeparator': {
                  visibility: 'visible',
                  color: '#E5E7EB'
                }
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              },
              '& .MuiDataGrid-toolbarContainer': {
                padding: '8px 16px',
                borderBottom: '1px solid #E5E7EB',
                '& .MuiButton-root': {
                  color: '#6B7280',
                  '&:hover': {
                    backgroundColor: '#F3F4F6'
                  }
                }
              },
              '& .MuiDataGrid-cell--pinned': {
                backgroundColor: 'white',
                borderLeft: '1px solid #E5E7EB',
                '&:last-child': {
                  borderRight: 'none'
                }
              },
              '& .MuiDataGrid-columnHeader--pinned': {
                backgroundColor: '#F9FAFB',
                borderLeft: '1px solid #E5E7EB',
                '&:last-child': {
                  borderRight: 'none'
                }
              }
            }}
            onSelectionModelChange={(newSelection) => {
              const selectedRow = filteredLoads.find(load => load.id === newSelection[0]);
              setSelectedRow(selectedRow);
            }}
          />
        </Box>
      </Box>
      
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: '300px',
            p: 2,
            mt: 1,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Filter by
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Column"
            variant="outlined"
          >
            {columns.map((column) => (
              <MenuItem key={column.field} value={column.field}>
                {column.headerName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            label="Operator"
            variant="outlined"
          >
            <MenuItem value="contains">Contains</MenuItem>
            <MenuItem value="equals">Equals</MenuItem>
            <MenuItem value="startsWith">Starts with</MenuItem>
            <MenuItem value="endsWith">Ends with</MenuItem>
            <MenuItem value="isEmpty">Is empty</MenuItem>
            <MenuItem value="isNotEmpty">Is not empty</MenuItem>
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Value"
            variant="outlined"
            placeholder="Filter value"
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleFilterClose}
              sx={{ color: '#6B7280' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleFilterClose}
            >
              Apply Filter
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default LoadsPage;