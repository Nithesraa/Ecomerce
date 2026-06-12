import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { Product } from '../models/Product.js';

export const orderRepository = {
  createOrderWithItems: async (orderData, orderItemsData) => {
    // We use a MongoDB transaction to ensure the Order and all its Items are created atomically
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Atomically decrement stock for all items
      for (const item of orderItemsData) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        if (!updatedProduct) {
          throw new Error(`Insufficient stock or product not found for ID: ${item.product}`);
        }
      }

      // 2. Create the master order record
      const [order] = await Order.create([orderData], { session });
      
      // 3. Attach the generated Order ID to every OrderItem snapshot
      const itemsWithOrderId = orderItemsData.map(item => ({
        ...item,
        order: order._id
      }));
      
      // 4. Bulk insert the OrderItems
      const orderItems = await OrderItem.insertMany(itemsWithOrderId, { session });
      
      // 5. Commit if everything succeeds
      await session.commitTransaction();
      session.endSession();
      
      return { order, orderItems };
    } catch (error) {
      // Abort completely if any insertion fails
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  find: async (query, options = {}) => {
    return Order.find(query).skip(options.skip || 0).limit(options.limit || 0).sort(options.sort);
  },

  count: async (query) => {
    return Order.countDocuments(query);
  },

  findById: async (id) => {
    return Order.findById(id);
  },

  findOrderItems: async (query, options = {}) => {
    return OrderItem.find(query).sort(options.sort).populate('product');
  },

  updateOrder: async (id, updateData) => {
    return Order.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
  }
};
