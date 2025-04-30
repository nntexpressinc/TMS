import React, { useEffect, useState, useRef } from "react";
import { Typography, Box, Button, TextField, MenuItem, InputAdornment, Chip, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ApiService,ENDPOINTS } from "../../api/auth";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Download, Height, FormatAlignLeft, FormatAlignCenter, FormatAlignRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './CustomerBrokerPage.css';
import { useSidebar } from "../SidebarContext";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const CustomerBrokerPage = () => {
  const [customerBrokers, setCustomerBrokers] = useState([]);
  const [filteredCustomerBrokers, setFilteredCustomerBrokers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [copiedContact, setCopiedContact] = useState(null);
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();

  const customerBrokerStatuses = [
    { value: 'ACTIVE', label: 'Active', color: '#10B981' },
    { value: 'INACTIVE', label: 'Inactive', color: '#EF4444' },
    { value: 'PENDING', label: 'Pending', color: '#F59E0B' }
  ];

  const searchCategories = [
    { value: "all", label: "All Fields" },
    { value: "company_name", label: "Company Name" },
    { value: "contact_number", label: "Contact Number" },
    { value: "email_address", label: "Email Address" },
    { value: "mc_number", label: "MC Number" }
  ];

  // Define a default category
  const defaultCategory = searchCategories.length > 0 ? searchCategories[0].value : "";

  // Ensure the searchCategory is always set
  useEffect(() => {
    if (!searchCategory && searchCategories.length > 0) {
      setSearchCategory(defaultCategory);
    }
  }, [searchCategory, searchCategories]);

  useEffect(() => {
    const fetchCustomerBrokersData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(ENDPOINTS.CUSTOMER_BROKER, storedAccessToken);
          setCustomerBrokers(data);
          setFilteredCustomerBrokers(data);
        } catch (error) {
          console.error("Error fetching customer brokers data:", error);
        }
      }
    };

    fetchCustomerBrokersData();
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
      setFilteredCustomerBrokers(customerBrokers);
      return;
    }

    const filtered = customerBrokers.filter(customerBroker => {
      if (searchCategory === "all") {
        return Object.values(customerBroker).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        return String(customerBroker[searchCategory])
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
    });

    setFilteredCustomerBrokers(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, searchCategory, customerBrokers]);

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    if (status === selectedStatus) {
      setFilteredCustomerBrokers(customerBrokers);
    } else {
      const filtered = customerBrokers.filter(customerBroker => customerBroker.status === status);
      setFilteredCustomerBrokers(filtered);
    }
  };

  const handleCreateCustomerBroker = () => {
    navigate('/customer_broker/create');
  };

  const handleEdit = (id) => {
    navigate(`/customer_broker/${id}/edit`);
  };

  const handleView = (item) => {
    navigate(`/customer_broker/${item.id}`);
  };

  const handleCopyContact = (contact) => {
    navigator.clipboard.writeText(contact);
    setCopiedContact(contact);
    setTimeout(() => setCopiedContact(null), 2000);
  };

  const columns = [
    {
      field: 'mc_number',
      headerName: 'MC Number',
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
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px',
              cursor: 'pointer',
              color: '#3B82F6',
              textDecoration: 'underline'
            }}
            onClick={() => handleView(params.row)}
          >
            {params.value || '-'}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleCopyContact(params.value)}
            sx={{
              padding: '4px',
              color: copiedContact === params.value ? '#10B981' : '#6B7280',
              '&:hover': { 
                backgroundColor: copiedContact === params.value ? '#D1FAE5' : '#F3F4F6'
              }
            }}
          >
            {copiedContact === params.value ? (
              <CheckIcon sx={{ fontSize: '16px' }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: '16px' }} />
            )}
          </IconButton>
        </Box>
      )
    },
    { field: 'company_name', headerName: 'Company Name', width: 150 },
    {
      field: 'contact_number',
      headerName: 'Contact Number',
      width: 150,
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
            {params.value || '-'}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleCopyContact(params.value)}
            sx={{
              padding: '4px',
              color: copiedContact === params.value ? '#10B981' : '#6B7280',
              '&:hover': { 
                backgroundColor: copiedContact === params.value ? '#D1FAE5' : '#F3F4F6'
              }
            }}
          >
            {copiedContact === params.value ? (
              <CheckIcon sx={{ fontSize: '16px' }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: '16px' }} />
            )}
          </IconButton>
        </Box>
      )
    },
    { field: 'email_address', headerName: 'Email Address', width: 200 },
    { field: 'pod_file', headerName: 'POD File', width: 100 },
    { field: 'rate_con', headerName: 'Rate Con', width: 100 },
    { field: 'address1', headerName: 'Address 1', width: 200 },
    { field: 'address2', headerName: 'Address 2', width: 200 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'state', headerName: 'State', width: 100 },
    { field: 'zip_code', headerName: 'Zip Code', width: 150 },
    { field: 'city', headerName: 'City', width: 150 },
    { 
      field: 'billing_type', 
      headerName: 'Billing Type', 
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const billingTypes = {
          'NONE': { label: 'None', color: '#64748B' },
          'FACTORING_COMPANY': { label: 'Factoring Company', color: '#3B82F6' },
          'EMAIL': { label: 'Email', color: '#10B981' },
          'MANUAL': { label: 'Manual', color: '#F59E0B' }
        };
        const typeConfig = billingTypes[params.value] || { label: params.value, color: '#64748B' };
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
              label={typeConfig.label}
              sx={{
                backgroundColor: `${typeConfig.color}15`,
                color: typeConfig.color,
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
      field: 'terms_days', 
      headerName: 'Terms Days', 
      width: 150,
      valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const statusConfig = customerBrokerStatuses.find(s => s.value === params.value);
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
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', transition: 'width 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} ref={tableRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Customer Brokers
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
            value={searchCategory || defaultCategory}
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
            placeholder="Search customer brokers..."
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
          onClick={handleCreateCustomerBroker}
          sx={{
            height: '32px',
            textTransform: 'none',
            px: 2,
            whiteSpace: 'nowrap'
          }}
        >
          Create Customer Broker
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
        {customerBrokerStatuses.map((status) => (
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
            rows={filteredCustomerBrokers}
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

export default CustomerBrokerPage;