import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ApiService } from "../../api/auth";  // ApiService import qilingan joy
import { Box, Typography } from "@mui/material";

const DispatcherPage = () => {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState({});  // Foydalanuvchilarni saqlash uchun

  useEffect(() => {
    // 1. Locations ma'lumotlarini olish
    ApiService.getData('/auth/my-locations/')
      .then(async (data) => {
        console.log("Kelgan ma'lumotlar:", data);
        setLocations(data);  // locations state'ini yangilash

        // 2. Har bir location uchun foydalanuvchi ID'sini olish
        const userIds = [...new Set(data.map(location => location.user))]; // takrorlanmaydigan ID'lar

        // 3. Har bir foydalanuvchi uchun emailni olish
        const userPromises = userIds.map(userId => 
          ApiService.getData(`/auth/users/${userId}/`)  // foydalanuvchi emailini olish
        );

        const userResponses = await Promise.all(userPromises);
        const userEmailMap = userResponses.reduce((acc, user) => {
          acc[user.id] = user.email;  // foydalanuvchi ID va emailni xaritada saqlash
          return acc;
        }, {});

        setUsers(userEmailMap);  // foydalanuvchilarni saqlash
      })
      .catch(error => console.error("Xatolik:", error));
  }, []);

  const columns = [
    { field: 'user', headerName: 'User Email', width: 250 },
    { field: 'created_at', headerName: 'Created At', width: 200 },
    { 
      field: 'google_maps_url', 
      headerName: 'Google Maps URL', 
      width: 300,
      renderCell: (params) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          Open Map
        </a>
      )
    },
  ];

  const rows = locations.map((location, index) => ({
    id: index + 1,
    user: users[location.user] || 'Loading...',  // Foydalanuvchi emailini olish
    created_at: new Date(location.created_at).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,  // 24-soat formatida ko'rsatish
    }),
    google_maps_url: location.google_maps_url,
  }));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Actives
      </Typography>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          components={{ Toolbar: GridToolbar }}
        />
      </div>
    </Box>
  );
};

export default DispatcherPage;
