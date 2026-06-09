import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxUsesPerUser: { type: Number, default: 1 },
    totalUsageLimit: { type: Number, default: null },
    currentUsageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
