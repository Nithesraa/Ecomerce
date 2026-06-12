import mongoose from 'mongoose';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { SellerProfile } from '../models/SellerProfile.js';

export const dashboardService = {
  getSellerOverview: async (sellerId) => {
    const objectId = new mongoose.Types.ObjectId(sellerId);

    const [salesMetrics] = await OrderItem.aggregate([
      { $match: { seller: objectId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$quantity', '$priceAtPurchase'] } },
          productsSold: { $sum: '$quantity' },
          uniqueOrders: { $addToSet: '$order' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          productsSold: 1,
          totalOrders: { $size: '$uniqueOrders' }
        }
      }
    ]);

    const [productMetrics] = await Product.aggregate([
      { $match: { seller: objectId, status: 'ACTIVE', isDeleted: false } },
      {
        $group: {
          _id: null,
          activeProducts: { $sum: 1 },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] }
          }
        }
      }
    ]);

    return {
      totalRevenue: salesMetrics?.totalRevenue || 0,
      productsSold: salesMetrics?.productsSold || 0,
      totalOrders: salesMetrics?.totalOrders || 0,
      activeProducts: productMetrics?.activeProducts || 0,
      lowStockProducts: productMetrics?.lowStockProducts || 0
    };
  },

  getSellers: async () => {
    return await SellerProfile.find().populate('user', 'name email createdAt');
  },

  verifySeller: async (sellerId, isVerified) => {
    const seller = await SellerProfile.findByIdAndUpdate(
      sellerId,
      { isVerified },
      { new: true }
    );
    if (!seller) {
      const error = new Error('Seller not found');
      error.statusCode = 404;
      throw error;
    }
    return seller;
  }
};
