import { paymentService } from '../services/paymentService.js';
import { stripeService } from '../services/stripeService.js';
import { stripe } from '../services/stripeService.js'; // need to access stripe directly for getSession

export const paymentController = {
  /**
   * Initializes a Stripe Checkout Session for a given system Order ID.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  initialize: async (req, res, next) => {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        throw Object.assign(new Error('Order ID is required'), { statusCode: 400 });
      }

      const paymentData = await paymentService.createStripeCheckoutSession(orderId, req.user);

      res.status(200).json({
        success: true,
        message: 'Stripe Checkout Session created successfully',
        data: paymentData
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves a Stripe Checkout Session to check its status.
   * Useful for the order-success page to validate the payment.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getSession: async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      if (!sessionId) {
        throw Object.assign(new Error('Session ID is required'), { statusCode: 400 });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      res.status(200).json({
        success: true,
        data: {
          id: session.id,
          payment_status: session.payment_status,
          status: session.status,
          metadata: session.metadata
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
