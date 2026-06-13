import axios from 'axios';
import toast from 'react-hot-toast';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Required for cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling & token refresh
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Attempt to refresh token
        const res = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh-token`, { refreshToken });
        
        if (res.data?.success) {
          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;
          
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, user must log in again
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Global Error Toasting (excluding 401 to avoid duplicate toasts on refresh failure)
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
