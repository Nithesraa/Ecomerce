import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { paymentVerifyLimiter } from '../middlewares/rateLimiter.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { paymentInitSchema, paymentVerifySchema, paymentFailSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);

// Initialize Razorpay Order
router.post('/initialize', validateRequest(paymentInitSchema), paymentController.initialize);

// Verify successful payment signature
router.post('/verify', paymentVerifyLimiter, validateRequest(paymentVerifySchema), paymentController.verify);

// Log failed payment from the client
router.post('/fail', validateRequest(paymentFailSchema), paymentController.fail);

export default router;
