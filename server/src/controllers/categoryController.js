import { categoryService } from '../services/categoryService.js';

export const categoryController = {
  createCategory: async (req, res, next) => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  },

  getAllCategories: async (req, res, next) => {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  },

  getCategoryBySlug: async (req, res, next) => {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
};
