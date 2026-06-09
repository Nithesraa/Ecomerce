import { Wishlist } from '../models/Wishlist.js';
import { getRedisClient } from '../config/redis.js';

const WISHLIST_TTL = 60 * 60; // 1 hour in seconds

export const wishlistRepository = {
  getWishlist: async (userId) => {
    const redis = getRedisClient();
    const redisKey = `wishlist:${userId}`;

    // 1. Try Redis Cache
    const cachedWishlist = await redis.get(redisKey);
    if (cachedWishlist) {
      return JSON.parse(cachedWishlist);
    }

    // 2. Fallback to MongoDB
    let wishlist = await Wishlist.findOne({ user: userId });
    
    // If no wishlist exists, create an empty one
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // 3. Populate Redis Cache
    await redis.setex(redisKey, WISHLIST_TTL, JSON.stringify(wishlist));

    return wishlist;
  },

  saveWishlist: async (userId, wishlistData) => {
    const redis = getRedisClient();
    const redisKey = `wishlist:${userId}`;

    // 1. Update MongoDB
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      wishlistData,
      { returnDocument: 'after', upsert: true }
    );

    // 2. Invalidate Redis (Cache-Aside pattern)
    await redis.del(redisKey);

    return updatedWishlist;
  }
};
