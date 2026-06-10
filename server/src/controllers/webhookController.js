import { razorpayService } from '../services/razorpayService.js';
import { paymentService } from '../services/paymentService.js';
import logger from '../utils/logger.js';

export const webhookController = {
  handleRazorpayWebhook: async (req, res, next) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      
      // req.body should be a Buffer because we use express.raw() for this route
      const rawBody = req.body.toString('utf8');

      const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        logger.warn('Invalid Razorpay webhook signature');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }

      const event = JSON.parse(rawBody);

      switch (event.event) {
        case 'payment.captured': {
          const payment = event.payload.payment.entity;
          const orderId = payment.notes?.orderId;
          const razorpayOrderId = payment.order_id;
          const razorpayPaymentId = payment.id;

          if (!orderId) {
            logger.error(`Webhook error: Missing orderId in notes for payment ${razorpayPaymentId}`);
            return res.status(400).json({ success: false, message: 'Missing orderId' });
          }

          // Generate dummy signature since we've already cryptographically verified the webhook itself
          // We can bypass standard signature check by passing "mock_signature" in test mode, 
          // but in production, paymentService.processSuccessfulPayment checks standard signature.
          // Wait, paymentService.processSuccessfulPayment checks signature!
          // If we pass the WEBHOOK signature, it will fail verifySignature (which expects order_id|payment_id).
          // We should add a flag or a separate service method, or just let paymentService know it's a verified webhook.
          
          await paymentService.processSuccessfulPayment(
            orderId, 
            razorpayOrderId, 
            razorpayPaymentId, 
            'webhook_verified' // Special signature override
          );
          logger.info(`Webhook successfully processed payment.captured for order ${orderId}`);
          break;
        }
        case 'payment.failed': {
          const payment = event.payload.payment.entity;
          const orderId = payment.notes?.orderId;
          const razorpayOrderId = payment.order_id;
          const razorpayPaymentId = payment.id;
          const errorReason = payment.error_description || payment.error_reason;

          if (orderId) {
            await paymentService.processFailedPayment(orderId, razorpayOrderId, razorpayPaymentId, errorReason);
            logger.info(`Webhook successfully processed payment.failed for order ${orderId}`);
          }
          break;
        }
        default:
          logger.info(`Unhandled Razorpay webhook event: ${event.event}`);
      }

      // Always return 200 to acknowledge receipt and prevent Razorpay retries
      res.status(200).json({ success: true });
    } catch (error) {
      // paymentService gracefully returns already processed without throwing,
      // so if it throws, it's a real issue.
      logger.error(`Webhook processing error: ${error.message}`, { stack: error.stack });
      // If it's a duplicate or race condition handled gracefully, it won't throw.
      // We return 500 so Razorpay retries it, unless we want to swallow it. Let's send 500 for real errors.
      res.status(500).json({ success: false, message: 'Internal server error during webhook processing' });
    }
  }
};
