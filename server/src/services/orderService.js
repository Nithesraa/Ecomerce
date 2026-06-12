import mongoose from 'mongoose';
import { checkoutService } from './checkoutService.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { couponRepository } from '../repositories/couponRepository.js';
import { couponService } from './couponService.js';
import { Product } from '../models/Product.js';
import { eventBus } from '../utils/eventBus.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { OrderItem } from '../models/OrderItem.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from './emailService.js';
import { paymentService } from './paymentService.js';

export const orderService = {
  createOrder: async (userId, shippingAddress, couponCode = null, paymentMethod = 'STRIPE') => {
    // 1. Fetch strict, validated checkout summary
    const summary = await checkoutService.getCheckoutSummary(userId, couponCode);

    const isCOD = paymentMethod === 'COD';

    // 2. Prepare Order Data
    const orderData = {
      user: userId,
      totalAmount: summary.finalTotal,
      discountAmount: summary.discountAmount,
      couponCode: couponCode || undefined,
      shippingAddress,
      orderStatus: isCOD ? 'PROCESSING' : 'PENDING',
      statusHistory: [
        { status: 'PENDING', note: 'Order placed successfully' },
        ...(isCOD ? [{ status: 'PROCESSING', note: 'COD Order created and processing' }] : [])
      ],
      paymentStatus: 'PENDING'
    };

    // 3. Prepare OrderItem Snapshots
    const orderItemsData = [];
    for (const item of summary.items) {
      // We need the seller reference to track vendor fulfillments later
      const product = await Product.findById(item.product._id || item.product).select('seller');
      
      orderItemsData.push({
        product: item.product._id || item.product,
        productTitle: item.product.title,
        seller: product.seller,
        quantity: item.quantity,
        priceAtPurchase: item.price
      });
    }

    // 4. Persist Order and Items atomically
    const session = await mongoose.startSession();
    session.startTransaction();

    let order, orderItems;
    try {
      // Create Order and Items manually instead of orderRepository.createOrderWithItems to keep it in same session
      [order] = await Order.create([orderData], { session });
      
      const itemsToCreate = orderItemsData.map(item => ({ ...item, order: order._id }));
      orderItems = await OrderItem.create(itemsToCreate, { session });

      // 5. Decrement Stock immediately if COD
      if (isCOD) {
        for (const item of orderItems) {
          const product = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session, returnDocument: 'after' }
          );
          if (!product) {
            throw new Error(`Product went out of stock: ${item.productTitle}`);
          }
        }
      }

      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

    // 6. Clear Cart
    await cartRepository.clearCart(userId);

    // 7. Update Coupon Usage if applied
    if (couponCode) {
      await couponRepository.updateUsage(couponCode, userId);
    }

    // 8. Create Payment Record if COD
    if (isCOD) {
      await Payment.create({
        order: order._id,
        amount: order.totalAmount,
        paymentMethod: 'COD',
        status: 'PENDING'
      });

      // Send Email Notification
      const userDoc = await User.findById(userId).select('email');
      if (userDoc) {
        sendOrderConfirmationEmail(userDoc.email, order).catch(err => console.error(err));
      }
    }

    return { order, orderItems };
  },

  getMyOrders: async (userId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderRepository.find({ user: userId }, { skip, limit, sort: { createdAt: -1 } }),
      orderRepository.count({ user: userId })
    ]);

    return { orders, total, page, limit };
  },

  getAllOrders: async (options = {}) => {
    const { page = 1, limit = 10, status, paymentStatus, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      orderRepository.find(query, { skip, limit, sort: { createdAt: -1 } }),
      orderRepository.count(query)
    ]);

    return { orders, total, page, limit };
  },

  getOrderById: async (orderId, user) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

    // Validate ownership
    if (order.user.toString() !== user._id.toString() && user.role !== 'ADMIN') {
      // Sellers can also view if they have items in this order
      if (user.role === 'SELLER') {
        const sellerId = user.sellerProfileId || user._id; // Depending on how sellerId is stored
        const items = await orderRepository.findOrderItems({ order: orderId, seller: sellerId });
        if (items.length === 0) {
          throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
        }
      } else {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
      }
    }

    const items = await orderRepository.findOrderItems({ order: orderId });
    return { order, items };
  },

  getSellerOrders: async (sellerId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // A seller's orders are those which contain OrderItems associated with their sellerId
    const items = await orderRepository.findOrderItems({ seller: sellerId }, { sort: { createdAt: -1 } });
    
    // We can group by order or just return the items. Usually sellers see "Order Items" to fulfill.
    // Let's just return the items for the seller, or unique orders.
    // For simplicity, finding unique order IDs:
    const orderIds = [...new Set(items.map(item => item.order.toString()))];
    
    // Manual pagination on orderIds
    const paginatedOrderIds = orderIds.slice(skip, skip + limit);
    const orders = await orderRepository.find({ _id: { $in: paginatedOrderIds } }, { sort: { createdAt: -1 } });

    return { orders, total: orderIds.length, page, limit };
  },

  getSellerOrderItems: async (sellerId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // We populate the 'order' field to get buyer details, and 'product' to get images.
    const [orderItems, total] = await Promise.all([
      OrderItem.find({ seller: sellerId })
        .populate('order', 'user shippingAddress orderStatus createdAt')
        .populate({ path: 'order', populate: { path: 'user', select: 'name email' } })
        .populate('product', 'images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderItem.countDocuments({ seller: sellerId })
    ]);

    return { orderItems, total, page, limit };
  },

  updateOrderItemStatus: async (orderItemId, newStatus, sellerId) => {
    const validStatuses = ['PENDING', 'PACKED', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(newStatus)) {
      throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
    }

    const orderItem = await OrderItem.findOne({ _id: orderItemId, seller: sellerId });
    if (!orderItem) {
      throw Object.assign(new Error('Order item not found or unauthorized'), { statusCode: 404 });
    }

    orderItem.fulfillmentStatus = newStatus;
    await orderItem.save();
    return orderItem;
  },

  updateOrderStatus: async (orderId, newStatus, user) => {
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'];
    if (!validStatuses.includes(newStatus)) {
      throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
    }

    const order = await orderRepository.findById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

    // Determine ownership/role capability FIRST (Security Best Practice)
    if (user.role === 'USER') {
      if (order.user.toString() !== user._id.toString()) {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
      }
    } else if (user.role === 'SELLER') {
      const sellerId = user.sellerProfileId || user._id;
      const items = await orderRepository.findOrderItems({ order: orderId, seller: sellerId });
      if (items.length === 0) {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
      }
    } else if (user.role !== 'ADMIN') {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }

    // Validate Status Transitions
    const currentStatus = order.orderStatus;
    
    if (currentStatus === 'CANCELLED' || currentStatus === 'RETURNED') {
      throw Object.assign(new Error(`Cannot change status of a ${currentStatus} order`), { statusCode: 400 });
    }

    const transitionMap = {
      'PENDING': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': ['RETURN_REQUESTED'],
      'RETURN_REQUESTED': ['RETURNED', 'DELIVERED'] // DELIVERED implies return rejected
    };

    if (!transitionMap[currentStatus]?.includes(newStatus) && user.role !== 'ADMIN') {
      throw Object.assign(new Error(`Invalid transition from ${currentStatus} to ${newStatus}`), { statusCode: 400 });
    }

    // Role specific transition rules
    if (user.role === 'USER') {
      if (newStatus === 'CANCELLED') {
        if (!['PENDING', 'PROCESSING'].includes(currentStatus)) {
          throw Object.assign(new Error('Customers can only cancel PENDING or PROCESSING orders'), { statusCode: 400 });
        }
      } else if (newStatus === 'RETURN_REQUESTED') {
        if (currentStatus !== 'DELIVERED') {
          throw Object.assign(new Error('Can only request return for DELIVERED orders'), { statusCode: 400 });
        }
      } else {
        throw Object.assign(new Error('Customers can only cancel or request returns'), { statusCode: 403 });
      }
    }

    // If cancelling or returning, handle Refund & Restock
    if (newStatus === 'CANCELLED' || newStatus === 'RETURNED') {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        if (order.paymentStatus === 'PAID') {
          await paymentService.processRefund(order._id, session);
        }
        
        const paymentRecord = await Payment.findOne({ order: orderId }).session(session);
        const isCOD = paymentRecord && paymentRecord.paymentMethod === 'COD';

        // Only restock if it was paid (Stripe) OR was COD (we decremented at creation)
        if (order.paymentStatus === 'PAID' || isCOD) {
          const items = await orderRepository.findOrderItems({ order: orderId }).session(session);
          for (const item of items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.quantity } },
              { session }
            );
            item.fulfillmentStatus = newStatus;
            await item.save({ session });
          }
        }
        
        await session.commitTransaction();
        session.endSession();
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
      }
    }

    const updateData = {
      orderStatus: newStatus,
      $push: { statusHistory: { status: newStatus, note: `Status updated to ${newStatus} by ${user.role}` } }
    };

    if (newStatus === 'DELIVERED' && order.paymentStatus === 'PENDING') {
      updateData.paymentStatus = 'PAID';
      
      // Update Payment document
      const payment = await Payment.findOne({ order: orderId });
      if (payment) {
        payment.status = 'SUCCESS';
        await payment.save();
      }
    }

    const updatedOrder = await orderRepository.updateOrder(orderId, updateData);

    eventBus.emit(`order.${newStatus.toLowerCase()}`, {
      orderId: updatedOrder._id,
      userId: updatedOrder.user,
      status: newStatus
    });

    if (newStatus === 'SHIPPED') {
      const userDoc = await User.findById(updatedOrder.user).select('email');
      if (userDoc) {
        sendOrderShippedEmail(userDoc.email, updatedOrder).catch(err => console.error(err));
      }
    }

    return updatedOrder;
  }
};
