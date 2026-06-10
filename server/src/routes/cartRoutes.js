import express from 'express';
import { cartController } from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { addToCartSchema, updateCartSchema, removeFromCartSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', validateRequest(addToCartSchema), cartController.addToCart);
router.put('/:productId', validateRequest(updateCartSchema), cartController.updateCartItem);
router.delete('/:productId', validateRequest(removeFromCartSchema), cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
