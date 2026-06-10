import { checkoutService } from '../services/checkoutService.js';

export const checkoutController = {
  /**
   * Generates a checkout summary including subtotal, discounts, and final total.
   * Strictly validates cart items against current stock and availability.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getSummary: async (req, res, next) => {
    try {
      const couponCode = req.body.couponCode || req.query.couponCode;
      const summary = await checkoutService.getCheckoutSummary(req.user._id, couponCode);
      
      res.status(200).json({
        success: true,
        message: 'Checkout summary generated successfully',
        data: summary
      });
    } catch (error) {
      next(error); // Passes to centralized error handler
    }
  }
};
