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
  }
};
