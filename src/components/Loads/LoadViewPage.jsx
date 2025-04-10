import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Button,
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

const LoadViewPage = () => {
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
  const [dispatchers, setDispatchers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isSidebarOpen } = useSidebar();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoadData = async () => {
      setIsLoading(true);
      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken && id) {
        try {
          const data = await ApiService.getData(`/load/${id}/`, storedAccessToken);
          console.log("Fetched load data:", data);
          setLoadData(data);
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
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ p: 2, mb: 2, width: "100%" }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/loads/edit/${id}`)}
            >
              Edit Load
            </Button>
          </Box>
          </Stepper>
        </Box>
        <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
          <LoadForm
            loadData={loadData}
            drivers={drivers}
            dispatchers={dispatchers}
            isReadOnly={true}
            activeStep={activeStep}
          />
        </Box>
      </Box>
      <Box sx={{ width: "20%" }}>
        <ChatBox
          chatMessages={chatMessages}
          loadData={loadData}
          isReadOnly={true}
        />
      </Box>
    </Box>
  );
};

export default LoadViewPage; 