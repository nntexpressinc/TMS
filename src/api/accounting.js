import axios from 'axios';

const API_URL = 'https://api1.biznes-armiya.uz/api';

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
    console.error('Error fetching drivers:', error.message);
    throw error;
  }
};

export const getDispatchers = async () => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.get(`${API_URL}/dispatcher/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dispatchers:', error.message);
    throw error;
  }
};

export const getDriverPayReport = async (data) => {
  try {
    console.log('getDriverPayReport request:', data);
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.post(
      `${API_URL}/driver/pay/create/`,
      {
        pay_from: data.pay_from,
        pay_to: data.pay_to,
        driver: data.driver,
        notes: data.notes || '',
      },
      {
        headers: {
          Authorization: `Bearer ${storedAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('getDriverPayReport response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating driver pay report:', error.message);
    throw error;
  }
};
// salom
export const downloadPayReportPDF = async (data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.post(
      `${API_URL}/driver/pay/create/`,
      {
        pay_from: data.pay_from,
        pay_to: data.pay_to,
        driver: data.driver,
        notes: data.notes || '',
      },
      {
        headers: {
          Authorization: `Bearer ${storedAccessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error downloading PDF:', error.message);
    throw error;
  }
};