import { axiosInstance } from './axios.js';

export const orderService = {
  createOrder: async (shippingAddress, couponCode = '', paymentMethod) => {
    const payload = { shippingAddress, paymentMethod };
    if (couponCode) payload.couponCode = couponCode;
    const response = await axiosInstance.post('/orders', payload);
    return response;
  },

  getMyOrders: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get('/orders/my-orders', {
      params: { page, limit }
    });
    return response;
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response;
  },

  getAllOrders: async () => {
    const response = await axiosInstance.get('/admin/orders');
    return response;
  },

  updateOrderStatus: async (orderId, statusData) => {
    // statusData: { status, note }
    const response = await axiosInstance.patch(`/orders/${orderId}/status`, statusData);
    return response;
  }
};
