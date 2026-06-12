import mongoose from 'mongoose';
import { stripeService } from './stripeService.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import { eventBus } from '../utils/eventBus.js';
import { sendOrderConfirmationEmail } from './emailService.js';

export const paymentService = {
  createStripeCheckoutSession: async (orderId, user) => {
    const order = await Order.findById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    if (order.paymentStatus === 'PAID') throw Object.assign(new Error('Order is already paid'), { statusCode: 400 });

    const orderItems = await OrderItem.find({ order: orderId });
    
    const session = await stripeService.createCheckoutSession(order, orderItems, user.email);
    
    return {
      checkoutUrl: session.url,
      sessionId: session.id,
      orderId: order._id
    };
  },

  processSuccessfulPayment: async (stripeSession) => {
    const orderId = stripeSession.metadata.orderId;
    const stripeSessionId = stripeSession.id;
    const stripePaymentIntentId = stripeSession.payment_intent;
    const amountTotal = stripeSession.amount_total; // in cents

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error('Order not found');
      
      // Idempotency Fast-Path Check
      if (order.paymentStatus === 'PAID') {
        await session.abortTransaction();
        session.endSession();
        return { success: true, message: 'Already processed', orderId };
      }

      // Verify Amount
      if (Math.round(order.totalAmount * 100) !== amountTotal) {
        throw new Error(`Amount mismatch: Order ${order.totalAmount} != Stripe ${amountTotal / 100}`);
      }

      // 3. Create Payment record
      try {
        await Payment.create([{
          order: orderId,
          stripeSessionId,
          stripePaymentIntentId,
          amount: order.totalAmount,
          paymentMethod: 'STRIPE',
          status: 'SUCCESS'
        }], { session });
      } catch (err) {
        if (err.code === 11000) {
          // Idempotency: duplicate payment record for this order
          await session.abortTransaction();
          session.endSession();
          return { success: true, message: 'Already processed', orderId };
        }
        throw err;
      }

      // 4 & 5. Update Order status
      order.paymentStatus = 'PAID';
      order.orderStatus = 'PROCESSING';
      order.statusHistory.push({ status: 'PROCESSING', note: 'Payment verified via Stripe webhook.' });
      await order.save({ session });

      // 6 & 7. Reduce Inventory & Log 
      const orderItems = await OrderItem.find({ order: orderId }).session(session);
      const eventsToEmit = [];
      
      for (const item of orderItems) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, returnDocument: 'after' }
        );

        if (!product) {
          throw new Error(`Product went out of stock during checkout: ${item.productTitle || item.product}`);
        }

        await InventoryLog.create([{
          product: product._id,
          seller: product.seller,
          changeType: 'SOLD',
          quantityChanged: -item.quantity
        }], { session });

        // Queue events for after transaction
        eventsToEmit.push({ event: 'seller.new_order', payload: { sellerId: product.seller, orderId, productTitle: item.productTitle, quantity: item.quantity } });
        if (product.stock === 0) {
          eventsToEmit.push({ event: 'product.out_of_stock', payload: { sellerId: product.seller, productId: product._id, title: product.title } });
        } else if (product.stock <= 5) {
          eventsToEmit.push({ event: 'product.low_stock', payload: { sellerId: product.seller, productId: product._id, title: product.title, stock: product.stock } });
        }
      }

      // 8. Increment Coupon (Only after payment succeeds)
      if (order.couponCode) {
         await Coupon.findOneAndUpdate(
           { code: { $regex: new RegExp(`^${order.couponCode}$`, 'i') } },
           { 
             $push: { usedBy: order.user },
             $inc: { currentUsageCount: 1 } 
           },
           { session }
         );
      }

      await session.commitTransaction();
      session.endSession();
      
      // Fire Domain Events after strict persistence
      eventBus.emit('order.created', { orderId, userId: order.user, totalAmount: order.totalAmount });
      eventsToEmit.forEach(e => eventBus.emit(e.event, e.payload));

      // Send Email Notification
      const userDoc = await User.findById(order.user).select('email');
      if (userDoc) {
        sendOrderConfirmationEmail(userDoc.email, order).catch(err => console.error(err));
      }

      return { success: true, orderId };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  processFailedPayment: async (stripeSession, status = 'FAILED', reason = 'Payment failed') => {
    const orderId = stripeSession.metadata?.orderId;
    if (!orderId) throw new Error('Order ID missing from metadata');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error('Order not found');

      if (order.paymentStatus === 'PAID') {
        await session.abortTransaction();
        session.endSession();
        return { success: true, message: 'Already processed successfully', orderId };
      }

      // 3. Create Failed Payment Record
      await Payment.create([{
        order: orderId,
        stripeSessionId: stripeSession.id,
        amount: order.totalAmount,
        paymentMethod: 'STRIPE',
        status: status === 'EXPIRED' ? 'EXPIRED' : 'FAILED'
      }], { session });

      // 4 & 5. Update Order Status
      order.paymentStatus = status; // FAILED or EXPIRED
      order.statusHistory.push({ status: 'PENDING', note: `Stripe webhook received: ${reason}` });
      await order.save({ session });

      // Inventory and Coupons are strictly NOT touched for failed payments.

      await session.commitTransaction();
      session.endSession();
      
      eventBus.emit('payment.failed', { orderId, userId: order.user, reason });

      return { success: false, orderId };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  processRefund: async (orderId, sessionParams = null) => {
    let session = sessionParams;
    let ownSession = false;
    if (!session) {
      session = await mongoose.startSession();
      session.startTransaction();
      ownSession = true;
    }

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error('Order not found');

      if (order.paymentStatus !== 'PAID') {
        throw new Error('Can only refund paid orders');
      }

      const payment = await Payment.findOne({ order: orderId, status: 'SUCCESS' }).session(session);
      
      if (payment && payment.paymentMethod === 'STRIPE' && payment.stripePaymentIntentId) {
        try {
          // Process actual Stripe refund
          await stripeService.refundPayment(payment.stripePaymentIntentId);
          payment.status = 'REFUNDED';
          await payment.save({ session });
        } catch (stripeErr) {
          console.error(`Stripe refund failed for order ${orderId}:`, stripeErr);
          // If refund fails (e.g. insufficient funds in test mode), throw to abort
          throw new Error('Stripe refund failed: ' + stripeErr.message);
        }
      } else if (payment && payment.paymentMethod === 'COD') {
         // COD "refund" means we just cancel it out. No API call needed.
         payment.status = 'REFUNDED';
         await payment.save({ session });
      }

      order.paymentStatus = 'REFUNDED';
      order.statusHistory.push({ status: order.orderStatus, note: 'Payment refunded' });
      await order.save({ session });

      if (ownSession) {
        await session.commitTransaction();
        session.endSession();
      }

      return { success: true };
    } catch (error) {
      if (ownSession) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }
};
