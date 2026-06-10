import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Initialize Razorpay Order
router.post('/initialize', paymentController.initialize);

// Verify successful payment signature
router.post('/verify', paymentController.verify);

// Log failed payment from the client
router.post('/fail', paymentController.fail);

export default router;
