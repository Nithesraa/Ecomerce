import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createOrderSchema, idParamSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);

// Create a new order
router.post('/', validateRequest(createOrderSchema), orderController.createOrder);

// Admin Routes
router.get('/', authorizeRoles('ADMIN'), orderController.getAllOrders);

// Customer Routes
router.get('/my-orders', orderController.getMyOrders);

// Seller Routes
router.get('/seller', authorizeRoles('SELLER', 'ADMIN'), orderController.getSellerOrders);

// Shared Routes (Customer, Seller, Admin)
// orderController handles specific role ownership logic inside the service
router.get('/:id', validateRequest(idParamSchema), orderController.getOrderById);
router.patch('/:id/status', validateRequest(idParamSchema), orderController.updateOrderStatus);

export default router;
