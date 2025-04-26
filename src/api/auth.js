// src/api/auth.js
import axios from 'axios';

const BASE_URL = 'https://api.biznes-armiya.uz/api';

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

  async postMediaData(endpoint, data) {
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

  async putMediaData(endpoint, data) {
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

  async patchMediaData(endpoint, data) {
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

  async postRegisterData(endpoint, data) {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  async getRegisterData(endpoint) {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  async postRegister(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined,
        'X-CSRFTOKEN': localStorage.getItem('csrfToken')
      },
    });
    return response.data;
  },
};

export { ApiService };