import express from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { createCategorySchema, updateCategorySchema, idParamSchema } from '../validators/ecommerceValidators.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/', authenticate, authorizeRoles('ADMIN'), validateRequest(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), validateRequest(idParamSchema), categoryController.deleteCategory);

export default router;
