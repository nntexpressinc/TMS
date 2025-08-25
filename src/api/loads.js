import axios from 'axios';
import { ApiService, ENDPOINTS } from './auth';

// Fetch loads with optional pagination and search params.
// params: { page, page_size, search, url, signal }
export const getAllLoads = async (params = {}) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  // If backend returned an absolute `next` url, caller may pass it as params.url
  if (params.url && typeof params.url === 'string' && params.url.startsWith('http')) {
    const response = await axios.get(params.url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: params.signal
    });
    return response.data;
  }

  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.page_size) query.append('page_size', params.page_size);
  if (params.search) query.append('search', params.search);
  if (params.load_status) query.append('load_status', params.load_status);

  const endpoint = `${ENDPOINTS.LOADS}${query.toString() ? `?${query.toString()}` : ''}`;
  // ApiService.getData will prefix BASE_URL and add auth header
  return await ApiService.getData(endpoint);
};
