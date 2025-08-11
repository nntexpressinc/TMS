import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Alert,
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
  "In Yard",
  "Delivered",
  "Completed",
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
    "truck", // Added truck as required field
  ],
  1: ["reference_id", "truck"], // Added truck requirement
  2: ["reference_id", "truck"],
  3: ["reference_id", "truck"],
  4: ["reference_id", "truck"],
  5: ["reference_id", "truck"],
  6: ["reference_id", "truck"],
  7: ["reference_id", "truck"],
  8: ["reference_id", "truck"],
};

const EditLoad = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loadData, setLoadData] = useState({
    id: 0,
    company_name: "",
    reference_id: "",
    instructions: "",
    bills: 0,
    created_by: "",
    load_id: "",
    trip_id: 0,
    customer_broker: null,
    driver: null,
    co_driver: "",
    truck: null, // Initialize truck as null
    dispatcher: null,
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
    stops: [], // Add stops array to preserve stops data
  });
  const [drivers, setDrivers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [trucks, setTrucks] = useState([]); // Add trucks state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { id } = useParams();

  useEffect(() => {
    const fetchLoadData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken && id) {
        try {
          const data = await ApiService.getData(`/load/${id}/`, storedAccessToken);
          console.log("Fetched load data:", data);
          
          // Set pickup_time and delivery_time from created_date and updated_date
          data.pickup_time = data.created_date ? data.created_date.split('T')[0] : "";
          data.delivery_time = data.updated_date ? data.updated_date.split('T')[0] : "";
          
          // Preserve existing stops data
          if (!data.stops) {
            data.stops = [];
          }
          
          setLoadData(data);
          
          // Load statusga qarab activeStep'ni sozlash
          const stepIndex = steps.findIndex(step => step.toUpperCase().replace(" ", " ") === data.load_status);
          setActiveStep(stepIndex !== -1 ? stepIndex : 0);
        } catch (error) {
          console.error("Error fetching load data:", error);
          setAlertMessage("Error loading load data");
          setAlertSeverity("error");
        }
      }
    };

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

    const fetchDispatchers = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/dispatcher/`, storedAccessToken);
          setDispatchers(data);
        } catch (error) {
          console.error("Error fetching dispatchers data:", error);
        }
      }
    };

    const fetchTrucks = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
        try {
          const data = await ApiService.getData(`/truck/`, storedAccessToken);
          setTrucks(data);
        } catch (error) {
          console.error("Error fetching trucks data:", error);
        }
      }
    };

    fetchLoadData();
    fetchDrivers();
    fetchDispatchers();
    fetchTrucks();
  }, [id]);

  const handleNext = async () => {
    const currentStep = steps[activeStep].toUpperCase().replace(" ", " ");

    // Enhanced validation with specific error messages
    const required = requiredFields[activeStep];
    for (const field of required) {
      if (!loadData[field]) {
        let fieldName = field.replace("_", " ");
        if (field === "truck") {
          fieldName = "Unit/Truck";
        }
        setAlertMessage(`${fieldName} is required to proceed.`);
        setAlertSeverity("error");
        return;
      }
    }

    try {
      const formData = new FormData();
      const processedData = { ...loadData };
      
      // Convert object references to IDs while preserving stops and other complex data
      if (processedData.created_by && typeof processedData.created_by === 'object') processedData.created_by = processedData.created_by.id;
      if (processedData.customer_broker && typeof processedData.customer_broker === 'object') processedData.customer_broker = processedData.customer_broker.id;
      if (processedData.dispatcher && typeof processedData.dispatcher === 'object') processedData.dispatcher = processedData.dispatcher.id;
      if (processedData.driver && typeof processedData.driver === 'object') processedData.driver = processedData.driver.id;
      if (processedData.truck && typeof processedData.truck === 'object') processedData.truck = processedData.truck.id;

      // Handle date formatting - preserve exact format entered by user
      const formattedPickupTime = loadData.pickup_time ? new Date(loadData.pickup_time).toISOString().split('T')[0] : "";
      const formattedDeliveryTime = loadData.delivery_time ? new Date(loadData.delivery_time).toISOString().split('T')[0] : "";
      formData.append("created_date", formattedPickupTime);
      formData.append("updated_date", formattedDeliveryTime);

      // Preserve stops data during form submission
      if (processedData.stops && Array.isArray(processedData.stops)) {
        formData.append("stops", JSON.stringify(processedData.stops));
      }

      Object.keys(processedData).forEach((key) => {
        if (processedData[key] !== null && processedData[key] !== undefined && 
            key !== "pickup_time" && key !== "delivery_time" && key !== "stops") {
          if (processedData[key]?.file) {
            formData.append(key, processedData[key].file);
          } else if (typeof processedData[key] !== 'object') {
            formData.append(key, processedData[key]);
          }
        }
      });
      
      formData.set("load_status", currentStep);
      formData.set("created_by", processedData.created_by || "");

      await ApiService.patchData(`/load/${id}/`, formData);
      
      setAlertMessage("Load updated successfully");
      setAlertSeverity("success");

      if (activeStep === steps.length - 1) {
        navigate("/loads");
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } catch (error) {
      console.error("Error updating load:", error);
      console.error("Response data:", error.response?.data);
      setAlertMessage("Error updating load. Please check all required fields.");
      setAlertSeverity("error");
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = async (e) => {
    // Enhanced change handler that preserves all existing data including stops
    const isFileUpload = e.target.type === 'file';
    const { name, files, value } = e.target;
    
    // Create updated load data while preserving all existing properties
    const updatedLoadData = {
      ...loadData, // Preserve all existing data including stops
      [name]: files ? { name: files[0].name, file: files[0] } : value,
    };
    
    setLoadData(updatedLoadData);

    // Handle file uploads with data preservation
    if (files) {
      const formData = new FormData();
      formData.append(name, files[0]);
      formData.set("created_by", loadData.created_by || "");
      
      // Preserve stops data during file upload
      if (loadData.stops && Array.isArray(loadData.stops)) {
        formData.append("stops", JSON.stringify(loadData.stops));
      }

      try {
        const response = await ApiService.putMediaData(`/load/${id}/`, formData);
        console.log("File uploaded successfully:", response);
        if (response.status !== 200) {
          throw new Error("Failed to update load");
        }
        setAlertMessage("File uploaded successfully");
        setAlertSeverity("success");
      } catch (error) {
        console.error("Error uploading file:", error);
        setAlertMessage("Error uploading file");
        setAlertSeverity("error");
      }
    }
  };

  // Enhanced stops handler
  const handleStopsChange = (newStops) => {
    setLoadData(prevData => ({
      ...prevData,
      stops: newStops
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const userId = localStorage.getItem("userId");

    formData.append("user", userId || "");
    formData.append("load_id", id || "");
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
        setAlertMessage("Error sending message");
        setAlertSeverity("error");
      }
    }

    // Handle file uploads in messages
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

  const handleToggleCustomerForm = async () => {
    if (showCustomerForm) {
      // If the form is being hidden, submit the data
      const formData = new FormData();
      formData.append("company_name", loadData.new_customer_company_name || "");
      formData.append("contact_number", loadData.new_customer_contact_number || "");
      formData.append("email_address", loadData.new_customer_email_address || "");
      formData.append("mc_number", loadData.new_customer_mc_number || "");
      formData.append("address1", loadData.new_customer_address1 || "");
      formData.append("address2", loadData.new_customer_address2 || "");
      formData.append("country", loadData.new_customer_country || "");
      formData.append("state", loadData.new_customer_state || "");
      formData.append("city", loadData.new_customer_city || "");
      formData.append("zip_code", loadData.new_customer_zip_code || "");

      try {
        const response = await ApiService.postData("/api/customer_broker/", formData);
        console.log("Customer Broker created:", response);
        setAlertMessage("Customer broker created successfully");
        setAlertSeverity("success");
      } catch (error) {
        console.error("Error creating customer broker:", error);
        setAlertMessage("Error creating customer broker");
        setAlertSeverity("error");
      }
    }
    setShowCustomerForm(!showCustomerForm);
  };

  const isDetailsComplete = requiredFields[0].every((field) => loadData[field]);

  return (
    <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
      <Box sx={{ width: isSidebarOpen ? "77%" : "87%", pr: 2 }}>
        {alertMessage && (
          <Alert 
            severity={alertSeverity} 
            onClose={() => setAlertMessage("")}
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        )}
        
        <Box sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            
          </Box>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ p: 2, mb: 2, width: "100%" }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
           
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            <Button variant="contained" color="primary" onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Complete" : "Next"}
            </Button>
          </Stepper>
        </Box>
        
        <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
          <LoadForm
            loadData={loadData}
            drivers={drivers}
            dispatchers={dispatchers}
            trucks={trucks} // Pass trucks to LoadForm
            handleChange={handleChange}
            handleStopsChange={handleStopsChange} // Pass stops handler
            activeStep={activeStep}
            showCustomerForm={showCustomerForm}
            handleToggleCustomerForm={handleToggleCustomerForm}
            isDetailsComplete={isDetailsComplete}
            isCustomerBrokerComplete={activeStep >= 1}
          />
          
          {/* Date inputs with proper formatting */}
          <TextField
            label="Pickup Date"
            name="created_date"
            type="date"
            value={loadData.created_date ? loadData.created_date.split('T')[0] : ''}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            label="Delivery Date"
            name="updated_date"
            type="date"
            value={loadData.updated_date ? loadData.updated_date.split('T')[0] : ''}
            onChange={handleChange}
            sx={{ mb: 2, width: '300px', mr: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            required
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

export default EditLoad;