import mongoose from 'mongoose';
import { razorpayService } from './razorpayService.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { Coupon } from '../models/Coupon.js';

export const paymentService = {
  initializePayment: async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    if (order.paymentStatus === 'PAID') throw Object.assign(new Error('Order is already paid'), { statusCode: 400 });

    const razorpayOrder = await razorpayService.createRazorpayOrder(order.totalAmount, orderId);
    
    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id
    };
  },

  processSuccessfulPayment: async (orderId, razorpayOrderId, razorpayPaymentId, signature, paymentMethod = 'RAZORPAY') => {
    // 2. Verify signature
    const isValid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
    if (!isValid) {
      throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 });
    }

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

      // 3. Create Payment record
      try {
        await Payment.create([{
          order: orderId,
          razorpayOrderId,
          razorpayPaymentId,
          amount: order.totalAmount,
          paymentMethod,
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
      order.statusHistory.push({ status: 'PROCESSING', note: 'Payment verified successfully.' });
      await order.save({ session });

      // 6 & 7. Reduce Inventory & Log 
      const orderItems = await OrderItem.find({ order: orderId }).session(session);
      
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
      
      return { success: true, orderId };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  processFailedPayment: async (orderId, razorpayOrderId, razorpayPaymentId, errorReason) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error('Order not found');

      // 3. Create Failed Payment Record
      await Payment.create([{
        order: orderId,
        razorpayOrderId,
        razorpayPaymentId,
        amount: order.totalAmount,
        paymentMethod: 'RAZORPAY',
        status: 'FAILED'
      }], { session });

      // 4 & 5. Update Order Status
      order.paymentStatus = 'FAILED';
      order.statusHistory.push({ status: 'PENDING', note: `Payment failed: ${errorReason || 'User dropped from checkout'}` });
      await order.save({ session });

      // Inventory and Coupons are strictly NOT touched for failed payments.

      await session.commitTransaction();
      session.endSession();
      
      return { success: false, orderId };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
};
