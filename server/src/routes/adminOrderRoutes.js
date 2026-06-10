import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { idParamSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', orderController.getAllOrders);
router.get('/:id', validateRequest(idParamSchema), orderController.getOrderById);
router.patch('/:id/status', validateRequest(idParamSchema), orderController.updateOrderStatus);

export default router;
