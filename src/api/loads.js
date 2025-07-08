import { ApiService, ENDPOINTS } from './auth';

export const getAllLoads = async () => {
  return await ApiService.getData(ENDPOINTS.LOADS);
};
