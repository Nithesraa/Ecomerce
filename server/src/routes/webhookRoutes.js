import express from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = express.Router();

// Route must consume raw body for signature verification!
router.post('/stripe', webhookController.handleStripeWebhook);

export default router;
