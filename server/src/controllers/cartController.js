import { cartService } from '../services/cartService.js';

export const cartController = {
  getCart: async (req, res, next) => {
    try {
      const cart = await cartService.getCart(req.user._id);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  },

  addToCart: async (req, res, next) => {
    try {
      const { productId, quantity, variantId } = req.body;
      const cart = await cartService.addToCart(req.user._id, productId, quantity, variantId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  },

  updateCartItem: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { quantity, variantId } = req.body;
      const cart = await cartService.updateCartItem(req.user._id, productId, quantity, variantId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  },

  removeFromCart: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { variantId } = req.query; // Usually provided in query params for DELETE
      const cart = await cartService.removeFromCart(req.user._id, productId, variantId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  },

  clearCart: async (req, res, next) => {
    try {
      const cart = await cartService.clearCart(req.user._id);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }
};
