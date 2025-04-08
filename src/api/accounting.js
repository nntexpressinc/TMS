import axios from 'axios';

const API_URL = 'https://api.biznes-armiya.uz/api';

export const getDrivers = async () => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.get(`${API_URL}/driver/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
};

export const getDriverPayReport = async (data) => {
  try {
    console.log('getDriverPayReport data:', data);
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.post(`${API_URL}/driver/pay/create/`, {
      pay_from: data.pay_from,
      pay_to: data.pay_to,
      driver: data.driver,
      pay: 1,
      notes: data.notes || ''
    }, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('getDriverPayReport response:', response.data);
    return response.data; // Return the raw response without transformation
  } catch (error) {
    console.error('Error generating driver pay report:', error);
    throw error;
  }
};

export const downloadPayReportPDF = async (data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.post(`${API_URL}/driver/pay/create/`, data, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/pdf',
      },
      responseType: 'blob',
    });

    return response.data; // Blob for PDF
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};