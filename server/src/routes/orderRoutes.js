import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Create a new order
router.post('/', orderController.createOrder);

export default router;
