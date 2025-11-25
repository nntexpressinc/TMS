import React, { useEffect, useState, useRef } from "react";
import { Typography, Box, Button, TextField, MenuItem, InputAdornment, Chip, IconButton, Tooltip } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { ApiService } from "../../api/auth";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Download, Height, FormatAlignLeft, FormatAlignCenter, FormatAlignRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './EmployeePage.css';
import { useSidebar } from "../SidebarContext";
import { OverlayLoader } from "../loader/PulseDotsLoader";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();

  const employeeStatuses = [
    { value: 'ACTIVE (DF)', label: 'Active', color: '#10B981' },
    { value: 'Terminate', label: 'Terminated', color: '#EF4444' },
    { value: 'Applicant', label: 'Applicant', color: '#F59E0B' }
  ];

  const searchCategories = [
    { value: "all", label: "All Fields" },
    { value: "nickname", label: "Nickname" },
    { value: "user_first_name", label: "First Name" },
    { value: "user_last_name", label: "Last Name" },
    { value: "user_telephone", label: "Phone Number" },
    { value: "user_email", label: "Email Address" },
    { value: "user_company_name", label: "Company Name" },
    { value: "position", label: "Position" },
    { value: "employee_status", label: "Employee Status" },
    { value: "user_city", label: "City" },
    { value: "user_state", label: "State" }
  ];

  useEffect(() => {
    const fetchEmployeesData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        setLoading(true); // 🔹 So‘rov boshlanishida loading true
        try {
          const data = await ApiService.getData(`/employee/`, storedAccessToken);
          setEmployees(data);
          setFilteredEmployees(data);
        } catch (error) {
          console.error("Error fetching employees data:", error);
        } finally {
          setLoading(false); // 🔹 Yakunda false
        }
      }
    };

    fetchEmployeesData();
  }, []);

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);


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

  const applyFilters = () => {
    let filtered = [...employees];

    // Apply search filter first
    if (debouncedSearchTerm !== "") {
      filtered = filtered.filter(employee => {
        if (searchCategory === "all") {
          // Search across all relevant fields including nested user data
          const searchableFields = [
            // Employee fields
            employee.nickname,
            employee.position,
            employee.employee_status,
            employee.note,
            employee.employee_tags,
            // User nested fields
            employee.user?.first_name,
            employee.user?.last_name,
            employee.user?.email,
            employee.user?.telephone,
            employee.user?.company_name,
            employee.user?.state,
            employee.user?.city,
            employee.user?.address,
            employee.user?.country,
            employee.user?.postal_zip
          ];
          
          return searchableFields.some(value =>
            value && String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          );
        } else {
          // Handle nested field searches
          let fieldValue;
          if (searchCategory.startsWith('user_')) {
            const userField = searchCategory.replace('user_', '');
            fieldValue = employee.user?.[userField];
          } else {
            fieldValue = employee[searchCategory];
          }
          
          return fieldValue && String(fieldValue)
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase());
        }
      });
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(employee => employee.employee_status === selectedStatus);
    }

    setFilteredEmployees(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [debouncedSearchTerm, searchCategory, employees, selectedStatus]);

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  const handleCreateEmployee = () => {
    navigate('/employee/create');
  };

  const handleEdit = (id) => {
    navigate(`/employee/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/employee/${id}`);
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
        const shortNick = nickname.length > 8 ? nickname.substring(0, 8) + '...' : nickname;
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
                cursor: nickname !== '-' ? 'pointer' : 'default',
                color: nickname !== '-' ? '#3B82F6' : 'inherit',
                textDecoration: nickname !== '-' ? 'underline' : 'none'
              }}
              onClick={() => nickname !== '-' && navigate(`/employee/${params.row.id}`)}
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
        );
      }
    },
    { field: 'position', headerName: 'Position', width: 150 },
    {
      field: 'employee_status', headerName: 'Status', width: 130, headerAlign: 'center', align: 'center', renderCell: (params) => {
        const statusConfig = employeeStatuses.find(s => s.value === params.value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: '4px' }}>
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
    { field: 'user_first_name', headerName: 'First Name', width: 120, valueGetter: (params) => params.row.user?.first_name || '-' },
    { field: 'user_last_name', headerName: 'Last Name', width: 120, valueGetter: (params) => params.row.user?.last_name || '-' },
    { field: 'user_email', headerName: 'Email', width: 200, valueGetter: (params) => params.row.user?.email || '-' },
    { field: 'user_telephone', headerName: 'Phone', width: 130, valueGetter: (params) => params.row.user?.telephone || '-' },
    { field: 'user_company_name', headerName: 'Company Name', width: 150, valueGetter: (params) => params.row.user?.company_name || '-' },
    { field: 'user_state', headerName: 'State', width: 100, valueGetter: (params) => params.row.user?.state || '-' },
    { field: 'user_city', headerName: 'City', width: 120, valueGetter: (params) => params.row.user?.city || '-' },
    { field: 'user_address', headerName: 'Address', width: 150, valueGetter: (params) => params.row.user?.address || '-' },
    { field: 'user_country', headerName: 'Country', width: 120, valueGetter: (params) => params.row.user?.country || '-' },
    { field: 'user_postal_zip', headerName: 'ZIP', width: 100, valueGetter: (params) => params.row.user?.postal_zip || '-' },
    { field: 'note', headerName: 'Note', width: 200 },
    { field: 'employee_tags', headerName: 'Employee Tags', width: 100 }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={tableRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Employees
        </Typography>
        <Box sx={{
          display: 'flex',
          width: '60%',
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
              width: '180px',
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
            placeholder="Search employees..."
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
        </Box>
        <Button
          variant="contained"
          // color="primary" 
          onClick={handleCreateEmployee}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid rgb(189, 189, 189)',  // kulrang border
            height: '32px',
            textTransform: 'none',
            px: 2,
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1px solid rgb(189, 189, 189)',
              color: 'black'
            }
          }}
        >
          Create Employee
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
        {employeeStatuses.map((status) => (
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
        <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
          {loading && (
            <OverlayLoader
              fullScreen={false}
              showText={false}
            />
          )}
          <DataGrid
            rows={filteredEmployees}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            loading={loading}
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

export default EmployeePage;