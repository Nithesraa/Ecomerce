import { axiosInstance } from './axios.js';

export const paymentService = {
  initializePayment: async (orderId) => {
    const response = await axiosInstance.post('/payments/initialize', { orderId });
    return response;
  },

  getSession: async (sessionId) => {
    const response = await axiosInstance.get(`/payments/session/${sessionId}`);
    return response;
  }
};
