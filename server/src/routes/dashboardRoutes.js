import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('SELLER', 'ADMIN'));

router.get('/seller/overview', dashboardController.getSellerOverview);
router.get('/seller/orders', dashboardController.getSellerRecentOrders); // Keeping for generic use if needed
router.get('/seller/order-items', dashboardController.getSellerOrderItems);
router.patch('/seller/order-items/:id/status', dashboardController.updateOrderItemStatus);
router.get('/seller/products', dashboardController.getSellerTopProducts);

// Admin Routes
router.get('/admin/sellers', authorizeRoles('ADMIN'), dashboardController.getSellers);
router.patch('/admin/sellers/:id/verify', authorizeRoles('ADMIN'), dashboardController.verifySeller);

export default router;
