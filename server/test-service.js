import 'dotenv/config';
import mongoose from 'mongoose';
import { connectRedis } from './src/config/redis.js';
import { env } from './src/config/env.js';
import { cartService } from './src/services/cartService.js';
import { wishlistService } from './src/services/wishlistService.js';
import { Product } from './src/models/Product.js';
import { Category } from './src/models/Category.js';
import { SellerProfile } from './src/models/SellerProfile.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB and Redis...');
  await mongoose.connect(env.MONGO_URI);
  const redis = connectRedis();
  await new Promise(resolve => setTimeout(resolve, 1000));

  const userId = new mongoose.Types.ObjectId();
  console.log(`\n👤 Using mock User ID: ${userId}`);

  // 1. Setup Mock Product
  console.log('\n📦 Setting up Mock Product...');
  // Clean up any previously crashed test runs to prevent unique index conflicts
  await Product.deleteMany({ sku: { $regex: /^test-sku-/ } });
  await Product.deleteMany({ sku: null });
  
  const category = await Category.create({ name: 'Test Cat ' + Date.now(), slug: 'test-cat-' + Date.now() });
  const seller = await SellerProfile.create({ 
    user: new mongoose.Types.ObjectId(), 
    storeName: 'Test Store ' + Date.now(),
    businessEmail: 'test@store.com'
  });
  
  const product = await Product.create({
    title: 'Test Service Product',
    slug: 'test-service-' + Date.now(),
    sku: 'test-sku-' + Date.now(),
    description: 'Test Description',
    price: 100,
    category: category._id,
    seller: seller._id,
    status: 'ACTIVE',
    stock: 5, // Only 5 in stock
    images: [{ url: 'test', publicId: 'test' }]
  });

  console.log('✅ Created mock ACTIVE product with 5 stock.');

  console.log('\n=======================================');
  console.log('🛒 CART SERVICE: Verification');
  console.log('=======================================');

  // Test 1: Add to cart, Cart Hydration & Dynamic total calculation
  console.log('\n[1] Adding to Cart (Quantity: 2) -> Testing Hydration & Dynamic Total');
  let cart = await cartService.addToCart(userId, product._id.toString(), 2);
  console.log('✅ Cart Total Amount (Should be 200):', cart.totalAmount);
  console.log('✅ Cart Hydrated Title:', cart.items[0].productDetails.title);

  // Test 2: Prevent Exceeding Stock
  console.log('\n[2] Attempting to add 4 more (Total 6 > Stock 5) -> Testing Stock validation');
  try {
    await cartService.addToCart(userId, product._id.toString(), 4);
    console.log('❌ Failed: Allowed exceeding stock');
  } catch (e) {
    console.log('✅ Successfully prevented exceeding stock:', e.message);
  }

  // Test 3: ACTIVE status validation
  console.log('\n[3] Simulating Product becoming INACTIVE (DRAFT) -> Testing auto-purge');
  product.status = 'DRAFT';
  await product.save();
  cart = await cartService.getCart(userId);
  console.log('✅ Cart after fetching (should be empty due to DRAFT status):', cart.items.length);
  
  // Test 4: Product Existence / Soft Delete validation
  console.log('\n[4] Attempting to add Soft Deleted product -> Testing Soft Delete validation');
  product.status = 'ACTIVE';
  product.isDeleted = true;
  await product.save();
  try {
    await cartService.addToCart(userId, product._id.toString(), 1);
    console.log('❌ Failed: Allowed adding soft-deleted product');
  } catch (e) {
    console.log('✅ Successfully prevented adding soft deleted product:', e.message);
  }

  // Test 5: Real Product Existence
  console.log('\n[5] Attempting to add non-existent product ID -> Testing Product existence');
  try {
    await cartService.addToCart(userId, new mongoose.Types.ObjectId().toString(), 1);
    console.log('❌ Failed: Allowed adding non-existent product');
  } catch (e) {
    console.log('✅ Successfully prevented adding non-existent product:', e.message);
  }

  // Revert for Wishlist tests
  product.isDeleted = false;
  await product.save();

  console.log('\n=======================================');
  console.log('❤️ WISHLIST SERVICE: Verification');
  console.log('=======================================');

  console.log('\n[1] Adding to Wishlist -> Testing basic add');
  let wishlist = await wishlistService.addToWishlist(userId, product._id.toString());
  console.log('✅ Added successfully. Items length:', wishlist.items.length);

  console.log('\n[2] Attempting to add duplicate -> Testing Duplicate prevention');
  try {
    await wishlistService.addToWishlist(userId, product._id.toString());
    console.log('❌ Failed: Allowed duplicate in wishlist');
  } catch (e) {
    console.log('✅ Successfully prevented duplicate:', e.message);
  }

  console.log('\n✨ Verification Complete! Cleaning up test data...');
  await mongoose.connection.db.collection('carts').deleteOne({ user: userId });
  await mongoose.connection.db.collection('wishlists').deleteOne({ user: userId });
  await Product.deleteOne({ _id: product._id });
  await Category.deleteOne({ _id: category._id });
  await SellerProfile.deleteOne({ _id: seller._id });
  
  process.exit(0);
}

runTests().catch(console.error);
