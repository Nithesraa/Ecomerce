import express from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = express.Router();

// Route must consume raw body for signature verification!
router.post('/razorpay', webhookController.handleRazorpayWebhook);

export default router;
