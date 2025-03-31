import axios from 'axios';

const API_URL = 'https://api.biznes-armiya.uz/api';

export const ApiService = {
  async getData(endpoint, token) {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async postData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async putData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_URL}${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async patchData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.patch(`${API_URL}${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async deleteData(endpoint) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.delete(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async postMediaData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async putMediaData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.put(`${API_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async patchMediaData(endpoint, data) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.patch(`${API_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async postRegisterData(endpoint, data) {
    const response = await axios.post(`${API_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  async getRegisterData(endpoint) {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  async postRegister(endpoint, data) {
    const response = await axios.post(`${API_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};