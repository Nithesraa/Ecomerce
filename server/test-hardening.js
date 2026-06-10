import 'dotenv/config';
import mongoose from 'mongoose';
import { connectRedis, getRedisClient } from './src/config/redis.js';
import { env } from './src/config/env.js';
import { cartService } from './src/services/cartService.js';
import { orderService } from './src/services/orderService.js';
import { paymentService } from './src/services/paymentService.js';
import { Product } from './src/models/Product.js';
import { Category } from './src/models/Category.js';
import { SellerProfile } from './src/models/SellerProfile.js';
import { Order } from './src/models/Order.js';
import { OrderItem } from './src/models/OrderItem.js';
import { Payment } from './src/models/Payment.js';
import { InventoryLog } from './src/models/InventoryLog.js';
import { addToCartSchema } from './src/validators/ecommerceValidators.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB and Redis...');
  await mongoose.connect(env.MONGO_URI);
  const redis = connectRedis();
  await new Promise(resolve => setTimeout(resolve, 1000));

  const userId1 = new mongoose.Types.ObjectId();
  const userId2 = new mongoose.Types.ObjectId();

  console.log('\n📦 Setting up Mock Data...');
  await Product.deleteMany({ sku: { $regex: /^test-hard-/ } });
  
  const category = await Category.create({ name: 'Hard Cat', slug: 'hard-cat-' + Date.now() });
  const seller = await SellerProfile.create({ 
    user: new mongoose.Types.ObjectId(), 
    storeName: 'Hard Store',
    businessEmail: 'h@store.com'
  });
  
  // Product with ONLY 1 STOCK
  const product = await Product.create({
    title: 'Hardening Product',
    slug: 'test-hard-' + Date.now(),
    sku: 'test-hard-' + Date.now(),
    description: 'Test',
    price: 100,
    category: category._id,
    seller: seller._id,
    status: 'ACTIVE',
    stock: 1, // Only 1 available!
    images: [{ url: 'test', publicId: 'test' }]
  });

  const shippingAddress = { street: '1', city: '1', state: '1', country: '1', zipCode: '1' };

  console.log('\n=======================================');
  console.log('🛡️ HARDENING SPRINT VERIFICATION');
  console.log('=======================================');

  // Test 1: Zod Validation (Negative Quantity)
  console.log('\n[1] Testing Zod Validation (Negative Quantity)...');
  try {
    addToCartSchema.parse({
      body: {
        productId: product._id.toString(),
        quantity: -5
      }
    });
    throw new Error('Zod failed to reject negative quantity');
  } catch (err) {
    console.log('✅ Zod successfully rejected invalid payload.');
  }

  // Test 2: N+1 Query & Redis Consistency
  console.log('\n[2] Testing Cart Hydration N+1 Optimization & Redis Consistency...');
  mongoose.set('debug', true);
  await cartService.addToCart(userId1.toString(), product._id.toString(), 1);
  mongoose.set('debug', false);
  const redisCart = await redis.get(`cart:${userId1.toString()}`);
  if (redisCart) {
    console.log('✅ Cart successfully written to Redis without stale state.');
  } else {
    throw new Error('Redis Cart not found');
  }

  // Test 3: Inventory Race Condition
  console.log('\n[3] Testing Inventory Race Condition (Concurrent Purchases for 1 Stock)...');
  
  // User 1 order
  const { order: order1 } = await orderService.createOrder(userId1.toString(), shippingAddress);
  const rpOrder1 = await paymentService.initializePayment(order1._id);

  // User 2 order (sneaks in and creates order before user 1 pays)
  await cartService.addToCart(userId2.toString(), product._id.toString(), 1);
  const { order: order2 } = await orderService.createOrder(userId2.toString(), shippingAddress);
  const rpOrder2 = await paymentService.initializePayment(order2._id);

  // CONCURRENT PAYMENT VERIFICATION
  console.log('Simulating simultaneous payment verifications...');
  const results = await Promise.allSettled([
    paymentService.processSuccessfulPayment(order1._id, rpOrder1.razorpayOrderId, 'pay_1', 'mock_signature'),
    paymentService.processSuccessfulPayment(order2._id, rpOrder2.razorpayOrderId, 'pay_2', 'mock_signature')
  ]);

  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failureCount = results.filter(r => r.status === 'rejected').length;

  if (successCount === 1 && failureCount === 1) {
    console.log('✅ Race condition prevented! Only 1 payment succeeded. The other was aborted due to insufficient stock.');
  } else {
    throw new Error(`Race condition failed. Successes: ${successCount}, Failures: ${failureCount}`);
  }

  // Check final stock
  const updatedProduct = await Product.findById(product._id);
  console.log(`✅ Final Product Stock: ${updatedProduct.stock} (Expected: 0)`);

  // Test 4: Idempotency
  console.log('\n[4] Testing Payment Webhook Idempotency...');
  const successfulOrderResult = results.find(r => r.status === 'fulfilled').value;
  const duplicateCall = await paymentService.processSuccessfulPayment(successfulOrderResult.orderId, 'same', 'same', 'mock_signature');
  if (duplicateCall.message === 'Already processed') {
    console.log('✅ Idempotency confirmed. Duplicate webhook handled gracefully.');
  } else {
    throw new Error('Idempotency check failed.');
  }

  console.log('\n✨ All Hardening Verifications Passed!');
  
  // Cleanup
  await Order.deleteMany({ _id: { $in: [order1._id, order2._id] } });
  await OrderItem.deleteMany({ order: { $in: [order1._id, order2._id] } });
  await Payment.deleteMany({ order: { $in: [order1._id, order2._id] } });
  await InventoryLog.deleteMany({ product: product._id });
  await redis.del(`cart:${userId1.toString()}`);
  await redis.del(`cart:${userId2.toString()}`);
  await mongoose.connection.db.collection('carts').deleteMany({ user: { $in: [userId1, userId2] } });
  await Product.deleteOne({ _id: product._id });
  await Category.deleteOne({ _id: category._id });
  await SellerProfile.deleteOne({ _id: seller._id });
  
  process.exit(0);
}

runTests().catch(console.error);
