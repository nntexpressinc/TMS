import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Dashboard/Sidebar";
import { Box, Container } from "@mui/material";
import { useSidebar } from "../SidebarContext";
import Navbar from "../Navbar/Navbar";

const Layout = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Box sx={{ flexGrow: 1, ml: isSidebarOpen ? '250px' : '60px', transition: 'margin-left 0.3s' }}>
        <Navbar />
        <Container maxWidth="0" sx={{ mt: 10}}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;