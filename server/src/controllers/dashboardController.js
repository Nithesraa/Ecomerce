import { dashboardService } from '../services/dashboardService.js';
import { orderService } from '../services/orderService.js';
import { productService } from '../services/productService.js';

export const dashboardController = {
  getSellerOverview: async (req, res, next) => {
    try {
      const sellerId = req.user.sellerProfileId || req.user._id;
      const overview = await dashboardService.getSellerOverview(sellerId);
      res.status(200).json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  },

  getSellerRecentOrders: async (req, res, next) => {
    try {
      const sellerId = req.user.sellerProfileId || req.user._id;
      // Get most recent 5 orders
      const result = await orderService.getSellerOrders(sellerId, { page: 1, limit: 5 });
      res.status(200).json({ success: true, data: result.orders });
    } catch (error) {
      next(error);
    }
  },

  getSellerTopProducts: async (req, res, next) => {
    try {
      const sellerId = req.user.sellerProfileId || req.user._id;
      // Get products sorted by stock (or could be sold amount if we aggregate it, but standard find works for now)
      const result = await productService.getSellerProducts(sellerId, { page: 1, limit: 5 });
      res.status(200).json({ success: true, data: result.products });
    } catch (error) {
      next(error);
    }
  }
};
