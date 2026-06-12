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
      const { shippingAddress, couponCode, paymentMethod } = req.body;
      
      if (!shippingAddress) {
        throw Object.assign(new Error('Shipping address is required'), { statusCode: 400 });
      }

      const { order, orderItems } = await orderService.createOrder(req.user._id, shippingAddress, couponCode, paymentMethod);
      
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
  },

  getMyOrders: async (req, res, next) => {
    try {
      const result = await orderService.getMyOrders(req.user._id, req.query);
      res.status(200).json({ success: true, data: result.orders, total: result.total, page: result.page, limit: result.limit });
    } catch (error) {
      next(error);
    }
  },

  getAllOrders: async (req, res, next) => {
    try {
      const result = await orderService.getAllOrders(req.query);
      res.status(200).json({ success: true, data: result.orders, total: result.total, page: result.page, limit: result.limit });
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, res, next) => {
    try {
      const result = await orderService.getOrderById(req.params.id, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getSellerOrders: async (req, res, next) => {
    try {
      const sellerId = req.user.sellerProfileId || req.user._id;
      const result = await orderService.getSellerOrders(sellerId, req.query);
      res.status(200).json({ success: true, data: result.orders, total: result.total, page: result.page, limit: result.limit });
    } catch (error) {
      next(error);
    }
  },

  updateOrderStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status, req.user);
      res.status(200).json({ success: true, message: 'Order status updated successfully', data: order });
    } catch (error) {
      next(error);
    }
  }
};
