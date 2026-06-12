import { axiosInstance } from './axios.js';

export const couponService = {
  getAllCoupons: async () => {
    return await axiosInstance.get('/coupons');
  },

  getCouponById: async (id) => {
    return await axiosInstance.get(`/coupons/${id}`);
  },

  createCoupon: async (couponData) => {
    return await axiosInstance.post('/coupons', couponData);
  },

  updateCoupon: async (id, couponData) => {
    return await axiosInstance.put(`/coupons/${id}`, couponData);
  },

  deleteCoupon: async (id) => {
    return await axiosInstance.delete(`/coupons/${id}`);
  }
};
