import Stripe from 'stripe';
import { env } from '../config/env.js';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // or latest
});

export const stripeService = {
  createCheckoutSession: async (order, items, customerEmail) => {
    const line_items = items.map((item) => {
      // Calculate unit_amount: if order has discount, we should apply it,
      // but Stripe checkout is simpler if we just pass the price at purchase in cents.
      // We will add a discount coupon if needed, but for simplicity, we can just use the final discounted unit price
      // or pass the original and add a global discount.
      // Since order already calculated the total, let's just make the items match the total amount exactly.
      // Best way: create line items normally, then if there's a discount, add a coupon or just pass the total correctly.
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productTitle,
            // images: item.product.images ? [item.product.images[0].url] : [],
          },
          unit_amount: Math.round(item.priceAtPurchase * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      };
    });

    const sessionConfig = {
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/checkout`,
      customer_email: customerEmail,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
      },
      line_items,
    };

    // If there is a discount, we have a few options. Easiest is to add a one-off discount if order.discountAmount > 0.
    // Stripe has API for one-off discounts via 'discounts' array pointing to a dynamic coupon.
    // Since we don't want to dynamically create Stripe coupons right now, we can just add a negative line item, 
    // or adjust the unit_amounts. Since we can't use negative line items in Stripe, if there's a coupon, 
    // it's best to create an ephemeral coupon in Stripe or just pass the exact amount total.
    // Given our `item.priceAtPurchase` already reflects the price BEFORE coupon.
    if (order.discountAmount && order.discountAmount > 0) {
      // We will create a quick coupon for the checkout session
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(order.discountAmount * 100),
        currency: 'usd',
        duration: 'once',
        name: `Discount (${order.couponCode || 'Promo'})`,
      });
      sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return session;
  },

  verifySignature: (payload, signature) => {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  },

  refundPayment: async (paymentIntentId, amountCents = null) => {
    const payload = {
      payment_intent: paymentIntentId,
    };
    if (amountCents) {
      payload.amount = amountCents;
    }
    const refund = await stripe.refunds.create(payload);
    return refund;
  }
};
