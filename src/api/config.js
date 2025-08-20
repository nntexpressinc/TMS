import axios from 'axios';

export const BASE_URL = 'https://nnt.nntexpressinc.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  DRIVER: {
    BASE: '/driver',
    CREATE: '/driver/create',
    UPDATE: (id) => `/driver/${id}`,
    DELETE: (id) => `/driver/${id}`,
    GET_ONE: (id) => `/driver/${id}`,
  },
  INVOICES: {
    BASE: '/invoices',
    CREATE: '/invoices',
    UPDATE: (id) => `/invoices/${id}`,
    DELETE: (id) => `/invoices/${id}`,
    GET_ONE: (id) => `/invoices/${id}`,
  }
};

export default apiClient;