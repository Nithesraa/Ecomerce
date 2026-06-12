import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';

const ratingWords = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five'
};

export const reviewService = {
  checkEligibility: async (productId, userId) => {
    const deliveredOrders = await Order.find({ user: userId, orderStatus: 'DELIVERED' }).select('_id');
    if (!deliveredOrders.length) return false;
    
    const orderIds = deliveredOrders.map(o => o._id);
    const hasPurchased = await OrderItem.exists({ order: { $in: orderIds }, product: productId });
    
    if (!hasPurchased) return false;
    
    // Check if they already reviewed
    const existingReview = await Review.exists({ product: productId, user: userId });
    if (existingReview) return false; // Not eligible to create a NEW review, though they can edit
    
    return true;
  },

  addReview: async (productId, userId, rating, comment) => {
    // 1. Verify Purchase (Only Delivered Orders)
    const deliveredOrders = await Order.find({ user: userId, orderStatus: 'DELIVERED' }).select('_id');
    const orderIds = deliveredOrders.map(o => o._id);
    
    const hasPurchased = await OrderItem.exists({ order: { $in: orderIds }, product: productId });
    
    if (!hasPurchased) {
      const error = new Error('You can only review products that have been delivered to you.');
      error.statusCode = 403;
      throw error;
    }

    // 2. Prevent Duplicate Reviews natively via atomic update to catch duplicate early
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      const error = new Error('You have already reviewed this product. You can update your existing review.');
      error.statusCode = 400;
      throw error;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 3. Create Review
      const review = await Review.create([{
        product: productId,
        user: userId,
        rating,
        comment,
        isVerifiedPurchase: true
      }], { session });

      // 4. Update Product incrementally
      const ratingKey = `ratingDistribution.${ratingWords[rating]}`;
      
      const product = await Product.findById(productId).session(session);
      if (!product) throw new Error('Product not found');

      const oldAvg = product.averageRating || 0;
      const oldCount = product.reviewCount || 0;
      
      const newCount = oldCount + 1;
      const newAvg = ((oldAvg * oldCount) + rating) / newCount;

      await Product.findByIdAndUpdate(productId, {
        $set: { averageRating: Number(newAvg.toFixed(1)), reviewCount: newCount },
        $inc: { [ratingKey]: 1 }
      }, { session });

      await session.commitTransaction();
      session.endSession();
      
      return review[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  updateReview: async (reviewId, userId, rating, comment) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingReview = await Review.findOne({ _id: reviewId, user: userId }).session(session);
      if (!existingReview) {
        const err = new Error('Review not found or unauthorized');
        err.statusCode = 404;
        throw err;
      }

      const oldRating = existingReview.rating;
      
      // Update review
      if (rating !== undefined) existingReview.rating = rating;
      if (comment !== undefined) existingReview.comment = comment;
      
      await existingReview.save({ session });

      // If rating changed, incrementally adjust Product stats
      if (rating !== undefined && rating !== oldRating) {
        const product = await Product.findById(existingReview.product).session(session);
        
        const count = product.reviewCount || 1;
        const currentSum = (product.averageRating || 0) * count;
        const newSum = currentSum - oldRating + rating;
        const newAvg = newSum / count;

        const oldKey = `ratingDistribution.${ratingWords[oldRating]}`;
        const newKey = `ratingDistribution.${ratingWords[rating]}`;

        await Product.findByIdAndUpdate(existingReview.product, {
          $set: { averageRating: Number(newAvg.toFixed(1)) },
          $inc: { [oldKey]: -1, [newKey]: 1 }
        }, { session });
      }

      await session.commitTransaction();
      session.endSession();
      
      return existingReview;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  deleteReview: async (reviewId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const review = await Review.findOne({ _id: reviewId, user: userId }).session(session);
      if (!review) {
        const err = new Error('Review not found or unauthorized');
        err.statusCode = 404;
        throw err;
      }

      await Review.deleteOne({ _id: reviewId }).session(session);

      // Decrement product stats
      const product = await Product.findById(review.product).session(session);
      
      const oldCount = product.reviewCount || 1;
      const newCount = Math.max(0, oldCount - 1);
      
      let newAvg = 0;
      if (newCount > 0) {
        const currentSum = (product.averageRating || 0) * oldCount;
        newAvg = (currentSum - review.rating) / newCount;
      }

      const ratingKey = `ratingDistribution.${ratingWords[review.rating]}`;

      await Product.findByIdAndUpdate(review.product, {
        $set: { averageRating: Number(newAvg.toFixed(1)), reviewCount: newCount },
        $inc: { [ratingKey]: -1 }
      }, { session });

      await session.commitTransaction();
      session.endSession();
      
      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  getReviewsByProduct: async (productId, page = 1, limit = 10, sort = 'newest') => {
    const skip = (page - 1) * limit;
    
    let sortQuery = { createdAt: -1 };
    if (sort === 'highest') sortQuery = { rating: -1, createdAt: -1 };
    else if (sort === 'lowest') sortQuery = { rating: 1, createdAt: -1 };

    const reviews = await Review.find({ product: productId })
      .populate('user', 'firstName lastName avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    return {
      reviews,
      page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    };
  }
};
