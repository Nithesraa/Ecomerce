import mongoose from 'mongoose';

const browsingEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Nullable for guests
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    eventType: { type: String, enum: ['VIEW', 'ADD_TO_CART', 'PURCHASE', 'WISHLIST', 'SEARCH_CLICK'], required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

browsingEventSchema.index({ user: 1, timestamp: -1 });

export const BrowsingEvent = mongoose.model('BrowsingEvent', browsingEventSchema);
