import axios from 'axios';

const API_URL = 'https://nnt.nntexpressinc.com/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const storedAccessToken = localStorage.getItem('accessToken');
  if (!storedAccessToken) {
    throw new Error('No access token found');
  }
  return {
    Authorization: `Bearer ${storedAccessToken}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Get all companies
 * @returns {Promise<Array>} List of all companies
 */
export const getCompanies = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/company/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

/**
 * Get a single company by ID
 * @param {number} id - Company ID
 * @returns {Promise<Object>} Company details
 */
export const getCompanyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/auth/company/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
};

/**
 * Create a new company
 * @param {Object} companyData - Company data
 * @returns {Promise<Object>} Created company
 */
export const createCompany = async (companyData) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/company/`,
      companyData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

/**
 * Update an existing company
 * @param {number} id - Company ID
 * @param {Object} companyData - Updated company data
 * @returns {Promise<Object>} Updated company
 */
export const updateCompany = async (id, companyData) => {
  try {
    const response = await axios.put(
      `${API_URL}/auth/company/${id}/`,
      companyData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

/**
 * Partially update a company
 * @param {number} id - Company ID
 * @param {Object} companyData - Partial company data
 * @returns {Promise<Object>} Updated company
 */
export const patchCompany = async (id, companyData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/auth/company/${id}/`,
      companyData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error patching company:', error);
    throw error;
  }
};

/**
 * Delete a company
 * @param {number} id - Company ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteCompany = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/auth/company/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};
