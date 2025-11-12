import { ApiService } from './auth';

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export const getDriversSummary = async () => {
  try {
    // Use the drivers-summary endpoint that returns company_drivers, owner_drivers, and trucks
    const response = await ApiService.getData('/pay-system/drivers-summary/');
    console.log('Raw API response from getDriversSummary:', response);
    console.log('Response type:', Array.isArray(response) ? 'Array' : typeof response);
   
    // The response contains company_drivers, owner_drivers, and trucks arrays
    return response;
  } catch (error) {
    console.error('Error fetching drivers summary:', error);
    throw error;
  }
};

export const getDriverCompletedLoads = async (driverId, params = {}) => {
  try {
    if (!driverId) {
      throw new Error('Driver id is required');
    }
   
    console.log('getDriverCompletedLoads - Driver ID:', driverId);
    console.log('getDriverCompletedLoads - Params:', params);
   
    // Build the query string for date filtering
    const query = buildQueryString(params);
    const endpoint = `/pay-system/drivers/${driverId}/completed-loads/${query}`;
   
    console.log('getDriverCompletedLoads - Calling endpoint:', endpoint);
    console.log('getDriverCompletedLoads - Full URL would be:', `https://nnt.nntexpressinc.com/api${endpoint}`);
   
    const response = await ApiService.getData(endpoint);
    console.log('getDriverCompletedLoads - Raw API response:', response);
    console.log('getDriverCompletedLoads - Response type:', Array.isArray(response) ? 'Array' : typeof response);
    console.log('getDriverCompletedLoads - Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');
    console.log('getDriverCompletedLoads - Has loads:', response && response.loads ? 'YES' : 'NO');
    console.log('getDriverCompletedLoads - Has expenses:', response && response.expenses ? 'YES' : 'NO');
    if (response && response.expenses) {
      console.log('getDriverCompletedLoads - Expenses array:', response.expenses);
      console.log('getDriverCompletedLoads - Expenses count:', response.expenses.length);
    }
   
    // CRITICAL: Return the response as-is
    // The API returns an array directly, so we should not wrap it
    return response;
    
  } catch (error) {
    console.error('Error fetching completed loads:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getTruckCompletedLoads = async (truckId, params = {}) => {
  try {
    if (!truckId) {
      throw new Error('Truck id is required');
    }
   
    console.log('getTruckCompletedLoads - Truck ID:', truckId);
    console.log('getTruckCompletedLoads - Params:', params);
   
    // Build the query string for date filtering
    const query = buildQueryString(params);
    const endpoint = `/pay-system/trucks/${truckId}/completed-loads/${query}`;
   
    console.log('getTruckCompletedLoads - Calling endpoint:', endpoint);
    console.log('getTruckCompletedLoads - Full URL would be:', `https://nnt.nntexpressinc.com/api${endpoint}`);
   
    const response = await ApiService.getData(endpoint);
    console.log('getTruckCompletedLoads - Raw API response:', response);
    console.log('getTruckCompletedLoads - Response type:', Array.isArray(response) ? 'Array' : typeof response);
    console.log('getTruckCompletedLoads - Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');
    console.log('getTruckCompletedLoads - Has loads:', response && response.loads ? 'YES' : 'NO');
    console.log('getTruckCompletedLoads - Has expenses:', response && response.expenses ? 'YES' : 'NO');
    if (response && response.expenses) {
      console.log('getTruckCompletedLoads - Expenses array:', response.expenses);
      console.log('getTruckCompletedLoads - Expenses count:', response.expenses.length);
    }
   
    // Return the response as-is
    return response;
    
  } catch (error) {
    console.error('Error fetching truck completed loads:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const postPaystubAction = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Payload is required');
    }
   
    console.log('Posting paystub action with payload:', payload);
   
    // Use the new driver-pay/calculate endpoint
    const response = await ApiService.postData('/driver-pay/calculate/', payload);
    console.log('Paystub action response:', response);
   
    return response;
  } catch (error) {
    console.error('Error posting paystub action:', error);
    throw error;
  }
};

// ============================================================================
// PAY REPORTS CRUD FUNCTIONS
// ============================================================================

/**
 * Get all driver pay records with optional filters
 * @param {Object} params - Query parameters (driver_id, pay_from, pay_to, invoice_number)
 * @returns {Promise<Array>} Array of driver pay records
 */
export const getDriverPayRecords = async (params = {}) => {
  try {
    const query = buildQueryString(params);
    const endpoint = `/driver-pay/${query}`;
    
    console.log('Fetching driver pay records:', endpoint);
    const response = await ApiService.getData(endpoint);
    console.log('Driver pay records response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching driver pay records:', error);
    throw error;
  }
};

/**
 * Get a single driver pay record by ID
 * @param {number} id - Driver pay record ID
 * @returns {Promise<Object>} Detailed driver pay record
 */
export const getDriverPayRecord = async (id) => {
  try {
    if (!id) {
      throw new Error('Record ID is required');
    }
    
    const endpoint = `/driver-pay/${id}/`;
    console.log('Fetching driver pay record:', endpoint);
    
    const response = await ApiService.getData(endpoint);
    console.log('Driver pay record response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching driver pay record:', error);
    throw error;
  }
};

/**
 * Create a new driver pay record
 * @param {Object} payload - Driver pay data
 * @returns {Promise<Object>} Created driver pay record
 */
export const createDriverPayRecord = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Payload is required');
    }
    
    console.log('Creating driver pay record:', payload);
    const response = await ApiService.postData('/driver-pay/', payload);
    console.log('Created driver pay record:', response);
    
    return response;
  } catch (error) {
    console.error('Error creating driver pay record:', error);
    throw error;
  }
};

/**
 * Update a driver pay record (full update)
 * @param {number} id - Driver pay record ID
 * @param {Object} payload - Complete driver pay data
 * @returns {Promise<Object>} Updated driver pay record
 */
export const updateDriverPayRecord = async (id, payload) => {
  try {
    if (!id) {
      throw new Error('Record ID is required');
    }
    if (!payload) {
      throw new Error('Payload is required');
    }
    
    console.log('Updating driver pay record:', id, payload);
    const response = await ApiService.putData(`/driver-pay/${id}/`, payload);
    console.log('Updated driver pay record:', response);
    
    return response;
  } catch (error) {
    console.error('Error updating driver pay record:', error);
    throw error;
  }
};

/**
 * Partially update a driver pay record
 * @param {number} id - Driver pay record ID
 * @param {Object} payload - Partial driver pay data
 * @returns {Promise<Object>} Updated driver pay record
 */
export const patchDriverPayRecord = async (id, payload) => {
  try {
    if (!id) {
      throw new Error('Record ID is required');
    }
    if (!payload) {
      throw new Error('Payload is required');
    }
    
    console.log('Patching driver pay record:', id, payload);
    const response = await ApiService.patchData(`/driver-pay/${id}/`, payload);
    console.log('Patched driver pay record:', response);
    
    return response;
  } catch (error) {
    console.error('Error patching driver pay record:', error);
    throw error;
  }
};

/**
 * Delete a driver pay record
 * @param {number} id - Driver pay record ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteDriverPayRecord = async (id) => {
  try {
    if (!id) {
      throw new Error('Record ID is required');
    }
    
    console.log('Deleting driver pay record:', id);
    const response = await ApiService.deleteData(`/driver-pay/${id}/`);
    console.log('Deleted driver pay record:', response);
    
    return response;
  } catch (error) {
    console.error('Error deleting driver pay record:', error);
    throw error;
  }
};

/**
 * Get driver pay records by driver ID
 * @param {number} driverId - Driver ID
 * @returns {Promise<Object>} Driver pay records for the driver
 */
export const getDriverPayRecordsByDriver = async (driverId) => {
  try {
    if (!driverId) {
      throw new Error('Driver ID is required');
    }
    
    const endpoint = `/driver-pay/by_driver/${driverId}/`;
    console.log('Fetching driver pay records by driver:', endpoint);
    
    const response = await ApiService.getData(endpoint);
    console.log('Driver pay records by driver response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching driver pay records by driver:', error);
    throw error;
  }
};

/**
 * Get driver pay records by date range
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Driver pay records in the date range
 */
export const getDriverPayRecordsByDateRange = async (fromDate, toDate) => {
  try {
    if (!fromDate || !toDate) {
      throw new Error('Both from and to dates are required');
    }
    
    const params = { pay_from: fromDate, pay_to: toDate };
    const query = buildQueryString(params);
    const endpoint = `/driver-pay/by_date_range/${query}`;
    
    console.log('Fetching driver pay records by date range:', endpoint);
    const response = await ApiService.getData(endpoint);
    console.log('Driver pay records by date range response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching driver pay records by date range:', error);
    throw error;
  }
};

/**
 * Download PDF for a driver pay record
 * @param {number} id - Driver pay record ID
 * @returns {Promise<Object>} PDF file information
 */
export const downloadDriverPayPDF = async (id) => {
  try {
    if (!id) {
      throw new Error('Record ID is required');
    }
    
    const endpoint = `/driver-pay/${id}/download_pdf/`;
    console.log('Downloading driver pay PDF:', endpoint);
    
    const response = await ApiService.getData(endpoint);
    console.log('PDF download response:', response);
    
    return response;
  } catch (error) {
    console.error('Error downloading driver pay PDF:', error);
    throw error;
  }
};

// ============================================================================
// DRIVER EXPENSE CRUD FUNCTIONS
// ============================================================================

/**
 * Get all driver expenses
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of driver expenses
 */
export const getDriverExpenses = async (params = {}) => {
  try {
    const query = buildQueryString(params);
    const endpoint = `/driver/expense/${query}`;
    
    console.log('Fetching driver expenses:', endpoint);
    const response = await ApiService.getData(endpoint);
    console.log('Driver expenses response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching driver expenses:', error);
    throw error;
  }
};

/**
 * Get a single driver expense by ID
 * @param {number} id - Driver expense ID
 * @returns {Promise<Object>} Detailed driver expense
 */
export const getDriverExpense = async (id) => {
  try {
    if (!id) {
      throw new Error('Expense ID is required');
    }
    
    const endpoint = `/driver/expense/${id}/`;
    console.log('Fetching driver expense:', endpoint);
    
    const response = await ApiService.getData(endpoint);
    console.log('Driver expense response:', response);
    
    return response;
  } catch (error) {
    console.error('Error fetching driver expense:', error);
    throw error;
  }
};

/**
 * Create a new driver expense
 * @param {Object} payload - Driver expense data
 * @returns {Promise<Object>} Created driver expense
 */
export const createDriverExpense = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Payload is required');
    }
    
    console.log('Creating driver expense:', payload);
    const response = await ApiService.postData('/driver/expense/', payload);
    console.log('Created driver expense:', response);
    
    return response;
  } catch (error) {
    console.error('Error creating driver expense:', error);
    throw error;
  }
};

/**
 * Update a driver expense
 * @param {number} id - Driver expense ID
 * @param {Object} payload - Complete driver expense data
 * @returns {Promise<Object>} Updated driver expense
 */
export const updateDriverExpense = async (id, payload) => {
  try {
    if (!id) {
      throw new Error('Expense ID is required');
    }
    if (!payload) {
      throw new Error('Payload is required');
    }
    
    console.log('Updating driver expense:', id, payload);
    const response = await ApiService.putData(`/driver/expense/${id}/`, payload);
    console.log('Updated driver expense:', response);
    
    return response;
  } catch (error) {
    console.error('Error updating driver expense:', error);
    throw error;
  }
};

/**
 * Delete a driver expense
 * @param {number} id - Driver expense ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteDriverExpense = async (id) => {
  try {
    if (!id) {
      throw new Error('Expense ID is required');
    }
    
    console.log('Deleting driver expense:', id);
    const response = await ApiService.deleteData(`/driver/expense/${id}/`);
    console.log('Deleted driver expense:', response);
    
    return response;
  } catch (error) {
    console.error('Error deleting driver expense:', error);
    throw error;
  }
};

// ============================================================================
// TRUCK EXPENSE CRUD FUNCTIONS
// ============================================================================

/**
 * Create a new truck expense
 * @param {Object} payload - Truck expense data
 * @returns {Promise<Object>} Created truck expense
 */
export const createTruckExpense = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Payload is required');
    }
    
    console.log('Creating truck expense:', payload);
    const response = await ApiService.postData('/driver/expense/', payload);
    console.log('Created truck expense:', response);
    
    return response;
  } catch (error) {
    console.error('Error creating truck expense:', error);
    throw error;
  }
};
