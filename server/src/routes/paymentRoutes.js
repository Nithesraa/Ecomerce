import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { paymentInitSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);

// Initialize Stripe Checkout Session
router.post('/initialize', validateRequest(paymentInitSchema), paymentController.initialize);

// Get Stripe Session status
router.get('/session/:sessionId', paymentController.getSession);

export default router;
