import { orderService } from '../services/orderService.js';

export const orderController = {
  /**
   * Creates a new Order from the user's current valid checkout summary.
   * Persists order item snapshots and initializes a PENDING order.
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.body - Contains shippingAddress and optional couponCode
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  createOrder: async (req, res, next) => {
    try {
      const { shippingAddress, couponCode } = req.body;
      
      if (!shippingAddress) {
        throw Object.assign(new Error('Shipping address is required'), { statusCode: 400 });
      }

      const { order, orderItems } = await orderService.createOrder(req.user._id, shippingAddress, couponCode);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order._id,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          itemsCount: orderItems.length
        }
      });
    } catch (error) {
      next(error); // Passes to centralized error handler
    }
  }
};
