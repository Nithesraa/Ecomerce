import { BrowsingEvent } from '../models/BrowsingEvent.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import mongoose from 'mongoose';

export const analyticsService = {
  recordEvent: async (userId, productId, eventType) => {
    if (!productId) return;
    await BrowsingEvent.create({
      user: userId || null,
      product: productId,
      eventType
    });
  },

  getSimilarProducts: async (productId) => {
    // 1. Find orders that contain this product
    const items = await OrderItem.find({ product: productId }).select('order');
    const orderIds = items.map(item => item.order);

    if (orderIds.length === 0) {
      // Fallback to top products in the same category
      const product = await Product.findById(productId);
      if (!product) return [];
      return await Product.find({ category: product.category, _id: { $ne: productId } }).limit(4);
    }

    // 2. Find other products in those same orders
    const similarProducts = await OrderItem.aggregate([
      { $match: { order: { $in: orderIds }, product: { $ne: new mongoose.Types.ObjectId(productId) } } },
      { $group: { _id: '$product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
      { $unwind: '$productDetails' },
      { $replaceRoot: { newRoot: '$productDetails' } }
    ]);

    // If not enough similar products, pad with other products
    if (similarProducts.length < 4) {
      const product = await Product.findById(productId);
      const existingIds = similarProducts.map(p => p._id);
      existingIds.push(productId);
      const padProducts = await Product.find({ category: product?.category, _id: { $nin: existingIds } }).limit(4 - similarProducts.length);
      return [...similarProducts, ...padProducts];
    }

    return similarProducts;
  },

  getPersonalizedRecommendations: async (userId) => {
    if (!userId) {
      // Fallback for guests: Top selling products overall
      const topProducts = await OrderItem.aggregate([
        { $group: { _id: '$product', count: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 4 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
        { $unwind: '$productDetails' },
        { $replaceRoot: { newRoot: '$productDetails' } }
      ]);
      if (topProducts.length > 0) return topProducts;
      return await Product.find().limit(4);
    }

    // 1. Get recent browsing history categories
    const recentEvents = await BrowsingEvent.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('product');

    const categoryMap = {};
    recentEvents.forEach(event => {
      if (event.product && event.product.category) {
        categoryMap[event.product.category] = (categoryMap[event.product.category] || 0) + 1;
      }
    });

    const topCategories = Object.keys(categoryMap).sort((a, b) => categoryMap[b] - categoryMap[a]).slice(0, 2);

    if (topCategories.length > 0) {
      const recommendations = await Product.find({ category: { $in: topCategories } }).limit(4);
      if (recommendations.length > 0) return recommendations;
    }

    // Fallback: Just return random or recent products
    return await Product.find().sort({ createdAt: -1 }).limit(4);
  },

  getDashboardMetrics: async () => {
    // Top Viewed Products
    const topViewed = await BrowsingEvent.aggregate([
      { $match: { eventType: 'VIEW' } },
      { $group: { _id: '$product', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { title: '$product.title', views: 1, _id: 0 } }
    ]);

    // Top Added to Cart
    const topCarted = await BrowsingEvent.aggregate([
      { $match: { eventType: 'ADD_TO_CART' } },
      { $group: { _id: '$product', adds: { $sum: 1 } } },
      { $sort: { adds: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { title: '$product.title', adds: 1, _id: 0 } }
    ]);
    
    // Overall Conversion (Purchases / Views)
    const viewCount = await BrowsingEvent.countDocuments({ eventType: 'VIEW' });
    const purchaseCount = await BrowsingEvent.countDocuments({ eventType: 'PURCHASE' });
    const conversionRate = viewCount > 0 ? ((purchaseCount / viewCount) * 100).toFixed(2) : 0;

    return {
      topViewed,
      topCarted,
      conversionRate,
      viewCount,
      purchaseCount
    };
  }
};
