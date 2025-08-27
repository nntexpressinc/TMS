import React, { useEffect, useState, useRef, useCallback } from "react";
import { Typography, Box, Button, TextField, MenuItem, InputAdornment, Chip, IconButton, Menu, Popover, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, createFilterOptions, FormControl, InputLabel, Select, Grid, Alert, Snackbar, CircularProgress } from "@mui/material";
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
    // Validate required fields
    if (!loadData.unit_id) {
      setError('Unit selection is required');
      return;
    }
    if (!loadData.customer_broker || !loadData.load_id) {
      setError("Load ID and Customer/Broker are required");
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

  // Custom filter for brokers: search by company name, MC number, or email
  const brokerFilterOptions = createFilterOptions({
    stringify: (option) => `${option.company_name || ''} ${option.mc_number || ''} ${option.email_address || ''}`
  });

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
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={brokers || []}
                  filterOptions={(options, { inputValue }) => {
                    try {
                      const list = Array.isArray(options) ? options : [];
                      const q = (inputValue || '').toString().trim().toLowerCase();

                      // If empty query, return a small subset for snappy UI
                      if (!q) return list.slice(0, 50);

                      const scored = [];
                      const maxResults = 200; // keep UI responsive

                      const scoreFor = (opt) => {
                        if (!opt) return -Infinity;
                        const name = (opt.company_name || '').toString().toLowerCase();
                        const mc = (opt.mc_number || '').toString().toLowerCase();
                        const email = (opt.email_address || '').toString().toLowerCase();

                        let score = 0;

                        // Exact full match is best
                        if (name === q || mc === q || email === q) score += 100;

                        // Prefix matches are very relevant
                        if (name.startsWith(q) || mc.startsWith(q) || email.startsWith(q)) score += 50;

                        // Word-start matches in company name
                        if (name.split(/\s+/).some(w => w.startsWith(q))) score += 30;

                        // Substring matches
                        if (name.includes(q)) score += 10;
                        if (mc.includes(q)) score += 20; // MC match slightly more important
                        if (email.includes(q)) score += 5;

                        // Slight boost for earlier position
                        const idx = name.indexOf(q);
                        if (idx >= 0) score += Math.max(0, 5 - idx);

                        return score;
                      };

                      for (let i = 0; i < list.length; i++) {
                        const opt = list[i];
                        if (!opt) continue;
                        const s = scoreFor(opt);
                        if (s > 0) scored.push({ opt, score: s });
                      }

                      // Sort by score desc, then by company_name for stable order
                      scored.sort((a, b) => {
                        if (b.score !== a.score) return b.score - a.score;
                        const na = (a.opt.company_name || a.opt.mc_number || '').toString().toLowerCase();
                        const nb = (b.opt.company_name || b.opt.mc_number || '').toString().toLowerCase();
                        return na.localeCompare(nb);
                      });

                      return scored.slice(0, maxResults).map(s => s.opt);
                    } catch (err) {
                      console.error('broker filter error', err);
                      return options || [];
                    }
                  }}
                  autoHighlight
                  clearOnEscape
                  getOptionLabel={(option) => {
                    if (!option) return '';
                    // option can be a string when freeSolo or during typing; handle gracefully
                    if (typeof option === 'string') return option;
                    return option.company_name || option.mc_number || option.email_address || '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    // Accept equality by id if available, otherwise by company name or mc_number
                    if (!option || !value) return false;
                    if (option.id && value.id) return option.id === value.id;
                    return (option.company_name === value.company_name) || (option.mc_number === value.mc_number);
                  }}
                  value={loadData.customer_broker}
                  onChange={handleBrokerChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Customer/Broker" 
                      required
                      error={!loadData.customer_broker}
                      helperText={!loadData.customer_broker ? "Customer/Broker is required" : ""}
                      placeholder="Search by company name or MC number"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{option.company_name || option.mc_number}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          MC: {option.mc_number} {option.email_address ? `| ${option.email_address}` : ''}
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
            disabled={loading || !loadData.customer_broker || !loadData.load_id}
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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

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
    { value: 'in_yard', label: 'In Yard', icon: <MdHome />, color: '#6B7280' },
    { value: 'canceled', label: 'Canceled', icon: <MdHome />, color: '#EF4444' }
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
    { value: "trip_bil_status", label: "Trip Bill Status" },
    { value: "team", label: "Team" }
  ];

  const fetchLoadsData = useCallback(async (url) => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      let data;

      if (url && /^https?:\/\//i.test(url)) {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        data = await res.json();
      } else {
        const endpoint = url || `/load/?page_size=${pageSize}`;
        data = await ApiService.getData(endpoint);
      }

      const arr = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);

      setNextUrl(data && data.next ? data.next : null);
      setPrevUrl(data && data.previous ? data.previous : null);
      setTotalCount(data && typeof data.count === 'number' ? data.count : arr.length);

      const formattedData = arr.map(load => ({
        id: load.id,
        created_by: load.created_by?.nickname || '',
        customer_broker: load.customer_broker?.company_name || '',
        driver: load.driver || null,
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
        truck: load.truck || null,
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
      }));

      setLoads(formattedData);
      setFilteredLoads(formattedData);

      // derive current page from API pagination links (API pages are 1-based)
      try {
        let currentApiPage = 1;
        if (data && data.previous) {
          const prevUrlObj = new URL(data.previous);
          const prevPage = prevUrlObj.searchParams.get('page');
          if (prevPage) currentApiPage = parseInt(prevPage, 10) + 1;
        } else if (data && data.next) {
          const nextUrlObj = new URL(data.next);
          const nextPage = nextUrlObj.searchParams.get('page');
          if (nextPage) currentApiPage = parseInt(nextPage, 10) - 1;
        }
        setPage(Math.max(0, currentApiPage - 1));
      } catch (err) {
        // ignore parsing errors and keep existing page
      }
    } catch (error) {
      console.error("Error fetching loads data:", error);
      setLoads([]);
      setFilteredLoads([]);
      setNextUrl(null);
      setPrevUrl(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchLoadsData();
  }, [fetchLoadsData]);

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

  // helper: build API endpoint for current filters (memoized)
  const buildEndpoint = useCallback((opts = {}) => {
    const qs = new URLSearchParams();
    const page = opts.page || 1;
    qs.set('page', page);
    qs.set('page_size', opts.page_size || pageSize);

    const term = (searchTerm || '').toString().trim();
    if (term) {
      switch (searchCategory) {
        case 'id':
          qs.set('id', term);
          break;
        case 'load_id':
          qs.set('load_id', term);
          break;
        case 'load_status':
          qs.set('load_status', term);
          break;
        case 'invoice_status':
          qs.set('invoice_status', term);
          break;
        case 'company_name':
          qs.set('company_name', term);
          break;
        case 'reference_id':
          qs.set('reference_id', term);
          break;
        case 'team':
          qs.set('team_id', term);
          break;
        default:
          qs.set('search', term);
      }
    }

    if (selectedStatus) qs.set('load_status', selectedStatus);
    if (selectedInvoiceStatus) qs.set('invoice_status', selectedInvoiceStatus);

    return `/load/?${qs.toString()}`;
  }, [pageSize, searchTerm, searchCategory, selectedStatus, selectedInvoiceStatus]);
  // Excel export handler
  const handleExportExcel = async () => {
    const qs = new URLSearchParams();
    qs.set('export', 'excel');
    const term = (searchTerm || '').toString().trim();
    if (term) {
      switch (searchCategory) {
        case 'id':
          qs.set('id', term);
          break;
        case 'load_id':
          qs.set('load_id', term);
          break;
        case 'load_status':
          qs.set('load_status', term);
          break;
        case 'invoice_status':
          qs.set('invoice_status', term);
          break;
        case 'company_name':
          qs.set('company_name', term);
          break;
        case 'reference_id':
          qs.set('reference_id', term);
          break;
        case 'team':
          qs.set('team_id', term);
          break;
        default:
          qs.set('search', term);
      }
    }
    if (selectedStatus) qs.set('load_status', selectedStatus);
    if (selectedInvoiceStatus) qs.set('invoice_status', selectedInvoiceStatus);
    const url = `${process.env.REACT_APP_API_BASE_URL || 'https://nnt.nntexpressinc.com/api'}/load/?${qs.toString()}`;
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download Excel');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'loads.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Excel export failed!');
    }
  };

  // Trigger server fetch when search inputs or filters change
  useEffect(() => {
    setPage(0);
    const endpoint = buildEndpoint({ page: 1, page_size: pageSize });
    fetchLoadsData(endpoint);
  }, [buildEndpoint, fetchLoadsData, pageSize]);

  const handleCreateLoad = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateLoadSuccess = (newLoad) => {
    navigate(`/loads/view/${newLoad.id}`);
  };

  // removed unused handleEditLoad to satisfy linter

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
  const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / pageSize)) : Math.max(1, Math.ceil((filteredLoads?.length || 0) / pageSize));

    const handlePrev = () => {
      if (prevUrl) {
        // fetch previous page from API
        fetchLoadsData(prevUrl);
      } else {
        setPage(p => Math.max(0, p - 1));
      }
    };

    const handleNext = () => {
      if (nextUrl) {
        // fetch next page from API
        fetchLoadsData(nextUrl);
      } else {
        setPage(p => Math.min(totalPages - 1, p + 1));
      }
    };

    const handlePageSizeChange = (e) => {
      const newSize = Number(e.target.value);
      setPageSize(newSize);
      setPage(0);
    };

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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={handlePrev} disabled={!(prevUrl || page > 0)}>
            Prev
          </Button>
          <Typography sx={{ mx: 1 }}>
            Page {page + 1} of {totalPages}
          </Typography>
          <Button size="small" variant="outlined" onClick={handleNext} disabled={!(nextUrl || page < totalPages - 1)}>
            Next
          </Button>

          <TextField
            select
            size="small"
            value={pageSize}
            onChange={handlePageSizeChange}
            sx={{ width: 100, ml: 2 }}
          >
            {[10, 20, 50, 100].map(size => (
              <MenuItem key={size} value={size}>{size} / page</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', width: '100%', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={tableRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Loads
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '80%', gap: 2, backgroundColor: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Button
            variant="outlined"
            color="success"
            onClick={handleExportExcel}
            sx={{ minWidth: 0, px: 2 }}
          >
            Export to Excel
          </Button>
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
          {permissions.load_create && (
            <Button variant="contained" color="primary" onClick={handleCreateLoad}>
              Create Load
            </Button>
          )}
        </Box>
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
            pagination
            page={page}
            onPageChange={(newPage) => {
              // request server page (API pages are 1-based)
              const endpoint = buildEndpoint({ page: newPage + 1, page_size: pageSize });
              fetchLoadsData(endpoint);
            }}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              // fetch first page with new size
              const endpoint = buildEndpoint({ page: 1, page_size: newSize });
              fetchLoadsData(endpoint);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
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