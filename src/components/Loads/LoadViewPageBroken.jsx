import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Divider,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Avatar,
  Badge,
  Chip,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch,
  FormControlLabel,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  Fade,
  Skeleton,
  LinearProgress,
  Tooltip,
  Menu
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Send,
  LocationOn,
  Edit as EditIcon,
  AttachFile,
  Close as CloseIcon,
  InsertDriveFile,
  Image,
  Download,
  PictureAsPdf,
  LocalShipping,
  ArrowBack,
  Refresh as RefreshIcon,
  Assignment,
  Done,
  CheckCircle,
  Cancel,
  Add as AddIcon,
  Business as BusinessIcon,
  Check,
  Save as SaveIcon,
  Visibility,
  FileUpload,
  Description,
  PersonOutline,
  DriveEta,
  Info,
  DocumentScanner,
  GetApp,
  AttachMoney as AttachMoneyIcon,
  Save,
  Close,
  Delete,
  LocalShipping as LocalShippingIcon,
  Numbers as NumbersIcon,
  QrCode as QrCodeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Directions as DirectionsIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  SupportAgent as SupportAgentIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  Badge as BadgeIcon,
  ContentCopy as ContentCopyIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  Chat as ChatIcon,
  Map as MapIcon,
  MonetizationOn as MonetizationOnIcon,
  Description as DescriptionIcon,
  Speed as SpeedIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { ApiService } from "../../api/auth";
import chatSocketService from "../../api/chat";
import { useSidebar } from "../SidebarContext";
import darkLogo from '../../images/dark-logo.png';
import EmojiPicker from 'emoji-picker-react';

// Enhanced Styled Components with modern design
const MainContainer = styled(Box)(({ theme, fullscreen }) => ({
  display: "flex",
  flexDirection: "column",
  height: fullscreen ? "100vh" : "calc(100vh - 64px)",
  padding: fullscreen ? 0 : theme.spacing(3),
  gap: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  ...(fullscreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: theme.palette.background.default,
  })
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(20px)',
}));

const StyledHeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const LoadTitleSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flex: 1,
  minWidth: 0,
}));

const LoadIdChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 700,
  fontSize: '1.1rem',
  padding: theme.spacing(0.5, 1),
  height: 48,
  '& .MuiChip-label': {
    padding: theme.spacing(0, 2),
  },
  '& .MuiChip-icon': {
    fontSize: '1.3rem',
  },
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  }
}));

const StatusChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  alignItems: 'center',
}));

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2.5),
  minHeight: 44,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  }
}));

const ModernIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  }
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
}));

const TabPanel = styled(Box)(({ theme, value, index }) => ({
  display: value === index ? 'flex' : 'none',
  flex: 1,
  flexDirection: 'column',
  gap: theme.spacing(3),
  height: '100%',
  overflow: 'hidden',
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  }
}));

const ModernCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2.5),
  '& .MuiCardHeader-title': {
    fontSize: '1.1rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  '& .MuiCardHeader-action': {
    margin: 0,
  }
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: theme.spacing(2.5),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: theme.palette.grey[400],
    },
  },
}));

const InfoGridContainer = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const InfoGridItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  height: '100%',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  }
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  wordBreak: 'break-word',
}));

const QuickStatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const StatCard = styled(Paper)(({ theme, gradient }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'skewX(-15deg)',
  }
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: theme.spacing(1),
  position: 'relative',
  zIndex: 1,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  opacity: 0.9,
  fontWeight: 500,
  position: 'relative',
  zIndex: 1,
}));

const FloatingActionButton = styled(SpeedDial)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1000,
  '& .MuiSpeedDial-fab': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    width: 64,
    height: 64,
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      transform: 'scale(1.1)',
    }
  }
}));

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.modal + 1,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
}));

const SkeletonContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const StopsTimeline = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.palette.divider,
  }
}));

const StopItem = styled(Box)(({ theme, isPickup }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -28,
    top: 8,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: isPickup ? theme.palette.success.main : theme.palette.error.main,
    border: `3px solid ${theme.palette.background.paper}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  }
}));

const StopCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transform: 'translateX(8px)',
  }
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: '10px',
  },
}));

const MessageBubble = styled(Paper)(({ theme, isCurrentUser }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2),
  backgroundColor: isCurrentUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  maxWidth: '80%',
  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  position: 'relative',
  wordBreak: 'break-word',
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'flex-end',
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
}));

// LoadViewPage Component
const LoadViewPage = () => {
  const [load, setLoad] = useState(null);
  const [loadStatus, setLoadStatus] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [editingSection, setEditingSection] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const chatEndRef = useRef(null);
  const { isSidebarOpen } = useSidebar();

  // Load data on component mount
  useEffect(() => {
    console.log('LoadViewPage mounted with ID:', id);
    console.log('ID type:', typeof id);
    console.log('ID value:', id);
    
    if (id && id !== 'undefined' && id !== 'null') {
      fetchLoadData();
      fetchChatMessages();
      getCurrentUser();
    } else {
      console.error('Invalid load ID provided:', id);
      setError('Invalid load ID provided');
      setIsLoading(false);
    }
  }, [id]);

  const fetchLoadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching load with ID:', id);
      
      const response = await ApiService.get(`/load/${id}/`);
      console.log('Load response:', response);
      
      if (response.data) {
        setLoad(response.data);
        setLoadStatus(response.data.load_status || '');
        setInvoiceStatus(response.data.invoice_status || '');
        console.log('Load data set successfully:', response.data);
      } else {
        console.error('No data in response');
        setError('No load data received');
      }
    } catch (error) {
      console.error('Error fetching load:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 404) {
        setError('Load not found');
      } else if (error.response?.status === 403) {
        setError('Access denied to this load');
      } else if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        setError(`Failed to load data: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await ApiService.get(`/load/${id}/chat/`);
      setChatMessages(response.data.results || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await ApiService.get('/user/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/loads');
  };

  const handleCopyLoadId = () => {
    if (load?.load_id) {
      navigator.clipboard.writeText(load.load_id);
      setSnackbar({ open: true, message: 'Load ID copied!', severity: 'success' });
    }
  };

  const handleRefresh = () => {
    fetchLoadData();
    fetchChatMessages();
  };

  const handleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const getStatusChip = (status, type = 'load') => {
    const configs = {
      load: {
        'dispatched': { color: 'primary', label: 'Dispatched' },
        'delivered': { color: 'success', label: 'Delivered' },
        'in_transit': { color: 'warning', label: 'In Transit' },
        'cancelled': { color: 'error', label: 'Cancelled' },
        'available': { color: 'default', label: 'Available' },
      },
      invoice: {
        'paid': { color: 'success', label: 'Paid' },
        'pending': { color: 'warning', label: 'Pending' },
        'overdue': { color: 'error', label: 'Overdue' },
        'draft': { color: 'default', label: 'Draft' },
      }
    };

    const config = configs[type]?.[status?.toLowerCase()] || { color: 'default', label: status || 'Unknown' };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="medium"
        sx={{
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '0.75rem'
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <MainContainer>
        <LoadingOverlay open={true}>
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading load details...
            </Typography>
          </Box>
        </LoadingOverlay>
      </MainContainer>
    );
  }

  if (!load && !isLoading) {
    return (
      <MainContainer>
        <Box textAlign="center" sx={{ py: 8 }}>
          <LocalShipping sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            {error || 'Load not found'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error === 'Load not found' ? 
              `Load with ID "${id}" could not be found.` :
              'Please check the load ID and try again.'
            }
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <ModernButton 
              variant="contained" 
              startIcon={<ArrowBack />}
              onClick={handleBack}
            >
              Back to Loads
            </ModernButton>
            <ModernButton 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => {
                setError(null);
                fetchLoadData();
              }}
            >
              Try Again
            </ModernButton>
          </Box>
        </Box>
      </MainContainer>
    );
  }

  const speedDialActions = [
    { icon: <EditIcon />, name: 'Edit Load', onClick: () => setEditingSection('details') },
    { icon: <RefreshIcon />, name: 'Refresh', onClick: handleRefresh },
    { icon: <ContentCopyIcon />, name: 'Copy Load ID', onClick: handleCopyLoadId },
    { icon: fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />, name: fullscreen ? 'Exit Fullscreen' : 'Fullscreen', onClick: handleFullscreen },
  ];

  return (
    <MainContainer fullscreen={fullscreen}>
      {/* Header */}
      <HeaderContainer>
        <StyledHeaderSection>
          <LoadTitleSection>
            <ModernIconButton onClick={handleBack}>
              <ArrowBack />
            </ModernIconButton>
            
            <LoadIdChip
              icon={<LocalShipping />}
              label={load.load_id || `Load #${load.id}`}
              onClick={handleCopyLoadId}
            />

            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {load.reference_id && ` - ${load.reference_id}`}
            </Typography>
          </LoadTitleSection>

          <StatusChipContainer>
            {getStatusChip(load.load_status, 'load')}
            {getStatusChip(load.invoice_status, 'invoice')}
          </StatusChipContainer>

          <ActionButtonsContainer>
            <ModernIconButton onClick={handleRefresh}>
              <RefreshIcon />
            </ModernIconButton>
            <ModernIconButton onClick={handleFullscreen}>
              {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </ModernIconButton>
          </ActionButtonsContainer>
        </StyledHeaderSection>

        {/* Quick Stats */}
        <QuickStatsContainer>
          <StatCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <StatValue>${load.total_pay || '0.00'}</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </StatCard>
          <StatCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <StatValue>${load.driver_pay || '0.00'}</StatValue>
            <StatLabel>Driver Pay</StatLabel>
          </StatCard>
          <StatCard gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <StatValue>{load.total_miles || '0'} mi</StatValue>
            <StatLabel>Total Miles</StatLabel>
          </StatCard>
          <StatCard gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <StatValue>{load.stops?.length || 0}</StatValue>
            <StatLabel>Total Stops</StatLabel>
          </StatCard>
        </QuickStatsContainer>

        {/* Tabs */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 48,
            }
          }}
        >
          <Tab icon={<Info />} label="Details" iconPosition="start" />
          <Tab icon={<DirectionsIcon />} label="Route & Stops" iconPosition="start" />
          <Tab icon={<ChatIcon />} label="Communication" iconPosition="start" />
          <Tab icon={<DescriptionIcon />} label="Documents" iconPosition="start" />
          <Tab icon={<MonetizationOnIcon />} label="Financials" iconPosition="start" />
        </Tabs>
      </HeaderContainer>

      {/* Content */}
      <ContentContainer>
        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            <Grid item xs={12} md={6}>
              <ModernCard>
                <ModernCardHeader
                  title={
                    <>
                      <Info color="primary" />
                      Load Information
                    </>
                  }
                  action={
                    <ModernIconButton size="small">
                      <EditIcon />
                    </ModernIconButton>
                  }
                />
                <ScrollableContent>
                  <InfoGridContainer container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Load ID</InfoLabel>
                        <InfoValue>{load.load_id || 'N/A'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Reference ID</InfoLabel>
                        <InfoValue>{load.reference_id || 'N/A'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Customer</InfoLabel>
                        <InfoValue>{load.customer_broker?.company_name || 'N/A'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Equipment Type</InfoLabel>
                        <InfoValue>{load.equipment_type || 'N/A'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Weight</InfoLabel>
                        <InfoValue>{load.weight ? `${load.weight} lbs` : 'N/A'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Created Date</InfoLabel>
                        <InfoValue>
                          {load.created_date ? new Date(load.created_date).toLocaleDateString() : 'N/A'}
                        </InfoValue>
                      </InfoGridItem>
                    </Grid>
                  </InfoGridContainer>
                </ScrollableContent>
              </ModernCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <ModernCard>
                <ModernCardHeader
                  title={
                    <>
                      <PersonIcon color="primary" />
                      Team Assignment
                    </>
                  }
                  action={
                    <ModernIconButton size="small">
                      <EditIcon />
                    </ModernIconButton>
                  }
                />
                <ScrollableContent>
                  <InfoGridContainer container spacing={2}>
                    <Grid item xs={12}>
                      <InfoGridItem>
                        <InfoLabel>Driver</InfoLabel>
                        <InfoValue>
                          {load.driver ? 
                            `${load.driver.user?.first_name || ''} ${load.driver.user?.last_name || ''}`.trim() || 'N/A'
                            : 'Unassigned'
                          }
                        </InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12}>
                      <InfoGridItem>
                        <InfoLabel>Dispatcher</InfoLabel>
                        <InfoValue>{load.dispatcher || 'N/A'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12}>
                      <InfoGridItem>
                        <InfoLabel>Truck</InfoLabel>
                        <InfoValue>
                          {load.truck ? 
                            `${load.truck.make || ''} ${load.truck.model || ''} ${load.truck.unit_number || ''}`.trim()
                            : 'N/A'
                          }
                        </InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12}>
                      <InfoGridItem>
                        <InfoLabel>Trailer</InfoLabel>
                        <InfoValue>{load.trailer?.unit_number || 'N/A'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                  </InfoGridContainer>
                </ScrollableContent>
              </ModernCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Route & Stops Tab */}
        <TabPanel value={tabValue} index={1}>
          <ModernCard>
            <ModernCardHeader
              title={
                <>
                  <DirectionsIcon color="primary" />
                  Route & Stops ({load.stops?.length || 0})
                </>
              }
              action={
                <ModernButton variant="outlined" startIcon={<AddIcon />}>
                  Add Stop
                </ModernButton>
              }
            />
            <ScrollableContent>
              {load.stops && load.stops.length > 0 ? (
                <StopsTimeline>
                  {load.stops.map((stop, index) => (
                    <StopItem key={stop.id} isPickup={stop.stop_type === 'pickup'}>
                      <StopCard>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                            {stop.stop_type === 'pickup' ? '📦 Pickup' : '🚚 Delivery'} #{index + 1}
                          </Typography>
                          <Chip 
                            label={stop.stop_type} 
                            color={stop.stop_type === 'pickup' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <InfoLabel>Company</InfoLabel>
                            <InfoValue>{stop.company_name || 'N/A'}</InfoValue>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <InfoLabel>Contact</InfoLabel>
                            <InfoValue>{stop.contact_name || 'N/A'}</InfoValue>
                          </Grid>
                          <Grid item xs={12}>
                            <InfoLabel>Address</InfoLabel>
                            <InfoValue>
                              {[stop.address1, stop.city, stop.state, stop.zip_code]
                                .filter(Boolean).join(', ') || 'N/A'}
                            </InfoValue>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <InfoLabel>Appointment Date</InfoLabel>
                            <InfoValue>
                              {stop.appointmentdate_date ? 
                                new Date(stop.appointmentdate_date).toLocaleDateString() : 'N/A'}
                            </InfoValue>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <InfoLabel>Time</InfoLabel>
                            <InfoValue>{stop.appointmentdate_time || 'N/A'}</InfoValue>
                          </Grid>
                          {stop.note && (
                            <Grid item xs={12}>
                              <InfoLabel>Notes</InfoLabel>
                              <InfoValue>{stop.note}</InfoValue>
                            </Grid>
                          )}
                        </Grid>
                      </StopCard>
                    </StopItem>
                  ))}
                </StopsTimeline>
              ) : (
                <Box textAlign="center" py={8}>
                  <DirectionsIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No stops configured
                  </Typography>
                  <ModernButton variant="contained" startIcon={<AddIcon />}>
                    Add First Stop
                  </ModernButton>
                </Box>
              )}
            </ScrollableContent>
          </ModernCard>
        </TabPanel>

        {/* Communication Tab */}
        <TabPanel value={tabValue} index={2}>
          <ModernCard>
            <ModernCardHeader
              title={
                <>
                  <ChatIcon color="primary" />
                  Load Communication
                </>
              }
            />
            <ChatContainer>
              <ChatMessages>
                {chatMessages.length > 0 ? (
                  chatMessages.map((message, index) => (
                    <MessageBubble 
                      key={index} 
                      isCurrentUser={message.sender?.id === user?.id}
                    >
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {message.message}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {message.sender?.first_name} {message.sender?.last_name} - {' '}
                        {new Date(message.timestamp).toLocaleString()}
                      </Typography>
                    </MessageBubble>
                  ))
                ) : (
                  <Box textAlign="center" py={8}>
                    <ChatIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No messages yet
                    </Typography>
                  </Box>
                )}
                <div ref={chatEndRef} />
              </ChatMessages>
              
              <ChatInputContainer>
                <ModernTextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <ModernIconButton onClick={() => fileInputRef.current?.click()}>
                  <AttachFile />
                </ModernIconButton>
                <ModernButton 
                  variant="contained" 
                  endIcon={<Send />}
                  disabled={!newMessage.trim()}
                >
                  Send
                </ModernButton>
              </ChatInputContainer>
            </ChatContainer>
          </ModernCard>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={3}>
          <ModernCard>
            <ModernCardHeader
              title={
                <>
                  <DescriptionIcon color="primary" />
                  Load Documents
                </>
              }
              action={
                <ModernButton variant="outlined" startIcon={<FileUpload />}>
                  Upload Document
                </ModernButton>
              }
            />
            <ScrollableContent>
              <Box textAlign="center" py={8}>
                <DescriptionIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No documents uploaded
                </Typography>
                <ModernButton variant="contained" startIcon={<FileUpload />}>
                  Upload First Document
                </ModernButton>
              </Box>
            </ScrollableContent>
          </ModernCard>
        </TabPanel>

        {/* Financials Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ModernCard>
                <ModernCardHeader
                  title={
                    <>
                      <MonetizationOnIcon color="primary" />
                      Revenue & Costs
                    </>
                  }
                />
                <ScrollableContent>
                  <InfoGridContainer container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Load Pay</InfoLabel>
                        <InfoValue sx={{ color: 'success.main', fontWeight: 700 }}>
                          ${load.load_pay || '0.00'}
                        </InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Driver Pay</InfoLabel>
                        <InfoValue sx={{ color: 'error.main', fontWeight: 700 }}>
                          ${load.driver_pay || '0.00'}
                        </InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Total Pay</InfoLabel>
                        <InfoValue sx={{ fontWeight: 700 }}>
                          ${load.total_pay || '0.00'}
                        </InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Per Mile Rate</InfoLabel>
                        <InfoValue>${load.per_mile || '0.00'}</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Total Miles</InfoLabel>
                        <InfoValue>{load.total_miles || '0'} mi</InfoValue>
                      </InfoGridItem>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoGridItem>
                        <InfoLabel>Empty Miles</InfoLabel>
                        <InfoValue>{load.empty_mile || '0'} mi</InfoValue>
                      </InfoGridItem>
                    </Grid>
                  </InfoGridContainer>
                </ScrollableContent>
              </ModernCard>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ModernCard>
                <ModernCardHeader
                  title={
                    <>
                      <ReceiptIcon color="primary" />
                      Invoice Status
                    </>
                  }
                />
                <ScrollableContent>
                  <Box textAlign="center" py={4}>
                    {getStatusChip(load.invoice_status, 'invoice')}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Invoice management coming soon
                    </Typography>
                  </Box>
                </ScrollableContent>
              </ModernCard>
            </Grid>
          </Grid>
        </TabPanel>
      </ContentContainer>

      {/* Floating Action Button */}
      <FloatingActionButton
        ariaLabel="Load Actions"
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick();
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </FloatingActionButton>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
};

export default LoadViewPage;
