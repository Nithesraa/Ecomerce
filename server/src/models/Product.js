import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String },
  color: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  price: { type: Number }, // Optional override for variant specific price
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    stock: { type: Number, default: 0 },
    variants: [variantSchema],
    tags: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ratingDistribution: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED'],
      default: 'DRAFT',
    },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    approvalInfo: {
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      rejectionReason: { type: String },
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
productSchema.index({ status: 1, category: 1 });
productSchema.index({ status: 1, isDeleted: 1 });
productSchema.index({ status: 1, category: 1, isDeleted: 1 });

export const Product = mongoose.model('Product', productSchema);
