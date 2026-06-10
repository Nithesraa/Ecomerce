import express from 'express';
import { couponController } from '../controllers/couponController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply global authentication and admin authorization to all coupon routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.post('/', couponController.create);
router.get('/', couponController.getAll);
router.get('/:id', couponController.getById);
router.put('/:id', couponController.update);
router.delete('/:id', couponController.delete);

export default router;
