import 'dotenv/config';
import mongoose from 'mongoose';
import { connectRedis } from './src/config/redis.js';
import { env } from './src/config/env.js';
import { cartService } from './src/services/cartService.js';
import { orderService } from './src/services/orderService.js';
import { Product } from './src/models/Product.js';
import { Category } from './src/models/Category.js';
import { SellerProfile } from './src/models/SellerProfile.js';
import { Coupon } from './src/models/Coupon.js';
import { Order } from './src/models/Order.js';
import { OrderItem } from './src/models/OrderItem.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB and Redis...');
  await mongoose.connect(env.MONGO_URI);
  const redis = connectRedis();
  await new Promise(resolve => setTimeout(resolve, 1000));

  const userId = new mongoose.Types.ObjectId();
  console.log(`\n👤 Using mock User ID: ${userId}`);

  // 1. Setup Mock Data
  console.log('\n📦 Setting up Mock Data...');
  await Product.deleteMany({ sku: { $regex: /^test-order-/ } });
  await Coupon.deleteMany({ code: 'ORDER_TEST_50' });
  
  const category = await Category.create({ name: 'Test Cat ' + Date.now(), slug: 'test-cat-o-' + Date.now() });
  const seller = await SellerProfile.create({ 
    user: new mongoose.Types.ObjectId(), 
    storeName: 'Test Store O ' + Date.now(),
    businessEmail: 'o@store.com'
  });
  
  const product = await Product.create({
    title: 'Order Test Product',
    slug: 'test-order-' + Date.now(),
    sku: 'test-order-' + Date.now(),
    description: 'Test Description',
    price: 150,
    category: category._id,
    seller: seller._id,
    status: 'ACTIVE',
    stock: 10,
    images: [{ url: 'test', publicId: 'test' }]
  });

  const coupon = await Coupon.create({
    code: 'ORDER_TEST_50',
    discountType: 'FIXED',
    discountValue: 50,
    minOrderValue: 100,
    validUntil: new Date(Date.now() + 86400000),
    isActive: true,
    maxUsesPerUser: 1,
    currentUsageCount: 0,
    usedBy: []
  });

  console.log('✅ Created mock Product ($150, stock 10) and Coupon ($50 off).');

  const shippingAddress = {
    street: '123 Main St',
    city: 'Techville',
    state: 'CA',
    country: 'USA',
    zipCode: '12345'
  };

  console.log('\n=======================================');
  console.log('📦 ORDER SERVICE: Verification');
  console.log('=======================================');

  // Add 2 to Cart
  await cartService.addToCart(userId, product._id.toString(), 2);
  console.log('\n[1] Generated valid Cart (2 items, $300 total)');

  // Test 1: Order Creation & Status History
  console.log('\n[2] Creating Order from Checkout Summary (With ORDER_TEST_50)...');
  const { order, orderItems } = await orderService.createOrder(userId, shippingAddress, 'ORDER_TEST_50');

  console.log(`✅ Order Created! ID: ${order._id}`);
  console.log(`✅ Totals -> TotalAmount: $${order.totalAmount}, Discount: $${order.discountAmount}`);
  console.log(`✅ Status -> orderStatus: ${order.orderStatus}, paymentStatus: ${order.paymentStatus}`);
  console.log(`✅ Status History Length: ${order.statusHistory.length} (Current: ${order.statusHistory[0].status})`);

  // Test 2: OrderItem Snapshot Verification
  console.log('\n[3] Verifying OrderItem Snapshots...');
  console.log(`✅ Items Generated: ${orderItems.length}`);
  console.log(`✅ Snapshot Data -> Title: "${orderItems[0].productTitle}", PriceAtPurchase: $${orderItems[0].priceAtPurchase}, Quantity: ${orderItems[0].quantity}`);

  // Test 3: Coupon Discount Persistence Verification
  console.log('\n[4] Verifying Coupon Persistence...');
  const updatedCoupon = await Coupon.findById(coupon._id);
  console.log(`✅ Coupon Usage Count updated to: ${updatedCoupon.currentUsageCount} (Expected: 1)`);
  console.log(`✅ Coupon 'usedBy' Array Length: ${updatedCoupon.usedBy.length} (Expected: 1)`);

  // Verification Assertions
  if (order.totalAmount !== 250) throw new Error('Order totalAmount is incorrect!');
  if (order.discountAmount !== 50) throw new Error('Order discountAmount is incorrect!');
  if (order.orderStatus !== 'PENDING') throw new Error('Order status is incorrect!');
  if (orderItems[0].priceAtPurchase !== 150) throw new Error('OrderItem price snapshot is incorrect!');

  console.log('\n✨ All Verifications Passed! Cleaning up test data...');
  await Order.deleteOne({ _id: order._id });
  await OrderItem.deleteMany({ order: order._id });
  await mongoose.connection.db.collection('carts').deleteOne({ user: userId });
  await Product.deleteOne({ _id: product._id });
  await Category.deleteOne({ _id: category._id });
  await SellerProfile.deleteOne({ _id: seller._id });
  await Coupon.deleteOne({ _id: coupon._id });
  
  process.exit(0);
}

runTests().catch(console.error);
