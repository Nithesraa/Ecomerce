import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { eventBus } from '../utils/eventBus.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust in production
      methods: ['GET', 'POST']
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: Token missing'));

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded; // Attach user info
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket;
    
    // Join Rooms based on Role
    socket.join(`user:${user._id}`);
    
    if (user.role === 'SELLER' && user.sellerProfileId) {
      socket.join(`seller:${user.sellerProfileId}`);
    }
    
    if (user.role === 'ADMIN') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      // Automatic room cleanup handled by Socket.io
    });
  });

  // Event Bus Subscribers
  // Map internal domain events to Socket.IO broadcasts
  
  // -- ORDER EVENTS --
  eventBus.on('order.created', (payload) => {
    // Notify Customer
    io.to(`user:${payload.userId}`).emit('order.created', payload);
    // Notify Admin
    io.to('admin').emit('order_created', payload);
  });

  eventBus.on('order.processing', (payload) => {
    io.to(`user:${payload.userId}`).emit('order.processing', payload);
  });

  eventBus.on('order.shipped', (payload) => {
    io.to(`user:${payload.userId}`).emit('order.shipped', payload);
  });

  eventBus.on('order.delivered', (payload) => {
    io.to(`user:${payload.userId}`).emit('order.delivered', payload);
  });

  eventBus.on('order.cancelled', (payload) => {
    io.to(`user:${payload.userId}`).emit('order.cancelled', payload);
  });

  // -- SELLER NOTIFICATIONS --
  eventBus.on('seller.new_order', (payload) => {
    io.to(`seller:${payload.sellerId}`).emit('new_order', payload);
  });

  eventBus.on('product.low_stock', (payload) => {
    io.to(`seller:${payload.sellerId}`).emit('low_stock', payload);
    io.to('admin').emit('low_stock_alert', payload);
  });

  eventBus.on('product.out_of_stock', (payload) => {
    io.to(`seller:${payload.sellerId}`).emit('product_out_of_stock', payload);
  });

  // -- ADMIN EVENTS --
  eventBus.on('payment.failed', (payload) => {
    io.to('admin').emit('payment_failed', payload);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
