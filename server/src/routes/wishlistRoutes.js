import express from 'express';
import { wishlistController } from '../controllers/wishlistController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all wishlist routes
router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
