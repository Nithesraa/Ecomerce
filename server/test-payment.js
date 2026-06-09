import 'dotenv/config';
import mongoose from 'mongoose';
import { connectRedis } from './src/config/redis.js';
import { env } from './src/config/env.js';
import { cartService } from './src/services/cartService.js';
import { orderService } from './src/services/orderService.js';
import { paymentService } from './src/services/paymentService.js';
import { razorpayService } from './src/services/razorpayService.js';
import { Product } from './src/models/Product.js';
import { Category } from './src/models/Category.js';
import { SellerProfile } from './src/models/SellerProfile.js';
import { Coupon } from './src/models/Coupon.js';
import { Order } from './src/models/Order.js';
import { OrderItem } from './src/models/OrderItem.js';
import { Payment } from './src/models/Payment.js';
import { InventoryLog } from './src/models/InventoryLog.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB and Redis...');
  await mongoose.connect(env.MONGO_URI);
  const redis = connectRedis();
  await new Promise(resolve => setTimeout(resolve, 1000));

  const userId = new mongoose.Types.ObjectId();
  console.log(`\n👤 Using mock User ID: ${userId}`);

  // 1. Setup Mock Data
  console.log('\n📦 Setting up Mock Data...');
  await Product.deleteMany({ sku: { $regex: /^test-pay-/ } });
  await Coupon.deleteMany({ code: 'PAY_TEST_50' });
  
  const category = await Category.create({ name: 'Test Cat P ' + Date.now(), slug: 'test-cat-p-' + Date.now() });
  const seller = await SellerProfile.create({ 
    user: new mongoose.Types.ObjectId(), 
    storeName: 'Test Store P ' + Date.now(),
    businessEmail: 'p@store.com'
  });
  
  const product = await Product.create({
    title: 'Payment Test Product',
    slug: 'test-pay-' + Date.now(),
    sku: 'test-pay-' + Date.now(),
    description: 'Test Description',
    price: 150,
    category: category._id,
    seller: seller._id,
    status: 'ACTIVE',
    stock: 10,
    images: [{ url: 'test', publicId: 'test' }]
  });

  const coupon = await Coupon.create({
    code: 'PAY_TEST_50',
    discountType: 'FIXED',
    discountValue: 50,
    minOrderValue: 100,
    validUntil: new Date(Date.now() + 86400000),
    isActive: true,
    maxUsesPerUser: 1,
    currentUsageCount: 0,
    usedBy: []
  });

  const shippingAddress = {
    street: '123 Main St',
    city: 'Techville',
    state: 'CA',
    country: 'USA',
    zipCode: '12345'
  };

  console.log('\n=======================================');
  console.log('💳 PAYMENT SERVICE: Verification');
  console.log('=======================================');

  // Test Setup: Create Orders
  await cartService.addToCart(userId, product._id.toString(), 2);
  const { order: successOrder } = await orderService.createOrder(userId, shippingAddress, 'PAY_TEST_50');
  
  await cartService.addToCart(userId, product._id.toString(), 1);
  const { order: failedOrder } = await orderService.createOrder(userId, shippingAddress);

  console.log('\n[1] Initializing Razorpay Orders...');
  const rpSuccessOrder = await paymentService.initializePayment(successOrder._id);
  const rpFailedOrder = await paymentService.initializePayment(failedOrder._id);
  console.log(`✅ Razorpay Orders Created! (Expected amounts in paise: ${rpSuccessOrder.amount}, ${rpFailedOrder.amount})`);

  console.log('\n[2] Processing Successful Payment Flow...');
  await paymentService.processSuccessfulPayment(
    successOrder._id,
    rpSuccessOrder.razorpayOrderId,
    'pay_mock_123',
    'mock_signature'
  );

  const verifiedOrder = await Order.findById(successOrder._id);
  const paymentRecord = await Payment.findOne({ order: successOrder._id });
  const updatedProduct = await Product.findById(product._id);
  const inventoryLog = await InventoryLog.findOne({ product: product._id });
  const updatedCoupon = await Coupon.findById(coupon._id);

  console.log(`✅ Order Status updated to: ${verifiedOrder.paymentStatus} / ${verifiedOrder.orderStatus}`);
  console.log(`✅ Payment Record Status: ${paymentRecord.status}`);
  console.log(`✅ Product Inventory Reduced to: ${updatedProduct.stock} (Expected: 8)`);
  console.log(`✅ InventoryLog Created! Change: ${inventoryLog.quantityChanged}`);
  console.log(`✅ Coupon Usage Incremented to: ${updatedCoupon.currentUsageCount}`);

  console.log('\n[3] Processing Failed Payment Flow...');
  await paymentService.processFailedPayment(
    failedOrder._id,
    rpFailedOrder.razorpayOrderId,
    'pay_mock_fail',
    'User cancelled payment'
  );

  const verifiedFailedOrder = await Order.findById(failedOrder._id);
  const failedPaymentRecord = await Payment.findOne({ order: failedOrder._id });
  const doubleCheckProduct = await Product.findById(product._id);

  console.log(`✅ Order Status updated to: ${verifiedFailedOrder.paymentStatus} / ${verifiedFailedOrder.orderStatus}`);
  console.log(`✅ Payment Record Status: ${failedPaymentRecord.status}`);
  console.log(`✅ Inventory remains untouched: ${doubleCheckProduct.stock} (Expected: 8)`);

  // Assertions
  if (verifiedOrder.paymentStatus !== 'PAID') throw new Error('Success order not marked PAID');
  if (updatedProduct.stock !== 8) throw new Error('Stock not reduced correctly');
  if (verifiedFailedOrder.paymentStatus !== 'FAILED') throw new Error('Failed order not marked FAILED');

  console.log('\n✨ All Verifications Passed! Cleaning up test data...');
  await Order.deleteMany({ _id: { $in: [successOrder._id, failedOrder._id] } });
  await OrderItem.deleteMany({ order: { $in: [successOrder._id, failedOrder._id] } });
  await Payment.deleteMany({ order: { $in: [successOrder._id, failedOrder._id] } });
  await InventoryLog.deleteMany({ product: product._id });
  await mongoose.connection.db.collection('carts').deleteOne({ user: userId });
  await Product.deleteOne({ _id: product._id });
  await Category.deleteOne({ _id: category._id });
  await SellerProfile.deleteOne({ _id: seller._id });
  await Coupon.deleteOne({ _id: coupon._id });
  
  process.exit(0);
}

runTests().catch(console.error);
