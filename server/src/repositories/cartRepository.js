import { Cart } from '../models/Cart.js';
import { getRedisClient } from '../config/redis.js';

const CART_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export const cartRepository = {
  getCart: async (userId) => {
    const redis = getRedisClient();
    const redisKey = `cart:${userId}`;

    // 1. Try Redis Cache
    const cachedCart = await redis.get(redisKey);
    if (cachedCart) {
      return JSON.parse(cachedCart);
    }

    // 2. Fallback to MongoDB
    let cart = await Cart.findOne({ user: userId });
    
    // If no cart exists in DB, create an empty one
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
    }

    // 3. Populate Redis Cache
    await redis.setex(redisKey, CART_TTL, JSON.stringify(cart));

    return cart;
  },

  saveCart: async (userId, cartData) => {
    const redis = getRedisClient();
    const redisKey = `cart:${userId}`;

    // 1. Update MongoDB (Source of Truth for Write-Through)
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      cartData,
      { returnDocument: 'after', upsert: true }
    );

    // 2. Update Redis
    await redis.setex(redisKey, CART_TTL, JSON.stringify(updatedCart));

    return updatedCart;
  },

  clearCart: async (userId) => {
    const redis = getRedisClient();
    const redisKey = `cart:${userId}`;

    // Clear items in MongoDB
    const clearedCart = await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 },
      { returnDocument: 'after' }
    );

    // Update Redis with empty cart
    await redis.setex(redisKey, CART_TTL, JSON.stringify(clearedCart));
    
    return clearedCart;
  }
};
