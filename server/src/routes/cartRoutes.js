import express from 'express';
import { cartController } from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:productId', cartController.updateCartItem);
router.delete('/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
