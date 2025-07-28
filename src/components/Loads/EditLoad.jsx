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
    "created_date",
    "updated_date",
    "load_pay",
    "total_pay",
    "per_mile",
    "total_miles",
  ],
  1: ["load_id"],
  2: ["load_id"],
  3: ["load_id"],
  4: ["load_id"],
  5: ["load_id"],
  6: ["load_id"],
  7: ["load_id"],
  8: ["load_id"],
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
    truck: "",
    dispatcher:null,
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
  const [dispatchers, setDispatchers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { id } = useParams(); // URL'dan loadId'ni olish

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
          setLoadData(data);
          // Load statusga qarab activeStep'ni sozlash
          const stepIndex = steps.findIndex(step => step.toUpperCase().replace(" ", " ") === data.load_status);
          setActiveStep(stepIndex !== -1 ? stepIndex : 0);
        } catch (error) {
          console.error("Error fetching load data:", error);
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

    fetchLoadData();
    fetchDrivers();
    fetchDispatchers();
  }, [id]);

  const handleNext = async () => {
    const currentStep = steps[activeStep].toUpperCase().replace(" ", " ");

    // Validation
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
      
      // Convert string IDs to integers
      if (processedData.created_by) processedData.created_by = parseInt(processedData.created_by);
      if (processedData.customer_broker) processedData.customer_broker = parseInt(processedData.customer_broker);
      if (processedData.dispatcher) processedData.dispatcher = parseInt(processedData.dispatcher);
      if (processedData.driver) processedData.driver = parseInt(processedData.driver);

      // Check and format pickup_time and delivery_time to YYYY-MM-DD
      const formattedPickupTime = loadData.pickup_time ? new Date(loadData.pickup_time).toISOString().split('T')[0] : "";
      const formattedDeliveryTime = loadData.delivery_time ? new Date(loadData.delivery_time).toISOString().split('T')[0] : "";
      formData.append("created_date", formattedPickupTime);
      formData.append("updated_date", formattedDeliveryTime);

      Object.keys(processedData).forEach((key) => {
        if (processedData[key] !== null && key !== "pickup_time" && key !== "delivery_time") {
          if (processedData[key]?.file) {
            formData.append(key, processedData[key].file);
          } else {
            formData.append(key, processedData[key]);
          }
        }
      });
      formData.set("load_status", currentStep);
      formData.set("created_by", processedData.created_by || "");

      await ApiService.patchData(`/load/${id}/`, formData);

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
        const response = await ApiService.putMediaData(`/load/${id}/`, formData);
        console.log(response);
        if (response.status !== 200) {
          throw new Error("Failed to update load");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleSendMessage = async (messageText = newMessage, file = null) => {
    if (!messageText.trim() && !file) return;

    const formData = new FormData();
    const userId = localStorage.getItem("userId");

    formData.append("user", userId || "");
    formData.append("load_id", id || "");
    formData.append("group_message_id", "");

    if (messageText.trim()) {
      const newMessageObj = {
        message: messageText,
        timestamp: new Date(),
      };
      setChatMessages([...chatMessages, newMessageObj]);
      formData.append("message", messageText);
    }

    if (file) {
      formData.append("file", file);
    }

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
      } catch (error) {
        console.error("Error creating customer broker:", error);
      }
    }
    setShowCustomerForm(!showCustomerForm);
  };

  const isDetailsComplete = requiredFields[0].every((field) => loadData[field]);

  return (
    <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
      <Box sx={{ width: isSidebarOpen ? "77%" : "87%", pr: 2 }}>
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
            handleChange={handleChange}
            activeStep={activeStep}
            showCustomerForm={showCustomerForm}
            handleToggleCustomerForm={handleToggleCustomerForm}
            isDetailsComplete={isDetailsComplete}
            isCustomerBrokerComplete={activeStep >= 1}
          />
          <TextField
            label="Pickup Date"
            name="created_date"
            type="date"
            value={loadData.created_date}
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
            value={loadData.updated_date}
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