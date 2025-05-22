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
  const [roleName, setRoleName] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = localStorage.getItem("userid");
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedUserData = localStorage.getItem("user");

      // Avval localStorage dagi user ma'lumotlarini tekshiramiz
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUser(parsedUserData);

          // ROL NOMINI OLIB KELISH
          if (parsedUserData.role) {
            // Rol ma'lumotlarini API dan olish kerak bo'lsa, olishimiz mumkin
            // yoki uni ham localStorage ga saqlash mumkin
            try {
              const roleData = await ApiService.getData(`/auth/role/${parsedUserData.role}/`);
              setRoleName(roleData.name);
              // Rol nomini ham localStorage ga saqlaymiz
              localStorage.setItem("roleName", roleData.name);
            } catch (roleError) {
              // Avval localStorage da saqlangan rol nomini tekshiramiz
              const storedRoleName = localStorage.getItem("roleName");
              if (storedRoleName) {
                setRoleName(storedRoleName);
              } else {
                setRoleName('');
              }
            }
          }
        } catch (parseError) {
          // Agar parse qilishda xato bo'lsa, API ga so'rov yuboramiz
          console.error("Error parsing stored user data:", parseError);
          fetchFromAPI();
        }
      } else if (storedUserId && storedAccessToken) {
        // Agar localStorage da user ma'lumotlari bo'lmasa, API dan olamiz
        fetchFromAPI();
      }
    };

    // API dan ma'lumotlarni olish uchun alohida funksiya
    const fetchFromAPI = async () => {
      const storedUserId = localStorage.getItem("userid");
      const storedAccessToken = localStorage.getItem("accessToken");

      if (storedUserId && storedAccessToken) {
        try {
          const data = await ApiService.getData(`/auth/users/${storedUserId}/`);
          setUser(data);
          // Olingan ma'lumotlarni localStorage ga saqlaymiz
          localStorage.setItem("user", JSON.stringify(data));

          // ROL NOMINI OLIB KELISH
          if (data.role) {
            try {
              const roleData = await ApiService.getData(`/auth/role/${data.role}/`);
              setRoleName(roleData.name);
              // Rol nomini ham localStorage ga saqlaymiz
              localStorage.setItem("roleName", roleData.name);
            } catch (roleError) {
              setRoleName('');
            }
          }
        } catch (error) {
          setUser(null);
          if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userid");
            localStorage.removeItem("user");
            localStorage.removeItem("roleName");
            navigate('/login');
          }
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fallback uchun avatar harfi
  const getAvatarLetter = () => {
    if (user) {
      if (user.first_name) return user.first_name[0].toUpperCase();
      if (user.email) return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Format profile photo URL to use production API
  const getFormattedProfilePhotoUrl = (url) => {
    if (!url) return "";
    return url.replace('https://0.0.0.0:8000/', 'https://api1.biznes-armiya.uz/');
  };

  // Foydalanuvchi to'liq ismi yoki emaili
  const getUserFullName = () => {
    if (!user) return "Loading...";
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email || "No name";
  };

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
            <Badge badgeContent={notifications.length} sx={{ 
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
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              padding: '6px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Avatar 
              alt="User Profile" 
              src={user?.profile_photo ? getFormattedProfilePhotoUrl(user.profile_photo) : ""}
              sx={{ 
                width: 36,
                height: 36,
                border: '2px solid rgba(255, 255, 255, 0.2)',
                bgcolor: '#888'
              }}
            >
              {!user?.profile_photo && getAvatarLetter()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#ffffff'
              }}>
                {getUserFullName()}
              </Typography>
              <Typography sx={{ 
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                {user ? (roleName || "Loading...") : "Loading..."}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
