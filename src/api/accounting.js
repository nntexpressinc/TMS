import axios from 'axios';

const API_URL = 'https://ezpzfleetnodir.biznes-armiya.uz/api';

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

// Yangi: Driver pay list olish
export const getDriverPayList = async (params = {}) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    
    const queryParams = new URLSearchParams();
    if (params.weekly_number) queryParams.append('weekly_number', params.weekly_number);
    if (params.search) queryParams.append('search', params.search);
    if (params.driver) queryParams.append('driver', params.driver);
    if (params.pay_from) queryParams.append('pay_from', params.pay_from);
    if (params.pay_to) queryParams.append('pay_to', params.pay_to);
    
    const response = await axios.get(`${API_URL}/driver/pay/driver/?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching driver pay list:', error.message);
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
        invoice_number: data.invoice_number || '',
        weekly_number: data.weekly_number || '',
        load_driver_pay: data.load_driver_pay || [],
        load_company_driver_pay: data.load_company_driver_pay || [],
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

export const uploadPayReportPDF = async (payId, pdfBlob) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const formData = new FormData();
    formData.append('file', pdfBlob, `driver-pay-report-${payId}.pdf`);

    const response = await axios.put(
      `${API_URL}/driver/pay/driver/${payId}/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${storedAccessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error.message);
    throw error;
  }
};

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

export const getAllLoads = async () => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.get(`${API_URL}/load/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching loads:', error.message);
    throw error;
  }
};

