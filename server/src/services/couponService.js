import { couponRepository } from '../repositories/couponRepository.js';

export const couponService = {
  applyCoupon: async (code, userId, cartTotal) => {
    // 1. Validate coupon existence
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw Object.assign(new Error('Invalid coupon code'), { statusCode: 404 });
    }

    // 2. Validate isActive
    if (!coupon.isActive) {
      throw Object.assign(new Error('This coupon is currently inactive'), { statusCode: 400 });
    }

    // 3. Validate expiry date
    if (new Date() > new Date(coupon.validUntil)) {
      throw Object.assign(new Error('This coupon has expired'), { statusCode: 400 });
    }

    // 4. Validate minOrderValue
    if (cartTotal < coupon.minOrderValue) {
      throw Object.assign(new Error(`A minimum order value of $${coupon.minOrderValue} is required to use this coupon`), { statusCode: 400 });
    }

    // 5. Validate maxUsesPerUser
    const userUsesCount = coupon.usedBy.filter(id => id.toString() === userId.toString()).length;
    if (userUsesCount >= coupon.maxUsesPerUser) {
      throw Object.assign(new Error('You have already reached the maximum usage limit for this coupon'), { statusCode: 400 });
    }

    // 6. Validate totalUsageLimit
    if (coupon.totalUsageLimit !== null && coupon.currentUsageCount >= coupon.totalUsageLimit) {
      throw Object.assign(new Error('This coupon has reached its maximum global usage limit'), { statusCode: 400 });
    }

    // 7. Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    }

    // Ensure the discount never exceeds the cart total itself
    discountAmount = Math.min(discountAmount, cartTotal);
    
    // Round to 2 decimal places to prevent floating point anomalies
    discountAmount = Number(discountAmount.toFixed(2));
    const finalTotal = Number((cartTotal - discountAmount).toFixed(2));

    return {
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalTotal
    };
  }
};
