import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  color: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  price: { type: Number }, // Optional override for variant specific price
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    variants: [variantSchema],
    tags: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED'], 
      default: 'DRAFT' 
    },
  },
  { timestamps: true }
);

// Text indexes for search functionality
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Index tags array specifically
productSchema.index({ tags: 1 });
// Additional Performance Indexes
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ averageRating: -1 });

export const Product = mongoose.model('Product', productSchema);
