import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Badge, Avatar, Box, Button } from '@mui/material';
import { Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../SidebarContext';
import { ApiService } from '../../api/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSidebarOpen } = useSidebar();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = localStorage.getItem("userId");
      const storedAccessToken = localStorage.getItem("accessToken");

      if (storedUserId && storedAccessToken) {
        try {
          const data = await ApiService.getData(`/auth/users/${storedUserId}/`);
          setUser(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1201,
        width: isSidebarOpen ? 'calc(100% - 250px)' : 'calc(100% - 60px)',
        ml: isSidebarOpen ? '250px' : '60px',
        transition: 'all 0.3s ease',
        backgroundColor: '#0093E9',
        backgroundImage: 'linear-gradient(160deg, #0093E9 0%, #772a9a 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        height: '64px'
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: '64px !important',
          height: '64px',
          px: 3 
        }}
      >
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '1.25rem'
          }}
        >
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2
        }}>
          <IconButton 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              },
              color: '#ffffff',
              borderRadius: '12px',
              padding: '8px'
            }}
          >
            <Badge badgeContent={4} sx={{ 
              '& .MuiBadge-badge': {
                backgroundColor: '#ef4444',
                color: 'white'
              }
            }}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="text"
            startIcon={<SettingsIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff'
              }
            }}
          >
            {t('Settings')}
          </Button>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }} onClick={() => navigate('/profile')}>
            <Avatar 
              alt="User Profile" 
              src={user?.profile_photo || "/static/images/avatar/1.jpg"}
              sx={{ 
                width: 36,
                height: 36,
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#ffffff'
              }}>
                {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
              </Typography>
              <Typography sx={{ 
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                {user?.role || "Admin"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
