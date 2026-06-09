import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/', authenticate, authorizeRoles('ADMIN'), categoryController.createCategory);

export default router;
