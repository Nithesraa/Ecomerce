import { reviewService } from '../services/reviewService.js';

export const reviewController = {
  addReview: async (req, res, next) => {
    try {
      const { rating, comment } = req.body;
      const { productId } = req.params;
      const userId = req.user._id;

      const review = await reviewService.addReview(productId, userId, rating, comment);
      res.status(201).json({ success: true, data: review, message: 'Review added successfully' });
    } catch (error) {
      next(error);
    }
  },

  updateReview: async (req, res, next) => {
    try {
      const { rating, comment } = req.body;
      const { reviewId } = req.params;
      const userId = req.user._id;

      const review = await reviewService.updateReview(reviewId, userId, rating, comment);
      res.status(200).json({ success: true, data: review, message: 'Review updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  deleteReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;

      await reviewService.deleteReview(reviewId, userId);
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  getReviews: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sort = req.query.sort || 'newest';

      const data = await reviewService.getReviewsByProduct(productId, page, limit, sort);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  checkEligibility: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;
      const isEligible = await reviewService.checkEligibility(productId, userId);
      res.status(200).json({ success: true, data: { isEligible } });
    } catch (error) {
      next(error);
    }
  }
};
