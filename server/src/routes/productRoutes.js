import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate, authorizeRoles, optionalAuth } from '../middlewares/authMiddleware.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Seller/Admin specific routes MUST be before /:slug
router.get('/seller/my-products', authenticate, authorizeRoles('SELLER', 'ADMIN'), productController.getSellerProducts);

// Public routes
router.get('/', optionalAuth, productController.getProducts);
router.get('/:slug', optionalAuth, productController.getProductBySlug);

// Mutations
router.post('/', authenticate, authorizeRoles('SELLER', 'ADMIN'), uploadMiddleware.array('images', 5), productController.createProduct);
router.put('/:id', authenticate, authorizeRoles('SELLER', 'ADMIN'), productController.updateProduct);
router.delete('/:id', authenticate, authorizeRoles('SELLER', 'ADMIN'), productController.deleteProduct);

export default router;
