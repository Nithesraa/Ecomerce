import 'dotenv/config'; // Make sure env vars are loaded
import mongoose from 'mongoose';
import { connectRedis, getRedisClient } from './src/config/redis.js';
import { env } from './src/config/env.js';
import { cartRepository } from './src/repositories/cartRepository.js';
import { wishlistRepository } from './src/repositories/wishlistRepository.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB and Redis...');
  await mongoose.connect(env.MONGO_URI);
  const redis = connectRedis();
  
  // Wait for redis to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  const userId = new mongoose.Types.ObjectId();
  const dummyProduct = new mongoose.Types.ObjectId();
  console.log(`\n👤 Using mock User ID: ${userId}`);

  console.log('\n=======================================');
  console.log('🛒 CART: Write-Through Verification');
  console.log('=======================================');

  // 1. Cache Miss
  console.log('\n[1] Fetching Cart (Cache Miss)');
  let cart = await cartRepository.getCart(userId);
  let redisCart = await redis.get(`cart:${userId}`);
  console.log('✅ Fetched Cart from DB. Was it saved to Redis?', redisCart ? 'Yes' : 'No');

  // 2. Cache Hit
  console.log('\n[2] Fetching Cart again (Cache Hit)');
  const startHit = Date.now();
  await cartRepository.getCart(userId);
  console.log(`✅ Fetched Cart from Redis in ${Date.now() - startHit}ms`);

  // 3. Write-Through Persistence
  console.log('\n[3] Updating Cart (Write-Through)');
  await cartRepository.saveCart(userId, { items: [{ product: dummyProduct, quantity: 2 }] });
  
  // Verify DB
  const dbCart = await mongoose.connection.db.collection('carts').findOne({ user: userId });
  console.log('✅ MongoDB Cart items length:', dbCart.items.length);
  
  // Verify Redis sync
  redisCart = await redis.get(`cart:${userId}`);
  console.log('✅ Redis Cart items length:', JSON.parse(redisCart).items.length);


  console.log('\n=======================================');
  console.log('❤️ WISHLIST: Cache-Aside Verification');
  console.log('=======================================');

  // 1. Wishlist Creation
  console.log('\n[1] Fetching Wishlist (Cache Miss)');
  await wishlistRepository.getWishlist(userId);
  let redisWishlist = await redis.get(`wishlist:${userId}`);
  console.log('✅ Fetched Wishlist from DB. Is it in Redis?', redisWishlist ? 'Yes' : 'No');
  
  // 2. Wishlist Invalidation
  console.log('\n[2] Updating Wishlist (Cache Invalidation)');
  await wishlistRepository.saveWishlist(userId, { items: [dummyProduct] });
  redisWishlist = await redis.get(`wishlist:${userId}`);
  console.log('✅ Was Redis cache successfully invalidated (deleted)?', !redisWishlist ? 'Yes' : 'No');

  console.log('\n✨ Verification Complete! Cleaning up test data...');
  await mongoose.connection.db.collection('carts').deleteOne({ user: userId });
  await mongoose.connection.db.collection('wishlists').deleteOne({ user: userId });
  
  process.exit(0);
}

runTests().catch(console.error);
