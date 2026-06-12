import express from 'express';
import { wishlistController } from '../controllers/wishlistController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { toggleWishlistSchema, removeFromWishlistSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/', validateRequest(toggleWishlistSchema), wishlistController.toggleWishlist);
router.delete('/:productId', validateRequest(removeFromWishlistSchema), wishlistController.removeFromWishlist);

export default router;
