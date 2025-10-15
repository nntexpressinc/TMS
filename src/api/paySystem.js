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
    // Use the correct endpoint that works in Postman
    const response = await ApiService.getData('/pay-system/drivers/');
    console.log('Raw API response from getDriversSummary:', response);
    console.log('Response type:', Array.isArray(response) ? 'Array' : typeof response);
   
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
   
    console.log('getDriverCompletedLoads - Driver ID:', driverId);
    console.log('getDriverCompletedLoads - Params:', params);
   
    // Build the query string for date filtering
    const query = buildQueryString(params);
    const endpoint = `/pay-system/drivers/${driverId}/completed-loads/${query}`;
   
    console.log('getDriverCompletedLoads - Calling endpoint:', endpoint);
   
    const response = await ApiService.getData(endpoint);
    console.log('getDriverCompletedLoads - Raw API response:', response);
    console.log('getDriverCompletedLoads - Response type:', Array.isArray(response) ? 'Array' : typeof response);
    console.log('getDriverCompletedLoads - Response length:', Array.isArray(response) ? response.length : 'N/A');
   
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
