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

    // Format the response data
    const responseData = response.data;
    const formattedLoads = responseData.loads?.map(load => {
      // Parse rate string to get values
      const rateMatch = load.Rate?.match(/\$(\d+\.\d+)\s*\*\s*(\d+\.\d+)%\s*\$(\d+\.\d+)/);
      const rate = rateMatch ? {
        amount: parseFloat(rateMatch[1]),
        percentage: parseFloat(rateMatch[2]),
        total: parseFloat(rateMatch[3])
      } : { amount: 0, percentage: 0, total: 0 };

      // Parse total pay string
      const totalPay = parseFloat(load['Total Pay']?.replace('$', '') || '0');

      // Parse pickup and delivery
      const [pickupDate, pickupLocation] = (load.Pickup || '').split(', ');
      const [deliveryDate, deliveryLocation] = (load.Delivery || '').split(', ');

      return {
        load_number: load['Load #'],
        pickup: {
          date: pickupDate || '',
          location: pickupLocation || 'N/A'
        },
        delivery: {
          date: deliveryDate || '',
          location: deliveryLocation || 'N/A'
        },
        rate: {
          amount: rate.amount,
          percentage: rate.percentage,
          total: rate.total,
          display: load.Rate || '$0.00'
        },
        notes: load.Notes || '',
        total_pay: totalPay
      };
    }) || [];

    // Parse total pay
    const totalPay = parseFloat(responseData.total_pay?.replace('$', '') || '0');

    return {
      driver_details: {
        ...responseData.driver,
        generate_date: responseData.driver.generate_date,
        report_date: responseData.driver.report_date,
        search_from: responseData.driver.search_from,
        search_to: responseData.driver.search_to
      },
      company_info: {
        name: responseData.user_admin.company_name,
        email: responseData.user_admin.email,
        address: responseData.user_admin.address,
        location: responseData.user_admin.country,
        phone: responseData.user_admin.state,
        fax: responseData.user_admin.fax
      },
      loads: formattedLoads,
      total_pay: totalPay
    };
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
        Accept: 'application/pdf', // Ensure server knows we expect a PDF
      },
      responseType: 'blob', // Important for handling binary data (PDF)
    });

    return response.data; // This will be a Blob
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};