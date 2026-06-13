import { axiosInstance } from '../../api/axios.js';

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response; // returns { success, message, data: { user, accessToken } }
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axiosInstance.post('/auth/logout', { refreshToken });
    return response;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response;
  }
};
