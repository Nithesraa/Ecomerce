import { axiosInstance } from './axios.js';

export const dashboardService = {
  getSellerOverview: async () => {
    return await axiosInstance.get('/dashboard/seller/overview');
  },
  
  getSellerOrders: async () => {
    return await axiosInstance.get('/dashboard/seller/orders');
  },
  
  getSellerProducts: async () => {
    return await axiosInstance.get('/dashboard/seller/products');
  },

  updateOrderStatus: async (orderId, status) => {
    return await axiosInstance.patch(`/orders/${orderId}/status`, { status });
  },

  getOrderDetails: async (orderId) => {
    return await axiosInstance.get(`/orders/${orderId}`);
  },

  // Admin specific APIs
  getAdminOrders: async () => {
    return await axiosInstance.get('/orders');
  },
  
  getSellers: async () => {
    return await axiosInstance.get('/dashboard/admin/sellers');
  },
  
  verifySeller: async (sellerId, isVerified) => {
    return await axiosInstance.patch(`/dashboard/admin/sellers/${sellerId}/verify`, { isVerified });
  },

  // Seller specific Order Item APIs
  getSellerOrderItems: async () => {
    return await axiosInstance.get('/dashboard/seller/order-items');
  },

  updateSellerOrderItemStatus: async (orderItemId, status) => {
    return await axiosInstance.patch(`/dashboard/seller/order-items/${orderItemId}/status`, { status });
  }
};
