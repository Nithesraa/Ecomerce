import { Product } from '../models/Product.js';

export const productRepository = {
  create: async (data) => {
    return Product.create(data);
  },

  findById: async (id) => {
    return Product.findById(id).populate('category', 'name slug')
    // .populate('seller', 'storeName user');
  },

  findBySlug: async (slug) => {
    return Product.findOne({ slug, isDeleted: false }).populate('category', 'name slug')
    // .populate('seller', 'storeName user');
  },

  findProducts: async (filters, options = {}) => {
    const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
    const query = { isDeleted: false, ...filters };

    if (query.search) {
      query.$text = { $search: query.search };
      delete query.search;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        // .populate('seller', 'storeName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return { products, total };
  },

  update: async (id, data) => {
    return Product.findByIdAndUpdate(id, data, { new: true });
  },
};
