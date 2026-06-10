import express from 'express';
import { couponController } from '../controllers/couponController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createCouponSchema, updateCouponSchema, idParamSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

// Apply global authentication and admin authorization to all coupon routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.post('/', validateRequest(createCouponSchema), couponController.create);
router.get('/', couponController.getAll);
router.get('/:id', validateRequest(idParamSchema), couponController.getById);
router.put('/:id', validateRequest(updateCouponSchema), couponController.update);
router.delete('/:id', validateRequest(idParamSchema), couponController.delete);

export default router;
