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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ApiService } from "../../api/auth";
import LoadForm from "./LoadForm";
import ChatBox from "./ChatBox";
import { useSidebar } from "../SidebarContext";

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
            setLoadData(prevData => ({
              ...prevData,
              ...data,
            }));
            const stepIndex = steps.findIndex(step => step.toUpperCase() === data.load_status);
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

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.keys(loadData).forEach((key) => {
        if (loadData[key] !== null) {
          if (loadData[key]?.file) {
            formData.append(key, loadData[key].file);
          } else {
            formData.append(key, loadData[key]);
          }
        }
      });

      const currentStep = steps[activeStep].toUpperCase();
      formData.set("load_status", currentStep);
      formData.set("created_by", loadData.created_by || "");

      if (isEditMode || loadData.id) {
        await ApiService.patchData(`/load/${loadData.id || id}/`, formData);
      } else {
        const response = await ApiService.postData("/load/", formData);
        localStorage.setItem("loadId", response.id);
        setLoadData((prevData) => ({
          ...prevData,
          id: response.id,
        }));
        navigate(`/load/${response.id}`);
      }
    } catch (error) {
      console.error("Error submitting load:", error);
      console.error("Response data:", error.response?.data);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleChange = async (e) => {
    const { name, files, value } = e.target;
    const updatedLoadData = {
      ...loadData,
      [name]: files ? { name: files[0].name, file: files[0] } : value,
    };
    setLoadData(updatedLoadData);

    if (files) {
      const formData = new FormData();
      formData.append(name, files[0]);
      formData.set("created_by", loadData.created_by || "");

      try {
        const loadId = isEditMode ? id : localStorage.getItem("loadId");
        await ApiService.putMediaData(`/load/${loadId}/`, formData);
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
          await ApiService.postMediaData("/chat/", formData);
        } catch (error) {
          console.error(`Error uploading ${fieldName}:`, error);
        }
      }
    }
  };

  const handleToggleCustomerForm = () => {
    setShowCustomerForm(!showCustomerForm);
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
        <Box sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ p: 2, mb: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={activeStep}
              label="Status"
              onChange={(e) => setActiveStep(Number(e.target.value))}
            >
              {steps.map((label, index) => (
                <MenuItem key={label} value={index}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {isEditMode || loadData.id ? "Save" : "Create"}
            </Button>
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
            isDetailsComplete={true}
            isCustomerBrokerComplete={true}
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
          isDisabled={false}
        />
      </Box>
    </Box>
  );
};

export default LoadPage;
