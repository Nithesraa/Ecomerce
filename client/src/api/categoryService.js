import { axiosInstance } from './axios.js';

export const categoryService = {
  getCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response;
  },

  getCategoryBySlug: async (slug) => {
    const response = await axiosInstance.get(`/categories/${slug}`);
    return response;
  },

  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/categories', categoryData);
    return response;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await axiosInstance.put(`/categories/${categoryId}`, categoryData);
    return response;
  },

  deleteCategory: async (categoryId) => {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);
    return response;
  }
};
