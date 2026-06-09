import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { couponService } from './src/services/couponService.js';
import { Coupon } from './src/models/Coupon.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI);

  const userId = new mongoose.Types.ObjectId();
  console.log(`\n👤 Using mock User ID: ${userId}`);

  // 1. Setup Mock Coupons
  console.log('\n🎟️ Setting up Mock Coupons...');
  await Coupon.deleteMany({ code: { $regex: /^TEST_/ } });

  const activePromo = await Coupon.create({
    code: 'TEST_SUMMER50',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    minOrderValue: 100,
    validUntil: new Date(Date.now() + 86400000), // 1 day from now
    isActive: true,
    maxUsesPerUser: 1,
    totalUsageLimit: 10
  });

  const fixedPromo = await Coupon.create({
    code: 'TEST_FLAT20',
    discountType: 'FIXED',
    discountValue: 20,
    minOrderValue: 50,
    validUntil: new Date(Date.now() + 86400000),
    isActive: true,
    maxUsesPerUser: 1
  });

  console.log('✅ Created mock coupons: TEST_SUMMER50 (50% off) & TEST_FLAT20 ($20 off).');

  console.log('\n=======================================');
  console.log('🏷️ COUPON SERVICE: Verification');
  console.log('=======================================');

  // Test 1: Successful PERCENTAGE application
  console.log('\n[1] Applying TEST_SUMMER50 on $200 Cart');
  let result = await couponService.applyCoupon('TEST_SUMMER50', userId, 200);
  console.log(`✅ Success! Discount: $${result.discountAmount}, Final Total: $${result.finalTotal}`);

  // Test 2: Successful FIXED application
  console.log('\n[2] Applying TEST_FLAT20 on $100 Cart');
  result = await couponService.applyCoupon('TEST_FLAT20', userId, 100);
  console.log(`✅ Success! Discount: $${result.discountAmount}, Final Total: $${result.finalTotal}`);

  // Test 3: Min Order Value Validation
  console.log('\n[3] Applying TEST_SUMMER50 on $50 Cart (Min is $100)');
  try {
    await couponService.applyCoupon('TEST_SUMMER50', userId, 50);
    console.log('❌ Failed: Allowed below minimum order value');
  } catch (e) {
    console.log('✅ Successfully prevented:', e.message);
  }

  // Test 4: Expiry Validation
  console.log('\n[4] Simulating Expired Coupon');
  activePromo.validUntil = new Date(Date.now() - 86400000); // 1 day ago
  await activePromo.save();
  try {
    await couponService.applyCoupon('TEST_SUMMER50', userId, 200);
    console.log('❌ Failed: Allowed expired coupon');
  } catch (e) {
    console.log('✅ Successfully prevented:', e.message);
  }
  activePromo.validUntil = new Date(Date.now() + 86400000); // Revert
  await activePromo.save();

  // Test 5: Inactive Status Validation
  console.log('\n[5] Simulating Inactive Coupon');
  activePromo.isActive = false;
  await activePromo.save();
  try {
    await couponService.applyCoupon('TEST_SUMMER50', userId, 200);
    console.log('❌ Failed: Allowed inactive coupon');
  } catch (e) {
    console.log('✅ Successfully prevented:', e.message);
  }
  activePromo.isActive = true; // Revert
  await activePromo.save();

  // Test 6: Per User Usage Limit Validation
  console.log('\n[6] Simulating Max Uses Per User Reached');
  activePromo.usedBy.push(userId); // Simulate user already used it once
  await activePromo.save();
  try {
    await couponService.applyCoupon('TEST_SUMMER50', userId, 200);
    console.log('❌ Failed: Allowed exceeding maxUsesPerUser');
  } catch (e) {
    console.log('✅ Successfully prevented:', e.message);
  }
  activePromo.usedBy = []; // Revert
  await activePromo.save();

  // Test 7: Global Usage Limit Validation
  console.log('\n[7] Simulating Global Usage Limit Reached');
  activePromo.currentUsageCount = 10; // Limit is 10
  await activePromo.save();
  try {
    await couponService.applyCoupon('TEST_SUMMER50', userId, 200);
    console.log('❌ Failed: Allowed exceeding totalUsageLimit');
  } catch (e) {
    console.log('✅ Successfully prevented:', e.message);
  }

  // Test 8: Invalid Coupon Validation
  console.log('\n[8] Applying Non-Existent Coupon');
  try {
    await couponService.applyCoupon('FAKE_CODE_123', userId, 200);
    console.log('❌ Failed: Allowed fake coupon');
  } catch (e) {
    console.log('✅ Successfully prevented:', e.message);
  }

  console.log('\n✨ Verification Complete! Cleaning up test data...');
  await Coupon.deleteMany({ _id: { $in: [activePromo._id, fixedPromo._id] } });
  
  process.exit(0);
}

runTests().catch(console.error);
