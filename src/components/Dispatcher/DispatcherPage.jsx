import React, { useEffect, useState, useRef } from "react";
import { Typography, Box, Button, TextField, MenuItem, InputAdornment, Chip, IconButton, Menu, Popover, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ApiService } from "../../api/auth";
import { useNavigate } from 'react-router-dom';
import './DispatcherPage.css';
import { useSidebar } from "../SidebarContext";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  MdPerson,
  MdCheckCircle,
  MdBlock,
  MdAccessTime
} from 'react-icons/md';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const DispatcherPage = () => {
  const [dispatchers, setDispatchers] = useState([]);
  const [filteredDispatchers, setFilteredDispatchers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();

  const dispatcherStatuses = [
    { value: 'ACTIVE (DF)', label: 'Active', icon: <MdCheckCircle />, color: '#10B981' },
    { value: 'TERMINATE', label: 'Terminate', icon: <MdBlock />, color: '#EF4444' },
    { value: 'APPLICANT', label: 'Applicant', icon: <MdAccessTime />, color: '#6366F1' }
  ];

  const searchCategories = [
    { value: "all", label: "All Fields" },
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "nickname", label: "Nickname" },
    { value: "employee_status", label: "Employee Status" },
    { value: "position", label: "Position" },
    { value: "company_name", label: "Company Name" },
    { value: "email_address", label: "Email" },
    { value: "contact_number", label: "Contact Number" }
  ];

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Status filter handler
  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    if (status === selectedStatus) {
      setFilteredDispatchers(dispatchers);
    } else {
      const filtered = dispatchers.filter(dispatcher => {
        if (!dispatcher || !dispatcher.employee_status) return false;
        return dispatcher.employee_status.toLowerCase() === status.toLowerCase();
      });
      setFilteredDispatchers(filtered);
    }
  };

  useEffect(() => {
    const fetchDispatchersData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/dispatcher/`, storedAccessToken);
          const users = await Promise.all(
            data.map(async (dispatcher) => {
              if (dispatcher.user && typeof dispatcher.user === 'number') {
                try {
                  const user = await ApiService.getData(`/auth/user/${dispatcher.user}/`);
                  return { ...dispatcher, user };
                } catch {
                  return { ...dispatcher, user: null };
                }
              }
              return dispatcher;
            })
          );
          setDispatchers(users);
          setFilteredDispatchers(users);
        } catch (error) {
          console.error("Error fetching dispatchers data:", error);
        }
      }
    };

    fetchDispatchersData();
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
      setFilteredDispatchers(dispatchers);
      return;
    }

    const filtered = dispatchers.filter(dispatcher => {
      if (searchCategory === "all") {
        return Object.values(dispatcher).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        return String(dispatcher[searchCategory])
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
    });

    setFilteredDispatchers(filtered);
  }, [searchTerm, searchCategory, dispatchers]);

  const handleCreateDispatcher = () => {
    navigate('/dispatcher/create');
  };

  const handleEditDispatcher = (dispatcherId) => {
    navigate(`/dispatcher/edit/${dispatcherId}`);
  };

  const handleViewDispatcher = (dispatcherId) => {
    navigate(`/dispatcher/${dispatcherId}`);
  };

  const getStatusStyle = (status) => {
    const statusConfig = dispatcherStatuses.find(s => s.value.toLowerCase() === status?.toLowerCase());
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

  const columns = [
    {
      field: 'nickname',
      headerName: 'Nickname',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const nickname = params.row.nickname || '-';
        const shortNick = nickname.length > 8 ? nickname.slice(0, 8) + '...' : nickname;
        return (
          <Tooltip title={nickname}>
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
                  cursor: nickname !== '-' ? 'pointer' : 'default',
                  color: nickname !== '-' ? '#3B82F6' : 'inherit',
                  textDecoration: nickname !== '-' ? 'underline' : 'none'
                }}
                onClick={() => nickname !== '-' && navigate(`/dispatcher/${params.row.id}`)}
              >
                {shortNick}
              </Typography>
              {nickname !== '-' && (
                <IconButton
                  size="small"
                  onClick={() => handleCopyId(nickname)}
                  sx={{
                    padding: '4px',
                    color: copiedId === nickname ? '#10B981' : '#6B7280',
                    '&:hover': {
                      backgroundColor: copiedId === nickname ? '#D1FAE5' : '#F3F4F6'
                    }
                  }}
                >
                  {copiedId === nickname ? (
                    <CheckIcon sx={{ fontSize: '16px' }} />
                  ) : (
                    <ContentCopyIcon sx={{ fontSize: '16px' }} />
                  )}
                </IconButton>
              )}
            </Box>
          </Tooltip>
        );
      }
    },
    { field: 'mc_number', headerName: 'MC Number', width: 150 },
    { field: 'employee_status', headerName: 'Status', width: 130, headerAlign: 'center', align: 'center', renderCell: (params) => {
      const statusConfig = dispatcherStatuses.find(s => s.value.toLowerCase() === (params.value || '').toLowerCase());
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: '4px' }}>
          <Chip
            label={statusConfig?.label || params.value}
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
    }},
    { field: 'position', headerName: 'Position', width: 150 },
    { field: 'company_name', headerName: 'Company Name', width: 150 },
    { field: 'office', headerName: 'Office', width: 150 },
    { field: 'user_first_name', headerName: 'First Name', width: 120, valueGetter: (params) => params.row.user?.first_name || '-' },
    { field: 'user_last_name', headerName: 'Last Name', width: 120, valueGetter: (params) => params.row.user?.last_name || '-' },
    { field: 'user_email', headerName: 'Email', width: 200, valueGetter: (params) => params.row.user?.email || '-' },
    { field: 'user_telephone', headerName: 'Phone', width: 130, valueGetter: (params) => params.row.user?.telephone || '-' },
    { field: 'user_state', headerName: 'State', width: 100, valueGetter: (params) => params.row.user?.state || '-' },
    { field: 'user_city', headerName: 'City', width: 120, valueGetter: (params) => params.row.user?.city || '-' },
    { field: 'user_address', headerName: 'Address', width: 150, valueGetter: (params) => params.row.user?.address || '-' },
    { field: 'user_country', headerName: 'Country', width: 120, valueGetter: (params) => params.row.user?.country || '-' },
    { field: 'user_postal_zip', headerName: 'ZIP', width: 100, valueGetter: (params) => params.row.user?.postal_zip || '-' }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={tableRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Dispatchers
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          width: '75%',
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
            placeholder="Search dispatchers..."
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
            onClick={handleFilterClick}
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
          onClick={handleCreateDispatcher}
          sx={{
            height: '32px',
            textTransform: 'none',
            px: 2,
            whiteSpace: 'nowrap'
          }}
        >
          Create&nbsp;Dispatcher
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
        {dispatcherStatuses.map((status) => (
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
            rows={filteredDispatchers}
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

export default DispatcherPage;