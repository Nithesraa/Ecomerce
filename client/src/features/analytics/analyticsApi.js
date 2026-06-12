import { axiosInstance } from '../../api/axios.js';

export const analyticsApi = {
  recordEvent: async (productId, eventType) => {
    try {
      await axiosInstance.post(`/analytics/events`, { productId, eventType });
    } catch (error) {
      console.error('Failed to record analytics event', error);
    }
  },

  getSimilarProducts: async (productId) => {
    const response = await axiosInstance.get(`/analytics/recommendations/similar/${productId}`);
    return response.data; // response is already response.data due to interceptor
  },

  getPersonalizedRecommendations: async () => {
    const response = await axiosInstance.get(`/analytics/recommendations/personalized`);
    return response.data; // response is already response.data due to interceptor
  },

  getDashboardMetrics: async () => {
    const response = await axiosInstance.get(`/analytics/metrics`);
    return response.data; // response is already response.data due to interceptor
  }
};
