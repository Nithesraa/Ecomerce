import { axiosInstance } from './axios.js';

export const wishlistService = {
  getWishlist: async () => {
    const response = await axiosInstance.get('/wishlist');
    return response;
  },

  toggleWishlist: async (productId) => {
    // Assuming POST /wishlist with { productId } toggles or adds it.
    // The backend route is POST /api/wishlist, and DELETE /api/wishlist/:productId
    // Let's implement a toggle logic if the backend supports it, or just use add/remove.
    const response = await axiosInstance.post('/wishlist', { productId });
    return response;
  },

  removeFromWishlist: async (productId) => {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return response;
  }
};
