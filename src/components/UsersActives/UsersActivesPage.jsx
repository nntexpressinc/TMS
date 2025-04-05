import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ApiService } from "../../api/auth";
import { Box, Typography, Alert } from "@mui/material";

const DispatcherPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        // Backenddan joylashuvlarni olish
        const data = await ApiService.getData('/auth/my-locations/');
        console.log("Kelgan ma'lumotlar:", data);
        setLocations(data);
      } catch (error) {
        console.error("Xatolik:", error);
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi!");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const columns = [
    { field: 'user', headerName: 'User ID', width: 100 },  // Agar email kerak bo‘lsa, backendni o‘zgartirish kerak
    { field: 'created_at', headerName: 'Created At', width: 200 },
    { field: 'device_info', headerName: 'Device Info', width: 300 },
    { field: 'page_status', headerName: 'Page Status', width: 150 },
    {
      field: 'google_maps_url',
      headerName: 'Google Maps URL',
      width: 200,
      renderCell: (params) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          Open Map
        </a>
      ),
    },
  ];

  const rows = locations.map((location, index) => ({
    id: index + 1, // Har bir qator uchun unikal ID
    user: location.user, // Agar email kerak bo‘lsa, backenddan email qo‘shish kerak
    created_at: new Date(location.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-soat formati
    }),
    device_info: location.device_info || 'N/A',
    page_status: location.page_status || 'Unknown',
    google_maps_url: location.google_maps_url,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Actives
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          components={{ Toolbar: GridToolbar }}
          loading={loading} // Yuklanayotgan holatni ko‘rsatish
          disableSelectionOnClick
        />
      </div>
    </Box>
  );
};

export default DispatcherPage;