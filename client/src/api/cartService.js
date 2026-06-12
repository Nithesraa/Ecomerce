import { axiosInstance } from './axios.js';

export const cartService = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart');
    return response;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await axiosInstance.post('/cart', { productId, quantity });
    return response;
  },

  updateCartItem: async (productId, quantity) => {
    const response = await axiosInstance.put(`/cart/${productId}`, { quantity });
    return response;
  },

  removeFromCart: async (productId) => {
    const response = await axiosInstance.delete(`/cart/${productId}`);
    return response;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete('/cart');
    return response;
  }
};
