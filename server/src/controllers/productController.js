import { productService } from '../services/productService.js';

export const productController = {
  createProduct: async (req, res, next) => {
    try {
      // In a real app, seller id might come from req.user.sellerProfile
      // const sellerId = req.body.seller; 
      const sellerId = req.user._id;
      const product = await productService.createProduct(req.body, sellerId, req.files);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  getProducts: async (req, res, next) => {
    try {
      const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (category) filters.category = category;
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = Number(minPrice);
        if (maxPrice) filters.price.$lte = Number(maxPrice);
      }

      const options = {
        skip: (Number(page) - 1) * Number(limit),
        limit: Number(limit),
        sort: sort ? { [sort.split('_')[0]]: sort.split('_')[1] === 'desc' ? -1 : 1 } : { createdAt: -1 }
      };

      const result = await productService.getProducts(filters, options);
      res.status(200).json({ success: true, data: result.products, total: result.total, page: Number(page), limit: Number(limit) });
    } catch (error) {
      next(error);
    }
  },

  getProductBySlug: async (req, res, next) => {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  getSellerProducts: async (req, res, next) => {
    try {
      // Fallback logic for finding the seller ID
      const sellerId = req.user.sellerProfileId || req.user._id;

      const { page = 1, limit = 10 } = req.query;
      const options = {
        skip: (Number(page) - 1) * Number(limit),
        limit: Number(limit),
      };

      const result = await productService.getSellerProducts(sellerId, options);
      res.status(200).json({ success: true, data: result.products, total: result.total });
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.user);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      await productService.deleteProduct(req.params.id, req.user);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};
