import axios from 'axios';

const API_URL = 'https://nnt.nntexpressinc.com/api';

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

// Cache storage
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get cache key
const getCacheKey = (endpoint, params) => {
  return `${endpoint}?${new URLSearchParams(params).toString()}`;
};

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_TTL;
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

    // Check cache first
    const cacheKey = getCacheKey('driver_pay', params);
    const cachedData = cache.get(cacheKey);
    if (isCacheValid(cachedData)) {
      return cachedData.data;
    }

    // If not in cache or cache expired, make API call
    const response = await axios.get(`${API_URL}/driver/pay/driver/?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
      signal: params.signal // Support for AbortController
    });

    // Update cache
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Let the component handle abort errors
    }
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

// Update driver pay record with file upload
export const updateDriverPay = async (payId, formData) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.patch(
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
    console.error('Error updating driver pay:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Update only basic fields without files
export const updateDriverPayBasicFields = async (payId, data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.patch(
      `${API_URL}/driver/pay/driver/${payId}/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${storedAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating driver pay basic fields:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
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

export const getAllLoads = async (params = {}) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.load_status) queryParams.append('load_status', params.load_status);
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);

    const queryString = queryParams.toString();
    const url = `${API_URL}/load/${queryString ? `?${queryString}` : ''}`;

    console.log('API Request URL:', url); // This will show you the exact URL being called

    const response = await axios.get(url, {
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

// Invoice related endpoints
export const getInvoices = async (params = {}) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    // Build query string if frontend requests paging/search
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.search) query.append('search', params.search);
    if (params.per_page) query.append('per_page', params.per_page);

    const url = `${API_URL}/invoices/${query.toString() ? `?${query.toString()}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      }
    });

    // API may return an array (as documented) or a paginated object { results, count }
    const data = response.data;
    if (Array.isArray(data)) {
      return {
        results: data,
        count: data.length
      };
    }

    // If server already returns paginated shape, pass it through
    return data;
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const response = await axios.get(`${API_URL}/invoices/${id}/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error.message);
    throw error;
  }
};

export const createInvoice = async (data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }

    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const headers = {
      Authorization: `Bearer ${storedAccessToken}`,
    };

    // When sending FormData, let the browser set Content-Type (multipart/form-data with boundary)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // For JSON payloads, only send the fields the API expects.
    const payload = isFormData ? data : {
      invoice_date: data.invoice_date,
      status: data.status,
      notes: data.notes,
      loads: data.loads
    };

    const response = await axios.post(
      `${API_URL}/invoices/`,
      payload,
      {
        headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    throw error;
  }
};

export const updateInvoice = async (id, data) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.put(
      `${API_URL}/invoices/${id}/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${storedAccessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Update localStorage after update
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      const invoices = JSON.parse(storedInvoices);
      const index = invoices.findIndex(inv => inv.id === id);
      if (index !== -1) {
        invoices[index] = response.data;
        localStorage.setItem('invoices', JSON.stringify(invoices));
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error updating invoice:', error.message);
    throw error;
  }
};

// Helper function to invalidate related caches
const invalidateInvoiceCaches = () => {
  const keysToDelete = [];
  for (const key of cache.keys()) {
    if (key.startsWith('invoices') || key.startsWith('invoice_')) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => cache.delete(key));
};

export const deleteInvoice = async (id) => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (!storedAccessToken) {
      throw new Error('No access token found');
    }
    const response = await axios.delete(`${API_URL}/invoices/${id}/`, {
      headers: {
        Authorization: `Bearer ${storedAccessToken}`,
      },
    });

    // Update localStorage after deletion
    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      const invoices = JSON.parse(storedInvoices);
      const filteredInvoices = invoices.filter(inv => inv.id !== id);
      localStorage.setItem('invoices', JSON.stringify(filteredInvoices));
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting invoice:', error.message);
    throw error;
  }
};

