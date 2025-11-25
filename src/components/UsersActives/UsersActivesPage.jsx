import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ApiService } from "../../api/auth";
import { Box, Typography, Alert } from "@mui/material";
import { OverlayLoader } from "../loader/PulseDotsLoader";

const DispatcherPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getData('/auth/my-locations/');
        console.log("Fetch data:", data);
        setLocations(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Fetch data error");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Qurilma nomini ajratib olish funksiyasi
  const extractDeviceName = (deviceInfo) => {
    if (!deviceInfo || deviceInfo === 'N/A') return 'N/A';
    
    // User-Agent satridan qurilma nomini ajratish
    const match = deviceInfo.match(/\(([^;]+)(?:;|\))/);
    return match ? match[1].trim() : deviceInfo; // Agar topilmasa, xom ma'lumot qaytadi
  };

  const columns = [
    { field: 'user', headerName: 'User ID', width: 100 },
    { field: 'created_at', headerName: 'Created At', width: 200 },
    {
      field: 'device_info',
      headerName: 'Device Info',
      width: 300,
      renderCell: (params) => (
        <div
          style={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {params.value}
        </div>
      ),
    },
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
    id: index + 1,
    user: location.user,
    created_at: new Date(location.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    device_info: extractDeviceName(location.device_info), // Filtrlangan qurilma nomi
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
      <div style={{ height: 400, width: '100%', position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
              pointerEvents: 'all'
            }}
          >
            <OverlayLoader fullScreen={false} showText={false} />
          </div>
        )}
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
        />
      </div>
    </Box>
  );
};

export default DispatcherPage;