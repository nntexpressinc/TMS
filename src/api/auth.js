// src/api/auth.js
import axios from 'axios';

const BASE_URL = 'https://api.biznes-armiya.uz/api';

const ApiService = {
  getData: async (endpoint) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  postData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  putData: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('accessToken');
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
      
      if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please check your data and try again.');
      }
      
      throw error.response?.data?.detail || error.message || 'An unknown error occurred';
    }
  },

  deleteData: async (endpoint) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async postMediaData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async putMediaData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async patchMediaData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.patch(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
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
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

export { ApiService };