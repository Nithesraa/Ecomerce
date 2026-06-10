import http from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { eventBus } from './src/utils/eventBus.js';
import { initSocket } from './src/socket/index.js';

function createToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

async function runTests() {
  console.log('🚀 Starting Test Socket Server...');
  const httpServer = http.createServer();
  initSocket(httpServer);
  
  await new Promise(resolve => httpServer.listen(0, resolve));
  const port = httpServer.address().port;
  console.log(`Server listening on port ${port}`);

  // Create Mock Users
  const userA = { _id: new mongoose.Types.ObjectId().toString(), role: 'USER' };
  const userB = { _id: new mongoose.Types.ObjectId().toString(), role: 'USER' };
  const sellerA = { _id: new mongoose.Types.ObjectId().toString(), role: 'SELLER', sellerProfileId: new mongoose.Types.ObjectId().toString() };
  const admin = { _id: new mongoose.Types.ObjectId().toString(), role: 'ADMIN' };

  // Connect Clients
  const connectClient = (user) => {
    return new Promise((resolve) => {
      const socket = Client(`http://localhost:${port}`, {
        auth: { token: createToken(user) }
      });
      socket.on('connect', () => resolve(socket));
    });
  };

  const clientUserA = await connectClient(userA);
  const clientUserB = await connectClient(userB);
  const clientSellerA = await connectClient(sellerA);
  const clientAdmin = await connectClient(admin);

  console.log('🔌 All clients connected and authenticated.');

  console.log('\n=======================================');
  console.log('📡 REAL-TIME EVENT BUS VERIFICATION');
  console.log('=======================================');

  let passed = true;

  // 1. Order Status Updates & Room Isolation
  console.log('\n[1] Emitting order.shipped for User A...');
  const orderPayload = { orderId: '123', userId: userA._id, status: 'SHIPPED' };
  
  let userBReceived = false;
  clientUserB.on('order.shipped', () => { userBReceived = true; });

  const userAReceived = await new Promise((resolve) => {
    clientUserA.on('order.shipped', (data) => resolve(data));
    eventBus.emit('order.shipped', orderPayload);
  });

  if (userAReceived.orderId === '123') console.log('✅ User A received order.shipped successfully.');
  else { passed = false; console.error('❌ User A failed to receive event'); }

  // Give a small buffer for User B to fail if isolation is broken
  await new Promise(r => setTimeout(r, 100));
  if (!userBReceived) console.log('✅ User B did NOT receive User A\'s event (Room Isolation works).');
  else { passed = false; console.error('❌ User B received User A\'s event!'); }

  // 2. Seller New Order Notification
  console.log('\n[2] Emitting seller.new_order for Seller A...');
  const sellerPayload = { sellerId: sellerA.sellerProfileId, orderId: '456' };
  
  const sellerAReceived = await new Promise((resolve) => {
    clientSellerA.on('new_order', (data) => resolve(data));
    eventBus.emit('seller.new_order', sellerPayload);
  });

  if (sellerAReceived.orderId === '456') console.log('✅ Seller A received new_order successfully.');
  else { passed = false; console.error('❌ Seller A failed to receive event'); }

  // 3. Low Stock Alert (Seller & Admin should receive it)
  console.log('\n[3] Emitting product.low_stock...');
  const lowStockPayload = { sellerId: sellerA.sellerProfileId, productId: '789', stock: 2 };
  
  let adminReceivedLowStock = false;
  clientAdmin.on('low_stock_alert', (data) => {
    if (data.productId === '789') adminReceivedLowStock = true;
  });

  const sellerAReceivedLowStock = await new Promise((resolve) => {
    clientSellerA.on('low_stock', (data) => resolve(data));
    eventBus.emit('product.low_stock', lowStockPayload);
  });

  await new Promise(r => setTimeout(r, 100)); // wait for admin event to process

  if (sellerAReceivedLowStock.productId === '789') console.log('✅ Seller A received low_stock alert.');
  else { passed = false; console.error('❌ Seller A failed to receive low stock alert'); }

  if (adminReceivedLowStock) console.log('✅ Admin received global low_stock_alert successfully.');
  else { passed = false; console.error('❌ Admin failed to receive global low stock alert'); }

  // 4. Admin Global Order Notifications
  console.log('\n[4] Emitting order.created...');
  const globalOrderPayload = { orderId: '000', userId: userB._id, totalAmount: 1000 };
  
  const adminReceivedOrder = await new Promise((resolve) => {
    clientAdmin.on('order_created', (data) => resolve(data));
    eventBus.emit('order.created', globalOrderPayload);
  });

  if (adminReceivedOrder.orderId === '000') console.log('✅ Admin received order_created successfully.');
  else { passed = false; console.error('❌ Admin failed to receive global order event'); }

  if (passed) {
    console.log('\n✨ All Real-Time Event Verifications Passed!');
  } else {
    console.log('\n❌ Real-Time Verifications Failed!');
  }

  // Cleanup
  clientUserA.disconnect();
  clientUserB.disconnect();
  clientSellerA.disconnect();
  clientAdmin.disconnect();
  httpServer.close();
  process.exit(passed ? 0 : 1);
}

runTests().catch(console.error);
