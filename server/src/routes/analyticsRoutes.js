import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/events', optionalAuth, analyticsController.recordEvent);
router.get('/recommendations/similar/:productId', analyticsController.getSimilarProducts);
router.get('/recommendations/personalized', optionalAuth, analyticsController.getPersonalizedRecommendations);

// Admin/Seller metrics
router.get('/metrics', authenticate, analyticsController.getDashboardMetrics);

export default router;
