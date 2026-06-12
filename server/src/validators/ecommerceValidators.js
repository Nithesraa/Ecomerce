import { z } from 'zod';
import { objectIdSchema } from '../middlewares/validateRequest.js';

// --- Params ---
export const idParamSchema = z.object({
  params: z.object({ id: objectIdSchema })
});

// --- Cart ---
export const addToCartSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    quantity: z.number().int().positive('Quantity must be greater than zero'),
    variantId: objectIdSchema.optional().nullable()
  }).strict()
});

export const updateCartSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    variantId: objectIdSchema.optional().nullable()
  }).strict(),
  params: z.object({
    productId: objectIdSchema
  })
});

export const removeFromCartSchema = z.object({
  params: z.object({
    productId: objectIdSchema
  }),
  body: z.object({
    variantId: objectIdSchema.optional().nullable()
  }).strict().optional()
});

// --- Wishlist ---
export const toggleWishlistSchema = z.object({
  body: z.object({
    productId: objectIdSchema
  }).strict()
});

export const removeFromWishlistSchema = z.object({
  params: z.object({
    productId: objectIdSchema
  })
});

// --- Checkout ---
export const checkoutSummarySchema = z.object({
  body: z.object({
    couponCode: z.string().trim().toUpperCase().optional()
  }).strict().optional()
});

// --- Order ---
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      country: z.string().min(1, 'Country is required'),
      zipCode: z.string().min(1, 'ZipCode is required')
    }).strict(),
    couponCode: z.string().trim().toUpperCase().optional(),
    paymentMethod: z.enum(['STRIPE', 'COD']).default('STRIPE')
  }).strict()
});

// --- Payment ---
export const couponUsageSchema = z.object({
  body: z.object({
    userId: objectIdSchema
  }).strict()
});

// --- Reviews ---
export const createReviewSchema = z.object({
  params: z.object({
    productId: objectIdSchema
  }),
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().max(1000, 'Comment is too long').optional()
  }).strict()
});

export const updateReviewSchema = z.object({
  params: z.object({
    reviewId: objectIdSchema
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(1000).optional()
  }).strict()
});

export const paymentInitSchema = z.object({
  body: z.object({
    orderId: objectIdSchema
  }).strict()
});

// --- Coupon ---
export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().toUpperCase().min(3),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minOrderValue: z.number().nonnegative().default(0),
    validUntil: z.string().datetime(),
    isActive: z.boolean().default(true),
    maxUsesPerUser: z.number().int().positive().default(1),
    totalUsageLimit: z.number().int().positive().nullable().optional()
  }).strict()
});

export const updateCouponSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    code: z.string().trim().toUpperCase().min(3).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().positive().optional(),
    minOrderValue: z.number().nonnegative().optional(),
    validUntil: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
    maxUsesPerUser: z.number().int().positive().optional(),
    totalUsageLimit: z.number().int().positive().nullable().optional()
  }).strict()
});

// --- Category ---
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    parent: objectIdSchema.optional()
  }).strict()
});

export const updateCategorySchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    parent: objectIdSchema.optional()
  }).strict()
});

// --- Product ---
export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    price: z.coerce.number().positive(),
    category: objectIdSchema,
    stock: z.coerce.number().int().nonnegative().default(0),
    tags: z.array(z.string()).optional(),
    status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED']).optional(),
    discountPercentage: z.coerce.number().min(0).max(100).optional()
  }).passthrough()
});

export const updateProductSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.coerce.number().positive().optional(),
    category: objectIdSchema.optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED']).optional(),
    discountPercentage: z.coerce.number().min(0).max(100).optional()
  }).passthrough()
});
