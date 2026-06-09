import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productTitle: { type: String, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true },
    fulfillmentStatus: { type: String, enum: ['PENDING', 'PACKED', 'SHIPPED', 'DELIVERED'], default: 'PENDING' },
  },
  { timestamps: true }
);

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
