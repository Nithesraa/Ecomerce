import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createOrderSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);

// Create a new order
router.post('/', validateRequest(createOrderSchema), orderController.createOrder);

export default router;
