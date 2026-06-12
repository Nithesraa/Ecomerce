import { categoryRepository } from '../repositories/categoryRepository.js';

export const categoryService = {
  createCategory: async (data) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return categoryRepository.create({ ...data, slug });
  },

  getAllCategories: async () => {
    return categoryRepository.findAll();
  },
  
  getCategoryBySlug: async (slug) => {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    return category;
  },

  updateCategory: async (id, data) => {
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const category = await categoryRepository.update(id, data);
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    return category;
  },

  deleteCategory: async (id) => {
    const category = await categoryRepository.delete(id);
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    return category;
  }
};
