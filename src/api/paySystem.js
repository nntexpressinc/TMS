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

export const getDriversSummary = async () => {
  try {
    // Use the correct endpoint that works in Postman
    const response = await ApiService.getData('/pay-system/drivers/');
    console.log('Raw API response:', response); // Debug log
    
    // The response is already an array of drivers
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
    
    console.log('Fetching completed loads for driver:', driverId, 'with params:', params);
    
    // Build the query string for date filtering
    const query = buildQueryString(params);
    const endpoint = `/pay-system/drivers/${driverId}/completed-loads${query}`;
    
    console.log('Calling endpoint:', endpoint);
    
    const response = await ApiService.getData(endpoint);
    console.log('Completed loads response:', response);
    
    // The response should be an array of loads
    const loads = ensureArray(response);
    
    return {
      loads,
      driver: { id: driverId }
    };
  } catch (error) {
    console.error('Error fetching completed loads:', error);
    throw error;
  }
};

// Helper function (need to define it here since it's used)
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export const postPaystubAction = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Payload is required');
    }
    
    console.log('Posting paystub action with payload:', payload);
    
    // Use the pay-system endpoint for paystub actions
    const response = await ApiService.postData('/pay-system/paystub/', payload);
    console.log('Paystub action response:', response);
    
    return response;
  } catch (error) {
    console.error('Error posting paystub action:', error);
    throw error;
  }
};
