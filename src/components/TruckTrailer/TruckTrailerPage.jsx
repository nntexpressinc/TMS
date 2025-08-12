import React, { useEffect, useState, useRef } from "react";
import { 
  Typography, 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  InputAdornment, 
  Chip, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Grid
} from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ApiService } from "../../api/auth";
import { useNavigate } from 'react-router-dom';
import './TruckTrailerPage.css';
import { useSidebar } from "../SidebarContext";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { MdCheckCircle, MdCancel, MdPending } from 'react-icons/md';

const TruckTrailerPage = ({ type = 'truck' }) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();

  const statuses = [
    { value: 'ACTIVE', label: 'Active', icon: <MdCheckCircle />, color: '#10B981' },
    { value: 'INACTIVE', label: 'Inactive', icon: <MdCancel />, color: '#EF4444' },
    { value: 'MAINTENANCE', label: 'Maintenance', icon: <MdPending />, color: '#F59E0B' }
  ];

  const trailerTypes = [
    { value: 'REEFER', label: 'Reefer', color: '#3B82F6' },
    { value: 'DRYVAN', label: 'Dryvan', color: '#10B981' },
    { value: 'STEPDECK', label: 'Stepdeck', color: '#F59E0B' },
    { value: 'LOWBOY', label: 'Lowboy', color: '#8B5CF6' },
    { value: 'CARHAUL', label: 'Carhaul', color: '#EC4899' },
    { value: 'FLATBED', label: 'Flatbed', color: '#6366F1' }
  ];

  const ownershipTypes = [
    { value: 'COMPANY', label: 'Company', color: '#3B82F6' },
    { value: 'OWNER_OPERATOR', label: 'Owner-operator', color: '#10B981' },
    { value: 'LEASE', label: 'Lease', color: '#F59E0B' },
    { value: 'RENTAL', label: 'Rental', color: '#8B5CF6' }
  ];

  const truckSearchCategories = [
    { value: "all", label: "All Fields" },
    { value: "truck_number", label: "Truck Number" },
    { value: "vin", label: "VIN" },
    { value: "plate_number", label: "Plate Number" },
    { value: "make", label: "Make" },
    { value: "model", label: "Model" },
    { value: "year", label: "Year" }
  ];

  const trailerSearchCategories = [
    { value: "all", label: "All Fields" },
    { value: "trailer_number", label: "Trailer Number" },
    { value: "vin", label: "VIN" },
    { value: "plate_number", label: "Plate Number" },
    { value: "type", label: "Type" }
  ];

  const searchCategories = type === 'truck' ? truckSearchCategories : trailerSearchCategories;

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'truck' ? '/truck/' : '/trailer/';
      const data = await ApiService.getData(endpoint);
      setItems(data);
      setFilteredItems(data);
      setError(null);
    } catch (error) {
      setError(`Error fetching ${type} data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

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

  const handleSearch = () => {
    if (searchTerm === "") {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => {
      if (searchCategory === "all") {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        return String(item[searchCategory])
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
    });

    setFilteredItems(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, searchCategory, items]);

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    if (status === selectedStatus) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => item.status === status);
      setFilteredItems(filtered);
    }
  };

  const handleTypeFilter = (trailerType) => {
    setSelectedStatus(trailerType === selectedStatus ? null : trailerType);
    if (trailerType === selectedStatus) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => item.type === trailerType);
      setFilteredItems(filtered);
    }
  };

  const handleOwnershipFilter = (ownership) => {
    setSelectedStatus(ownership === selectedStatus ? null : ownership);
    if (ownership === selectedStatus) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => item.ownership_type === ownership);
      setFilteredItems(filtered);
    }
  };

  const handleCreate = () => {
    navigate(`/${type}/create`);
  };

  const handleEdit = (id) => {
    navigate(`/${type}/${id}/edit`);
  };

  const handleView = (item) => {
    navigate(`/${type}/${item.id}`);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      await ApiService.deleteData(`/${type}/${selectedItem.id}/`);
      await fetchData(); // Refresh data after deletion
      setError(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      setError(`Error deleting ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatVin = (vin) => {
    if (!vin) return '-';
    if (vin.length <= 6) return vin;
    return `...${vin.slice(-6)}`;
  };

  const ViewDialog = () => (
    <Dialog 
      open={viewDialogOpen} 
      onClose={() => setViewDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          {type.charAt(0).toUpperCase() + type.slice(1)} Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton 
              onClick={() => {
                setViewDialogOpen(false);
                navigate(`/${type}/${selectedItem.id}/edit`);
              }}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              onClick={() => {
                setViewDialogOpen(false);
                setDeleteDialogOpen(true);
              }}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {Object.entries(selectedItem || {}).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body1">
                  {key.includes('date') ? formatDate(value) : 
                   key === 'unit_number' ? (value || '-') : 
                   value || '-'}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const DeleteDialog = () => (
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this {type}? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setDeleteDialogOpen(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          color="error" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const getStatusStyle = (status) => {
    const statusConfig = statuses.find(s => s.value === status);
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

  const truckColumns = [
    {
      field: 'vin',
      headerName: 'VIN',
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
          <Typography
            sx={{ 
              whiteSpace: 'nowrap',
              overflow: 'visible',
              cursor: 'pointer',
              color: '#3B82F6',
              textDecoration: 'underline'
            }}
            onClick={() => handleView(params.row)}
          >
            {formatVin(params.value)}
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
      field: 'unit_number', 
      headerName: 'Unit Number', 
      width: 150,
      valueFormatter: (params) => params?.value || '-'
    },
    { field: 'make', headerName: 'Make', width: 120 },
    { field: 'model', headerName: 'Model', width: 120 },
    { field: 'plate_number', headerName: 'Plate Number', width: 120 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'state', headerName: 'State', width: 100 },
    { field: 'weight', headerName: 'Weight', width: 100 },
    { 
      field: 'registration_expiry_date', 
      headerName: 'Registration Expiry', 
      width: 150,
      valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    { 
      field: 'last_annual_inspection_date', 
      headerName: 'Last Inspection', 
      width: 150,
      valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    {
      field: 'assignment_status',
      headerName: 'Status',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          paddingTop: '4px'
        }}>
          <Chip
            label={params.value || 'N/A'}
            sx={{
              backgroundColor: params.value === 'AVAILABLE' ? '#10B98115' : '#F59E0B15',
              color: params.value === 'AVAILABLE' ? '#10B981' : '#F59E0B',
              height: '20px',
              minWidth: 'auto',
              maxWidth: '100%',
              '& .MuiChip-label': {
                fontSize: '0.7rem',
                padding: '0 8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }}
          />
        </Box>
      )
    },
    {
      field: 'ownership_type',
      headerName: 'Ownership',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const ownershipConfig = ownershipTypes.find(t => t.value === params.value);
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
              label={ownershipConfig?.label || params.value || 'N/A'}
              sx={{
                backgroundColor: `${ownershipConfig?.color}15` || '#64748B15',
                color: ownershipConfig?.color || '#64748B',
                height: '20px',
                minWidth: 'auto',
                maxWidth: '100%',
                '& .MuiChip-label': {
                  fontSize: '0.7rem',
                  padding: '0 8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
          </Box>
        );
      }
    },
    { field: 'color', headerName: 'Color', width: 100, valueFormatter: (params) => params?.value || '-' },
    { field: 'mc_number', headerName: 'MC Number', width: 120, valueFormatter: (params) => params?.value || '-' },
    { field: 'pickup_odometer', headerName: 'Pickup Odometer', width: 150, valueFormatter: (params) => params?.value || '-' },
    { field: 'owner', headerName: 'Owner', width: 120, valueFormatter: (params) => params?.value || '-' },
    { field: 'driver', headerName: 'Driver', width: 120, valueFormatter: (params) => params?.value || '-' },
    { field: 'location', headerName: 'Location', width: 150, valueFormatter: (params) => params?.value || '-' },
    { field: 'mileage_on_pickup', headerName: 'Mileage on Pickup', width: 150, valueFormatter: (params) => params?.value || '-' }
  ];

  const trailerColumns = [
    {
      field: 'vin',
      headerName: 'VIN',
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
          <Typography
            sx={{ 
              whiteSpace: 'nowrap',
              overflow: 'visible',
              cursor: 'pointer',
              color: '#3B82F6',
              textDecoration: 'underline'
            }}
            onClick={() => handleView(params.row)}
          >
            {formatVin(params.value)}
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
      field: 'unit_number', 
      headerName: 'Unit Number', 
      width: 150,
      valueFormatter: (params) => params?.value || '-'
    },
    { field: 'make', headerName: 'Trailer Number', width: 120 },
    { field: 'model', headerName: 'Model', width: 120 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'plate_number', headerName: 'Plate Number', width: 120 },
    { field: 'mc_number', headerName: 'MC Number', width: 120 },
    { field: 'owner', headerName: 'Owner', width: 120 },
    { 
      field: 'ownership', 
      headerName: 'Ownership', 
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const ownershipConfig = ownershipTypes.find(t => t.value === params.value);
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
              label={ownershipConfig?.label || params.value || 'N/A'}
              sx={{
                backgroundColor: `${ownershipConfig?.color}15` || '#64748B15',
                color: ownershipConfig?.color || '#64748B',
                height: '20px',
                minWidth: 'auto',
                maxWidth: '100%',
                '& .MuiChip-label': {
                  fontSize: '0.7rem',
                  padding: '0 8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
          </Box>
        );
      }
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const typeConfig = trailerTypes.find(t => t.value === params.value);
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
              label={typeConfig?.label || params.value || 'N/A'}
              sx={{
                backgroundColor: `${typeConfig?.color}15` || '#64748B15',
                color: typeConfig?.color || '#64748B',
                height: '20px',
                minWidth: 'auto',
                maxWidth: '100%',
                '& .MuiChip-label': {
                  fontSize: '0.7rem',
                  padding: '0 8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
          </Box>
        );
      }
    },
    { 
      field: 'registration_expiry_date', 
      headerName: 'Registration Expiry', 
      width: 150,
      valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    { 
      field: 'last_annual_inspection_date', 
      headerName: 'Last Inspection', 
      width: 150,
      valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    { field: 'location', headerName: 'Location', width: 150, valueFormatter: (params) => params?.value || '-' },
    { field: 'driver', headerName: 'Driver', width: 120, valueFormatter: (params) => params?.value || '-' },
    { field: 'co_driver', headerName: 'Co-Driver', width: 120, valueFormatter: (params) => params?.value || '-' },
    { 
      field: 'pickup_date', 
      headerName: 'Pickup Date', 
      width: 150,
      valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    { 
      field: 'drop_date', 
      headerName: 'Drop Date', 
      width: 150,
      valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleDateString() : '-'
    }
  ];

  const columns = type === 'truck' ? truckColumns : trailerColumns;

  return (
    <Box sx={{ height: '100%', width: '100%', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={tableRef}>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          {type === 'truck' ? 'Trucks' : 'Trailers'}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          width: '50%',
          gap: 1, 
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
              width: '150px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#F9FAFB',
                height: '32px'
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
            placeholder={`Search ${type}s...`}
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
                height: '32px'
              }
            }}
          />

          <IconButton 
            onClick={() => {}}
            sx={{ 
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              height: '32px',
              width: '32px',
              minWidth: '32px'
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreate}
          sx={{
            height: '32px',
            textTransform: 'none',
            px: 2,
            whiteSpace: 'nowrap'
          }}
        >
          Create {type === 'truck' ? 'Truck' : 'Trailer'}
        </Button>
      </Box>

      {/* Type Filter Buttons for Trailer */}
      {type === 'trailer' && (
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
          {trailerTypes.map((trailerType) => (
            <Chip
              key={trailerType.value}
              label={trailerType.label}
              onClick={() => handleTypeFilter(trailerType.value)}
              sx={{
                backgroundColor: selectedStatus === trailerType.value ? trailerType.color : 'transparent',
                color: selectedStatus === trailerType.value ? 'white' : 'inherit',
                borderColor: trailerType.color,
                border: '1px solid',
                '&:hover': {
                  backgroundColor: trailerType.color,
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Ownership Filter Buttons for Truck */}
      {type === 'truck' && (
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
          {ownershipTypes.map((ownership) => (
            <Chip
              key={ownership.value}
              label={ownership.label}
              onClick={() => handleOwnershipFilter(ownership.value)}
              sx={{
                backgroundColor: selectedStatus === ownership.value ? ownership.color : 'transparent',
                color: selectedStatus === ownership.value ? 'white' : 'inherit',
                borderColor: ownership.color,
                border: '1px solid',
                '&:hover': {
                  backgroundColor: ownership.color,
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>
      )}

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
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
          <DataGrid
            rows={filteredItems}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            components={{
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
          />
        </Box>
      </Box>

      <ViewDialog />
      <DeleteDialog />
    </Box>
  );
};

export default TruckTrailerPage;