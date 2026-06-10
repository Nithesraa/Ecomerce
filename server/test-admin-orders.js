import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { orderService } from './src/services/orderService.js';
import { Order } from './src/models/Order.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI);

  const adminUser = { _id: new mongoose.Types.ObjectId(), role: 'ADMIN' };
  const customerUser = { _id: new mongoose.Types.ObjectId(), role: 'USER' };

  console.log('\n📦 Setting up Mock Admin Order Data...');
  
  // Create 3 orders with different statuses
  const o1 = await Order.create({
    user: new mongoose.Types.ObjectId(),
    shippingAddress: { street: '1', city: '1', state: '1', country: '1', zipCode: '1' },
    totalAmount: 100,
    orderStatus: 'PENDING',
    paymentStatus: 'PAID'
  });

  const o2 = await Order.create({
    user: new mongoose.Types.ObjectId(),
    shippingAddress: { street: '1', city: '1', state: '1', country: '1', zipCode: '1' },
    totalAmount: 200,
    orderStatus: 'SHIPPED',
    paymentStatus: 'PAID'
  });

  const o3 = await Order.create({
    user: new mongoose.Types.ObjectId(),
    shippingAddress: { street: '1', city: '1', state: '1', country: '1', zipCode: '1' },
    totalAmount: 300,
    orderStatus: 'DELIVERED',
    paymentStatus: 'PAID'
  });

  console.log('\n=======================================');
  console.log('🛡️  ADMIN ORDER CONTROLS VERIFICATION');
  console.log('=======================================');

  // Test 1: Admin can view all orders
  console.log('\n[1] Admin - getAllOrders...');
  const allOrders = await orderService.getAllOrders();
  if (allOrders.orders.length >= 3) {
    console.log('✅ Admin successfully retrieved all orders.');
  } else {
    throw new Error('Admin failed to retrieve all orders');
  }

  // Test 2: Filtering works
  console.log('\n[2] Admin - getAllOrders (Filtering by SHIPPED)...');
  const filteredOrders = await orderService.getAllOrders({ status: 'SHIPPED' });
  if (filteredOrders.orders.every(o => o.orderStatus === 'SHIPPED') && filteredOrders.orders.length >= 1) {
    console.log('✅ Admin filtering works correctly.');
  } else {
    throw new Error('Filtering failed');
  }

  // Test 3: Pagination works
  console.log('\n[3] Admin - getAllOrders (Pagination page=1, limit=2)...');
  const paginatedOrders = await orderService.getAllOrders({ page: 1, limit: 2 });
  if (paginatedOrders.orders.length === 2) {
    console.log('✅ Admin pagination works correctly.');
  } else {
    throw new Error('Pagination failed');
  }

  // Test 4: Admin can access any order
  console.log('\n[4] Admin - getOrderById (Random Customer Order)...');
  const fetchedOrder = await orderService.getOrderById(o1._id, adminUser);
  if (fetchedOrder.order._id.toString() === o1._id.toString()) {
    console.log('✅ Admin successfully accessed a specific customer order.');
  } else {
    throw new Error('Admin failed to access order');
  }

  // Test 5: Non-admin users are blocked from another's order
  console.log('\n[5] Customer - getOrderById (Attempting to access another order)...');
  try {
    await orderService.getOrderById(o1._id, customerUser);
    throw new Error('Customer accessed unauthorized order!');
  } catch (error) {
    if (error.statusCode === 403) {
      console.log('✅ Non-admin user was correctly blocked from unauthorized access.');
    } else {
      throw error;
    }
  }

  // Test 6: Admin Override Status (Even DELIVERED -> CANCELLED)
  console.log('\n[6] Admin - updateOrderStatus (DELIVERED -> CANCELLED)...');
  const overriddenOrder = await orderService.updateOrderStatus(o3._id, 'CANCELLED', adminUser);
  if (overriddenOrder.orderStatus === 'CANCELLED') {
    console.log('✅ Admin successfully overrode strict transition rules.');
  } else {
    throw new Error('Admin override failed');
  }

  // Test 7: Status changes are recorded
  console.log('\n[7] System - Verifying Status History...');
  if (overriddenOrder.statusHistory.pop().status === 'CANCELLED') {
    console.log('✅ Status change was correctly recorded in statusHistory.');
  } else {
    throw new Error('Status history not recorded');
  }

  console.log('\n✨ All Admin Order Control Verifications Passed!');

  // Cleanup
  await Order.deleteMany({ _id: { $in: [o1._id, o2._id, o3._id] } });

  process.exit(0);
}

runTests().catch(console.error);
