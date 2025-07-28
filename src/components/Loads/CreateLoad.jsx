import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  InputAdornment,
  CircularProgress,
  AvatarGroup,
  Tooltip,
  Badge,
  Grid,
  Autocomplete,
  Alert,
  Snackbar,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import { ApiService } from "../../api/auth";
import LoadForm from "./LoadForm";
import ChatBox from "./ChatBox";
import { useSidebar } from "../SidebarContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';

const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "calc(100vh - 64px)",
  backgroundColor: theme.palette.background.default,
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const LeftPanel = styled(Paper)(({ theme }) => ({
  width: "400px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.spacing(1),
}));

const ChatPanel = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.spacing(1),
}));

const RightPanel = styled(Paper)(({ theme }) => ({
  width: "350px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.spacing(1),
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const MessageInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}));

const InfoPanel = styled(Paper)(({ theme }) => ({
  width: "300px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderRadius: theme.spacing(1),
}));

const steps = [
  "Open",
  "Covered",
  "Dispatched",
  "Loading",
  "On Route",
  "Unloading",
  "Delivered",
  "Completed",
  "In Yard",
];

const requiredFields = {
  0: [
    "load_id",
    "reference_id",
    "created_date",
    "updated_date",
    "load_pay",
    "total_pay",
    "per_mile",
    "total_miles",
  ],
  1: ["reference_id"],
  2: ["reference_id"],
  3: ["reference_id"],
  4: ["reference_id"],
  5: ["reference_id"],
  6: ["reference_id"],
  7: ["reference_id"],
  8: ["reference_id"],
};

const STATE_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const BILLING_TYPES = [
  { value: 'NONE', label: 'None' },
  { value: 'FACTORING_COMPANY', label: 'Factoring Company' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MANUAL', label: 'Manual' }
];

const BrokerModal = ({ open, onClose, onSave }) => {
  const [brokerData, setBrokerData] = useState({
    company_name: "",
    contact_number: "",
    email_address: "",
    mc_number: "",
    pod_file: false,
    rate_con: false,
    address1: "",
    address2: "",
    country: "USA",
    state: "",
    zip_code: "",
    city: "",
    billing_type: "NONE",
    terms_days: null
  });

  const [errors, setErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("error");

  const validateForm = () => {
    const newErrors = {};
    
    if (!brokerData.company_name) {
      newErrors.company_name = "Company name is required";
    }
    
    if (!brokerData.mc_number) {
      newErrors.mc_number = "MC number is required";
    }
    
    if (brokerData.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brokerData.email_address)) {
      newErrors.email_address = "Invalid email format";
    }
    
    if (brokerData.contact_number && !/^\d+$/.test(brokerData.contact_number)) {
      newErrors.contact_number = "Contact number must contain only digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrokerData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const showNotificationMessage = (message, type = "error") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotificationMessage("Please fill in all required fields correctly");
      return;
    }

    try {
      // Convert numeric strings to numbers, but allow null for zip_code
      const formattedData = {
        ...brokerData,
        contact_number: brokerData.contact_number ? parseInt(brokerData.contact_number) : null,
        zip_code: brokerData.zip_code || null // Allow empty or null zip_code
      };

      const response = await ApiService.postData("/customer_broker/", formattedData);
      showNotificationMessage("Broker created successfully", "success");
      onSave(response);
      onClose();
    } catch (error) {
      console.error("Error creating broker:", error);
      const errorMessage = error.response?.data?.billing_type?.[0] || 
                         "Failed to create broker. Please try again.";
      showNotificationMessage(errorMessage);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon color="primary" />
            <Typography variant="h6">Create New Broker</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="company_name"
                value={brokerData.company_name}
                onChange={handleChange}
                required
                error={!!errors.company_name}
                helperText={errors.company_name}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MC Number"
                name="mc_number"
                value={brokerData.mc_number}
                onChange={handleChange}
                required
                error={!!errors.mc_number}
                helperText={errors.mc_number}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact_number"
                value={brokerData.contact_number}
                onChange={handleChange}
                error={!!errors.contact_number}
                helperText={errors.contact_number}
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email_address"
                type="email"
                value={brokerData.email_address}
                onChange={handleChange}
                error={!!errors.email_address}
                helperText={errors.email_address}
                inputProps={{ maxLength: 254 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                name="address1"
                value={brokerData.address1}
                onChange={handleChange}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                name="address2"
                value={brokerData.address2}
                onChange={handleChange}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={brokerData.city}
                onChange={handleChange}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="State"
                name="state"
                value={brokerData.state}
                onChange={handleChange}
              >
                {STATE_OPTIONS.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip_code"
                value={brokerData.zip_code}
                onChange={handleChange}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Billing Type"
                name="billing_type"
                value={brokerData.billing_type}
                onChange={handleChange}
              >
                {BILLING_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Create Broker
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity={notificationType}
          variant="filled"
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

const LoadPage = () => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(true);
  const [initialLoadData, setInitialLoadData] = useState({
    load_id: "",
    reference_id: "",
    customer_broker: null,
  });
  const [loadData, setLoadData] = useState({
    id: 0,
    created_by: null,
    customer_broker: null,
    driver: null,
    dispatcher: null,
    truck: null,
    stop: [],
    company_name: "",
    reference_id: "",
    instructions: "",
    bills: null,
    load_id: "",
    trip_id: null,
    equipment_type: "DRYVAN",
    load_status: "OPEN",
    load_pay: null,
    total_pay: null,
    per_mile: null,
    total_miles: null,
    pickup_date: null,
    delivery_date: null,
    pickup_location: null,
    delivery_location: null,
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [brokers, setBrokers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { isSidebarOpen } = useSidebar();
  const [loads, setLoads] = useState([]);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [files, setFiles] = useState([]);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);

  useEffect(() => {
    fetchBrokers();
    if (id) {
      fetchLoadData();
    }
  }, [id]);

  const fetchBrokers = async () => {
    try {
      const data = await ApiService.getData("/customer/");
      setBrokers(data);
    } catch (error) {
      console.error("Error fetching brokers:", error);
    }
  };

  const fetchLoadData = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getData(`/load/${id}/`);
      setLoadData(data);
    } catch (error) {
      console.error("Error fetching load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInitialLoad = async () => {
    try {
      const response = await ApiService.postData("/load/", {
        load_id: initialLoadData.load_id,
        reference_id: initialLoadData.reference_id || "",
        customer_broker: initialLoadData.customer_broker?.id,
      });
      setLoadData(response);
      setCreateModalOpen(false);
      navigate(`/loads/create/${response.id}`);
    } catch (error) {
      console.error("Error creating load:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await ApiService.postData(`/load/${id}/chat/`, {
        message: newMessage,
      });
      setNewMessage("");
      const messages = await ApiService.getData(`/load/${id}/chat/`);
      setMessages(messages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await ApiService.postMediaData(`/load/${id}/documents/`, formData);
      const files = await ApiService.getData(`/load/${id}/documents/`);
      setFiles(files);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const filteredLoads = loads.filter(load => 
    load.reference_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.customer_broker?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = async () => {
    const currentStep = steps[activeStep].toUpperCase().replace(" ", " ");
    const required = requiredFields[activeStep];

    for (const field of required) {
      if (!loadData[field]) {
        alert(`${field.replace("_", " ")} is required to proceed.`);
        return;
      }
    }

    try {
      const formData = new FormData();
      const processedData = { ...loadData };

      // Extract only the 'id' from objects
      if (processedData.created_by && typeof processedData.created_by === 'object') processedData.created_by = processedData.created_by.id;
      if (processedData.customer_broker && typeof processedData.customer_broker === 'object') processedData.customer_broker = processedData.customer_broker.id;
      if (processedData.dispatcher && typeof processedData.dispatcher === 'object') processedData.dispatcher = processedData.dispatcher.id;
      if (processedData.driver && typeof processedData.driver === 'object') processedData.driver = processedData.driver.id;

      Object.keys(processedData).forEach((key) => {
        // Skip created_date and updated_date unless they are explicitly set in a valid format
        if (key === "created_date" || key === "updated_date") {
          if (processedData[key] && typeof processedData[key] === "string" && processedData[key].includes("T")) {
            formData.append(key, processedData[key]);
          }
        } else if (processedData[key] !== null && processedData[key] !== undefined && key !== "pickup_time" && key !== "delivery_time") {
          if (processedData[key]?.file) {
            formData.append(key, processedData[key].file);
          } else {
            formData.append(key, processedData[key]);
          }
        }
      });
      // Format created_date and updated_date to YYYY-MM-DD
      const formattedCreatedDate = loadData.created_date ? new Date(loadData.created_date).toISOString().split('T')[0] : "";
      const formattedUpdatedDate = loadData.updated_date ? new Date(loadData.updated_date).toISOString().split('T')[0] : "";
      formData.set("created_date", formattedCreatedDate);
      formData.set("updated_date", formattedUpdatedDate);
      formData.set("load_status", currentStep);
      formData.set("created_by", processedData.created_by || "");

      if (id) {
        await ApiService.patchData(`/load/${id}/`, formData);
      } else {
        const response = await ApiService.postData("/load/", formData);
        localStorage.setItem("loadId", response.id);
        setLoadData((prevData) => ({
          ...prevData,
          id: response.id,
        }));
      }

      if (activeStep === steps.length - 1) {
        navigate("/loads");
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } catch (error) {
      console.error("Error updating load:", error);
      console.error("Response data:", error.response?.data);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      const processedData = { ...loadData };

      if (processedData.created_by && typeof processedData.created_by === 'object') processedData.created_by = processedData.created_by.id;
      if (processedData.customer_broker && typeof processedData.customer_broker === 'object') processedData.customer_broker = processedData.customer_broker.id;
      if (processedData.dispatcher && typeof processedData.dispatcher === 'object') processedData.dispatcher = processedData.dispatcher.id;
      if (processedData.driver && typeof processedData.driver === 'object') processedData.driver = processedData.driver.id;

      Object.keys(processedData).forEach((key) => {
        if (key === "created_date" || key === "updated_date") {
          if (processedData[key] && typeof processedData[key] === "string" && processedData[key].includes("T")) {
            formData.append(key, processedData[key]);
          }
        } else if (processedData[key] !== null && processedData[key] !== undefined && key !== "pickup_time" && key !== "delivery_time") {
          if (processedData[key]?.file) {
            formData.append(key, processedData[key].file);
          } else {
            formData.append(key, processedData[key]);
          }
        }
      });

      const formattedCreatedDate = loadData.created_date ? new Date(loadData.created_date).toISOString().split('T')[0] : "";
      const formattedUpdatedDate = loadData.updated_date ? new Date(loadData.updated_date).toISOString().split('T')[0] : "";
      formData.set("created_date", formattedCreatedDate);
      formData.set("updated_date", formattedUpdatedDate);

      const loadId = id ? id : localStorage.getItem('loadId');
      await ApiService.putData(`/load/${loadId}/`, formData);
      console.log('Load saved successfully');
      setIsChanged(false);
    } catch (error) {
      console.error('Error saving load:', error);
    }
  };

  const handleChange = async (e) => {
    const { name, files, value } = e.target;
    const updatedLoadData = {
      ...loadData,
      [name]: files ? { name: files[0].name, file: files[0] } : value,
    };
    setLoadData(updatedLoadData);
    setIsChanged(true);

    if (name === 'customer_broker' && typeof value === 'object') {
      setLoadData((prevData) => ({
        ...prevData,
        customer_broker: value,
      }));
    }

    if (name === 'dispatcher' && typeof value === 'object') {
      setLoadData((prevData) => ({
        ...prevData,
        dispatcher: value.id,
      }));
    }

    if (files) {
      const formData = new FormData();
      formData.append(name, files[0]);
      formData.set("created_by", loadData.created_by || "");

      try {
        const loadId = id ? id : localStorage.getItem("loadId");
        const response = await ApiService.putMediaData(`/load/${loadId}/`, formData);
        console.log(response);
        if (response.status !== 200) {
          throw new Error("Failed to update load");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleToggleCustomerForm = () => {
    setShowCustomerForm(!showCustomerForm);
  };

  const isDetailsComplete = requiredFields[0].every((field) => loadData[field]);

  const handleAddToLoad = async (broker) => {
    const updatedLoadData = {
      ...loadData,
      customer_broker: broker.id,
    };
    setLoadData(updatedLoadData);

    const formData = new FormData();
    formData.append('customer_broker', broker.id);

    try {
      const loadId = id ? id : localStorage.getItem('loadId');
      await ApiService.putData(`/load/${loadId}/`, formData);
      console.log('Broker added to load successfully');
    } catch (error) {
      console.error('Error adding broker to load:', error);
    }
  };

  const handleAddOtherPay = async (newOtherPay) => {
    const formData = new FormData();
    formData.append('amount', newOtherPay.amount);
    formData.append('pay_type', newOtherPay.pay_type);
    formData.append('note', newOtherPay.note);
    formData.append('load', loadData.id);

    try {
      const response = await ApiService.postMediaData('/api/otherpay/', formData);
      setLoadData((prevData) => ({
        ...prevData,
        otherPays: [...(prevData.otherPays || []), response],
      }));
      alert('Other Pay successfully created!');
      console.log('Other Pay added:', response);
    } catch (error) {
      alert('Failed to create Other Pay. Please try again.');
      console.error('Error adding other pay:', error);
    }
  };

  useEffect(() => {
    const fetchOtherPays = async () => {
      try {
        const response = await ApiService.getData(`/load/${loadData.id}/otherpays/`);
        setLoadData((prevData) => ({
          ...prevData,
          otherPays: response,
        }));
      } catch (error) {
        console.error('Error fetching other pays:', error);
      }
    };

    if (loadData.id) {
      fetchOtherPays();
    }
  }, [loadData.id]);

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      const processedData = { ...loadData, load_status: 'COVERED' };

      // Ensure driver is sent as an ID
      if (processedData.driver && typeof processedData.driver === 'object') {
        processedData.driver = processedData.driver.id;
      }

      Object.keys(processedData).forEach((key) => {
        if (processedData[key] !== null && processedData[key] !== undefined) {
          formData.append(key, processedData[key]);
        }
      });

      const response = await ApiService.postData('/load/', formData);
      navigate(`/loads/edit/${response.id}`);
    } catch (error) {
      console.error('Error creating load:', error);
    }
  };

  const handleBrokerSave = (newBroker) => {
    setBrokers(prev => [...prev, newBroker]);
    setInitialLoadData(prev => ({
      ...prev,
      customer_broker: newBroker
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Dialog open={isCreateModalOpen && !id} onClose={() => navigate("/loads")}>
        <DialogTitle>Create New Load</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Load ID"
                value={initialLoadData.load_id}
                onChange={(e) => setInitialLoadData({
                  ...initialLoadData,
                  load_id: e.target.value
                })}
                required
                error={!initialLoadData.load_id}
                helperText={!initialLoadData.load_id ? "Load ID is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference ID"
                value={initialLoadData.reference_id}
                onChange={(e) => setInitialLoadData({
                  ...initialLoadData,
                  reference_id: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={brokers}
                  getOptionLabel={(option) => option.company_name || ""}
                  value={initialLoadData.customer_broker}
                  onChange={(_, newValue) => setInitialLoadData({
                    ...initialLoadData,
                    customer_broker: newValue
                  })}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Broker" />
                  )}
                />
                <IconButton 
                  color="primary"
                  onClick={() => setIsBrokerModalOpen(true)}
                  sx={{ mt: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/loads")}>Cancel</Button>
          <Button 
            onClick={handleCreateInitialLoad}
            variant="contained"
            disabled={!initialLoadData.load_id || !initialLoadData.customer_broker}
          >
            Create Load
          </Button>
        </DialogActions>
      </Dialog>

      <BrokerModal 
        open={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        onSave={handleBrokerSave}
      />

      <MainContainer>
        <LeftPanel elevation={2}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">Load Details</Typography>
          </Box>
          <Box sx={{ p: 2, overflowY: "auto" }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instructions"
                  multiline
                  rows={4}
                  value={loadData.instructions}
                  onChange={(e) => setLoadData({ ...loadData, instructions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bills"
                  type="number"
                  value={loadData.bills}
                  onChange={(e) => setLoadData({ ...loadData, bills: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Load Pay"
                  type="number"
                  value={loadData.load_pay}
                  onChange={(e) => setLoadData({ ...loadData, load_pay: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total Miles"
                  type="number"
                  value={loadData.total_miles}
                  onChange={(e) => setLoadData({ ...loadData, total_miles: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  value={loadData.pickup_location}
                  onChange={(e) => setLoadData({ ...loadData, pickup_location: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Location"
                  value={loadData.delivery_location}
                  onChange={(e) => setLoadData({ ...loadData, delivery_location: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Pickup Date"
                  value={loadData.pickup_date || ""}
                  onChange={(e) => setLoadData({ ...loadData, pickup_date: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Delivery Date"
                  value={loadData.delivery_date || ""}
                  onChange={(e) => setLoadData({ ...loadData, delivery_date: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </LeftPanel>

        <ChatPanel elevation={2}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">Chat</Typography>
            <AvatarGroup max={3} sx={{ ml: "auto" }}>
              {participants.map((participant) => (
                <Tooltip key={participant.id} title={participant.name}>
                  <Avatar src={participant.avatar}>{participant.name[0]}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
          <MessageList>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 2,
                  flexDirection: message.is_mine ? "row-reverse" : "row",
                }}
              >
                <Avatar src={message.user.avatar}>{message.user.name[0]}</Avatar>
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.is_mine ? "primary.main" : "grey.100",
                    color: message.is_mine ? "white" : "text.primary",
                  }}
                >
                  <Typography variant="body2">{message.message}</Typography>
                  <Typography variant="caption" color={message.is_mine ? "grey.200" : "text.secondary"}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </MessageList>
          <MessageInput>
            <IconButton component="label">
              <input type="file" hidden onChange={handleFileUpload} />
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              placeholder="Xabar yozing..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              size="small"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <SendIcon />
            </IconButton>
          </MessageInput>
        </ChatPanel>

        <RightPanel elevation={2}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">Load Information</Typography>
          </Box>
          <Box sx={{ p: 2, overflowY: "auto" }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Load ID"
                  secondary={loadData.reference_id || "Not assigned"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Broker"
                  secondary={loadData.customer_broker?.company_name || "Not assigned"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocalShippingIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Driver"
                  secondary={loadData.driver?.user?.first_name || "Not assigned"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dispatcher"
                  secondary={loadData.dispatcher?.user?.email || "Not assigned"}
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Equipment Information
            </Typography>
            {loadData.truck && (
              <List>
                <ListItem>
                  <ListItemText
                    primary={`${loadData.truck.make} ${loadData.truck.model}`}
                    secondary={`Unit: ${loadData.truck.unit_number}`}
                  />
                </ListItem>
              </List>
            )}
          </Box>
        </RightPanel>
      </MainContainer>
    </>
  );
};

export default LoadPage;