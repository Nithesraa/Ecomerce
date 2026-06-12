import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String }, // Optional, if product has variants
  quantity: { type: Number, required: true, min: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
    recoveryEmailSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', cartSchema);
