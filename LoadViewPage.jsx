import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Button,
  Divider,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Avatar,
  Badge,
  Tooltip,
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
  MenuItem
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
  Timeline as TimelineIcon
} from "@mui/icons-material";
import { MdFileUpload, MdFileDownload, MdLocalShipping, MdDirectionsCar, MdAssignmentTurnedIn, MdDoneAll, MdAltRoute, MdCheckCircle, MdHome } from 'react-icons/md';
import { ApiService } from "../../api/auth";
import { useSidebar } from "../SidebarContext";
import darkLogo from '../../images/dark-logo.png';
import { CiDeliveryTruck } from "react-icons/ci";
import EmojiPicker from 'emoji-picker-react';

// Styled components for the layout
const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "calc(100vh - 64px)",
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const Panel = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  borderRadius: theme.spacing(1),
  overflow: "hidden",
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const PanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  position: 'relative',
  zIndex: 1
}));

const FormGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const FormLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 500,
  marginBottom: theme.spacing(1),
}));

const StyledTextarea = styled("textarea")(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.5),
  resize: "vertical",
  minHeight: "80px",
  fontFamily: theme.typography.fontFamily,
  fontSize: "0.875rem",
  backgroundColor: "#f9f9f9",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
  },
}));

const StyledInput = styled("input")(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.5),
  fontFamily: theme.typography.fontFamily,
  fontSize: "0.875rem",
  backgroundColor: "#f9f9f9",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
  },
}));

const LocationInput = styled(Box)(({ theme }) => ({
  position: "relative",
  "& svg": {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.text.secondary,
    zIndex: 1,
  },
  "& input": {
    paddingLeft: "35px",
  }
}));

// Add a new black and white filter for logo background
const ChatBackgroundOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url(${darkLogo})`,
  backgroundRepeat: 'repeat',
  backgroundSize: '50px',
  backgroundPosition: 'center',
  opacity: 0.15,
  filter: 'grayscale(100%)',
  zIndex: 0,
  borderRadius: 'inherit',
});

const ChatContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 1,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backdropFilter: 'blur(2px)',
  height: '100%',
  width: '100%',
});

const MessageBubble = styled(Paper)(({ theme, isCurrentUser }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: isCurrentUser ? '#0078d4' : '#ffffff',
  color: isCurrentUser ? '#ffffff' : theme.palette.text.primary,
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  position: 'relative',
  maxWidth: '100%',
  wordBreak: 'break-word',
}));

const MessageTime = styled(Typography)(({ theme, isCurrentUser }) => ({
  fontSize: '0.65rem',
  display: 'inline-block',
  textAlign: 'right',
  color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
  marginTop: '4px',
  cursor: 'default',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  border: '2px solid #fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const MessageInput = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  gap: theme.spacing(1),
  margin: theme.spacing(0, 2, 2, 2),
  borderRadius: `0 0 ${theme.spacing(1)}px ${theme.spacing(1)}px`,
  boxShadow: "0 -1px 3px rgba(0,0,0,0.05)",
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const InfoIcon = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.text.primary,
}));

const InfoText = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.875rem",
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

const StatusStep = styled(Box)(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  "& .step-number": {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[300],
    color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  "& .step-label": {
    fontWeight: active ? 600 : 400,
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  },
  "& .step-line": {
    flex: 1,
    height: 2,
    backgroundColor: theme.palette.grey[200],
  }
}));

// New styled components for file attachments
const AttachmentPreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(1),
  gap: theme.spacing(1)
}));

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  maxWidth: '250px',
  overflow: 'hidden'
}));

const FileAttachment = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.spacing(0.5),
  marginTop: theme.spacing(0.5)
}));

const FilePreviewModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  }
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '70vh',
  objectFit: 'contain',
  display: 'block',
  margin: '0 auto',
  cursor: 'pointer',
});

const PdfPreview = styled('iframe')({
  width: '100%',
  height: '80vh',
  border: 'none',
});

const EditIconButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  position: 'absolute',
  top: -8,
  right: -8,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  zIndex: 1,
}));

const LeftPanel = styled(Panel)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  overflow: "hidden", // Keep outer container from scrolling
  maxHeight: "calc(100vh - 64px)", // Set max height to viewport height minus header
  "& > :first-of-type": {
    flex: "0 0 auto" // Keep header from scrolling
  }
}));

const LeftPanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto", // Make content scrollable
  padding: theme.spacing(0, 2, 2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2)
}));

const MiddlePanel = styled(Panel)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden'
}));

const RightPanel = styled(Panel)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const ArrowBackIcon = styled(ArrowBack)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const StatusProgressContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  overflowX: "auto",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "30px",
    height: "100%",
    background: "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
    zIndex: 1,
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: "30px",
    height: "100%",
    background: "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
    zIndex: 1,
    pointerEvents: "none",
  }
}));

const StatusProgressTrack = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 0),
  minWidth: "max-content",
}));

const StatusProgressItem = styled(Box)(({ theme, active, completed }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  padding: theme.spacing(1),
  marginRight: theme.spacing(4),
  width: 80,
  "&:not(:last-child)::after": {
    content: '""',
    position: "absolute",
    left: 40,
    top: 12,
    height: 2,
    width: 80,
    backgroundColor: completed ? theme.palette.primary.main : theme.palette.grey[300],
  }
}));

const StatusDot = styled(Box)(({ theme, active, completed }) => ({
  width: 24,
  height: 24,
  borderRadius: "50%",
  backgroundColor: active 
    ? theme.palette.primary.main 
    : completed 
      ? theme.palette.success.main 
      : theme.palette.grey[300],
  color: active || completed ? "white" : theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.75rem",
  marginBottom: theme.spacing(1),
  zIndex: 1,
  boxShadow: active ? "0 0 0 4px rgba(25, 118, 210, 0.2)" : "none",
}));

const StatusLabel = styled(Typography)(({ theme, active, completed }) => ({
  fontWeight: active ? 600 : completed ? 500 : 400,
  color: active 
    ? theme.palette.primary.main 
    : completed 
      ? theme.palette.text.primary 
      : theme.palette.text.secondary,
  fontSize: "0.75rem",
  textAlign: "center",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));

const DetailCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(1),
  alignItems: "center",
}));

const StopsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
}));

const StopItem = styled(Box)(({ theme, isPickup, isCompact }) => ({
  display: "flex",
  borderLeft: `2px solid ${isPickup ? theme.palette.success.main : theme.palette.error.main}`,
  paddingLeft: theme.spacing(2),
  marginBottom: theme.spacing(isCompact ? 0.75 : 1.5),
  position: "relative",
  "&:not(:last-child)::after": {
    content: '""',
    position: "absolute",
    left: -1,
    top: 24,
    bottom: isCompact ? -8 : -12,
    width: 2,
    backgroundColor: theme.palette.grey[300],
  }
}));

const StopIconContainer = styled(Box)(({ theme, isPickup, isCompact }) => ({
  backgroundColor: isPickup ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
  borderRadius: "50%",
  width: isCompact ? 28 : 36,
  height: isCompact ? 28 : 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(isCompact ? 1 : 2),
  "& svg": {
    color: isPickup ? theme.palette.success.main : theme.palette.error.main,
    fontSize: isCompact ? '0.875rem' : '1.25rem'
  }
}));

const StopDetails = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const StopHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing(0.5),
}));

const StopAddress = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.875rem",
}));

const StopDate = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

const StopsHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2)
}));

const StopEditContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper
}));

const StopButtonGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2)
}));

// Add new styled component for the status selector
const StatusSelector = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'center',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2)
}));

const StatusIconContainer = styled(Box)(({ theme, color }) => ({
  backgroundColor: color ? `${color}15` : theme.palette.grey[100],
  borderRadius: '50%',
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
  '& svg': {
    color: color || theme.palette.grey[700],
    fontSize: '1rem'
  }
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
}));

const InfoCardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const InfoCardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '0.95rem',
  '& svg': {
    fontSize: '1.1rem',
    opacity: 0.9,
    color: theme.palette.primary.main,
  }
}));

const DetailItem = styled(Box)(({ theme, noBorder }) => ({
  display: 'flex',
  padding: theme.spacing(1, 0),
  borderBottom: noBorder ? 'none' : `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  }
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  width: '140px',
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: '0.875rem',
  fontWeight: 400,
}));

const FileItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const FileIcon = styled(Box)(({ theme, fileType }) => {
  const getColor = () => {
    switch (fileType) {
      case 'pdf': return '#F44336';
      case 'image': return '#4CAF50';
      case 'doc': return '#2196F3';
      case 'excel': return '#4CAF50';
      default: return theme.palette.text.secondary;
    }
  };
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '4px',
    backgroundColor: `${getColor()}10`,
    marginRight: theme.spacing(1.5),
    '& svg': {
      color: getColor(),
      fontSize: '1.2rem',
    }
  };
});

const FileDetails = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

const FileName = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const FileInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const FileActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
}));

const EmptyFilesMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  color: theme.palette.text.secondary,
  '& svg': {
    fontSize: '2rem',
    opacity: 0.5,
    marginBottom: theme.spacing(1),
  }
}));

// Create Load Modal Component
const CreateLoadModal = ({ open, onClose, onCreateSuccess }) => {
  const [loadData, setLoadData] = useState({
    load_id: "",
    reference_id: "",
    customer_broker: null
  });
  const [brokers, setBrokers] = useState([]);
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
        setError("Brokerlarni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.");
      }
    };

    if (open) {
      fetchBrokers();
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

  const handleCreateLoad = async () => {
    if (!loadData.reference_id || !loadData.customer_broker || !loadData.load_id) {
      setError("Reference ID, Load ID va Broker/Mijoz tanlanishi shart");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.postData("/load/", {
        reference_id: loadData.reference_id,
        load_id: loadData.load_id,
        customer_broker: loadData.customer_broker.id,
        load_status: "OPEN", 
        company_name: loadData.customer_broker.company_name
      });
      
      console.log("Load yaratildi:", response);
      onCreateSuccess(response);
      onClose();
    } catch (error) {
      console.error("Load yaratishda xato:", error);
      setError("Load yaratib bo'lmadi. Iltimos, qayta urinib ko'ring.");
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
      setError("Kompaniya nomi va MC raqami kiritilishi shart");
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
      console.error("Broker yaratishda xato:", error);
      setError("Broker yaratib bo'lmadi. Iltimos, qayta urinib ko'ring.");
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
            <LocalShipping color="primary" />
            <Typography variant="h6">Yangi Load Yaratish</Typography>
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
                helperText={!loadData.load_id ? "Load ID kiritilishi shart" : ""}
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
                helperText={!loadData.reference_id ? "Reference ID kiritilishi shart" : ""}
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
                      label="Broker/Mijoz" 
                      required
                      error={!loadData.customer_broker}
                      helperText={!loadData.customer_broker ? "Broker/Mijoz tanlanishi shart" : ""}
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Bekor qilish</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateLoad}
            disabled={loading || !loadData.reference_id || !loadData.customer_broker || !loadData.load_id}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Load yaratish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Broker yaratish modali */}
      <Dialog
        open={showBrokerModal}
        onClose={handleCloseBrokerModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon color="primary" />
            <Typography variant="h6">Yangi Broker qo'shish</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kompaniya nomi"
                name="company_name"
                value={newBroker.company_name}
                onChange={handleBrokerFormChange}
                required
                error={!newBroker.company_name}
                helperText={!newBroker.company_name ? "Kompaniya nomi kiritilishi shart" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MC raqami"
                name="mc_number"
                value={newBroker.mc_number}
                onChange={handleBrokerFormChange}
                required
                error={!newBroker.mc_number}
                helperText={!newBroker.mc_number ? "MC raqami kiritilishi shart" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon raqami"
                name="contact_number"
                value={newBroker.contact_number}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email manzili"
                name="email_address"
                type="email"
                value={newBroker.email_address}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manzil 1"
                name="address1"
                value={newBroker.address1}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manzil 2"
                name="address2"
                value={newBroker.address2}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shahar"
                name="city"
                value={newBroker.city}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Shtat</InputLabel>
                <Select
                  name="state"
                  value={newBroker.state}
                  onChange={handleBrokerFormChange}
                  label="Shtat"
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
                label="ZIP kodi"
                name="zip_code"
                value={newBroker.zip_code}
                onChange={handleBrokerFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>To'lov turi</InputLabel>
                <Select
                  name="billing_type"
                  value={newBroker.billing_type}
                  onChange={handleBrokerFormChange}
                  label="To'lov turi"
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
          <Button onClick={handleCloseBrokerModal}>Bekor qilish</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveBroker}
            disabled={!newBroker.company_name || !newBroker.mc_number}
          >
            Brokerni saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const LoadViewPage = () => {
  const [load, setLoad] = useState(null);
  const [loadStatus, setLoadStatus] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadDataLoading, setIsLoadDataLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const chatEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [usersData, setUsersData] = useState({});
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', type: '', name: '' });
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const copyMessageRef = useRef(null);
  const [chatRefreshInterval, setChatRefreshInterval] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopFormData, setStopFormData] = useState({
    stop_name: "",
    company_name: "",
    contact_name: "",
    reference_id: "",
    appointmentdate: "",
    time: "",
    address1: "",
    address2: "",
    country: "USA",
    state: "",
    city: "",
    zip_code: "",
    note: "",
    fcfs: "",
    plus_hour: ""
  });
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [allStops, setAllStops] = useState([]);
  const [compactView, setCompactView] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [units, setUnits] = useState([]); // Added state for units
  const [teams, setTeams] = useState([]); // Added state for teams
  const [isSaving, setIsSaving] = useState(false);
  const [otherPays, setOtherPays] = useState([]);
  const chatContainerRef = useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [permissions, setPermissions] = useState({});
  // First, add state for delete confirmation dialog
  const [deleteStopDialog, setDeleteStopDialog] = useState({
    open: false,
    stopId: null,
    stopName: ''
  });
  
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
  
  useEffect(() => {
    const fetchLoadData = async () => {
      setIsLoading(true);
      setIsLoadDataLoading(true);
      try {
        const data = await ApiService.getData(`/load/${id}/`);
        setLoad(data);
        setLoadStatus(data.load_status || 'OPEN');
        setInvoiceStatus(data.invoice_status || 'NOT_DETERMINED');
        // Fetch chat messages
        fetchChatMessages();
      } catch (error) {
        console.error('Error fetching load data:', error);
        showSnackbar('Error loading data', 'error');
      } finally {
        setIsLoading(false);
        setIsLoadDataLoading(false);
      }
    };

    fetchLoadData();
  }, [id]);

  const loadStatusOptions = [
    { value: 'OPEN', label: 'Open', icon: <MdLocalShipping size={16} />, color: '#3B82F6' },
    { value: 'COVERED', label: 'Covered', icon: <MdDirectionsCar size={16} />, color: '#10B981' },
    { value: 'DISPATCHED', label: 'Dispatched', icon: <MdAssignmentTurnedIn size={16} />, color: '#6366F1' },
    { value: 'LOADING', label: 'Loading', icon: <MdFileUpload size={16} />, color: '#F59E0B' },
    { value: 'ON_ROUTE', label: 'On Route', icon: <MdAltRoute size={16} />, color: '#3B82F6' },
    { value: 'UNLOADING', label: 'Unloading', icon: <MdFileDownload size={16} />, color: '#F59E0B' },
    { value: 'DELIVERED', label: 'Delivered', icon: <MdDoneAll size={16} />, color: '#10B981' },
    { value: 'COMPLETED', label: 'Completed', icon: <MdCheckCircle size={16} />, color: '#059669' },
    { value: 'IN_YARD', label: 'In Yard', icon: <MdHome size={16} />, color: '#6B7280' }
  ];

  // Load steps for the stepper
  const loadStatuses = [
    { id: 1, name: "Open" },
    { id: 2, name: "Covered" },
    { id: 3, name: "Dispatched" },
    { id: 4, name: "Loading" },
    { id: 5, name: "On Route" },
    { id: 6, name: "Unloading" },
    { id: 7, name: "Delivered" },
    { id: 8, name: "Completed" }
  ];

  const invoiceStatusOptions = [
    { value: 'NOT_DETERMINED', label: 'Not Determined', color: '#9CA3AF' },
    { value: 'INVOICED', label: 'Invoiced', color: '#3B82F6' },
    { value: 'PAID', label: 'Paid', color: '#10B981' },
    { value: 'UNPAID', label: 'Unpaid', color: '#EF4444' }
  ];

  const fetchUserData = async (userId) => {
    // Check if we already have this user's data
    if (usersData[userId]) return;
    
    try {
      const userData = await ApiService.getData(`/auth/users/${userId}/`);
      // Store the user data in the state
      setUsersData(prev => ({
        ...prev,
        [userId]: userData
      }));
        } catch (error) {
      console.error(`Error fetching user data for ID ${userId}:`, error);
    }
  };

  const fetchChatMessages = async () => {
    setIsChatLoading(true);
    try {
      // Get all chat messages
      const allMessages = await ApiService.getData(`/chat/`);
      // Filter messages for this load
      const loadMessages = allMessages.filter(msg => parseInt(msg.load_id) === parseInt(id));
      
      // Sort messages by timestamp
      loadMessages.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA - dateB;
      });
      
      setChatMessages(loadMessages || []);
      
      // Fetch user data for each unique user ID in the messages
      const uniqueUserIds = [...new Set(loadMessages.map(msg => msg.user))];
      uniqueUserIds.forEach(userId => {
        fetchUserData(userId);
      });
      
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      showSnackbar("Failed to load chat messages", "error");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRefreshChat = () => {
    fetchChatMessages();
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (messageText = newMessage, file = selectedFile) => {
    if (!permissions.chat_create) {
      showSnackbar('You do not have permission to send messages', 'error');
      return;
    }
    
    if ((!messageText.trim() && !file) && !editingMessage) return;
    
    try {
      // Get user ID from localStorage
      const userId = parseInt(localStorage.getItem("userid"));
      
      if (!userId) {
        showSnackbar("User authentication required", "error");
        return;
      }
      
      if (editingMessage) {
        if (!permissions.chat_update) {
          showSnackbar('You do not have permission to edit messages', 'error');
          return;
        }
        
        // Create message data for update
        const updateData = {
          message: messageText,
          load_id: parseInt(id),
          user: userId
        };
        
        // Don't include file field if editing a message that has a file
        // This avoids the "The submitted data was not a file" error
        if (!editingMessage.file) {
          updateData.file = null;
        }
        
        // Update existing message using PUT method
        await ApiService.putData(`/chat/${editingMessage.id}/`, updateData);
        
        setEditingMessage(null);
        setNewMessage("");
        fetchChatMessages();
        showSnackbar("Message updated", "success");
        return;
      }
      
      if (file) {
        // If there's a file, use FormData for multipart request
        const formData = new FormData();
        formData.append('message', messageText || '');
        formData.append('file', file);
        formData.append('load_id', parseInt(id));
        formData.append('user', userId);
        
        await ApiService.postMediaData(`/chat/`, formData);
      } else {
        // Regular text message
        await ApiService.postData(`/chat/`, {
          message: messageText,
          load_id: parseInt(id),
          user: userId,
          email: localStorage.getItem("email") || "user@example.com"
        });
      }
      
      setNewMessage("");
      setSelectedFile(null);
      fetchChatMessages();
      showSnackbar("Message sent", "success");
        } catch (error) {
      console.error("Error sending message:", error);
      showSnackbar("Failed to send message", "error");
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Function to cancel editing
  const handleCancelMessageEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  // Function to start editing a message
  const handleEditMessage = (message) => {
    if (!permissions.chat_update) {
      showSnackbar('You do not have permission to edit messages', 'error');
      return;
    }
    setEditingMessage(message);
    setNewMessage(message.message || "");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCancelFileSelection = () => {
    setSelectedFile(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Function to determine if the file is an image
  const isImageFile = (file) => {
    return file && file.type.startsWith('image/');
  };

  // Function to determine if a URL is an image
  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  };

  // Function to determine if the file is a PDF
  const isPdfFile = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
  };

  // Handle file paste in message input
  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          setSelectedFile(file);
          event.preventDefault();
          break;
        }
      }
    }
  };

  // Function to download file directly
  const downloadFile = (url, fileName) => {
    try {
      // Format the URL to use production API
      const formattedUrl = getFormattedFileUrl(url);
      
      // For cross-origin URLs, we need to fetch first
      fetch(formattedUrl)
        .then(response => response.blob())
        .then(blob => {
          // Create blob URL
          const blobUrl = URL.createObjectURL(blob);
          
          // Create anchor element
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName || 'download';
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          }, 100);
        })
        .catch(err => {
          console.error("Download failed:", err);
          // Fallback to simple method
          const a = document.createElement('a');
          a.href = formattedUrl;
          a.download = fileName || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Function to handle file preview in modal
  const handleFilePreview = (url, type, name) => {
    // Format the URL to use production API
    const formattedUrl = getFormattedFileUrl(url);
    
    setPreviewModal({
      open: true,
      url: formattedUrl,
      type,
      name: name || (type === 'image' ? 'Image' : 'Document')
    });
  };

  // Function to handle file download from modal
  const handleDownload = (e) => {
    e.stopPropagation();
    downloadFile(previewModal.url, previewModal.name);
  };

  // Function to close the preview modal
  const handleClosePreview = () => {
    setPreviewModal({ ...previewModal, open: false });
  };

  // Format profile photo URL to use production API
  const getFormattedProfilePhotoUrl = (url) => {
    if (!url) return "";
    return url.replace('https://0.0.0.0:8000/', 'https://blackhawks.nntexpressinc.com/');
  };
  
  // Format file URL to use production API
  const getFormattedFileUrl = (url) => {
    if (!url) return "";
    return url.replace('https://0.0.0.0:8000/', 'https://blackhawks.nntexpressinc.com/');
  };

  // Format detailed timestamp with seconds
  const formatDetailedTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Format date with time for display
  const formatDateWithTime = (dateString) => {
    if (!dateString) return "Not specified";
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Render chat messages
  const renderChatMessages = () => {
    // Group messages by date
    const messagesByDate = chatMessages.reduce((groups, message) => {
      const messageDate = message.created_at ? new Date(message.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown Date';
      
      if (!groups[messageDate]) {
        groups[messageDate] = [];
      }
      groups[messageDate].push(message);
      return groups;
    }, {});

    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1, 
        mb: 2,
        position: 'relative',
        zIndex: 1
      }}>
        {Object.entries(messagesByDate).map(([date, messages]) => (
          <Box key={date} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              my: 0.5 
            }}>
              <Chip 
                label={date} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.5)', 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: 20
                }} 
              />
            </Box>
            
            {messages.map((message, index) => {
              // Check if the message is from the current user
              const isCurrentUserMessage = parseInt(message.user) === parseInt(localStorage.getItem("userid"));
              // Get user data if available
              const messageUser = usersData[message.user] || null;
              
              // Format message time
              const messageTime = message.created_at ? new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }) : "Invalid";
              
              // Check if this is a continuation from the same user
              const isPreviousSameUser = index > 0 && messages[index - 1].user === message.user;
              
              // Check if the message has been edited
              const isEdited = message.updated_at && message.created_at && 
                new Date(message.updated_at).getTime() > new Date(message.created_at).getTime() + 1000;
              
              return (
                <Box
                  key={message.id || index}
                  sx={{
                    alignSelf: isCurrentUserMessage ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    maxWidth: '70%',
                    mt: isPreviousSameUser ? 0.3 : 1.5,
                  }}
                >
                  {/* Only show avatar for non-current user messages */}
                  {!isCurrentUserMessage && (
                    <UserAvatar 
                      src={messageUser?.profile_photo ? getFormattedProfilePhotoUrl(messageUser.profile_photo) : ""}
                      sx={{ 
                        width: 28,
                        height: 28,
                        mr: 1, 
                        alignSelf: 'flex-end',
                        mb: 0.5,
                        bgcolor: messageUser ? 'primary.dark' : 'grey.500',
                      }}
                    >
                      {messageUser ? (messageUser.first_name?.charAt(0) || messageUser.email?.charAt(0) || 'U').toUpperCase() : 'U'}
                    </UserAvatar>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
                    {/* Edit button for current user's messages */}
                    {isCurrentUserMessage && message.message && permissions.chat_update && (
                      <EditIconButton 
                        size="small"
                        onClick={() => handleEditMessage(message)}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </EditIconButton>
                    )}
                    
                    {/* Message bubble */}
                    <MessageBubble isCurrentUser={isCurrentUserMessage}>
                      {/* Show message sender name for first message in chain */}
                      {!isPreviousSameUser && !isCurrentUserMessage && (
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                            mb: 0.5
                          }}
                        >
                          {messageUser ? 
                            `${messageUser.first_name || ''} ${messageUser.last_name || ''}`.trim() || messageUser.email || 'Unknown' 
                          : message.email || 'Unknown'}
                        </Typography>
                      )}
                      
                      {/* Message content */}
                      {message.message && (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                          {message.message}
                        </Typography>
                      )}
                      
                      {/* File content */}
                      {message.file && renderFileInChat(message.file, message.file_name)}
                      
                      {/* Message timestamp inside bubble */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        alignItems: 'center', 
                        mt: 0.5
                      }}>
                        {isEdited && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.65rem',
                              fontStyle: 'italic',
                              color: isCurrentUserMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                              mr: 0.5
                            }}
                          >
                            edited
                          </Typography>
                        )}
                        <Tooltip 
                          title={
                            <Box>
                              <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap' }}>
                                Created: {formatDetailedTime(message.created_at)}
                              </Typography>
                              {isEdited && (
                                <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap' }}>
                                  Edited: {formatDetailedTime(message.updated_at)}
                                </Typography>
                              )}
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <MessageTime isCurrentUser={isCurrentUserMessage}>
                            {messageTime}
                          </MessageTime>
                        </Tooltip>
                      </Box>
                    </MessageBubble>
                  </Box>
                  
                  {/* Only show avatar for current user messages */}
                  {isCurrentUserMessage && (
                    <UserAvatar 
                      src={user?.profile_photo ? getFormattedProfilePhotoUrl(user.profile_photo) : ""}
                      sx={{ 
                        width: 28,
                        height: 28,
                        ml: 1,
                        alignSelf: 'flex-end',
                        mb: 0.5,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {user ? (user.first_name?.charAt(0) || user.email?.charAt(0) || 'Y').toUpperCase() : 'Y'}
                    </UserAvatar>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
        
        {chatMessages.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            width: '100%',
            margin: 'auto',
            paddingTop: '20%',
          }}>
            <Box
              component="img"
              src="https://static.thenounproject.com/png/54580-200.png"
              alt="Truck icon"
              sx={{ 
                width: 70, 
                height: 70, 
                opacity: 0.4,
                mb: 2,
                filter: 'grayscale(80%)'
              }} 
            />
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', mb: 1 }}>No messages yet</Typography>
            <Typography variant="caption" color="text.disabled">
              Start the conversation by sending a message below
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Function to render the file in chat
  const renderFileInChat = (fileUrl, fileName) => {
    // Replace URL from development to production URL
    const formattedUrl = fileUrl ? getFormattedFileUrl(fileUrl) : '';
    
    if (isImageUrl(formattedUrl)) {
      return (
        <Box 
          sx={{ 
            mt: 1, 
            maxWidth: '200px',
            cursor: 'pointer',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 1,
            overflow: 'hidden'
          }}
          onClick={() => handleFilePreview(formattedUrl, 'image', fileName)}
        >
          <img 
            src={formattedUrl} 
            alt="Image attachment" 
            style={{ 
              width: '100%',
              maxHeight: '150px',
              objectFit: 'cover'
            }}
          />
        </Box>
      );
    } else if (isPdfFile(formattedUrl)) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mt: 1,
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 500,
              fontSize: '0.9rem', 
              mb: 0.5 
            }}
          >
            PDF document
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              cursor: 'pointer',
            }}
            onClick={() => handleFilePreview(formattedUrl, 'pdf', fileName)}
          >
            <PictureAsPdf sx={{ color: '#e53935', fontSize: 20 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#ffffff',
                fontSize: '0.75rem'
              }}
            >
              Click to view
            </Typography>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mt: 1,
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 500,
              fontSize: '0.9rem', 
              mb: 0.5 
            }}
          >
            File attachment
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              cursor: 'pointer',
            }}
            onClick={() => downloadFile(formattedUrl, fileName)}
          >
            <InsertDriveFile sx={{ color: '#ffffff', fontSize: 20 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#ffffff',
                fontSize: '0.75rem'
              }}
            >
              Click to download
            </Typography>
          </Box>
        </Box>
      );
    }
  };

  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (copyMessageRef.current) {
          clearTimeout(copyMessageRef.current);
        }
        
        setSnackbar({
          open: true,
          message: `${field} copied to clipboard!`,
          severity: 'success'
        });
        
        copyMessageRef.current = setTimeout(() => {
          setSnackbar(prev => ({ ...prev, open: false }));
        }, 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setSnackbar({
          open: true,
          message: 'Failed to copy to clipboard',
          severity: 'error'
        });
      });
  };

  // Function to handle Create Load modal
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateLoadSuccess = (newLoad) => {
    navigate(`/loads/view/${newLoad.id}`);
  };

  // Completely replace the handleEditStop function
  const handleEditStop = (stop) => {
    if (!permissions.stop_update) {
      showSnackbar('You do not have permission to edit stops', 'error');
      return;
    }
    setEditingStop(stop.id);
    
    // Format date fields for HTML datetime-local input (requires YYYY-MM-DDThh:mm format)
    const formatDateTimeForInput = (dateStr) => {
      if (!dateStr) return '';
      
      try {
        // Check if dateStr is already a valid date string or needs conversion
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return ''; // Invalid date
        
        // Format to YYYY-MM-DDThh:mm
        return date.toISOString().slice(0, 16);
      } catch (error) {
        console.error("Error formatting date:", error);
        return '';
      }
    };

    console.log("Original stop data:", {
      appointmentdate: stop.appointmentdate,
      fcfs: stop.fcfs,
      plus_hour: stop.plus_hour
    });
    
    // Set form data with properly formatted date values
    const formattedData = {
      stop_name: stop.stop_name || "",
      company_name: stop.company_name || "",
      contact_name: stop.contact_name || "",
      reference_id: stop.reference_id || "",
      appointmentdate: formatDateTimeForInput(stop.appointmentdate),
      time: stop.time || "",
      address1: stop.address1 || "",
      address2: stop.address2 || "",
      country: stop.country || "USA",
      state: stop.state || "",
      city: stop.city || "",
      zip_code: stop.zip_code || "",
      note: stop.note || "",
      fcfs: formatDateTimeForInput(stop.fcfs),
      plus_hour: formatDateTimeForInput(stop.plus_hour)
    };
    
    console.log("Formatted stop data for form:", {
      appointmentdate: formattedData.appointmentdate,
      fcfs: formattedData.fcfs,
      plus_hour: formattedData.plus_hour
    });
    
    setStopFormData(formattedData);
  };

  // Function to handle cancel edit
  const handleCancelEditStop = () => {
    setEditingStop(null);
    setIsAddingStop(false);
  };

  // Function to handle form field changes
  const handleStopFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle adding new stop
    if (name === 'stop_name' && value === 'add-new') {
      const existingStops = load.stop || [];
      const existingNumberedStops = existingStops
        .filter(s => s.stop_name && s.stop_name.startsWith('Stop-'))
        .map(s => s.stop_name);
      
      const maxStopNumber = existingNumberedStops.reduce((max, stopName) => {
        const match = stopName.match(/Stop-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 1);
      
      const nextStopName = `Stop-${maxStopNumber + 1}`;
      
      setStopFormData(prev => ({
        ...prev,
        stop_name: nextStopName
      }));
      return;
    }
    
    // If appointment date is being set, clear FCFS fields
    if (name === 'appointmentdate' && value) {
      setStopFormData(prevData => ({
        ...prevData,
        [name]: value,
        // Clear FCFS fields if appointment date is set
        fcfs: '',
        plus_hour: ''
      }));
      return;
    }
    
    // If FCFS fields are being set, clear appointment date
    if ((name === 'fcfs' || name === 'plus_hour') && value) {
      setStopFormData(prevData => ({
        ...prevData,
        [name]: value,
        // Clear appointment date if FCFS fields are set
        ...(name === 'fcfs' || prevData.fcfs || prevData.plus_hour ? { appointmentdate: '' } : {})
      }));
      return;
    }
    
    // Normal field update
    setStopFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Function to add new stop
  const handleAddStop = () => {
    if (!permissions.stop_create) {
      showSnackbar('You do not have permission to add stops', 'error');
      return;
    }
    setIsAddingStop(true);
    
    // Determine the existing stops and next stop number
    const existingStops = load.stop || [];
    const existingNumberedStops = existingStops
      .filter(s => s.stop_name && s.stop_name.startsWith('Stop-'))
      .map(s => s.stop_name);
    
    let initialStopName = "PICKUP";
    
    // If we already have a PICKUP, check if we have a DELIVERY
    if (existingStops.some(s => s.stop_name === "PICKUP")) {
      // If we don't have a DELIVERY yet, suggest that
      if (!existingStops.some(s => s.stop_name === "DELIVERY")) {
        initialStopName = "DELIVERY";
      } else {
        // We have both PICKUP and DELIVERY, suggest next numbered stop
        const maxStopNumber = existingNumberedStops.reduce((max, stopName) => {
          const match = stopName.match(/Stop-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
          }
          return max;
        }, 1);
        
        initialStopName = `Stop-${maxStopNumber + 1}`;
      }
    }
    
    setStopFormData({
      stop_name: initialStopName,
      company_name: "",
      contact_name: "",
      reference_id: "",
      appointmentdate: "",
      time: "",
      address1: "",
      address2: "",
      country: "USA",
      state: "",
      city: "",
      zip_code: "",
      note: "",
      fcfs: "",
      plus_hour: ""
    });
  };

  // Function to save stop
  const handleSaveStop = async () => {
    if (!permissions.stop_create && !permissions.stop_update) {
      showSnackbar('You do not have permission to save stops', 'error');
      return;
    }
    
    try {
      // Create a copy of the form data
      let formattedData = {
        ...stopFormData,
        load: parseInt(id)
      };

      // Handle appointmentdate field
      if (stopFormData.appointmentdate) {
        formattedData.appointmentdate = new Date(stopFormData.appointmentdate).toISOString();
        // If appointmentdate is set, fcfs and plus_hour are optional, set them to null if empty
        if (!stopFormData.fcfs) {
          formattedData.fcfs = null;
        }
        if (!stopFormData.plus_hour) {
          formattedData.plus_hour = null;
        }
      } else {
        formattedData.appointmentdate = null;
      }

      // Handle fcfs field
      if (stopFormData.fcfs) {
        formattedData.fcfs = new Date(stopFormData.fcfs).toISOString();
        // If fcfs is set but appointmentdate is not, make appointmentdate optional
        if (!stopFormData.appointmentdate) {
          formattedData.appointmentdate = null;
        }
      } else {
        formattedData.fcfs = null;
      }

      // Handle plus_hour field - now it's a datetime-local field
      if (stopFormData.plus_hour) {
        formattedData.plus_hour = new Date(stopFormData.plus_hour).toISOString();
      } else {
        formattedData.plus_hour = null;
      }

      // For numeric fields, ensure they are numbers or null
      if (formattedData.zip_code) {
        formattedData.zip_code = parseInt(formattedData.zip_code) || null;
      }
      
      if (formattedData.reference_id && !isNaN(formattedData.reference_id)) {
        formattedData.reference_id = parseInt(formattedData.reference_id) || null;
      }

      console.log("Saving stop with data:", formattedData);

      let response;
      if (editingStop) {
        // Update existing stop
        response = await ApiService.putData(`/stops/${editingStop}/`, formattedData);
        showSnackbar("Stop updated successfully", "success");
      } else if (isAddingStop) {
        // Create new stop
        response = await ApiService.postData(`/stops/`, formattedData);
        
        // Agar yangi stop yaratilgan bo'lsa, loadni "stop" arrayiga shu stopning ID sini qo'shish kerak
        if (response && response.id) {
          // Avval hozirgi loadni olamiz
          const currentLoad = await ApiService.getData(`/load/${id}/`);
          const currentStopIds = currentLoad.stop ? currentLoad.stop.map(s => s.id) : [];
          
          // Yangi stop ID sini qo'shamiz
          const updatedStopIds = [...currentStopIds, response.id];
          
          // Loadni yangilaymiz
          await ApiService.patchData(`/load/${id}/`, {
            stop: updatedStopIds
          });
        }
        
        showSnackbar("Stop added successfully", "success");
      }
      
      // Refresh stops data
      fetchAllStops();
      
      // Reset edit state
      setEditingStop(null);
      setIsAddingStop(false);
    } catch (error) {
      console.error("Error saving stop:", error);
      console.error("Error details:", error.response?.data);
      showSnackbar("Failed to save stop. Please check the form fields and try again.", "error");
    }
  };

  const fetchAllStops = async () => {
    try {
      // Loadni qayta yuklash bilan, "stop" field ichidagi ma'lumotlarni olamiz
      const loadData = await ApiService.getData(`/load/${id}/`);
      
      // Loadni "stop" fieldi bilan yangilaymiz
      setLoad(loadData);
      
      // Ensure editing states are reset after fetching stops
      setEditingStop(null);
      setIsAddingStop(false);
      
      console.log("Fetched stops from load:", loadData.stop);
    } catch (error) {
      console.error("Error fetching stops:", error);
      showSnackbar("Failed to load stops", "error");
    }
  };

  // Helper for equipment type display
  const getEquipmentTypeName = (type) => {
    const types = {
      'DRYVAN': 'Dryvan',
      'REEFER': 'Reefer',
      'CARHAUL': 'Carhaul',
      'FLATBED': 'Flatbed',
      'STEPDECK': 'Stepdeck',
      'POWERONLY': 'PowerOnly',
      'RGN': 'Rgn',
      'TANKERSTYLE': 'TankerStyle'
    };
    
    return types[type] || type;
  };
  
  // Get file type
  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'doc';
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return 'excel';
    } else {
      return 'other';
    }
  };
  
  // Get file icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <Image />;
      case 'pdf': return <PictureAsPdf />;
      case 'doc': return <Description />;
      case 'excel': return <InsertDriveFile />;
      default: return <InsertDriveFile />;
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (event, fileType) => {
    if (!permissions.load_update) {
      showSnackbar('You do not have permission to upload files', 'error');
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append(fileType, file);
      
      await ApiService.putMediaData(`/load/${id}/`, formData);
      
      // Refresh data
      const updatedLoad = await ApiService.getData(`/load/${id}/`);
      setLoad(updatedLoad);
      
      showSnackbar(`File uploaded successfully`, "success");
    } catch (error) {
      console.error("Error uploading file:", error);
      showSnackbar("Failed to upload file. Please try again.", "error");
    }
  };
  
  // Function to format file URL correctly
  const getFormattedDocumentUrl = (url) => {
    if (!url) return "";
    return url.replace('https://0.0.0.0:8000/', 'https://blackhawks.nntexpressinc.com/');
  };
  
  
  // Handle view file
  const handleViewFile = (url, fileName) => {
    if (!url) return;
    
    // Format the URL to use production API
    const formattedUrl = getFormattedDocumentUrl(url);
    
    const fileType = getFileType(fileName || url);
    handleFilePreview(formattedUrl, fileType === 'pdf' ? 'pdf' : 'image', fileName);
  };

  // Fetch all reference data
  useEffect(() => {
    if (!isLoading && load) {
      // Fetch drivers
      const fetchDrivers = async () => {
        try {
          const driversData = await ApiService.getData('/driver/');
          setDrivers(driversData);
        } catch (error) {
          console.error('Error fetching drivers:', error);
        }
      };
      
      // Fetch dispatchers
    const fetchDispatchers = async () => {
        try {
          const dispatchersData = await ApiService.getData('/dispatcher/');
          setDispatchers(dispatchersData);
        } catch (error) {
          console.error('Error fetching dispatchers:', error);
        }
      };
      
      // Fetch trucks
      const fetchTrucks = async () => {
        try {
          const trucksData = await ApiService.getData('/truck/');
          setTrucks(trucksData);
        } catch (error) {
          console.error('Error fetching trucks:', error);
        }
      };
      
      // Fetch trailers
      const fetchTrailers = async () => {
        try {
          const trailersData = await ApiService.getData('/trailer/');
          setTrailers(trailersData);
        } catch (error) {
          console.error('Error fetching trailers:', error);
        }
      };
      
    fetchDrivers();
    fetchDispatchers();
      fetchTrucks();
      fetchTrailers();
    }
  }, [isLoading, load]);
  
  // Handle edit section
  const handleEditSection = (section) => {
    if (!permissions.load_update) {
      showSnackbar('You do not have permission to edit loads', 'error');
      return;
    }
    setEditingSection(section);
    
    // Initialize form data based on section
    if (section === 'basic') {
      setEditFormData({
        load_id: load.load_id || '',
        reference_id: load.reference_id || '',
        company_name: load.company_name || '',
        equipment_type: load.equipment_type || '',
        unit_id: load.unit_id || null, // Add unit_id field
        team_id: load.team_id || null // Add team_id field
      });
    } else if (section === 'personnel') {
      setEditFormData({
        driver: load.driver?.id || '',
        dispatcher: load.dispatcher?.id || '',
        driver_pay: load.driver_pay || ''
      });
    } else if (section === 'equipment') {
      // Ensure trailer data is correctly included in form data
      const formData = {
        truck: load.truck?.id || '',
        trailer: load.trailer?.id || '',
        equipment_type: load.equipment_type || '',
        unit_id: load.unit_id || null, // Add unit_id field here too
        team_id: load.team_id || null // Add team_id field here too
      };
      
      setEditFormData(formData);
      console.log("Edit equipment formData:", formData);
      
      // Unitdan ma'lumot olish uchun
      if (load.unit_id) {
        const selectedUnit = units.find(unit => unit.id === load.unit_id);
        if (selectedUnit) {
          // Load oynasi ochilganda, unit ma'lumotlaridan trailer ma'lumotlarini olish
          if (selectedUnit.trailer && selectedUnit.trailer.length > 0) {
            const trailerId = selectedUnit.trailer[0];
            // Trailer ma'lumotlarini olish
            const fetchTrailerInfo = async () => {
              try {
                const trailerInfo = await ApiService.getData(`/trailer/${trailerId}/`);
                console.log("Fetched trailer info from unit:", trailerInfo);
              } catch (error) {
                console.error('Error fetching trailer info:', error);
              }
            };
            fetchTrailerInfo();
          }
        }
      }
    } else if (section === 'mile') {
      // Initialize form data for mile section
      const mile = parseInt(load.mile) || 0;
      const emptyMile = parseInt(load.empty_mile) || 0;
      const totalMiles = parseInt(load.total_miles) || (mile + emptyMile);
      const totalPay = parseFloat(load.total_pay) || 0;
      
      // Calculate per_mile if it doesn't exist
      let perMile = load.per_mile || '';
      if (!perMile && totalMiles > 0 && totalPay > 0) {
        perMile = (totalPay / totalMiles).toFixed(2);
      }
      
      setEditFormData({
        mile: mile || '',
        empty_mile: emptyMile || '',
        total_miles: totalMiles || '',
        per_mile: perMile || ''
      });
    } else if (section === 'payment') {
      setEditFormData({
        load_pay: load.load_pay || '',
        total_pay: load.total_pay || '',
        // Remove per_mile and total_miles, they're now in mile section
        // Add other pay fields
        other_pay_amount: '',
        other_pay_type: '',
        other_pay_note: ''
      });
    } else if (section === 'notes') {
      setEditFormData({
        note: load.note || ''
      });
    } else if (section === 'documents') {
      // No form data needed for documents
    }
  };
  
  // Handle cancel edit section
  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditFormData({});
  };
  
  // Handle form field change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle saving changes - updated to include unit_id
  const handleSaveChanges = async () => {
    if (!permissions.load_update) {
      showSnackbar('You do not have permission to update loads', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      // Prepare data based on section
      let dataToUpdate = {};
      
      if (editingSection === 'basic') {
        dataToUpdate = {
          load_id: editFormData.load_id,
          reference_id: editFormData.reference_id,
          company_name: editFormData.company_name,
          equipment_type: editFormData.equipment_type,
          unit_id: editFormData.unit_id || null,
          team_id: editFormData.team_id || null
        };

        // If unit is selected, update truck, trailer, and driver as well
        if (editFormData.unit_id) {
          const selectedUnit = units.find(unit => unit.id === editFormData.unit_id);
          if (selectedUnit) {
            if (selectedUnit.truck && selectedUnit.truck.length > 0) {
              dataToUpdate.truck = selectedUnit.truck[0];
            }
            if (selectedUnit.trailer && selectedUnit.trailer.length > 0) {
              dataToUpdate.trailer = selectedUnit.trailer[0];
            }
            if (selectedUnit.driver && selectedUnit.driver.length > 0) {
              dataToUpdate.driver = selectedUnit.driver[0];
            }
            // Also update team_id from unit
            dataToUpdate.team_id = selectedUnit.team_id;
          }
        }
      } else if (editingSection === 'personnel') {
        dataToUpdate = {
          driver: editFormData.driver ? parseInt(editFormData.driver) : null,
          dispatcher: editFormData.dispatcher ? parseInt(editFormData.dispatcher) : null,
          driver_pay: editFormData.driver_pay ? parseFloat(editFormData.driver_pay) : null
        };
      } else if (editingSection === 'equipment') {
        // Tuzatilgan qism - trailerga tegishli ma'lumotlarni ham qo'shish
        dataToUpdate = {
          truck: editFormData.truck ? parseInt(editFormData.truck) : null,
          trailer: editFormData.trailer ? parseInt(editFormData.trailer) : null,
          equipment_type: editFormData.equipment_type || null
        };
        
        // If unit is selected, update team_id from unit too
        if (editFormData.unit_id) {
          const selectedUnit = units.find(unit => unit.id === editFormData.unit_id);
          if (selectedUnit) {
            dataToUpdate.team_id = selectedUnit.team_id;
            
            // Unitdan truck, trailer, va driver ma'lumotlarini olish
            if (selectedUnit.truck && selectedUnit.truck.length > 0) {
              dataToUpdate.truck = selectedUnit.truck[0];
            }
            if (selectedUnit.trailer && selectedUnit.trailer.length > 0) {
              dataToUpdate.trailer = selectedUnit.trailer[0];
            }
            if (selectedUnit.driver && selectedUnit.driver.length > 0) {
              dataToUpdate.driver = selectedUnit.driver[0];
            }
          }
        }
        
        console.log("Equipment update data:", dataToUpdate);
      } else if (editingSection === 'mile') {
        // Handle mile section updates
        const mile = editFormData.mile ? parseInt(editFormData.mile) : null;
        const emptyMile = editFormData.empty_mile ? parseInt(editFormData.empty_mile) : null;
        const totalMiles = editFormData.total_miles ? parseInt(editFormData.total_miles) : null;
        const perMile = editFormData.per_mile ? parseFloat(editFormData.per_mile) : null;
        
        dataToUpdate = {
          mile: mile,
          empty_mile: emptyMile,
          total_miles: totalMiles,
          per_mile: perMile
        };
        
        console.log("Mile update data:", dataToUpdate);
      } else if (editingSection === 'payment') {
        dataToUpdate = {
          load_pay: editFormData.load_pay ? parseFloat(editFormData.load_pay) : null,
          total_pay: editFormData.total_pay ? parseFloat(editFormData.total_pay) : null
          // Removed per_mile and total_miles as they're now in mile section
        };
        
        // If total_pay is updated, and we have total_miles, update per_mile
        if (editFormData.total_pay && load.total_miles) {
          const totalPay = parseFloat(editFormData.total_pay);
          const totalMiles = parseInt(load.total_miles);
          
          if (totalMiles > 0) {
            dataToUpdate.per_mile = (totalPay / totalMiles).toFixed(2);
          }
        }
      } else if (editingSection === 'notes') {
        dataToUpdate = {
          note: editFormData.note
        };
      }
      
      // Update the load data using PATCH to only update specific fields
      const updatedLoad = await ApiService.patchData(`/load/${id}/`, dataToUpdate);
      console.log("Updated load response:", updatedLoad);
      
      // Refresh data after update to ensure all fields are up to date
      const refreshedLoad = await ApiService.getData(`/load/${id}/`);
      
      // Update local state with complete data
      setLoad(refreshedLoad);
      
      showSnackbar('Load updated successfully', 'success');
      
      // Close edit form
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating load:', error);
      showSnackbar('Failed to update load. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle adding new driver
  const handleAddDriver = () => {
    // Navigate to driver creation page with return path
    navigate(`/drivers/create?returnTo=/loads/view/${id}`);
  };
  
  // Handle adding new dispatcher
  const handleAddDispatcher = () => {
    // Navigate to dispatcher creation page with return path
    navigate(`/dispatchers/create?returnTo=/loads/view/${id}`);
  };
  
  // Tuzatilgan handleAddTruck funksiyasi
  const handleAddTruck = () => {
    // Navigate to truck creation page with return path
    navigate(`/truck/create?returnTo=/loads/view/${id}`);
  };
  
  // Tuzatilgan handleAddTrailer funksiyasi
  const handleAddTrailer = () => {
    // Navigate to trailer creation page with return path
    navigate(`/trailer/create?returnTo=/loads/view/${id}`);
  };

  // Add this useEffect to fetch other pays
  useEffect(() => {
    const fetchOtherPays = async () => {
      try {
        const otherpayData = await ApiService.getData('/otherpay/');
        // Filter other pays for this load
        const loadOtherPays = otherpayData.filter(pay => pay.load === parseInt(id));
        setOtherPays(loadOtherPays || []);
      } catch (error) {
        console.error('Error fetching other pays:', error);
      }
    };

    if (!isLoading && load) {
      fetchOtherPays();
    }
  }, [isLoading, load, id]);

  // Scroll pozitsiyasini tekshirish uchun
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  };

  // Yangi xabarlar kelganda scroll qilish
  useEffect(() => {
    if (shouldScrollToBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, shouldScrollToBottom]);

  // Chat container uchun scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Add new function to fetch units data
  const fetchUnits = async () => {
    try {
      const unitsData = await ApiService.getData('/unit/');
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
      showSnackbar('Unitlarni yuklashda xatolik yuz berdi', 'error');
    }
  };

  // Add new function to fetch teams data
  const fetchTeams = async () => {
    try {
      const teamsData = await ApiService.getData('/team/');
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
      showSnackbar('Teamlarni yuklashda xatolik yuz berdi', 'error');
    }
  };

  // Fetch all reference data including units
  useEffect(() => {
    if (!isLoading && load) {
      // Fetch drivers
      const fetchDrivers = async () => {
        try {
          const driversData = await ApiService.getData('/driver/');
          setDrivers(driversData);
        } catch (error) {
          console.error('Error fetching drivers:', error);
        }
      };
      
      // Fetch dispatchers
      const fetchDispatchers = async () => {
        try {
          const dispatchersData = await ApiService.getData('/dispatcher/');
          setDispatchers(dispatchersData);
        } catch (error) {
          console.error('Error fetching dispatchers:', error);
        }
      };
      
      // Fetch trucks
      const fetchTrucks = async () => {
        try {
          const trucksData = await ApiService.getData('/truck/');
          setTrucks(trucksData);
        } catch (error) {
          console.error('Error fetching trucks:', error);
        }
      };
      
      // Fetch trailers
      const fetchTrailers = async () => {
        try {
          const trailersData = await ApiService.getData('/trailer/');
          setTrailers(trailersData);
        } catch (error) {
          console.error('Error fetching trailers:', error);
        }
      };
      
      fetchDrivers();
      fetchDispatchers();
      fetchTrucks();
      fetchTrailers();
      fetchUnits(); // Add fetching units
      fetchTeams(); // Add fetching teams
    }
  }, [isLoading, load]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !load) {
  return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Load not found"}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/loads")}>
          Back to Loads
        </Button>
      </Box>
    );
  }

  // Calculate current step based on load status
  const getCurrentStep = (status) => {
    const normalizedStatus = status?.replace('_', ' ').toUpperCase();
    const step = loadStatuses.findIndex(s => 
      s.name.toUpperCase() === normalizedStatus
    );
    return step !== -1 ? step : 0;
  };

  const currentStep = getCurrentStep(load.load_status);

  // Add function to handle adding other pay
  const handleAddOtherPay = async () => {
    if (!permissions.otherpay_create) {
      showSnackbar('You do not have permission to add other pays', 'error');
      return;
    }
    
    if (!editFormData.other_pay_amount && !editFormData.other_pay_type) {
      showSnackbar('Please enter amount and pay type', 'error');
      return;
    }

    try {
      const newOtherPay = {
        amount: editFormData.other_pay_amount ? parseFloat(editFormData.other_pay_amount) : null,
        pay_type: editFormData.other_pay_type || null,
        note: editFormData.other_pay_note || null,
        load: parseInt(id)
      };

      const response = await ApiService.postData('/otherpay/', newOtherPay);
      
      // Add the new other pay to the list
      setOtherPays(prev => [...prev, response]);
      
      // Clear form fields
      setEditFormData(prev => ({
        ...prev,
        other_pay_amount: '',
        other_pay_type: '',
        other_pay_note: ''
      }));
      
      showSnackbar('Other pay added successfully', 'success');
    } catch (error) {
      console.error('Error adding other pay:', error);
      showSnackbar('Failed to add other pay', 'error');
    }
  };

  // Add function to delete other pay
  const handleDeleteOtherPay = async (payId) => {
    if (!permissions.otherpay_delete) {
      showSnackbar('You do not have permission to delete other pays', 'error');
      return;
    }
    
    try {
      await ApiService.deleteData(`/otherpay/${payId}/`);
      
      // Remove the deleted pay from the list
      setOtherPays(prev => prev.filter(pay => pay.id !== payId));
      
      showSnackbar('Other pay deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting other pay:', error);
      showSnackbar('Failed to delete other pay', 'error');
    }
  };

  // Add a function to generate stop options
  const generateStopOptions = (stops) => {
    // Always have PICKUP and DELIVERY as options
    const options = [
      { value: "PICKUP", label: "Pickup" },
      { value: "DELIVERY", label: "Delivery" }
    ];
    
    // Add any existing numbered stops (Stop-2, Stop-3, etc.)
    const existingNumberedStops = stops
      .filter(s => s.stop_name.startsWith('Stop-'))
      .map(s => s.stop_name);
    
    // Add all existing numbered stops to options
    existingNumberedStops.forEach(stopName => {
      if (!options.some(opt => opt.value === stopName)) {
        options.push({ value: stopName, label: stopName });
      }
    });
    
    // Add the next numbered stop option
    const maxStopNumber = existingNumberedStops.reduce((max, stopName) => {
      const match = stopName.match(/Stop-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1);
    
    // Add the next stop in sequence
    const nextStopName = `Stop-${maxStopNumber + 1}`;
    if (!options.some(opt => opt.value === nextStopName)) {
      options.push({ value: nextStopName, label: nextStopName });
    }
    
    return options;
  };

  // Fix the handleDeleteStop function to properly reset editing state
  const handleDeleteStop = async (stopId) => {
    if (!permissions.stop_delete) {
      showSnackbar('You do not have permission to delete stops', 'error');
      return;
    }
    
    try {
      // Avval stopni o'chiramiz
      await ApiService.deleteData(`/stops/${stopId}/`);
      
      // Loadni olib, stop arrayidan o'chirilgan stopni olib tashlaymiz
      const currentLoad = await ApiService.getData(`/load/${id}/`);
      const updatedStopIds = currentLoad.stop ? 
        currentLoad.stop.filter(s => s.id !== stopId).map(s => s.id) : 
        [];
      
      // Loadni yangilangan stop array bilan yangilaymiz
      await ApiService.patchData(`/load/${id}/`, {
        stop: updatedStopIds
      });
      
      // Reset editing state
      setEditingStop(null);
      setIsAddingStop(false);
      
      // Reset delete dialog
      setDeleteStopDialog({ open: false, stopId: null, stopName: '' });
      
      // Show success message
      showSnackbar("Stop deleted successfully", "success");
      
      // Refresh stops data
      fetchAllStops();
    } catch (error) {
      console.error("Error deleting stop:", error);
      showSnackbar("Failed to delete stop. Please try again.", "error");
    }
  };

  // Add function to open delete confirmation dialog
  const openDeleteDialog = (event, stop) => {
    // Prevent event bubbling to edit stop
    event.stopPropagation();
    
    setDeleteStopDialog({
      open: true,
      stopId: stop.id,
      stopName: stop.stop_name === "PICKUP" ? "Pickup" : 
                stop.stop_name === "DELIVERY" ? "Delivery" : 
                stop.stop_name
    });
  };

  // Handle unit change - Auto-populate truck, trailer, and driver from selected unit
  const handleUnitChange = (event, unit) => {
    if (!unit) {
      // Reset unit-related fields if no unit is selected
      setEditFormData(prev => ({
        ...prev,
        unit_id: null,
        truck: '',
        trailer: '',
        driver: '',
        equipment_type: '',
        team_id: null // Reset team_id too
      }));
      return;
    }

    // Set unit ID and team_id
    setEditFormData(prev => ({
      ...prev,
      unit_id: unit.id,
      team_id: unit.team_id // Add team_id from unit
    }));

    // Auto-populate truck if unit has a truck
    if (unit.truck && unit.truck.length > 0) {
      const truckId = unit.truck[0]; // Get first truck ID
      setEditFormData(prev => ({
        ...prev,
        truck: truckId
      }));
    }

    // Auto-populate trailer if unit has a trailer
    if (unit.trailer && unit.trailer.length > 0) {
      const trailerId = unit.trailer[0]; // Get first trailer ID
      
      // Set trailer ID in form data
      setEditFormData(prev => ({
        ...prev,
        trailer: trailerId
      }));
      
      // Get trailer information and set equipment type based on trailer type
      const fetchTrailerInfo = async () => {
        try {
          const trailerInfo = await ApiService.getData(`/trailer/${trailerId}/`);
          if (trailerInfo && trailerInfo.type) {
            setEditFormData(prev => ({
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
    if (unit.driver && unit.driver.length > 0) {
      const driverId = unit.driver[0]; // Get first driver ID
      setEditFormData(prev => ({
        ...prev,
        driver: driverId
      }));
    }
  };

  const handleInvoiceStatusChange = async (event) => {
    const newStatus = event.target.value;
    if (newStatus === load.invoice_status) return;
    
    setIsUpdatingStatus(true);
    try {
      await ApiService.putData(`/load/${id}/`, {
        invoice_status: newStatus
      });
      
      setLoad(prevLoad => ({
        ...prevLoad,
        invoice_status: newStatus
      }));
      
      showSnackbar("Invoice status updated successfully", "success");
    } catch (error) {
      console.error("Error updating invoice status:", error);
      showSnackbar("Failed to update invoice status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getCurrentInvoiceStatusOption = () => {
    return invoiceStatusOptions.find(option => 
      option.value === load?.invoice_status
    ) || invoiceStatusOptions[0];
  };

  // Function to handle status change
  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    if (newStatus === load.load_status) return;
    
    setIsUpdatingStatus(true);
    try {
      await ApiService.putData(`/load/${id}/`, {
        load_status: newStatus
      });
      
      setLoad(prevLoad => ({
        ...prevLoad,
        load_status: newStatus
      }));
      
      showSnackbar("Load status updated successfully", "success");
    } catch (error) {
      console.error("Error updating load status:", error);
      showSnackbar("Failed to update load status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Function to get current status option
  const getCurrentStatusOption = () => {
    return loadStatusOptions.find(option => 
      option.value === load?.load_status
    ) || loadStatusOptions[0];
  };

  // Helper function to format date
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    // If message from today, just show time
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message from yesterday, show 'Yesterday' + time
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return messageDate.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <MainContainer>
      {/* Create Load Modal */}
      <CreateLoadModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateSuccess={handleCreateLoadSuccess}
      />

      <LeftPanel>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between', px: 2, pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Load Details
            </Typography>
          </Box>
        </Box>

        {isLoadDataLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <LeftPanelContent>
            {/* Stops Information with Edit Functionality */}
            <StopsContainer>
              <StopsHeader>
                <Typography variant="subtitle2" fontWeight={600}>
                  Stops
                </Typography>
                <Box>
                  {/* Commented out by user
                  <IconButton 
                    size="small" 
                    onClick={() => setCompactView(!compactView)}
                    sx={{ mr: 1 }}
                  >
                    {compactView ? 
                      <EditIcon fontSize="small" /> : 
                      <MdCheckCircle size={18} />
                    }
                  </IconButton> */}
                  {permissions.stop_create && (
                    <Button 
                      startIcon={<AddIcon />} 
                      size="small" 
                      onClick={handleAddStop}
                      disabled={isAddingStop || editingStop !== null}
                    >
                      Add Stop
                    </Button>
                  )}
                </Box>
              </StopsHeader>
              
              {isAddingStop && (
                <StopEditContainer>
                  <Typography variant="subtitle2" gutterBottom>
                    New Stop
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Stop Type</InputLabel>
                        <Select
                          name="stop_name"
                          value={stopFormData.stop_name}
                          onChange={handleStopFormChange}
                          label="Stop Type"
                        >
                          {generateStopOptions(load.stop || []).map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {option.value === "PICKUP" ? (
                                  <MdFileUpload size={16} style={{ marginRight: 8, color: '#4caf50' }} />
                                ) : option.value === "DELIVERY" ? (
                                  <MdFileDownload size={16} style={{ marginRight: 8, color: '#f44336' }} />
                                ) : (
                                  <TimelineIcon fontSize="small" style={{ marginRight: 8, color: '#2196f3' }} />
                                )}
                                {option.label}
                              </Box>
                            </MenuItem>
                          ))}
                          <MenuItem value="add-new" sx={{ color: 'primary.main', fontWeight: 500 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                              Add Next Stop
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Company Name"
                        name="company_name"
                        value={stopFormData.company_name}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Contact Name"
                        name="contact_name"
                        value={stopFormData.contact_name}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Reference ID"
                        name="reference_id"
                        value={stopFormData.reference_id}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Appointment Time"
                        name="appointmentdate"
                        type="datetime-local"
                        value={stopFormData.appointmentdate || ''}
                        onChange={handleStopFormChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        // Disable if FCFS fields are filled
                        disabled={!!(stopFormData.fcfs || stopFormData.plus_hour)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="FCFS From"
                        name="fcfs"
                        type="datetime-local"
                        value={stopFormData.fcfs || ''}
                        onChange={handleStopFormChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        helperText="Start time of the interval"
                        // Disable if appointment date is filled
                        disabled={!!stopFormData.appointmentdate}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="FCFS To"
                        name="plus_hour"
                        type="datetime-local"
                        value={stopFormData.plus_hour || ''}
                        onChange={handleStopFormChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        helperText="End time of the interval"
                        // Disable if appointment date is filled
                        disabled={!!stopFormData.appointmentdate}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Address Line 1"
                        name="address1"
                        value={stopFormData.address1}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Address Line 2"
                        name="address2"
                        value={stopFormData.address2}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                    <Grid item xs={12} >
                      <TextField
                        fullWidth
                        size="small"
                        label="City"
                        name="city"
                        value={stopFormData.city}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="State"
                        name="state"
                        value={stopFormData.state}
                        onChange={handleStopFormChange}
                      >
                        {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                          'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                          'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                          'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                          'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                          <MenuItem key={state} value={state}>{state}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                 
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="ZIP Code"
                        name="zip_code"
                        value={stopFormData.zip_code}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Notes"
                        name="note"
                        multiline
                        rows={2}
                        value={stopFormData.note}
                        onChange={handleStopFormChange}
                      />
                    </Grid>
                  </Grid>
                  
                  <StopButtonGroup>
                    <Button 
                      variant="outlined"
                      onClick={handleCancelEditStop}
                    >
                      Cancel
                    </Button>
            <Button
              variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveStop}
                    >
                      Save
                    </Button>
                  </StopButtonGroup>
                </StopEditContainer>
              )}
              
              {/* Show stops when not adding a new one */}
              {!isAddingStop && (load.stop && load.stop.length > 0 ? (
                load.stop.map(stop => (
                  editingStop === stop.id ? (
                    <StopEditContainer key={stop.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Edit Stop
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete fontSize="small" />}
                          onClick={(e) => openDeleteDialog(e, stop)}
                        >
                          Delete Stop
                        </Button>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Stop Type</InputLabel>
                            <Select
                              name="stop_name"
                              value={stopFormData.stop_name}
                              onChange={handleStopFormChange}
                              label="Stop Type"
                            >
                              {generateStopOptions(load.stop || []).map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {option.value === "PICKUP" ? (
                                      <MdFileUpload size={16} style={{ marginRight: 8, color: '#4caf50' }} />
                                    ) : option.value === "DELIVERY" ? (
                                      <MdFileDownload size={16} style={{ marginRight: 8, color: '#f44336' }} />
                                    ) : (
                                      <TimelineIcon fontSize="small" style={{ marginRight: 8, color: '#2196f3' }} />
                                    )}
                                    {option.label}
                                  </Box>
                                </MenuItem>
                              ))}
                              <MenuItem value="add-new" sx={{ color: 'primary.main', fontWeight: 500 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                  Add Next Stop
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Company Name"
                            name="company_name"
                            value={stopFormData.company_name}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Contact Name"
                            name="contact_name"
                            value={stopFormData.contact_name}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Reference ID"
                            name="reference_id"
                            value={stopFormData.reference_id}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Appointment Time"
                            name="appointmentdate"
                            type="datetime-local"
                            value={stopFormData.appointmentdate || ''}
                            onChange={handleStopFormChange}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            // Disable if FCFS fields are filled
                            disabled={!!(stopFormData.fcfs || stopFormData.plus_hour)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="FCFS From"
                            name="fcfs"
                            type="datetime-local"
                            value={stopFormData.fcfs || ''}
                            onChange={handleStopFormChange}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            helperText="Start time of the interval"
                            // Disable if appointment date is filled
                            disabled={!!stopFormData.appointmentdate}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="FCFS To"
                            name="plus_hour"
                            type="datetime-local"
                            value={stopFormData.plus_hour || ''}
                            onChange={handleStopFormChange}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            helperText="End time of the interval"
                            // Disable if appointment date is filled
                            disabled={!!stopFormData.appointmentdate}
                          />
                        </Grid>
                        {/* <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Time"
                            name="time"
                            value={stopFormData.time}
                            onChange={handleStopFormChange}
                          />
                        </Grid> */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Address Line 1"
                            name="address1"
                            value={stopFormData.address1}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Address Line 2"
                            name="address2"
                            value={stopFormData.address2}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="State"
                            name="state"
                            value={stopFormData.state}
                            onChange={handleStopFormChange}
                          >
                            {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                              'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                              'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                              'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                              'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                              <MenuItem key={state} value={state}>{state}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="City"
                            name="city"
                            value={stopFormData.city}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="ZIP Code"
                            name="zip_code"
                            value={stopFormData.zip_code}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Notes"
                            name="note"
                            multiline
                            rows={2}
                            value={stopFormData.note}
                            onChange={handleStopFormChange}
                          />
                        </Grid>
                      </Grid>
                      
                      <StopButtonGroup>
                        <Button 
                          variant="outlined"
                          onClick={handleCancelEditStop}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveStop}
                        >
                          Save
                        </Button>
                      </StopButtonGroup>
                    </StopEditContainer>
                  ) : (
                    <StopItem 
                      key={stop.id} 
                      isPickup={stop.stop_name === "PICKUP"}
                      isCompact={compactView}
                    >
                      <StopIconContainer 
                        isPickup={stop.stop_name === "PICKUP"}
                        isCompact={compactView}
                      >
                        {stop.stop_name === "PICKUP" ? (
                          <MdFileUpload size={compactView ? 14 : 20} />
                        ) : stop.stop_name === "DELIVERY" ? (
                          <MdFileDownload size={compactView ? 14 : 20} />
                        ) : (
                          <TimelineIcon fontSize={compactView ? 'small' : 'medium'} />
                        )}
                      </StopIconContainer>
                      <StopDetails>
                        <StopHeader>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StopAddress>
                              {stop.stop_name === "PICKUP" ? "Pickup" : 
                               stop.stop_name === "DELIVERY" ? "Delivery" : 
                               stop.stop_name}
                            </StopAddress>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditStop(stop)}
                              sx={{ ml: 1, display: compactView ? 'none' : 'flex' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <StopDate>
                            {stop.appointmentdate ? new Date(stop.appointmentdate).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            }) : stop.fcfs ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption">
                                  FCFS: {new Date(stop.fcfs).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                  })}
                                  {stop.plus_hour ? ` - ${new Date(stop.plus_hour).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                  })}` : ''}
                                </Typography>
                              </Box>
                            ) : "Not specified"}
                          </StopDate>
                        </StopHeader>
                        <Typography variant="body2">
                          {stop.address1 ? stop.address1 : "No address specified"}
                          {stop.city && `, ${stop.city}`}
                          {stop.state && `, ${stop.state}`}
                          {stop.zip_code && ` ${stop.zip_code}`}
                        </Typography>
                        {!compactView && (
                          <>
                            {stop.company_name && (
                              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                Company: {stop.company_name}
                              </Typography>
                            )}
                            {stop.contact_name && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Contact: {stop.contact_name}
                              </Typography>
                            )}
                            {/* Display FCFS information in expanded view */}
                            {stop.fcfs && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                FCFS: {new Date(stop.fcfs).toLocaleString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })}
                                {stop.plus_hour ? ` - ${new Date(stop.plus_hour).toLocaleString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })}` : ''}
                              </Typography>
                            )}
                          </>
                        )}
                      </StopDetails>
                      {compactView && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditStop(stop)}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </StopItem>
                  )
                ))
              ) : (
                !isAddingStop && (
                  <Box sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                    <Typography variant="body2">No stops added yet</Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={handleAddStop}
                      sx={{ mt: 1 }}
                    >
                      Add First Stop
                    </Button>
                  </Box>
                )
              ))}
            </StopsContainer>
            
            {/* Load and Broker Information Combined */}
            <DetailCard sx={{ 
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderRadius: 1,
              p: 2,
              mb: 1.5
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Load Information
              </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Load ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={load.load_id || "Not assigned"} placement="top">
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          maxWidth: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {load.load_id || "Not assigned"}
                        </Typography>
                      </Tooltip>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(load.load_id, 'Load ID')}
                        sx={{ padding: 0.2 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Reference ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={load.reference_id || "Not assigned"} placement="top">
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          maxWidth: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {load.reference_id || "Not assigned"}
                        </Typography>
                      </Tooltip>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(load.reference_id, 'Reference ID')}
                        sx={{ padding: 0.2 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Load Pay
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: load.load_pay ? '#2e7d32' : 'text.primary'
                    }}>
                      {load.load_pay ? `$${load.load_pay}` : "Not assigned"}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Driver Pay
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: load.driver_pay ? '#2e7d32' : 'text.primary'
                    }}>
                      {load.driver_pay ? `$${load.driver_pay}` : "Not assigned"}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Miles
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {load.total_miles || "Not available"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      color: load.status === 'COMPLETED' ? '#2e7d32' : 
                             load.status === 'IN_PROGRESS' ? '#1976d2' : 
                             load.status === 'CANCELLED' ? '#d32f2f' : 'text.primary'
                    }}>
                      {load.status || "Not set"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DetailCard>
            
            <DetailCard sx={{ 
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderRadius: 1,
              p: 2,
              mb: 1.5
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Broker Information
              </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Company
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {load.customer_broker?.company_name || "Not assigned"}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(load.customer_broker?.company_name, 'Company')}
                        sx={{ padding: 0.2 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      MC Number
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {load.customer_broker?.mc_number || "Not available"}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(load.customer_broker?.mc_number, 'MC Number')}
                        sx={{ padding: 0.2 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Contact
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {load.customer_broker?.contact_number || "Not available"}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(load.customer_broker?.contact_number, 'Contact')}
                        sx={{ padding: 0.2 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500,
                        maxWidth: '140px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {load.customer_broker?.email_address || "Not available"}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(load.customer_broker?.email_address, 'Email')}
                        sx={{ padding: 0.2 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DetailCard>
            
            <DetailCard sx={{ 
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderRadius: 1,
              p: 2,
              mb: 1.5
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Driver & Equipment
              </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Driver
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {load.driver ? 
                    `${load.driver.user?.first_name || ''} ${load.driver.user?.last_name || ''}` : 
                    "Not assigned"}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Dispatcher
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {load.dispatcher?.nickname || "Not assigned"}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Equipment
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {load.truck ? 
                    `${load.truck.make || ''} ${load.truck.model || ''} (Unit: ${load.truck.unit_number || ''})` : 
                    "No equipment assigned"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DetailCard>
            
            <DetailCard sx={{ 
              bgcolor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderRadius: 1,
              p: 2
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Additional Information
              </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                  Instructions
                </Typography>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      border: '1px solid #f0f0f0',
                      minHeight: '60px',
                      fontSize: '0.875rem'
                    }}>
                  {load.instructions || "No instructions provided"}
              </Box>
                  </Box>
                </Grid>
              
                <Grid item xs={12} md={6}>
              <Box>
                    <Typography variant="caption" color="text.secondary">
                  Bills
                </Typography>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: '#fafafa',
                      borderRadius: 1,
                      border: '1px solid #f0f0f0',
                      fontSize: '0.875rem'
                    }}>
                  {load.bills || "No bills information provided"}
              </Box>
                  </Box>
                </Grid>
              </Grid>
            </DetailCard>
          </LeftPanelContent>
        )}
      </LeftPanel>

      <MiddlePanel>
        <Panel>
          <PanelHeader>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%',
              gap: 2
            }}>
              <Typography variant="h6">Chat</Typography>
              
              {!isLoadDataLoading && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  flex: 1,
                  overflowX: 'auto',
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
                  <StatusSelector>
                    <Select
                      value={load?.load_status || 'OPEN'}
                      onChange={handleStatusChange}
                      disabled={isUpdatingStatus}
                      sx={{
                        height: 36,
                        width: { xs: 150, sm: 180 },
                        '.MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          paddingY: 0.5,
                          whiteSpace: 'nowrap'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: { maxHeight: 400 }
                        }
                      }}
                      renderValue={(selected) => {
                        const option = loadStatusOptions.find(opt => opt.value === selected);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StatusIconContainer color={option?.color}>
                              {option?.icon}
                            </StatusIconContainer>
                            <Typography variant="body2" fontWeight={500}>
                              {option?.label || 'Status'}
                            </Typography>
                          </Box>
                        );
                      }}
                    >
                      {loadStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <StatusIconContainer color={option.color}>
                              {option.icon}
                            </StatusIconContainer>
                            <Typography variant="body2">
                              {option.label}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </StatusSelector>

                  <StatusSelector>
                    <Select
                      value={load?.invoice_status || 'NOT_DETERMINED'}
                      onChange={handleInvoiceStatusChange}
                      disabled={isUpdatingStatus}
                      sx={{
                        height: 36,
                        width: { xs: 150, sm: 180 },
                        '.MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          paddingY: 0.5,
                          whiteSpace: 'nowrap'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: { maxHeight: 400 }
                        }
                      }}
                      renderValue={(selected) => {
                        const option = invoiceStatusOptions.find(opt => opt.value === selected);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: option?.color || '#9CA3AF'
                              }}
                            />
                            <Typography variant="body2" fontWeight={500}>
                              {option?.label || 'Not Determined'}
                            </Typography>
                          </Box>
                        );
                      }}
                    >
                      {invoiceStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: option.color
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {option.label}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </StatusSelector>
                </Box>
              )}
              
              <IconButton onClick={handleRefreshChat} disabled={isChatLoading}>
                {isChatLoading ? (
                  <CircularProgress size={24} thickness={4} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Box>
          </PanelHeader>
          
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: "#f8f9fa",
            borderRadius: theme => theme.spacing(1),
            margin: theme => theme.spacing(0, 2),
            position: 'relative',
            overflow: 'hidden'
          }}>
            <ChatBackgroundOverlay />
            <ChatContentWrapper>
              <Box sx={{ 
                padding: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                position: 'relative',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                }
              }} ref={chatContainerRef}>
                {isChatLoading && chatMessages.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 10
                  }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  renderChatMessages()
                )}
                <div ref={chatEndRef} />
              </Box>
            </ChatContentWrapper>
          </Box>
          
          <Box sx={{ position: 'relative' }}>
            {showEmojiPicker && (
              <Box sx={{ 
                position: 'absolute', 
                bottom: '100%', 
                right: 16, 
                zIndex: 100,
                boxShadow: 3,
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <EmojiPicker 
                  onEmojiClick={onEmojiClick} 
                  searchDisabled
                  skinTonesDisabled
                  width={300}
                  height={350}
                />
              </Box>
            )}
            
            {selectedFile && (
              <AttachmentPreview>
                <FilePreview>
                  {isImageFile(selectedFile) ? (
                    <Image fontSize="small" color="primary" />
                  ) : (
                    <InsertDriveFile fontSize="small" color="primary" />
                  )}
                  <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                    {selectedFile.name}
                  </Typography>
                </FilePreview>
                <Tooltip title="Remove attachment">
                  <IconButton size="small" onClick={handleCancelFileSelection}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </AttachmentPreview>
            )}
            
            {editingMessage && (
              <Box sx={{ 
                p: 1, 
                bgcolor: 'primary.light', 
                borderRadius: '4px 4px 0 0',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="body2">Editing message</Typography>
                <IconButton size="small" onClick={handleCancelMessageEdit} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            
            <MessageInput>
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <IconButton component="span" color="primary">
                  <AttachFile />
                </IconButton>
              </label>
              
              <TextField
                fullWidth
                placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                onPaste={handlePaste}
                size="small"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        size="small"
              color="primary"
                      >
                        <CiDeliveryTruck size={20} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <IconButton
                color="primary"
                onClick={() => handleSendMessage()}
                disabled={(!newMessage.trim() && !selectedFile && !editingMessage) || !permissions.chat_create}
              >
                <Send />
              </IconButton>
            </MessageInput>
          </Box>
        </Panel>
      </MiddlePanel>

      <RightPanel>
        <PanelHeader>
          <Typography variant="h6">Load Information</Typography>
          
          <IconButton onClick={() => {
            setIsLoadDataLoading(true);
            ApiService.getData(`/load/${id}/`)
              .then(data => {
                setLoad(data);
                fetchAllStops();
              })
              .catch(error => {
                console.error("Error fetching load data:", error);
                showSnackbar("Ma'lumotlarni yangilashda xatolik yuz berdi", "error");
              })
              .finally(() => {
                setIsLoadDataLoading(false);
              });
          }} disabled={isLoadDataLoading}>
            {isLoadDataLoading ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <RefreshIcon />
            )}
          </IconButton>
        </PanelHeader>
        
        <PanelContent>
          {isLoadDataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Basic Information */}
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardTitle>
                    <Info />
                    Basic Information
                  </InfoCardTitle>
                  {permissions.load_update && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={editingSection === 'basic' ? <Close /> : <EditIcon />}
                      onClick={editingSection === 'basic' ? handleCancelEdit : () => handleEditSection('basic')}
                    >
                      {editingSection === 'basic' ? 'CANCEL' : 'EDIT'}
                    </Button>
                  )}
                </InfoCardHeader>
                
                {editingSection === 'basic' ? (
                  // Edit form for basic information
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Load ID"
                      name="load_id"
                      value={editFormData.load_id}
                      onChange={handleFormChange}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Reference ID"
                      name="reference_id"
                      value={editFormData.reference_id}
                      onChange={handleFormChange}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Company Name"
                      name="company_name"
                      value={editFormData.company_name}
                      onChange={handleFormChange}
                    />
                    {/* Add Unit Autocomplete */}
                    <Autocomplete
                      options={units}
                      getOptionLabel={(option) => `Unit ${option.unit_number}`}
                      onChange={handleUnitChange}
                      value={units.find(unit => unit.id === editFormData.unit_id) || null}
                      renderOption={(props, option) => (
                        <li {...props}>
                          Unit {option.unit_number}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Unit Number"
                          size="small"
                          helperText="Unit tanlanganda truck, trailer va driver ma'lumotlari avtomatik to'ldiriladi"
                        />
                      )}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Equipment Type</InputLabel>
                      <Select
                        name="equipment_type"
                        value={editFormData.equipment_type || ''}
                        onChange={handleFormChange}
                        label="Equipment Type"
                        disabled={!!editFormData.unit_id} // Disable if unit is selected
                      >
                        <MenuItem value="DRYVAN">Dryvan</MenuItem>
                        <MenuItem value="REEFER">Reefer</MenuItem>
                        <MenuItem value="CARHAUL">Carhaul</MenuItem>
                        <MenuItem value="FLATBED">Flatbed</MenuItem>
                        <MenuItem value="STEPDECK">Stepdeck</MenuItem>
                        <MenuItem value="POWERONLY">PowerOnly</MenuItem>
                        <MenuItem value="RGN">Rgn</MenuItem>
                        <MenuItem value="TANKERSTYLE">TankerStyle</MenuItem>
                      </Select>
                    </FormControl>
                    {permissions.load_update && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="contained" 
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                        >
                          Save
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  // Display mode for basic information
                  <>
                    <DetailItem>
                      <DetailLabel>Load ID</DetailLabel>
                      <DetailValue>{load.load_id || "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Reference ID</DetailLabel>
                      <DetailValue>{load.reference_id || "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Company</DetailLabel>
                      <DetailValue>{load.company_name || "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Customer/Broker</DetailLabel>
                      <DetailValue>{load.customer_broker?.company_name || "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Unit Number</DetailLabel>
                      <DetailValue>
                        {units.find(unit => unit.id === load.unit_id)?.unit_number 
                          ? `Unit ${units.find(unit => unit.id === load.unit_id)?.unit_number}` 
                          : "Not assigned"}
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Team</DetailLabel>
                      <DetailValue>
                        {load.team_id 
                          ? (teams.find(team => team.id === load.team_id)?.name || `Team-${load.team_id}`)
                          : "Not assigned"}
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Created By</DetailLabel>
                      <DetailValue>{load.created_by?.nickname || load.created_by?.email || "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Created Date</DetailLabel>
                      <DetailValue>{load.created_date ? new Date(load.created_date).toLocaleString() : "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem noBorder>
                      <DetailLabel>Equipment Type</DetailLabel>
                      <DetailValue>{getEquipmentTypeName(load.equipment_type) || "Not assigned"}</DetailValue>
                    </DetailItem>
                  </>
                )}
              </InfoCard>
              
              {/* Personnel Information */}
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardTitle>
                    <PersonOutline />
                    Personnel
                  </InfoCardTitle>
                  {permissions.load_update && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={editingSection === 'personnel' ? <Close /> : <EditIcon />}
                      onClick={editingSection === 'personnel' ? handleCancelEdit : () => handleEditSection('personnel')}
                    >
                      {editingSection === 'personnel' ? 'CANCEL' : 'EDIT'}
                    </Button>
                  )}
                </InfoCardHeader>
                
                {editingSection === 'personnel' ? (
                  // Edit form for personnel
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Driver</InputLabel>
                        <Select
                          name="driver"
                          value={editFormData.driver || ''}
                          onChange={handleFormChange}
                          label="Driver"
                        >
                          <MenuItem value="">None</MenuItem>
                          {drivers.map(driver => (
                            <MenuItem key={driver.id} value={driver.id}>
                              {`${driver.user?.first_name || ''} ${driver.user?.last_name || ''}`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton 
                        color="primary" 
                        onClick={handleAddDriver}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Dispatcher</InputLabel>
                        <Select
                          name="dispatcher"
                          value={editFormData.dispatcher || ''}
                          onChange={handleFormChange}
                          label="Dispatcher"
                        >
                          <MenuItem value="">None</MenuItem>
                          {dispatchers.map(dispatcher => (
                            <MenuItem key={dispatcher.id} value={dispatcher.id}>
                              {dispatcher.nickname || dispatcher.email}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton 
                        color="primary" 
                        onClick={handleAddDispatcher}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Driver Pay"
                      name="driver_pay"
                      value={editFormData.driver_pay}
                      onChange={handleFormChange}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                      >
                        Save
                      </Button>
        </Box>
      </Box>
                ) : (
                  // Display mode for personnel
                  <>
                    <DetailItem>
                      <DetailLabel>Driver</DetailLabel>
                      <DetailValue>
                        {load.driver ? 
                          `${load.driver.user?.first_name || ''} ${load.driver.user?.last_name || ''}`.trim() : 
                          "Not assigned"}
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Dispatcher</DetailLabel>
                      <DetailValue>{load.dispatcher?.nickname || "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem noBorder>
                      <DetailLabel>Driver Pay</DetailLabel>
                      <DetailValue>{load.driver_pay ? `$${load.driver_pay}` : "Not assigned"}</DetailValue>
                    </DetailItem>
                  </>
                )}
              </InfoCard>
              
              {/* Vehicle Information */}
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardTitle>
                    <DriveEta />
                    Equipment
                  </InfoCardTitle>
                  {permissions.load_update && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={editingSection === 'equipment' ? <Close /> : <EditIcon />}
                      onClick={editingSection === 'equipment' ? handleCancelEdit : () => handleEditSection('equipment')}
                    >
                      {editingSection === 'equipment' ? 'CANCEL' : 'EDIT'}
                    </Button>
                  )}
                </InfoCardHeader>
                
                {editingSection === 'equipment' ? (
                  // Edit form for equipment
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Truck</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Truck</InputLabel>
                        <Select
                          name="truck"
                          value={editFormData.truck || ''}
                          onChange={handleFormChange}
                          label="Truck"
                          disabled={!!editFormData.unit_id} // Disable if unit is selected
                        >
                          <MenuItem value="">None</MenuItem>
                          {trucks.map(truck => (
                            <MenuItem key={truck.id} value={truck.id}>
                              {`${truck.make || ''} ${truck.model || ''} (${truck.unit_number || 'No unit'})`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton 
                        color="primary" 
                        onClick={handleAddTruck}
                        size="small"
                        title="Add new truck"
                        disabled={!!editFormData.unit_id} // Disable if unit is selected
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    
                    {/* Agar unit tanlangan bo'lsa, unitdan truck ma'lumotlarini ko'rsatish */}
                    {editFormData.unit_id && (
                      (() => {
                        const selectedUnit = units.find(unit => unit.id === editFormData.unit_id);
                        if (selectedUnit && selectedUnit.truck && selectedUnit.truck.length > 0) {
                          const truckId = selectedUnit.truck[0];
                          const truckInfo = trucks.find(truck => truck.id === truckId);
                          
                          if (truckInfo) {
                            return (
                              <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px solid #e1f0ff' }}>
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 0.5 }}>
                                  Truck from Unit {selectedUnit.unit_number}:
                                </Typography>
                                <Typography variant="body2">
                                  {`${truckInfo.make || ''} ${truckInfo.model || ''} (${truckInfo.unit_number || 'No unit'})`}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                  Plate: {truckInfo.plate_number || 'Not available'} | VIN: {truckInfo.vin || 'Not available'}
                                </Typography>
                              </Box>
                            );
                          }
                        }
                        return null;
                      })()
                    )}
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mt: 1 }}>Trailer</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Trailer</InputLabel>
                        <Select
                          name="trailer"
                          value={editFormData.trailer || ''}
                          onChange={handleFormChange}
                          label="Trailer"
                          disabled={!!editFormData.unit_id} // Disable if unit is selected
                        >
                          <MenuItem value="">None</MenuItem>
                          {trailers.map(trailer => (
                            <MenuItem key={trailer.id} value={trailer.id}>
                              {`${trailer.trailer_type || ''} (${trailer.unit_number || 'No unit'})`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton 
                        color="primary" 
                        onClick={handleAddTrailer}
                        size="small"
                        title="Add new trailer"
                        disabled={!!editFormData.unit_id} // Disable if unit is selected
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    
                    {/* Agar unit tanlangan bo'lsa, unitdan trailer ma'lumotlarini ko'rsatish */}
                    {editFormData.unit_id && (
                      (() => {
                        const selectedUnit = units.find(unit => unit.id === editFormData.unit_id);
                        if (selectedUnit && selectedUnit.trailer && selectedUnit.trailer.length > 0) {
                          const trailerId = selectedUnit.trailer[0];
                          const trailerInfo = trailers.find(trailer => trailer.id === trailerId);
                          
                          if (trailerInfo) {
                            return (
                                                             <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px solid #e1f0ff' }}>
                                <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 0.5 }}>
                                  Trailer from Unit {selectedUnit.unit_number}:
                                </Typography>
                                <Typography variant="body2">
                                  {`${trailerInfo.trailer_type || trailerInfo.type || 'Unknown'} (${trailerInfo.unit_number || 'No unit'})`}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                  VIN: {trailerInfo.vin || 'Not available'}
                                </Typography>
                              </Box>
                            );
                          }
                        }
                        return null;
                      })()
                    )}
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mt: 1 }}>Equipment Type</Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>Equipment Type</InputLabel>
                      <Select
                        name="equipment_type"
                        value={editFormData.equipment_type || ''}
                        onChange={handleFormChange}
                        label="Equipment Type"
                        disabled={!!editFormData.unit_id} // Disable if unit is selected
                      >
                        <MenuItem value="DRYVAN">Dryvan</MenuItem>
                        <MenuItem value="REEFER">Reefer</MenuItem>
                        <MenuItem value="CARHAUL">Carhaul</MenuItem>
                        <MenuItem value="FLATBED">Flatbed</MenuItem>
                        <MenuItem value="STEPDECK">Stepdeck</MenuItem>
                        <MenuItem value="POWERONLY">PowerOnly</MenuItem>
                        <MenuItem value="RGN">Rgn</MenuItem>
                        <MenuItem value="TANKERSTYLE">TankerStyle</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Display mode for equipment - IMPROVED SECTION
                  <>
                    {/* Truck information */}
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                      Truck
                    </Typography>
                    
                    {load.truck ? (
                      <>
                        <DetailItem>
                          <DetailLabel>Make/Model</DetailLabel>
                          <DetailValue>{`${load.truck.make || ''} ${load.truck.model || ''}`}</DetailValue>
                        </DetailItem>
                        
                        <DetailItem>
                          <DetailLabel>Unit Number</DetailLabel>
                          <DetailValue>{load.truck.unit_number || "Not available"}</DetailValue>
                        </DetailItem>
                        
                     
                        
                        <DetailItem>
                          <DetailLabel>VIN Number</DetailLabel>
                          <DetailValue>{load.truck.vin || "Not available"}</DetailValue>
                        </DetailItem>
                      </>
                    ) : load.unit_id ? (
                      // Agar unit tanlangan bo'lsa, unitdan truck ma'lumotlarini ko'rsatish
                      (() => {
                        const selectedUnit = units.find(unit => unit.id === load.unit_id);
                        if (selectedUnit && selectedUnit.truck && selectedUnit.truck.length > 0) {
                          const truckId = selectedUnit.truck[0];
                          const truckInfo = trucks.find(truck => truck.id === truckId);
                          
                          if (truckInfo) {
                            return (
                              <>
                                <DetailItem>
                                  <DetailLabel>Make/Model</DetailLabel>
                                  <DetailValue>{`${truckInfo.make || ''} ${truckInfo.model || ''}`}</DetailValue>
                                </DetailItem>
                                
                                <DetailItem>
                                  <DetailLabel>Unit Number</DetailLabel>
                                  <DetailValue>{truckInfo.unit_number || "Not available"}</DetailValue>
                                </DetailItem>
                                
                                <DetailItem>
                                  <DetailLabel>Plate Number</DetailLabel>
                                  <DetailValue>{truckInfo.plate_number || "Not available"}</DetailValue>
                                </DetailItem>
                                
                                <DetailItem>
                                  <DetailLabel>VIN Number</DetailLabel>
                                  <DetailValue>{truckInfo.vin || "Not available"}</DetailValue>
                                </DetailItem>
                                <Typography variant="caption" color="primary">
                                  (Truck from Unit {selectedUnit.unit_number})
                                </Typography>
                              </>
                            );
                          }
                        }
                        return (
                          <Box sx={{ p: 1, color: 'text.secondary' }}>
                            <Typography variant="body2">Unit has no truck assigned</Typography>
                          </Box>
                        );
                      })()
                    ) : (
                      <Box sx={{ p: 1, color: 'text.secondary', mb: 2 }}>
                        <Typography variant="body2">No truck assigned</Typography>
                      </Box>
                    )}
                    
                    {/* Trailer information - improved section */}
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                      Trailer
                    </Typography>
                    
                    {load.trailer ? (
                      <>
                        <DetailItem>
                          <DetailLabel>Type</DetailLabel>
                          <DetailValue>{load.trailer.trailer_type || load.trailer.type || "Not available"}</DetailValue>
                        </DetailItem>
                        
                        <DetailItem>
                          <DetailLabel>Unit Number</DetailLabel>
                          <DetailValue>{load.trailer.unit_number || "Not available"}</DetailValue>
                        </DetailItem>
                        
                        <DetailItem noBorder>
                          <DetailLabel>VIN Number</DetailLabel>
                          <DetailValue>{load.trailer.vin || load.trailer.vin_number || "Not available"}</DetailValue>
                        </DetailItem>
                      </>
                    ) : load.unit_id ? (
                      // Agar unit tanlangan bo'lsa, unitdan trailer ma'lumotlarini ko'rsatish
                      (() => {
                        const selectedUnit = units.find(unit => unit.id === load.unit_id);
                        if (selectedUnit && selectedUnit.trailer && selectedUnit.trailer.length > 0) {
                          const trailerId = selectedUnit.trailer[0];
                          const trailerInfo = trailers.find(trailer => trailer.id === trailerId);
                          
                          if (trailerInfo) {
                            return (
                              <>
                                <DetailItem>
                                  <DetailLabel>Type</DetailLabel>
                                  <DetailValue>{trailerInfo.trailer_type || trailerInfo.type || "Not available"}</DetailValue>
                                </DetailItem>
                                
                                <DetailItem>
                                  <DetailLabel>Unit Number</DetailLabel>
                                  <DetailValue>{trailerInfo.unit_number || "Not available"}</DetailValue>
                                </DetailItem>
                                
                                <DetailItem noBorder>
                                  <DetailLabel>VIN Number</DetailLabel>
                                  <DetailValue>{trailerInfo.vin || trailerInfo.vin_number || "Not available"}</DetailValue>
                                </DetailItem>
                                <Typography variant="caption" color="primary">
                                  (Trailer from Unit {selectedUnit.unit_number})
                                </Typography>
                              </>
                            );
                          }
                        }
                        return (
                          <Box sx={{ p: 1, color: 'text.secondary' }}>
                            <Typography variant="body2">Unit has no trailer assigned</Typography>
                          </Box>
                        );
                      })()
                    ) : (
                      <Box sx={{ p: 1, color: 'text.secondary' }}>
                        <Typography variant="body2">No trailer assigned</Typography>
                      </Box>
                    )}
                  </>
                )}
              </InfoCard>
              
              {/* Mile Information */}
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardTitle>
                    <DirectionsIcon />
                    Mile Information
                  </InfoCardTitle>
                  {permissions.load_update && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={editingSection === 'mile' ? <Close /> : <EditIcon />}
                      onClick={editingSection === 'mile' ? handleCancelEdit : () => handleEditSection('mile')}
                    >
                      
                      {editingSection === 'mile' ? 'CANCEL' : 'EDIT'}
                    </Button>
                  )}
                </InfoCardHeader>
                
                {editingSection === 'mile' ? (
                  // Edit form for mile
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Loaded Miles"
                          name="mile"
                          value={editFormData.mile || ''}
                          onChange={(e) => {
                            handleFormChange(e);
                          
                            // Auto calculate total miles when mile changes
                            const loadedMile = parseInt(e.target.value) || 0;
                            const emptyMile = parseInt(editFormData.empty_mile) || 0;
                            const totalMiles = loadedMile + emptyMile;
                            
                            setEditFormData(prev => ({
                              ...prev,
                              total_miles: totalMiles
                            }));
                            
                            // Also calculate per_mile if total_pay exists
                            if (editFormData.total_pay) {
                              const totalPay = parseFloat(editFormData.total_pay) || 0;
                              if (totalMiles > 0) {
                                const perMile = (totalPay / totalMiles).toFixed(2);
                                setEditFormData(prev => ({
                                  ...prev,
                                  per_mile: perMile
                                }));
                              }
                            }
                          }}
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Empty (Deadhead) Miles"
                          name="empty_mile"
                          value={editFormData.empty_mile || ''}
                          onChange={(e) => {
                            handleFormChange(e);
                            
                            // Auto calculate total miles when empty_mile changes
                            const emptyMile = parseInt(e.target.value) || 0;
                            const loadedMile = parseInt(editFormData.mile) || 0;
                            const totalMiles = loadedMile + emptyMile;
                            
                            setEditFormData(prev => ({
                              ...prev,
                              total_miles: totalMiles
                              
                            }));
                            
                            // Also calculate per_mile if total_pay exists
                            if (editFormData.total_pay) {
                              const totalPay = parseFloat(editFormData.total_pay) || 0;
                              if (totalMiles > 0) {
                                const perMile = (totalPay / totalMiles).toFixed(2);
                                setEditFormData(prev => ({
                                  ...prev,
                                  per_mile: perMile
                                }));
                              }
                            }
                          }}
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#f0f7ff', 
                      borderRadius: 1, 
                      border: '1px solid #e1f0ff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      <Typography variant="subtitle2" color="primary">
                        Calculated Values (Auto)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Total Miles"
                            value={editFormData.total_miles || '0'}
                            disabled
                            InputProps={{
                              endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                              readOnly: true,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Loaded + Empty miles
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Per Mile Rate"
                            value={editFormData.per_mile || '0.00'}
                            disabled
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              readOnly: true,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Total Pay ÷ Total Miles
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Display mode for mile
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <DetailLabel>Loaded Miles</DetailLabel>
                          <DetailValue>{load.mile ? `${load.mile} miles` : "Not assigned"}</DetailValue>
                        </DetailItem>
                        
                        <DetailItem>
                          <DetailLabel>Empty Miles</DetailLabel>
                          <DetailValue>{load.empty_mile ? `${load.empty_mile} miles` : "Not assigned"}</DetailValue>
                        </DetailItem>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <DetailItem>
                          <DetailLabel>Total Miles</DetailLabel>
                          <DetailValue>{load.total_miles ? `${load.total_miles} miles` : "Not available"}</DetailValue>
                        </DetailItem>
                        
                        <DetailItem>
                          <DetailLabel>Per Mile Rate</DetailLabel>
                          <DetailValue>{load.per_mile ? `$${load.per_mile}` : "Not assigned"}</DetailValue>
                        </DetailItem>
                      </Grid>
                    </Grid>
                  </>
                )}
              </InfoCard>
              
              {/* Payment Information */}
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardTitle>
                    <AttachMoneyIcon />
                    Payment Details
                  </InfoCardTitle>
                  {permissions.load_update && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={editingSection === 'payment' ? <Close /> : <EditIcon />}
                      onClick={editingSection === 'payment' ? handleCancelEdit : () => handleEditSection('payment')}
                    >
                      {editingSection === 'payment' ? 'CANCEL' : 'EDIT'}
                    </Button>
                  )}
                </InfoCardHeader>
                
                {editingSection === 'payment' ? (
                  // Edit form for payment
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Load Pay"
                      name="load_pay"
                      value={editFormData.load_pay}
                      onChange={handleFormChange}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Total Pay"
                      name="total_pay"
                      value={editFormData.total_pay}
                      onChange={(e) => {
                        handleFormChange(e);
                        
                        // Auto calculate per_mile when total_pay changes
                        const totalPay = parseFloat(e.target.value) || 0;
                        const totalMiles = parseInt(editFormData.total_miles) || 0;
                        
                        if (totalMiles > 0) {
                          const perMile = (totalPay / totalMiles).toFixed(2);
                          setEditFormData(prev => ({
                            ...prev,
                            per_mile: perMile
                          }));
                        }
                      }}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle2">Add Other Pay</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Amount"
                          name="other_pay_amount"
                          value={editFormData.other_pay_amount}
                          onChange={handleFormChange}
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Pay Type</InputLabel>
                          <Select
                            name="other_pay_type"
                            value={editFormData.other_pay_type || ''}
                            onChange={handleFormChange}
                            label="Pay Type"
                          >
                            <MenuItem value="DETENTION">Detention</MenuItem>
                            <MenuItem value="EQUIPMENT">Equipment</MenuItem>
                            <MenuItem value="LAYOVER">Layover</MenuItem>
                            <MenuItem value="LUMPER">Lumper</MenuItem>
                            <MenuItem value="DRIVERASSIST">Driver Assist</MenuItem>
                            <MenuItem value="TRAILERWASH">Trailer Wash</MenuItem>
                            <MenuItem value="ESCORTFEE">Escort Fee</MenuItem>
                            <MenuItem value="BONUS">Bonus</MenuItem>
                            <MenuItem value="CHARGEBACK">Charge Back</MenuItem>
                            <MenuItem value="OTHER">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                          <Button 
                            variant="contained" 
                            onClick={handleAddOtherPay}
                            startIcon={<AddIcon />}
                            size="small"
                            fullWidth
                          >
                            Add
                          </Button>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Note"
                          name="other_pay_note"
                          value={editFormData.other_pay_note}
                          onChange={handleFormChange}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                    
                    {otherPays.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Existing Other Pays</Typography>
                        <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {otherPays.map(pay => (
                            <Box 
                              key={pay.id} 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1
                              }}
                            >
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {pay.pay_type || 'No type'} - ${pay.amount || '0'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {pay.note || 'No note'}
                                </Typography>
                              </Box>
                              {permissions.otherpay_delete && (
                                <IconButton size="small" color="error" onClick={() => handleDeleteOtherPay(pay.id)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Display mode for payment
                  <>
                    <DetailItem>
                      <DetailLabel>Load Pay</DetailLabel>
                      <DetailValue>{load.load_pay ? `$${load.load_pay}` : "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>Total Pay</DetailLabel>
                      <DetailValue>{load.total_pay ? `$${load.total_pay}` : "Not assigned"}</DetailValue>
                    </DetailItem>
                    
                    {otherPays.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, my: 1 }}>Other Pays</Typography>
                        
                        {otherPays.map(pay => (
                          <DetailItem key={pay.id} noBorder={pay === otherPays[otherPays.length - 1]}>
                            <DetailLabel>{pay.pay_type || "Other Pay"}</DetailLabel>
                            <DetailValue>
                              {pay.amount ? `$${pay.amount}` : "No amount"}{pay.note ? ` - ${pay.note}` : ''}
                            </DetailValue>
                          </DetailItem>
                        ))}
                      </>
                    )}
                  </>
                )}
              </InfoCard>
              
              {/* Documents */}
              <InfoCard>
                <InfoCardHeader>
                  <InfoCardTitle>
                    <DocumentScanner />
                    Documents
                  </InfoCardTitle>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                                      {permissions.load_update && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={editingSection === 'documents' ? <Close /> : <EditIcon />}
                      onClick={editingSection === 'documents' ? handleCancelEdit : () => handleEditSection('documents')}
                    >
                      {editingSection === 'documents' ? 'CANCEL' : 'EDIT'}
                    </Button>
                  )}
                    <Button
                      startIcon={<FileUpload />}
                      size="small"
                      variant="text"
                      component="label"
                    >
                      Upload
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileUpload(e, 'document')}
                      />
                    </Button>
                  </Box>
                </InfoCardHeader>
                
                {editingSection === 'documents' ? (
                  // Edit form for documents
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Rate Con */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Rate Con
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField 
                          fullWidth
                          disabled
                          size="small"
                          placeholder="No file selected"
                          value={load.rate_con ? 'Rate Con Document' : ''}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                        >
                          Browse
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'rate_con')}
                          />
                        </Button>
                      </Box>
                    </Box>
                    
                    {/* BOL */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Bill of Lading (BOL)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField 
                          fullWidth
                          disabled
                          size="small"
                          placeholder="No file selected"
                          value={load.bol ? 'BOL Document' : ''}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                        >
                          Browse
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'bol')}
                          />
                        </Button>
                      </Box>
                    </Box>
                    
                    {/* POD */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Proof of Delivery (POD)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField 
                          fullWidth
                          disabled
                          size="small"
                          placeholder="No file selected"
                          value={load.pod ? 'POD Document' : ''}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                        >
                          Browse
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'pod')}
                          />
                        </Button>
                      </Box>
                    </Box>
                    
                    {/* Commercial Invoice */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Commercial Invoice
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField 
                          fullWidth
                          disabled
                          size="small"
                          placeholder="No file selected"
                          value={load.comercial_invoice ? 'Invoice Document' : ''}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                        >
                          Browse
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'comercial_invoice')}
                          />
                        </Button>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={handleCancelEdit}
                        sx={{ mr: 1 }}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Display mode for documents
                  <>
                    {/* Rate Con */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                      Rate Con
                    </Typography>
                    
                    {load.rate_con ? (
                      <FileItem>
                        <FileIcon fileType={getFileType(load.rate_con)}>
                          {getFileIcon(getFileType(load.rate_con))}
                        </FileIcon>
                        
                        <FileDetails>
                          <FileName>Rate Con Document</FileName>
                          <FileInfo>Added on {new Date().toLocaleDateString()}</FileInfo>
                        </FileDetails>
                        
                        <FileActions>
                          <IconButton size="small" onClick={() => handleViewFile(load.rate_con, 'Rate Con')}>
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => downloadFile(load.rate_con, 'rate_con')}>
                            <GetApp fontSize="small" />
                          </IconButton>
                        </FileActions>
                      </FileItem>
                    ) : (
                      <Box component="label" sx={{ cursor: 'pointer', display: 'block', mb: 2 }}>
                        <EmptyFilesMessage>
                          <DocumentScanner />
                          <Typography variant="body2">No Rate Con uploaded</Typography>
                          <Button 
                            variant="text" 
                            size="small" 
                            sx={{ mt: 0.5, fontSize: '0.75rem' }}
                          >
                            Upload Rate Con
                          </Button>
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'rate_con')}
                          />
                        </EmptyFilesMessage>
                      </Box>
                    )}
                    
                    {/* BOL */}
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                      Bill of Lading (BOL)
                    </Typography>
                    
                    {load.bol ? (
                      <FileItem>
                        <FileIcon fileType={getFileType(load.bol)}>
                          {getFileIcon(getFileType(load.bol))}
                        </FileIcon>
                        
                        <FileDetails>
                          <FileName>Bill of Lading</FileName>
                          <FileInfo>Added on {new Date().toLocaleDateString()}</FileInfo>
                        </FileDetails>
                        
                        <FileActions>
                          <IconButton size="small" onClick={() => handleViewFile(load.bol, 'BOL')}>
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => downloadFile(load.bol, 'bol')}>
                            <GetApp fontSize="small" />
                          </IconButton>
                        </FileActions>
                      </FileItem>
                    ) : (
                      <Box component="label" sx={{ cursor: 'pointer', display: 'block', mb: 2 }}>
                        <EmptyFilesMessage>
                          <DocumentScanner />
                          <Typography variant="body2">No BOL uploaded</Typography>
                          <Button 
                            variant="text" 
                            size="small" 
                            sx={{ mt: 0.5, fontSize: '0.75rem' }}
                          >
                            Upload BOL
                          </Button>
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'bol')}
                          />
                        </EmptyFilesMessage>
                      </Box>
                    )}
                    
                    {/* POD */}
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                      Proof of Delivery (POD)
                    </Typography>
                    
                    {load.pod ? (
                      <FileItem>
                        <FileIcon fileType={getFileType(load.pod)}>
                          {getFileIcon(getFileType(load.pod))}
                        </FileIcon>
                        
                        <FileDetails>
                          <FileName>Proof of Delivery</FileName>
                          <FileInfo>Added on {new Date().toLocaleDateString()}</FileInfo>
                        </FileDetails>
                        
                        <FileActions>
                          <IconButton size="small" onClick={() => handleViewFile(load.pod, 'POD')}>
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => downloadFile(load.pod, 'pod')}>
                            <GetApp fontSize="small" />
                          </IconButton>
                        </FileActions>
                      </FileItem>
                    ) : (
                      <Box component="label" sx={{ cursor: 'pointer', display: 'block', mb: 2 }}>
                        <EmptyFilesMessage>
                          <DocumentScanner />
                          <Typography variant="body2">No POD uploaded</Typography>
                          <Button 
                            variant="text" 
                            size="small" 
                            sx={{ mt: 0.5, fontSize: '0.75rem' }}
                          >
                            Upload POD
                          </Button>
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'pod')}
                          />
                        </EmptyFilesMessage>
                      </Box>
                    )}
                    
                    {/* Commercial Invoice */}
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                      Commercial Invoice
                    </Typography>
                    
                    {load.comercial_invoice ? (
                      <FileItem>
                        <FileIcon fileType={getFileType(load.comercial_invoice)}>
                          {getFileIcon(getFileType(load.comercial_invoice))}
                        </FileIcon>
                        
                        <FileDetails>
                          <FileName>Commercial Invoice</FileName>
                          <FileInfo>Added on {new Date().toLocaleDateString()}</FileInfo>
                        </FileDetails>
                        
                        <FileActions>
                          <IconButton size="small" onClick={() => handleViewFile(load.comercial_invoice, 'Invoice')}>
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => downloadFile(load.comercial_invoice, 'comercial_invoice')}>
                            <GetApp fontSize="small" />
                          </IconButton>
                        </FileActions>
                      </FileItem>
                    ) : (
                      <Box component="label" sx={{ cursor: 'pointer', display: 'block' }}>
                        <EmptyFilesMessage>
                          <DocumentScanner />
                          <Typography variant="body2">No Commercial Invoice uploaded</Typography>
                          <Button 
                            variant="text" 
                            size="small" 
                            sx={{ mt: 0.5, fontSize: '0.75rem' }}
                          >
                            Upload Invoice
                          </Button>
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'comercial_invoice')}
                          />
                        </EmptyFilesMessage>
                      </Box>
                    )}
                  </>
                )}
              </InfoCard>
              
              {/* Notes */}
              {(load.note || editingSection === 'notes') && (
                <InfoCard>
                  <InfoCardHeader>
                    <InfoCardTitle>
                      <Description />
                      Notes
                    </InfoCardTitle>
                                      {permissions.load_update && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={editingSection === 'notes' ? <Close /> : <EditIcon />}
                      onClick={editingSection === 'notes' ? handleCancelEdit : () => handleEditSection('notes')}
                    >
                      {editingSection === 'notes' ? 'CANCEL' : 'EDIT'}
                    </Button>
                  )}
                  </InfoCardHeader>
                  
                  {editingSection === 'notes' ? (
                    // Edit form for notes
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Notes"
                        name="note"
                        value={editFormData.note}
                        onChange={handleFormChange}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="contained" 
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    // Display mode for notes
                    <Typography variant="body2" sx={{ p: 1 }}>
                      {load.note}
                    </Typography>
                  )}
                </InfoCard>
              )}
            </>
          )}
        </PanelContent>
      </RightPanel>

      {/* File Preview Modal */}
      <FilePreviewModal
        open={previewModal.open}
        onClose={handleClosePreview}
        maxWidth="lg"
        onClick={handleClosePreview}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" noWrap sx={{ maxWidth: '90%' }}>
            {previewModal.name}
          </Typography>
          <Box>
            {previewModal.type === 'image' && (
              <IconButton 
                onClick={handleDownload}
                sx={{ mr: 1 }}
              >
                <Download />
              </IconButton>
            )}
            <IconButton onClick={handleClosePreview}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          {previewModal.type === 'image' ? (
            <ImagePreview 
              src={previewModal.url} 
              alt={previewModal.name} 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(e);
              }}
            />
          ) : previewModal.type === 'pdf' ? (
            <PdfPreview src={previewModal.url} title={previewModal.name} />
          ) : null}
        </DialogContent>
      </FilePreviewModal>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add delete confirmation dialog */}
      <Dialog
        open={deleteStopDialog.open}
        onClose={() => {
          setDeleteStopDialog({ open: false, stopId: null, stopName: '' });
          // Ensure editing state is reset when dialog is closed without deletion
          if (editingStop) {
            setEditingStop(null);
          }
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="alert-dialog-description">
            Are you sure you want to delete this stop ({deleteStopDialog.stopName})? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteStopDialog({ open: false, stopId: null, stopName: '' });
              // Ensure editing state is reset when dialog is cancelled
              if (editingStop) {
                setEditingStop(null);
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteStop(deleteStopDialog.stopId)} 
            variant="contained" 
            color="error" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>


    </MainContainer>
  );
};

export default LoadViewPage; 