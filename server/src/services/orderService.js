import { checkoutService } from './checkoutService.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { couponRepository } from '../repositories/couponRepository.js';
import { couponService } from './couponService.js';
import { Product } from '../models/Product.js';
import { eventBus } from '../utils/eventBus.js';

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

  updateOrderStatus: async (orderId, newStatus, user) => {
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
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
    
    if (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') {
      if (user.role !== 'ADMIN') {
        throw Object.assign(new Error(`Cannot change status of a ${currentStatus} order`), { statusCode: 400 });
      }
    }

    const transitionMap = {
      'PENDING': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
    };

    if (!transitionMap[currentStatus]?.includes(newStatus) && user.role !== 'ADMIN') {
      throw Object.assign(new Error(`Invalid transition from ${currentStatus} to ${newStatus}`), { statusCode: 400 });
    }

    // Role specific transition rules
    if (user.role === 'USER') {
      if (newStatus !== 'CANCELLED') {
        throw Object.assign(new Error('Customers can only cancel orders'), { statusCode: 403 });
      }
      if (currentStatus !== 'PENDING') {
        throw Object.assign(new Error('Customers can only cancel PENDING orders'), { statusCode: 400 });
      }
    }

    const updatedOrder = await orderRepository.updateOrder(orderId, {
      orderStatus: newStatus,
      $push: { statusHistory: { status: newStatus, note: `Status updated to ${newStatus} by ${user.role}` } }
    });

    eventBus.emit(`order.${newStatus.toLowerCase()}`, {
      orderId: updatedOrder._id,
      userId: updatedOrder.user,
      status: newStatus
    });

    return updatedOrder;
  }
};
