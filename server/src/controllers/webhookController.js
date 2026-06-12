import { stripeService } from '../services/stripeService.js';
import { paymentService } from '../services/paymentService.js';
import logger from '../utils/logger.js';

export const webhookController = {
  handleStripeWebhook: async (req, res, next) => {
    try {
      const signature = req.headers['stripe-signature'];
      
      // req.body should be a Buffer because we use express.raw() for this route
      const rawBody = req.body;

      let event;
      try {
        event = stripeService.verifySignature(rawBody, signature);
      } catch (err) {
        logger.warn(`Invalid Stripe webhook signature: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (session.payment_status === 'paid') {
            await paymentService.processSuccessfulPayment(session);
            logger.info(`Stripe webhook successfully processed checkout.session.completed for order ${session.metadata.orderId}`);
          }
          break;
        }
        case 'checkout.session.expired': {
          const session = event.data.object;
          await paymentService.processFailedPayment(session, 'EXPIRED', 'Checkout session expired');
          logger.info(`Stripe webhook successfully processed checkout.session.expired for order ${session.metadata?.orderId}`);
          break;
        }
        case 'payment_intent.payment_failed': {
          // Sometimes checkout.session handles everything, but if a payment fails explicitly
          // We can't always link payment_intent directly to order easily without expanding or fetching session
          // However, we mainly rely on checkout.session.expired for hosted checkout drops.
          // We will log this for completeness.
          logger.warn(`Stripe payment_intent.payment_failed received: ${event.data.object.id}`);
          break;
        }
        default:
          logger.info(`Unhandled Stripe webhook event: ${event.type}`);
      }

      // Always return 200 to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error(`Webhook processing error: ${error.message}`, { stack: error.stack });
      res.status(500).send(`Webhook Error: Internal server error`);
    }
  }
};
