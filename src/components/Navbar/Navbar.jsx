import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Badge, Avatar, Box, Button } from '@mui/material';
import { Search as SearchIcon, Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material';
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
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1201,
        width: isSidebarOpen ? 'calc(100% - 250px)' : 'calc(100% - 60px)',
        ml: isSidebarOpen ? '250px' : '60px',
        transition: 'width 0.3s, margin-left 0.3s',
        background: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: '#1e293b',
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
          {/* <Box sx={{ 
            position: 'relative',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            '&:hover': { 
              backgroundColor: '#f1f5f9'
            },
            width: '300px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            px: 2
          }}> */}
            {/* <SearchIcon sx={{ color: '#64748b', mr: 1 }} />
            <InputBase
              placeholder={`${t('Search')}...`}
              sx={{ 
                color: '#1e293b',
                width: '100%',
                '& input': {
                  padding: '8px 0',
                }
              }}
            /> */}
          {/* </Box> */}
          <IconButton 
            sx={{ 
              backgroundColor: '#f8fafc',
              '&:hover': { 
                backgroundColor: '#f1f5f9'
              },
              color: '#1e3d9d'
            }}
          >
            <Badge badgeContent={4} sx={{ 
              '& .MuiBadge-badge': {
                backgroundColor: '#1e3d9d',
                color: 'white'
              }
            }}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#1e3d9d',
                color: '#1e3d9d',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Settings
          </Button>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '12px',
            '&:hover': {
              backgroundColor: '#f8fafc'
            }
          }} onClick={() => navigate('/profile')}>
            <Avatar 
              alt="User Profile" 
              src={user?.profile_photo || "/static/images/avatar/1.jpg"}
              sx={{ 
                width: 36,
                height: 36,
                border: '2px solid #e2e8f0'
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1e293b'
              }}>
                {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
              </Typography>
              <Typography sx={{ 
                fontSize: '0.75rem',
                color: '#64748b'
              }}>
                {user?.role || ""}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
