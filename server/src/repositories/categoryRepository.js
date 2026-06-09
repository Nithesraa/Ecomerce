import { Category } from '../models/Category.js';

export const categoryRepository = {
  create: async (data) => {
    return Category.create(data);
  },
  
  findAll: async () => {
    return Category.find().populate('parentCategory');
  },

  findBySlug: async (slug) => {
    return Category.findOne({ slug }).populate('parentCategory');
  },

  update: async (id, data) => {
    return Category.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id) => {
    return Category.findByIdAndDelete(id);
  }
};
