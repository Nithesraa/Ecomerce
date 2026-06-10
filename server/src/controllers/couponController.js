import { couponService } from '../services/couponService.js';

export const couponController = {
  /**
   * Create a new coupon.
   * Admin only.
   */
  create: async (req, res, next) => {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve all coupons.
   * Admin only.
   */
  getAll: async (req, res, next) => {
    try {
      const coupons = await couponService.getCoupons();
      res.status(200).json({
        success: true,
        message: 'Coupons retrieved successfully',
        data: coupons
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieve a single coupon by ID.
   * Admin only.
   */
  getById: async (req, res, next) => {
    try {
      const coupon = await couponService.getCouponById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Coupon retrieved successfully',
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a coupon by ID.
   * Admin only.
   */
  update: async (req, res, next) => {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a coupon by ID.
   * Admin only.
   */
  delete: async (req, res, next) => {
    try {
      await couponService.deleteCoupon(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
};
