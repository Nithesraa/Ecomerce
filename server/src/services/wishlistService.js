import { wishlistRepository } from '../repositories/wishlistRepository.js';
import { Product } from '../models/Product.js';

export const wishlistService = {
  getWishlist: async (userId) => {
    const rawWishlist = await wishlistRepository.getWishlist(userId);
    
    // Hydrate products and automatically filter out deleted/inactive ones
    const products = await Product.find({ 
      _id: { $in: rawWishlist.items },
      status: 'ACTIVE',
      isDeleted: false
    }).select('title slug price images stock averageRating');

    return { user: userId, items: products };
  },

  toggleWishlist: async (userId, productId) => {
    // 1. Validate Product
    const product = await Product.findById(productId);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    if (product.isDeleted || product.status !== 'ACTIVE') {
      throw Object.assign(new Error('Product is no longer available'), { statusCode: 400 });
    }

    const rawWishlist = await wishlistRepository.getWishlist(userId);
    
    // 2. Toggle Logic
    const alreadyExists = rawWishlist.items.some(id => id.toString() === productId);
    if (alreadyExists) {
      rawWishlist.items = rawWishlist.items.filter(id => id.toString() !== productId);
    } else {
      rawWishlist.items.push(productId);
    }

    await wishlistRepository.saveWishlist(userId, { items: rawWishlist.items });

    return wishlistService.getWishlist(userId);
  },

  removeFromWishlist: async (userId, productId) => {
    const rawWishlist = await wishlistRepository.getWishlist(userId);
    
    const newItems = rawWishlist.items.filter(id => id.toString() !== productId);
    await wishlistRepository.saveWishlist(userId, { items: newItems });

    return wishlistService.getWishlist(userId);
  }
};
