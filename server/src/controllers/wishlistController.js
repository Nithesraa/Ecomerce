import { wishlistService } from '../services/wishlistService.js';

export const wishlistController = {
  getWishlist: async (req, res, next) => {
    try {
      const wishlist = await wishlistService.getWishlist(req.user._id);
      res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
      next(error);
    }
  },

  toggleWishlist: async (req, res, next) => {
    try {
      const { productId } = req.body;
      const wishlist = await wishlistService.toggleWishlist(req.user._id, productId);
      res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
      next(error);
    }
  },

  removeFromWishlist: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const wishlist = await wishlistService.removeFromWishlist(req.user._id, productId);
      res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
      next(error);
    }
  }
};
