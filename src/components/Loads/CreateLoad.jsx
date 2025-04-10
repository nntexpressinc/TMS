import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  TextField,
  IconButton,
} from "@mui/material";
import { ApiService } from "../../api/auth";
import LoadForm from "./LoadForm";
import ChatBox from "./ChatBox";
import { useSidebar } from "../SidebarContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

const LoadPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loadData, setLoadData] = useState({
    id: 0,
    company_name: "",
    reference_id: "",
    instructions: "",
    bills: 0,
    created_by: "",
    created_date: "",
    load_id: "",
    trip_id: 0,
    customer_broker: "",
    driver: "",
    co_driver: "",
    truck: "",
    dispatcher: "",
    load_status: "OFFER",
    tags: "",
    equipment_type: "DRYVAN",
    trip_status: "",
    invoice_status: "",
    trip_bil_status: "",
    load_pay: 0,
    driver_pay: 0,
    total_pay: 0,
    per_mile: 0,
    mile: 0,
    empty_mile: 0,
    total_miles: 0,
    flagged: false,
    flagged_reason: "",
    note: "",
    chat: "",
    ai: false,
    rate_con: null,
    bol: null,
    pod: null,
    document: null,
    comercial_invoice: null,
  });
  const [drivers, setDrivers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { id } = useParams();
  const isEditMode = !!id;
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/driver/`, storedAccessToken);
          setDrivers(data);
        } catch (error) {
          console.error("Error fetching drivers data:", error);
        }
      }
    };

    const fetchLoadData = async () => {
      if (isEditMode) {
        setIsLoading(true);
        const storedAccessToken = localStorage.getItem("accessToken");
        if (storedAccessToken) {
          try {
            const data = await ApiService.getData(`/load/${id}/`, storedAccessToken);
            console.log("Fetched load data:", data);
            setLoadData((prevData) => ({
              ...prevData,
              ...data,
              customer_broker: data.customer_broker ? data.customer_broker.id : "",
            }));
            const stepIndex = steps.findIndex(
              (step) => step.toUpperCase().replace(" ", " ") === data.load_status
            );
            setActiveStep(stepIndex !== -1 ? stepIndex : 0);
          } catch (error) {
            console.error("Error fetching load data:", error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    fetchDrivers();
    fetchLoadData();
  }, [id, isEditMode]);

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

      if (isEditMode) {
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

      const loadId = isEditMode ? id : localStorage.getItem('loadId');
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

    if (files) {
      const formData = new FormData();
      formData.append(name, files[0]);
      formData.set("created_by", loadData.created_by || "");

      try {
        const loadId = isEditMode ? id : localStorage.getItem("loadId");
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const loadId = isEditMode ? id : localStorage.getItem("loadId");
    const userId = localStorage.getItem("userId");

    formData.append("user", userId || "");
    formData.append("load_id", loadId || "");
    formData.append("group_message_id", "");

    if (newMessage.trim()) {
      const newMessageObj = {
        message: newMessage,
        timestamp: new Date(),
      };
      setChatMessages([...chatMessages, newMessageObj]);
      formData.append("message", newMessage);

      try {
        const response = await ApiService.postMediaData("/chat/", formData);
        console.log(response);
        if (response.status !== 200) {
          throw new Error("Failed to send message");
        }
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }

    const fileFields = {
      1: "comercial_invoice",
      2: "rate_con",
      3: "document",
      4: "pod",
      5: "bol",
    };

    const hasFiles = Object.values(fileFields).some((field) => loadData[field]);
    if (hasFiles) {
      for (let i = 1; i <= 5; i++) {
        const fieldName = fileFields[i];
        const file = loadData[fieldName];
        if (!file) continue;

        try {
          formData.append("file", file.file);
          const response = await ApiService.postMediaData("/chat/", formData);
          console.log(`File ${fieldName} upload response:`, response);
        } catch (error) {
          console.error(`Error uploading ${fieldName}:`, error);
        }
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
      const loadId = isEditMode ? id : localStorage.getItem('loadId');
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

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading load data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
      <Box sx={{ width: isSidebarOpen ? "77%" : "87%", pr: 2 }}>
        <Box sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ p: 2, mb: 2, flexGrow: 1 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ display: 'flex', marginRight: '10px', justifyContent: 'center', alignItems: 'center', gap: 2, p: 1, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            {!isEditMode && (
              <Button onClick={handleCreate} color="primary" sx={{
                textTransform: 'none',
                backgroundColor: '#1976d2',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#115293',
                },
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 'bold',
                boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)'
              }}>
                Create
              </Button>
            )}
            {isEditMode && (
              <>
                <Button onClick={() => navigate(`/loads/view/${id}`)} color="primary" startIcon={<VisibilityIcon />} sx={{ textTransform: 'none' }}>
                  View Load
                </Button>
                <Button disabled={activeStep === 0} onClick={handleBack} color="primary" startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none' }}>
                  Back
                </Button>
                <Button onClick={handleNext} color="primary" startIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none' }}>
                  Next
                </Button>
                <Button onClick={handleSave} color="primary" startIcon={<SaveIcon />} disabled={!isChanged} sx={{ textTransform: 'none' }}>
                  Save
                </Button>
              </>
            )}
          </Box>
        </Box>
        <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
          <LoadForm
            loadData={loadData}
            drivers={drivers}
            handleChange={handleChange}
            activeStep={activeStep}
            showCustomerForm={showCustomerForm}
            handleToggleCustomerForm={handleToggleCustomerForm}
            isDetailsComplete={isDetailsComplete}
            isCustomerBrokerComplete={activeStep >= 1}
            handleAddToLoad={handleAddToLoad}
            handleAddOtherPay={handleAddOtherPay}
          />
        </Box>
      </Box>
      <Box sx={{ width: "20%" }}>
        <ChatBox
          chatMessages={chatMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          loadData={loadData}
          handleChange={handleChange}
          isDisabled={!isDetailsComplete || activeStep < 1}
        />
      </Box>
    </Box>
  );
};

export default LoadPage;