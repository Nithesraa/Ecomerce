import { checkoutService } from './checkoutService.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { couponRepository } from '../repositories/couponRepository.js';
import { couponService } from './couponService.js';
import { Product } from '../models/Product.js';

export const orderService = {
  createOrder: async (userId, shippingAddress, couponCode = null) => {
    // 1. Fetch strict, validated checkout summary
    const summary = await checkoutService.getCheckoutSummary(userId, couponCode);

    // 2. Prepare Order Data
    const orderData = {
      user: userId,
      totalAmount: summary.finalTotal,
      discountAmount: summary.discountAmount,
      couponCode: couponCode || undefined,
      shippingAddress,
      orderStatus: 'PENDING',
      statusHistory: [{ status: 'PENDING', note: 'Order placed successfully' }],
      paymentStatus: 'PENDING'
    };

    // 3. Prepare OrderItem Snapshots
    const orderItemsData = [];
    for (const item of summary.items) {
      // We need the seller reference to track vendor fulfillments later
      const product = await Product.findById(item.product).select('seller');
      
      orderItemsData.push({
        product: item.product,
        productTitle: item.productDetails.title,
        seller: product.seller,
        quantity: item.quantity,
        priceAtPurchase: item.productDetails.price
      });
    }

    // 4. Persist Order and Items atomically
    const { order, orderItems } = await orderRepository.createOrderWithItems(orderData, orderItemsData);

    // Coupon incrementing and Stock reduction will be handled by paymentService 
    // strictly AFTER the payment is successfully processed.

    return { order, orderItems };
  }
};
