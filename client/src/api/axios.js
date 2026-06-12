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
    // With HTTP-Only cookies, the browser attaches tokens automatically.
    // No need to manually inject Authorization headers.
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
        // Attempt to refresh token using the http-only refresh cookie
        const res = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        
        if (res.data?.success) {
          // Cookies are automatically updated by the browser from the Set-Cookie headers
          // We just need to retry the original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, user must log in again
        localStorage.removeItem('user');
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
