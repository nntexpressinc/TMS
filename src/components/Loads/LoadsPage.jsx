import React, { useEffect, useState, useRef } from "react";
import { Typography, Box, Button, TextField, MenuItem, InputAdornment, Chip, IconButton, Menu, Popover, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ApiService } from "../../api/auth";
import { useNavigate } from 'react-router-dom';
import './LoadsPage.css';
import { useSidebar } from "../SidebarContext";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const LoadsPage = () => {
  const [loads, setLoads] = useState([]);
  const [filteredLoads, setFilteredLoads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const [copiedId, setCopiedId] = useState(null);

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

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Calculate totals for footer
  const calculateTotals = () => {
    if (!filteredLoads || filteredLoads.length === 0) return { totalPay: 0, driverPay: 0, totalMiles: 0 };
    
    return filteredLoads.reduce((acc, load) => ({
      totalPay: acc.totalPay + (parseFloat(load.total_pay) || 0),
      driverPay: acc.driverPay + (parseFloat(load.driver_pay) || 0),
      totalMiles: acc.totalMiles + (parseFloat(load.total_miles) || 0)
    }), { totalPay: 0, driverPay: 0, totalMiles: 0 });
  };

  // Status filter handler
  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    if (status === selectedStatus) {
      setFilteredLoads(loads);
    } else {
      const filtered = loads.filter(load => {
        if (!load || !load.load_status) return false;
        return load.load_status.toLowerCase() === status.toLowerCase();
      });
      setFilteredLoads(filtered);
    }
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
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/load/`, storedAccessToken);
          const formattedData = data.map(load => {
            return {
              id: load.id,
              created_by: load.created_by?.nickname || '',
              customer_broker: load.customer_broker?.company_name || '',
              driver: load.driver ? `${load.driver.first_name} ${load.driver.last_name}` : '',
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
              truck: load.truck,
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
          setLoads(formattedData);
          setFilteredLoads(formattedData);
        } catch (error) {
          console.error("Error fetching loads data:", error);
        }
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

  // Search function
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
    navigate('/loads/create');
  };

  const handleEditLoad = (loadId) => {
    navigate(`/loads/edit/${loadId}`);
  };

  const handleViewLoad = (loadId) => {
    console.log('View load:', loadId);
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
    setTimeout(() => setCopiedId(null), 2000); // 2 sekunddan keyin copy ikonini qaytarish
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
    // { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'load_id',
      headerName: 'Load ID',
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
    { field: 'company_name', headerName: 'Company Name', width: 120 },
    { field: 'reference_id', headerName: 'Reference ID', width: 120 },
    // { field: 'instructions', headerName: 'Instructions', width: 150 },
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
    { field: 'created_date', headerName: 'Created Date', width: 120 },
    // { field: 'trip_id', headerName: 'Trip ID', width: 100 },
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
      renderCell: (params) => (
        <Box 
          sx={{ 
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => handleViewDriver(params.row.driver_id)}
        >
          {params.value}
        </Box>
      )
    },
    // { field: 'co_driver', headerName: 'Co-Driver', width: 100 },
    { field: 'truck', headerName: 'Truck', width: 100 },
    {
      field: 'load_status',
      headerName: 'Load Status',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      pinned: 'right',
      renderCell: (params) => {
        const statusConfig = loadStatuses.find(s => s.value.toLowerCase() === params.value?.toLowerCase());
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
              label={params.value}
              icon={statusConfig?.icon}
              sx={{
                ...getStatusStyle(params.value),
                height: '20px',
                minWidth: 'auto',
                maxWidth: '100%',
                '& .MuiChip-label': {
                  fontSize: '0.7rem',
                  padding: '0 4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                },
                '& .MuiChip-icon': {
                  fontSize: '12px',
                  marginLeft: '2px'
                }
              }}
            />
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      pinned: 'right',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          paddingTop: '4px'
        }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditLoad(params.row.id)}
              sx={{ 
                padding: '6px',
                color: '#6366F1',
                '&:hover': { backgroundColor: '#EEF2FF' }
              }}
            >
              <EditIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={() => handleViewLoad(params.row.id)}
              sx={{ 
                padding: '6px',
                color: '#3B82F6',
                '&:hover': { backgroundColor: '#EFF6FF' }
              }}
            >
              <VisibilityIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
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
    // { field: 'flagged', headerName: 'Flagged', width: 100 },
    // { field: 'flagged_reason', headerName: 'Flagged Reason', width: 120 },
    // { field: 'note', headerName: 'Note', width: 150 },
    // { field: 'chat', headerName: 'Chat', width: 100 },
    // { field: 'ai', headerName: 'AI', width: 100 },
    // { field: 'rate_con', headerName: 'Rate Con', width: 100 },
    // { field: 'bol', headerName: 'BOL', width: 100 },
    // { field: 'pod', headerName: 'POD', width: 100 },
    { field: 'document', headerName: 'Document', width: 100 },
    { field: 'bills', headerName: 'Bills', width: 100 },
    { field: 'tags', headerName: 'Tags', width: 100 },
    // { field: 'comercial_invoice', headerName: 'Commercial Invoice', width: 120 }
  
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
        <Button variant="contained" color="primary" onClick={handleCreateLoad}>
          Create Load
        </Button>
      </Box>

      {/* Status Filter Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mb: 2, 
        flexWrap: 'wrap',
        backgroundColor: 'white',
        p: 2,
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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

      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, overflow: 'hidden' }}>
        {/* Main Table */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
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
              // Update selected row for status panel
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