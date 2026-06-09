import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
    changeType: { type: String, enum: ['ADDED', 'REMOVED', 'SOLD', 'RETURNED'], required: true },
    quantityChanged: { type: Number, required: true },
  },
  { timestamps: true }
);

export const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
