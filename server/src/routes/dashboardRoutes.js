import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('SELLER', 'ADMIN'));

router.get('/seller/overview', dashboardController.getSellerOverview);
router.get('/seller/orders', dashboardController.getSellerRecentOrders);
router.get('/seller/products', dashboardController.getSellerTopProducts);

export default router;
