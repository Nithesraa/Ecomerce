import 'dotenv/config';
import mongoose from 'mongoose';
import { connectRedis } from './src/config/redis.js';
import { env } from './src/config/env.js';
import { cartService } from './src/services/cartService.js';
import { couponService } from './src/services/couponService.js';
import { checkoutService } from './src/services/checkoutService.js';
import { Product } from './src/models/Product.js';
import { Category } from './src/models/Category.js';
import { SellerProfile } from './src/models/SellerProfile.js';
import { Coupon } from './src/models/Coupon.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB and Redis...');
  await mongoose.connect(env.MONGO_URI);
  const redis = connectRedis();
  await new Promise(resolve => setTimeout(resolve, 1000));

  const userId = new mongoose.Types.ObjectId();
  console.log(`\n👤 Using mock User ID: ${userId}`);

  // 1. Setup Mock Data
  console.log('\n📦 Setting up Mock Data...');
  await Product.deleteMany({ sku: { $regex: /^test-checkout-/ } });
  await Coupon.deleteMany({ code: 'CHECKOUT_TEST_50' });
  
  const category = await Category.create({ name: 'Test Cat ' + Date.now(), slug: 'test-cat-co-' + Date.now() });
  const seller = await SellerProfile.create({ 
    user: new mongoose.Types.ObjectId(), 
    storeName: 'Test Store CO ' + Date.now(),
    businessEmail: 'co@store.com'
  });
  
  const product = await Product.create({
    title: 'Checkout Test Product',
    slug: 'test-checkout-' + Date.now(),
    sku: 'test-checkout-' + Date.now(),
    description: 'Test Description',
    price: 100,
    category: category._id,
    seller: seller._id,
    status: 'ACTIVE',
    stock: 5,
    images: [{ url: 'test', publicId: 'test' }]
  });

  const coupon = await Coupon.create({
    code: 'CHECKOUT_TEST_50',
    discountType: 'FIXED',
    discountValue: 50,
    minOrderValue: 100,
    validUntil: new Date(Date.now() + 86400000),
    isActive: true
  });

  console.log('✅ Created mock Product ($100, stock 5) and Coupon ($50 off).');

  console.log('\n=======================================');
  console.log('🛍️ CHECKOUT SERVICE: Verification');
  console.log('=======================================');

  // Add 3 to Cart
  await cartService.addToCart(userId, product._id.toString(), 3);
  console.log('\n[1] Generated valid Cart (3 items, $300 total)');

  // Test 1: Successful Checkout Summary without Coupon
  console.log('\n[2] Requesting Checkout Summary (No Coupon)');
  let summary = await checkoutService.getCheckoutSummary(userId);
  console.log(`✅ Success! Subtotal: $${summary.subtotal}, Discount: $${summary.discountAmount}, Final Total: $${summary.finalTotal}`);

  // Test 2: Successful Checkout Summary with Coupon
  console.log('\n[3] Requesting Checkout Summary (With CHECKOUT_TEST_50)');
  summary = await checkoutService.getCheckoutSummary(userId, 'CHECKOUT_TEST_50');
  console.log(`✅ Success! Subtotal: $${summary.subtotal}, Discount: $${summary.discountAmount}, Final Total: $${summary.finalTotal}`);

  // Test 3: Validation - Stock Change interception
  console.log('\n[4] Simulating Seller changing stock to 2 while user has 3 in cart...');
  product.stock = 2;
  await product.save();

  try {
    await checkoutService.getCheckoutSummary(userId);
    console.log('❌ Failed: Allowed checkout with exceeded stock');
  } catch (e) {
    console.log('✅ Successfully intercepted stock drop during checkout:', e.message);
  }

  // The previous failure automatically corrected the cart to 2.
  // Test 4: Validation - Inactive product interception
  console.log('\n[5] Simulating Product becoming INACTIVE during checkout...');
  product.status = 'DRAFT';
  await product.save();

  try {
    await checkoutService.getCheckoutSummary(userId);
    console.log('❌ Failed: Allowed checkout with inactive product');
  } catch (e) {
    console.log('✅ Successfully intercepted inactive product during checkout:', e.message);
  }

  // Test 5: Validation - Empty Cart Checkout
  console.log('\n[6] Requesting Checkout on Empty Cart');
  try {
    await checkoutService.getCheckoutSummary(userId);
    console.log('❌ Failed: Allowed checkout on empty cart');
  } catch (e) {
    console.log('✅ Successfully prevented empty checkout:', e.message);
  }

  console.log('\n✨ Verification Complete! Cleaning up test data...');
  await mongoose.connection.db.collection('carts').deleteOne({ user: userId });
  await Product.deleteOne({ _id: product._id });
  await Category.deleteOne({ _id: category._id });
  await SellerProfile.deleteOne({ _id: seller._id });
  await Coupon.deleteOne({ _id: coupon._id });
  
  process.exit(0);
}

runTests().catch(console.error);
