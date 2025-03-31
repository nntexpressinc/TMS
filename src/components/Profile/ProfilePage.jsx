import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Box, 
  Avatar, 
  Grid,
  CircularProgress
} from "@mui/material";
import { ApiService } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = localStorage.getItem("userId");
      const storedAccessToken = localStorage.getItem("accessToken");

      if (storedUserId && storedAccessToken) {
        try {
          const data = await ApiService.getData(`/auth/users/${storedUserId}/`, storedAccessToken);
          setUser(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5', 
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Box sx={{
        bgcolor: '#ffffff', // White background
        color: '#000000',  // Black text
        p: 2,
        mb: 4,
        width: '100%',
        maxWidth: 600,
        textAlign: 'center',
        borderRadius: 1
      }}>
        <Typography variant="h4">
          Profile
        </Typography>
      </Box>

      {user ? (
        <Box sx={{ maxWidth: 600, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar
              src={user.profile_photo}
              alt={`${user.first_name} ${user.last_name}`}
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                border: '3px solid #fff',
                boxShadow: 1
              }}
            >
              {!user.profile_photo && <PersonIcon sx={{ fontSize: 60 }} />}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              {`${user.first_name} ${user.last_name}`}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              {user.role}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {user.email}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Phone:</strong> {user.telephone || 'Not provided'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Location:</strong> {user.city && user.state && user.country 
                  ? `${user.city}, ${user.state}, ${user.country}`
                  : 'Not provided'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Address:</strong> {user.address || 'Not provided'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Postal Code:</strong> {user.postal_zip || 'Not provided'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2
        }}>
          <CircularProgress />
          <Typography variant="body1">
            Loading user data...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProfilePage;