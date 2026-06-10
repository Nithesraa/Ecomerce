import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  /**
   * Initializes a Razorpay order for a given system Order ID.
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.body - Contains orderId
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  initialize: async (req, res, next) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        throw Object.assign(new Error('Order ID is required'), { statusCode: 400 });
      }

      const paymentData = await paymentService.initializePayment(orderId);

      res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: paymentData
      });
    } catch (error) {
      next(error); // Passes to centralized error handler
    }
  },

  /**
   * Verifies a successful Razorpay payment signature and completes the order flow.
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.body - Contains orderId, razorpayOrderId, razorpayPaymentId, signature
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  verify: async (req, res, next) => {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, signature } = req.body;

      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !signature) {
         throw Object.assign(new Error('Missing required payment verification parameters'), { statusCode: 400 });
      }

      const result = await paymentService.processSuccessfulPayment(
        orderId, 
        razorpayOrderId, 
        razorpayPaymentId, 
        signature
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully. Order is now processing.',
        data: result
      });
    } catch (error) {
      next(error); // Passes to centralized error handler
    }
  },

  /**
   * Processes a failed payment from the client-side Razorpay modal.
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.body - Contains orderId, razorpayOrderId, razorpayPaymentId, errorReason
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  fail: async (req, res, next) => {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, errorReason } = req.body;

      if (!orderId) {
        throw Object.assign(new Error('Order ID is required'), { statusCode: 400 });
      }

      const result = await paymentService.processFailedPayment(
        orderId, 
        razorpayOrderId, 
        razorpayPaymentId, 
        errorReason
      );

      res.status(200).json({
        success: true,
        message: 'Payment failure logged successfully',
        data: result
      });
    } catch (error) {
      next(error); // Passes to centralized error handler
    }
  }
};
