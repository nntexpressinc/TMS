import axios from 'axios';
import { BASE_URL } from './config';

export const DriverService = {
  getAllDrivers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/driver/`, {
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

  getDriverById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/driver/${id}/`, {
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

  createDriver: async (driverData) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add all driver data to FormData
      Object.keys(driverData).forEach(key => {
        if (driverData[key] !== null && driverData[key] !== undefined) {
          if (key === 'documents' && driverData[key]) {
            driverData[key].forEach((file, index) => {
              formData.append(`documents[${index}]`, file);
            });
          } else if (key === 'profile_photo' && driverData[key] instanceof File) {
            formData.append('profile_photo', driverData[key]);
          } else {
            formData.append(key, driverData[key]);
          }
        }
      });

      const response = await axios.post(`${BASE_URL}/driver/create/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error.response?.data || error.message);
      throw error;
    }
  },

  updateDriver: async (id, driverData) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(driverData).forEach(key => {
        if (driverData[key] !== null && driverData[key] !== undefined) {
          if (key === 'documents' && driverData[key]) {
            driverData[key].forEach((file, index) => {
              formData.append(`documents[${index}]`, file);
            });
          } else if (key === 'profile_photo' && driverData[key] instanceof File) {
            formData.append('profile_photo', driverData[key]);
          } else {
            formData.append(key, driverData[key]);
          }
        }
      });

      const response = await axios.put(`${BASE_URL}/driver/${id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDriver: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/driver/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 