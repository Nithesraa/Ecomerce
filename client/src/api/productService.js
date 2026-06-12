import { axiosInstance } from './axios.js';

export const productService = {
  getProducts: async (params) => {
    // params can include: search, category, minPrice, maxPrice, sort, page, limit, isFeatured
    const response = await axiosInstance.get('/products', { params });
    return response;
  },

  getProductBySlug: async (slug) => {
    const response = await axiosInstance.get(`/products/${slug}`);
    return response;
  },

  getSellerProducts: async () => {
    const response = await axiosInstance.get('/products/seller/my-products');
    return response;
  },

  createProduct: async (formData) => {
    // Note: formData must be passed directly since it contains files
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  },

  updateProduct: async (id, formData) => {
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  },

  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response;
  },

  approveProduct: async (id) => {
    const response = await axiosInstance.patch(`/products/${id}/approve`);
    return response;
  },

  rejectProduct: async (id) => {
    const response = await axiosInstance.patch(`/products/${id}/reject`);
    return response;
  }
};
