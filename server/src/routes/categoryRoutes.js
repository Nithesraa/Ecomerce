import express from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createCategorySchema, updateCategorySchema, idParamSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/', authenticate, authorizeRoles('ADMIN'), validateRequest(createCategorySchema), categoryController.createCategory);

export default router;
