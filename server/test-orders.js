import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { orderService } from './src/services/orderService.js';
import { Order } from './src/models/Order.js';
import { OrderItem } from './src/models/OrderItem.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI);

  const customerUser = { _id: new mongoose.Types.ObjectId(), role: 'USER' };
  const sellerUser = { _id: new mongoose.Types.ObjectId(), role: 'SELLER', sellerProfileId: new mongoose.Types.ObjectId() };
  const adminUser = { _id: new mongoose.Types.ObjectId(), role: 'ADMIN' };

  console.log('\n📦 Setting up Mock Order Data...');
  const orderData = {
    user: customerUser._id,
    shippingAddress: { street: '1', city: '1', state: '1', country: '1', zipCode: '1' },
    totalAmount: 1000,
    orderStatus: 'PENDING',
    paymentStatus: 'PAID',
    statusHistory: [{ status: 'PENDING', note: 'Order placed successfully' }]
  };

  const order = await Order.create(orderData);
  await OrderItem.create({
    order: order._id,
    product: new mongoose.Types.ObjectId(),
    productTitle: 'Test Product',
    priceAtPurchase: 1000,
    quantity: 1,
    seller: sellerUser.sellerProfileId
  });

  console.log('\n=======================================');
  console.log('📦 ORDER MANAGEMENT API VERIFICATION');
  console.log('=======================================');

  // Test 1: Customer getMyOrders
  console.log('\n[1] Customer - getMyOrders...');
  const myOrders = await orderService.getMyOrders(customerUser._id);
  if (myOrders.orders.length === 1 && myOrders.orders[0]._id.toString() === order._id.toString()) {
    console.log('✅ Customer retrieved their order successfully.');
  } else {
    throw new Error('Customer failed to retrieve order');
  }

  // Test 2: Seller getSellerOrders
  console.log('\n[2] Seller - getSellerOrders...');
  const sellerOrders = await orderService.getSellerOrders(sellerUser.sellerProfileId);
  if (sellerOrders.orders.length === 1 && sellerOrders.orders[0]._id.toString() === order._id.toString()) {
    console.log('✅ Seller retrieved the order assigned to them successfully.');
  } else {
    throw new Error('Seller failed to retrieve order');
  }

  // Test 3: Valid Status Transition (PENDING -> PROCESSING)
  console.log('\n[3] Seller - updateOrderStatus (PENDING -> PROCESSING)...');
  const processingOrder = await orderService.updateOrderStatus(order._id, 'PROCESSING', sellerUser);
  if (processingOrder.orderStatus === 'PROCESSING') {
    console.log('✅ Seller successfully updated order status to PROCESSING.');
  } else {
    throw new Error('Status update failed');
  }

  // Test 4: Invalid Transition Attempt (SHIPPED -> PENDING)
  console.log('\n[4] Seller - Attempting invalid status transition (SHIPPED -> PENDING)...');
  try {
    await orderService.updateOrderStatus(order._id, 'PENDING', sellerUser);
    throw new Error('Seller was allowed to transition backwards!');
  } catch (error) {
    if (error.message.includes('Invalid transition')) {
      console.log('✅ Seller was correctly forbidden from transitioning SHIPPED to PENDING.');
    } else {
      throw error;
    }
  }

  // Test 5: Valid Transition (PROCESSING -> SHIPPED -> DELIVERED)
  console.log('\n[5] Seller - updateOrderStatus (PROCESSING -> SHIPPED -> DELIVERED)...');
  await orderService.updateOrderStatus(order._id, 'SHIPPED', sellerUser);
  const deliveredOrder = await orderService.updateOrderStatus(order._id, 'DELIVERED', sellerUser);
  console.log('✅ Seller successfully updated order status to DELIVERED.');
  
  // Test 6: Verify Status History
  console.log('\n[6] System - Verifying Status History...');
  console.log(deliveredOrder.statusHistory);
  if (deliveredOrder.statusHistory.length === 4 && deliveredOrder.statusHistory[deliveredOrder.statusHistory.length - 1].status === 'DELIVERED') {
    console.log('✅ Status history is appended correctly.');
  } else {
    throw new Error('Status history is corrupted.');
  }

  // Test 7: Unauthorized Customer Access Attempt
  console.log('\n[7] Customer - Attempting to access another customer\'s order...');
  const anotherCustomer = { _id: new mongoose.Types.ObjectId(), role: 'USER' };
  try {
    await orderService.getOrderById(order._id, anotherCustomer);
    throw new Error('Customer accessed unauthorized order!');
  } catch (error) {
    if (error.statusCode === 403) {
      console.log('✅ Customer was correctly forbidden from accessing another customer\'s order.');
    } else {
      throw error;
    }
  }

  // Test 8: Unauthorized Seller Update Attempt
  console.log('\n[8] Seller - Attempting to update order without their products...');
  const anotherSeller = { _id: new mongoose.Types.ObjectId(), role: 'SELLER', sellerProfileId: new mongoose.Types.ObjectId() };
  try {
    await orderService.updateOrderStatus(order._id, 'PROCESSING', anotherSeller);
    throw new Error('Seller updated unauthorized order!');
  } catch (error) {
    if (error.statusCode === 403) {
      console.log('✅ Seller was correctly forbidden from updating an order that does not contain their products.');
    } else {
      throw error;
    }
  }

  // Test 9: Invalid Transition on DELIVERED order
  console.log('\n[9] Seller - Attempting to update DELIVERED order (DELIVERED -> PROCESSING)...');
  try {
    await orderService.updateOrderStatus(order._id, 'PROCESSING', sellerUser);
    throw new Error('Seller modified a delivered order!');
  } catch (error) {
    if (error.message.includes('Cannot change status of a DELIVERED order')) {
      console.log('✅ Seller was correctly forbidden from modifying a DELIVERED order.');
    } else {
      throw error;
    }
  }

  console.log('\n✨ All Order Management API Verifications Passed!');

  // Cleanup
  await Order.findByIdAndDelete(order._id);
  await OrderItem.deleteMany({ order: order._id });

  process.exit(0);
}

runTests().catch(console.error);
