import express from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createReviewSchema, updateReviewSchema, idParamSchema } from '../validators/ecommerceValidators.js';

const router = express.Router({ mergeParams: true });

// Product specific review routes (mounted at /api)
router.post('/products/:productId/reviews', authenticate, validateRequest(createReviewSchema), reviewController.addReview);
router.get('/products/:productId/reviews', optionalAuth, reviewController.getReviews);
router.get('/products/:productId/reviews/eligibility', authenticate, reviewController.checkEligibility);

// Standalone review routes (mounted at /api)
router.put('/reviews/:reviewId', authenticate, validateRequest(updateReviewSchema), reviewController.updateReview);
router.delete('/reviews/:reviewId', authenticate, reviewController.deleteReview);

export default router;
