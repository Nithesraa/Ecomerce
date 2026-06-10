import { Coupon } from '../models/Coupon.js';

export const couponRepository = {
  findByCode: async (code) => {
    // Treat coupon codes case-insensitively for better UX
    return Coupon.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') } });
  },

  recordUsage: async (couponId, userId) => {
    return Coupon.findByIdAndUpdate(
      couponId,
      {
        $push: { usedBy: userId },
        $inc: { currentUsageCount: 1 }
      },
      { returnDocument: 'after' }
    );
  },

  create: async (data) => {
    return Coupon.create(data);
  },

  findAll: async () => {
    return Coupon.find().sort({ createdAt: -1 });
  },

  findById: async (id) => {
    return Coupon.findById(id);
  },

  update: async (id, data) => {
    return Coupon.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  },

  delete: async (id) => {
    return Coupon.findByIdAndDelete(id);
  }
};
