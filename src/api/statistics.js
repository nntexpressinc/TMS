import axios from 'axios';
const API_URL = 'https://nnt.nntexpressinc.com/api';

export const getTeamStatistics = async (params = {}) => {
  const { teamId, date_from, date_to } = params;
  let url = `${API_URL}/statistics/teams/`;
  
  const queryParams = new URLSearchParams();
  
  if (teamId) {
    queryParams.append('team_id', teamId);
  }
  if (date_from) {
    queryParams.append('date_from', date_from);
  }
  if (date_to) {
    queryParams.append('date_to', date_to);
  }

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching team statistics:', error);
    throw error;
  }
};