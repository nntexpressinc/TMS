// src/api/auth.js
import axios from 'axios';

const BASE_URL = 'https://api1.biznes-armiya.uz/api';

// API endpoints
const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  REFRESH_TOKEN: '/auth/token/refresh/',
  VERIFY_TOKEN: '/auth/token/verify/',
  
  // Load management
  LOADS: '/load/',
  LOAD_DETAIL: (id) => `/load/${id}/`,
  LOAD_STATUS: (id) => `/load/${id}/status/`,
  LOAD_DOCUMENTS: (id) => `/load/${id}/documents/`,
  LOAD_CHAT: (id) => `/load/${id}/chat/`,
  
  // User management
  USERS: '/user/',
  USER_DETAIL: (id) => `/user/${id}/`,
  USER_PROFILE: '/user/profile/',
  
  // Driver management
  DRIVERS: '/driver/',
  DRIVER_DETAIL: (id) => `/driver/${id}/`,
  DRIVER_DOCUMENTS: (id) => `/driver/${id}/documents/`,
  DRIVER_LOADS: (id) => `/driver/${id}/loads/`,
  DRIVER_PAY: '/driver/pay/',
  DRIVER_PAY_DETAIL: (id) => `/driver/pay/${id}/`,
  DRIVER_EXPENSE: '/driver/expense/',
  DRIVER_EXPENSE_DETAIL: (id) => `/driver/expense/${id}/`,
  
  // Dispatcher management
  DISPATCHERS: '/dispatcher/',
  DISPATCHER_DETAIL: (id) => `/dispatcher/${id}/`,
  DISPATCHER_LOADS: (id) => `/dispatcher/${id}/loads/`,
  
  // Customer/Broker management
  CUSTOMER_BROKER: '/customer_broker/',
  CUSTOMER_BROKER_DETAIL: (id) => `/customer_broker/${id}/`,
  
  // Team management
  TEAMS: '/team/',
  TEAM_DETAIL: (id) => `/team/${id}/`,
  
  // Chat
  CHAT: '/chat/',
  CHAT_MESSAGES: (id) => `/chat/${id}/messages/`,
  
  // Documents
  DOCUMENTS: '/document/',
  DOCUMENT_DETAIL: (id) => `/document/${id}/`,
  
  // Reports
  REPORTS: '/report/',
  REPORT_DETAIL: (id) => `/report/${id}/`,
  
  // Settings
  SETTINGS: '/settings/',
  COMPANY_SETTINGS: '/settings/company/',
};

const ApiService = {
  getData: async (endpoint) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  postData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  putData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.put(`${BASE_URL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        endpoint: endpoint,
        requestData: data
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please check your data and try again.');
      }
      
      throw error.response?.data?.detail || error.message || 'An unknown error occurred';
    }
  },

  deleteData: async (endpoint) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.delete(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  postMediaData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  putMediaData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.put(`${BASE_URL}${endpoint}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  patchMediaData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.patch(`${BASE_URL}${endpoint}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  patchData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      const response = await axios.patch(`${BASE_URL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        endpoint: endpoint,
        requestData: data
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      throw error.response?.data?.detail || error.message || 'An unknown error occurred';
    }
  },

  // Auth related methods
  login: async (credentials) => {
    try {
      const response = await axios.post(`${BASE_URL}${ENDPOINTS.LOGIN}`, credentials);
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}${ENDPOINTS.REGISTER}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login xatosi uchun qo'shimcha funksiya
  postRegister: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token not found. Please login again.');
      }
      
      // FormData tipidagi so'rovlar uchun Content-Type headerini o'rnatmaymiz
      // Chunki browser o'zi boundary bilan to'g'ri Content-Type qo'yadi
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Agar FormData emas bo'lsa, Content-Type headerini qo'shamiz
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
        headers: headers
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      const response = await axios.post(`${BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
        refresh: refreshToken
      });
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw error.response?.data || error.message;
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await axios.post(`${BASE_URL}${ENDPOINTS.VERIFY_TOKEN}`, {
        token
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export { ApiService, ENDPOINTS };