import express from 'express';
import { checkoutController } from '../controllers/checkoutController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { checkoutSummarySchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);

// Generate checkout summary (strictly evaluates stock and active status)
router.post('/summary', validateRequest(checkoutSummarySchema), checkoutController.getSummary);

export default router;
