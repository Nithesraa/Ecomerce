import { analyticsService } from '../services/analyticsService.js';

export const analyticsController = {
  recordEvent: async (req, res, next) => {
    try {
      const { productId, eventType } = req.body;
      const userId = req.user ? req.user._id : null;
      await analyticsService.recordEvent(userId, productId, eventType);
      res.status(200).json({ success: true, message: 'Event recorded' });
    } catch (error) {
      next(error);
    }
  },

  getSimilarProducts: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const products = await analyticsService.getSimilarProducts(productId);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  getPersonalizedRecommendations: async (req, res, next) => {
    try {
      const userId = req.user ? req.user._id : null;
      const products = await analyticsService.getPersonalizedRecommendations(userId);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  getDashboardMetrics: async (req, res, next) => {
    try {
      const metrics = await analyticsService.getDashboardMetrics();
      res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
};
