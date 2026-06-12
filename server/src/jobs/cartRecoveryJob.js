import { Cart } from '../models/Cart.js';
import { User } from '../models/User.js';
import { sendAbandonedCartEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

// Configuration
// In production, an abandoned cart is usually one left alone for > 24 hours.
// During development/testing, we can use a shorter duration.
const ABANDONED_THRESHOLD_MS = process.env.NODE_ENV === 'production' 
  ? 24 * 60 * 60 * 1000 // 24 hours
  : 2 * 60 * 60 * 1000; // 2 hours for dev

const RUN_INTERVAL_MS = 60 * 60 * 1000; // Run every hour
// const RUN_INTERVAL_MS = 5 * 60 * 1000; // 5 mins for dev

export const startCartRecoveryJob = () => {
  logger.info('Cart Recovery Job started.');

  setInterval(async () => {
    try {
      const thresholdDate = new Date(Date.now() - ABANDONED_THRESHOLD_MS);

      // Find carts that:
      // 1. Have items
      // 2. Haven't been updated recently (abandoned)
      // 3. Haven't had a recovery email sent yet
      const abandonedCarts = await Cart.find({
        'items.0': { $exists: true },
        updatedAt: { $lt: thresholdDate },
        recoveryEmailSentAt: null
      }).populate('user', 'name email');

      if (abandonedCarts.length > 0) {
        logger.info(`Found ${abandonedCarts.length} abandoned carts. Processing recovery emails...`);
        
        for (const cart of abandonedCarts) {
          if (cart.user && cart.user.email) {
            await sendAbandonedCartEmail(cart.user.email, cart.user.name, cart);
            
            // Update the cart to mark email as sent
            cart.recoveryEmailSentAt = new Date();
            await cart.save();
          }
        }
      }
    } catch (error) {
      logger.error('Error running Cart Recovery Job:', error);
    }
  }, RUN_INTERVAL_MS);
};
