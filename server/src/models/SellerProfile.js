import mongoose from 'mongoose';

const sellerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
    storeName: { type: String, required: true, unique: true },
    businessEmail: { type: String, required: true },
    description: { type: String },
    gstNumber: { type: String },
    isVerified: { type: Boolean, default: false }, // Requires admin approval
  },
  { timestamps: true }
);

export const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema);
