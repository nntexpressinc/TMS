import { ApiService } from './auth';

export const testApiConnection = async () => {
  const results = {
    auth: false,
    drivers: false,
    driverPay: false,
    errors: []
  };

  try {
    // Test basic auth
    const token = localStorage.getItem('accessToken');
    if (!token) {
      results.errors.push('No access token found');
      return results;
    }
    results.auth = true;

    // Test pay-system drivers endpoint (the one that works in Postman)
    try {
      const driversResponse = await ApiService.getData('/pay-system/drivers/');
      console.log('Pay-system drivers endpoint test:', driversResponse);
      results.drivers = true;
    } catch (error) {
      results.errors.push(`Pay-system drivers endpoint failed: ${error.message}`);
    }

    // Test driver pay endpoint with a sample driver ID
    try {
      const driverPayResponse = await ApiService.getData('/pay-system/drivers/1/pay-data/');
      console.log('Driver pay endpoint test:', driverPayResponse);
      results.driverPay = true;
    } catch (error) {
      results.errors.push(`Driver pay endpoint failed: ${error.message}`);
    }

  } catch (error) {
    results.errors.push(`General error: ${error.message}`);
  }

  return results;
};

export const testDriverPayEndpoints = async (driverId = null) => {
  const results = {
    summary: false,
    payData: false,
    errors: []
  };

  try {
    // Test summary
    const summaryResponse = await ApiService.getData('/driver/');
    console.log('Driver summary test:', summaryResponse);
    results.summary = true;

    // Test pay data if driver ID provided
    if (driverId) {
      try {
        const payDataResponse = await ApiService.getData(`/driver/pay/driver/?driver=${driverId}`);
        console.log('Driver pay data test:', payDataResponse);
        results.payData = true;
      } catch (error) {
        results.errors.push(`Pay data endpoint failed: ${error.message}`);
      }
    }

  } catch (error) {
    results.errors.push(`Summary endpoint failed: ${error.message}`);
  }

  return results;
};