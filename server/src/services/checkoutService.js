import { cartService } from './cartService.js';
import { couponService } from './couponService.js';
import { cartRepository } from '../repositories/cartRepository.js';

export const checkoutService = {
  getCheckoutSummary: async (userId, couponCode = null) => {
    // 1. Fetch raw cart to compare against validated state
    const rawCart = await cartRepository.getCart(userId);

    // 2. Fetch and hydrate the cart.
    // cartService.getCart() automatically validates ACTIVE status, soft deletes, 
    // stock availability, and recalculates current prices.
    const cart = await cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw Object.assign(new Error('Your cart is empty.'), { statusCode: 400 });
    }

    // 3, 4. Validate if any products were completely removed (INACTIVE, soft deleted, or 0 stock)
    if (rawCart.items.length !== cart.items.length) {
      throw Object.assign(new Error('Some items in your cart are no longer available. Your cart has been automatically updated.'), { statusCode: 400 });
    }

    // 5. Validate stock availability (check if quantity was capped by hydration)
    for (const validItem of cart.items) {
      const rawItem = rawCart.items.find(
        (ri) => ri.product.toString() === validItem.product.toString() && (ri.variantId || null) === (validItem.variantId || null)
      );
      
      if (rawItem && rawItem.quantity !== validItem.quantity) {
        throw Object.assign(
          new Error(`Stock limited for ${validItem.productDetails.title}. Quantity adjusted to ${validItem.quantity}. Please review your cart.`),
          { statusCode: 400 }
        );
      }
    }

    // 6. Subtotal is the dynamically recalculated price from cartService
    const subtotal = cart.totalAmount;
    let discountAmount = 0;
    let finalTotal = subtotal;

    // 7. Apply optional coupon
    if (couponCode) {
      const couponResult = await couponService.applyCoupon(couponCode, userId, subtotal);
      discountAmount = couponResult.discountAmount;
      finalTotal = couponResult.finalTotal;
    }

    // 8. Generate checkout summary
    return {
      subtotal,
      discountAmount,
      finalTotal,
      items: cart.items
    };
  }
};
