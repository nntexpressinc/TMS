import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
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
    "pickup_time",
    "delivery_time",
    "load_pay",
    "total_pay",
    "per_mile",
    "total_miles",
  ],
  1: ["reference_id"],
  2: ["instructions"],
  3: ["bills"],
  4: ["driver"],
  5: ["trip_id"],
  6: ["unloading_location"],
  7: ["yard_location"],
  8: ["delivered_date"],
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
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const { id } = useParams(); // URL’dan loadId’ni olish

  useEffect(() => {
    const fetchLoadData = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken && id) {
        try {
          const data = await ApiService.getData(`/load/${id}/`, storedAccessToken);
          setLoadData(data);
          // Load statusga qarab activeStep’ni sozlash
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

    fetchLoadData();
    fetchDrivers();
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
      Object.keys(loadData).forEach((key) => {
        if (loadData[key] !== null) {
          if (loadData[key]?.file) {
            formData.append(key, loadData[key].file);
          } else {
            formData.append(key, loadData[key]);
          }
        }
      });
      formData.set("load_status", currentStep);
      formData.set("created_by", loadData.created_by || "");

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

  return (
    <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
      <Box sx={{ width: isSidebarOpen ? "77%" : "87%", pr: 2 }}>
        <Box sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
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
            handleChange={handleChange}
            activeStep={activeStep}
            showCustomerForm={showCustomerForm}
            handleToggleCustomerForm={handleToggleCustomerForm}
            isDetailsComplete={isDetailsComplete}
            isCustomerBrokerComplete={activeStep >= 1}
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