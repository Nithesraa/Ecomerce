import { axiosInstance } from './axios.js';

export const checkoutService = {
  getSummary: async (couponCode = '') => {
    const data = {};
    if (couponCode) {
      data.couponCode = couponCode;
    }
    const response = await axiosInstance.post('/checkout/summary', data);
    return response;
  }
};
