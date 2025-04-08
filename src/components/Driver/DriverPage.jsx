import React, { useEffect, useState, useRef } from "react";
import { Typography, Box, Button, TextField, MenuItem, InputAdornment, Chip, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ApiService } from "../../api/auth";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Download, Height, FormatAlignLeft, FormatAlignCenter, FormatAlignRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './DriverPage.css';
import { useSidebar } from "../SidebarContext";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const DriverPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();

  const driverStatuses = [
    { value: 'Available', label: 'Available', color: '#10B981' },
    { value: 'Home', label: 'Home', color: '#3B82F6' },
    { value: 'In-Transit', label: 'In-Transit', color: '#F59E0B' },
    { value: 'Inactive', label: 'Inactive', color: '#EF4444' },
    { value: 'Shop', label: 'Shop', color: '#8B5CF6' },
    { value: 'Rest', label: 'Rest', color: '#EC4899' },
    { value: 'Dispatched', label: 'Dispatched', color: '#6366F1' }
  ];

  const searchCategories = [
    { value: "all", label: "All Fields" },
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "contact_number", label: "Contact Number" },
    { value: "email_address", label: "Email Address" },
    { value: "driver_license_id", label: "Driver License ID" }
  ];

  useEffect(() => {
    const fetchDriversData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/driver/`, storedAccessToken);
          setDrivers(data);
          setFilteredDrivers(data);
        } catch (error) {
          console.error("Error fetching drivers data:", error);
        }
      }
    };

    fetchDriversData();
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

  const handleSearch = () => {
    if (searchTerm === "") {
      setFilteredDrivers(drivers);
      return;
    }

    const filtered = drivers.filter(driver => {
      if (searchCategory === "all") {
        return Object.values(driver).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        return String(driver[searchCategory])
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
    });

    setFilteredDrivers(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, searchCategory, drivers]);

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    if (status === selectedStatus) {
      setFilteredDrivers(drivers);
    } else {
      const filtered = drivers.filter(driver => driver.driver_status === status);
      setFilteredDrivers(filtered);
    }
  };

  const handleCreateDriver = () => {
    navigate('/driver/create');
  };

  const handleEdit = (id) => {
    navigate(`/driver/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/driver/${id}`);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 150,
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
    { field: 'first_name', headerName: 'First Name', width: 120 },
    { field: 'last_name', headerName: 'Last Name', width: 120 },
    { field: 'contact_number', headerName: 'Contact Number', width: 150 },
    { field: 'birth_date', headerName: 'Birth Date', width: 150 },
    { field: 'employment_status', headerName: 'Employment Status', width: 150 },
    { field: 'telegram_username', headerName: 'Telegram Username', width: 150 },
    { field: 'company_name', headerName: 'Company Name', width: 150 },
    { field: 'email_address', headerName: 'Email Address', width: 200 },
    { field: 'driver_license_id', headerName: 'Driver License ID', width: 150 },
    { field: 'dl_class', headerName: 'DL Class', width: 100 },
    { field: 'driver_type', headerName: 'Driver Type', width: 150 },
    { field: 'driver_license_state', headerName: 'Driver License State', width: 150 },
    { field: 'driver_license_expiration', headerName: 'Driver License Expiration', width: 200 },
    { field: 'address1', headerName: 'Address 1', width: 200 },
    { field: 'address2', headerName: 'Address 2', width: 200 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'state', headerName: 'State', width: 100 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'zip_code', headerName: 'Zip Code', width: 150 },
    { field: 'other_id', headerName: 'Other ID', width: 150 },
    { field: 'notes', headerName: 'Notes', width: 200 },
    { field: 'tariff', headerName: 'Tariff', width: 100 },
    { field: 'mc_number', headerName: 'MC Number', width: 150 },
    { field: 'team_driver', headerName: 'Team Driver', width: 150 },
    { field: 'escrow_deposit', headerName: 'Escrow Deposit', width: 150 },
    { field: 'permile', headerName: 'Per Mile', width: 100 },
    { field: 'cost', headerName: 'Cost', width: 100 },
    { field: 'payd', headerName: 'Payd', width: 100 },
    { field: 'assigned_truck', headerName: 'Assigned Truck', width: 150 },
    { field: 'assigned_trailer', headerName: 'Assigned Trailer', width: 150 },
    { field: 'assigned_dispatcher', headerName: 'Assigned Dispatcher', width: 150 },
    { field: 'driver_tags', headerName: 'Driver Tags', width: 100 },
    {
      field: 'driver_status',
      headerName: 'Status',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      pinned: 'right',
      renderCell: (params) => {
        const statusConfig = driverStatuses.find(s => s.value === params.value);
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
              label={statusConfig?.label || params.value || 'N/A'}
              sx={{
                backgroundColor: `${statusConfig?.color}15` || '#64748B15',
                color: statusConfig?.color || '#64748B',
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
              onClick={() => handleEdit(params.row.id)}
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
              onClick={() => handleView(params.row.id)}
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
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={tableRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Drivers
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
            placeholder="Search drivers..."
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
          onClick={handleCreateDriver}
          sx={{
            height: '32px',
            textTransform: 'none',
            px: 2,
            whiteSpace: 'nowrap'
          }}
        >
          Create Driver
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
        {driverStatuses.map((status) => (
          <Chip
            key={status.value}
            label={status.label}
            onClick={() => handleStatusFilter(status.value)}
            sx={{
              backgroundColor: selectedStatus === status.value ? status.color : 'transparent',
              color: selectedStatus === status.value ? 'white' : 'inherit',
              borderColor: status.color,
              border: '1px solid',
              '&:hover': {
                backgroundColor: status.color,
                color: 'white'
              }
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, overflow: 'hidden' }}>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <DataGrid
            rows={filteredDrivers}
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
    </Box>
  );
};

export default DriverPage;