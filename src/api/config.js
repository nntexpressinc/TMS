export const BASE_URL = 'https://api1.biznes-armiya.uz/api';

export const API_ENDPOINTS = {
  DRIVER: {
    BASE: '/driver',
    CREATE: '/driver/create',
    UPDATE: (id) => `/driver/${id}`,
    DELETE: (id) => `/driver/${id}`,
    GET_ONE: (id) => `/driver/${id}`,
  }
}; 