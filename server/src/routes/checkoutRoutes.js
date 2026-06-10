import express from 'express';
import { checkoutController } from '../controllers/checkoutController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Generate checkout summary (strictly evaluates stock and active status)
router.post('/summary', checkoutController.getSummary);

export default router;
