import { cartRepository } from '../repositories/cartRepository.js';
import { Product } from '../models/Product.js';

const hydrateAndCalculateTotal = async (cartItems) => {
  const itemsForDb = [];
  const itemsForFrontend = [];
  let totalAmount = 0;

  if (!cartItems || cartItems.length === 0) {
    return { itemsForDb, itemsForFrontend, totalAmount };
  }

  // Optimize N+1 query: fetch all products at once
  const productIds = [...new Set(cartItems.map(item => item.product.toString()))];
  const products = await Product.find({ _id: { $in: productIds } });
  
  // Create an in-memory map for O(1) lookups
  const productMap = new Map();
  for (const p of products) {
    productMap.set(p._id.toString(), p);
  }

  for (const item of cartItems) {
    const product = productMap.get(item.product.toString());
    
    // Auto-remove products that no longer exist, are deleted, or are not ACTIVE
    if (!product || product.isDeleted || product.status !== 'ACTIVE') {
      continue;
    }

    let price = product.price;
    let stock = product.stock;

    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant) continue;
      
      price = variant.price || product.price;
      stock = variant.stock;
    }

    // Ensure quantity doesn't exceed available stock
    const validQuantity = Math.min(item.quantity, stock);

    if (validQuantity > 0) {
      itemsForDb.push({
        product: product._id,
        variantId: item.variantId,
        quantity: validQuantity,
      });

      itemsForFrontend.push({
        product: product._id,
        productDetails: {
          title: product.title,
          slug: product.slug,
          image: product.images[0]?.url,
          price,
          stock,
        },
        variantId: item.variantId,
        quantity: validQuantity,
      });

      totalAmount += price * validQuantity;
    }
  }

  return { itemsForDb, itemsForFrontend, totalAmount };
};

export const cartService = {
  getCart: async (userId) => {
    const rawCart = await cartRepository.getCart(userId);
    const { itemsForDb, itemsForFrontend, totalAmount } = await hydrateAndCalculateTotal(rawCart.items);
    
    // If the cart changed (auto-removed items or stock adjusted), silently sync
    if (rawCart.items.length !== itemsForDb.length || rawCart.totalAmount !== totalAmount) {
      await cartRepository.saveCart(userId, { items: itemsForDb, totalAmount });
    }

    return { user: userId, items: itemsForFrontend, totalAmount };
  },

  addToCart: async (userId, productId, quantity, variantId = null) => {
    const product = await Product.findById(productId);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    if (product.isDeleted) throw Object.assign(new Error('Product is no longer available'), { statusCode: 400 });
    if (product.status !== 'ACTIVE') throw Object.assign(new Error('Product is not active'), { statusCode: 400 });

    let availableStock = product.stock;
    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) throw Object.assign(new Error('Variant not found'), { statusCode: 404 });
      availableStock = variant.stock;
    }

    if (quantity > availableStock) {
      throw Object.assign(new Error('Requested quantity exceeds available stock'), { statusCode: 400 });
    }

    const rawCart = await cartRepository.getCart(userId);
    const newItems = [...rawCart.items];
    
    const existingItemIndex = newItems.findIndex(
      (item) => item.product.toString() === productId && (item.variantId || null) === (variantId || null)
    );

    if (existingItemIndex > -1) {
      const newQuantity = newItems[existingItemIndex].quantity + quantity;
      if (newQuantity > availableStock) {
        throw Object.assign(new Error('Total quantity exceeds available stock'), { statusCode: 400 });
      }
      newItems[existingItemIndex].quantity = newQuantity;
    } else {
      newItems.push({ product: productId, variantId, quantity });
    }

    const { itemsForDb, itemsForFrontend, totalAmount } = await hydrateAndCalculateTotal(newItems);
    await cartRepository.saveCart(userId, { items: itemsForDb, totalAmount });
    
    return { user: userId, items: itemsForFrontend, totalAmount };
  },

  updateCartItem: async (userId, productId, quantity, variantId = null) => {
    const product = await Product.findById(productId);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    let availableStock = product.stock;
    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) throw Object.assign(new Error('Variant not found'), { statusCode: 404 });
      availableStock = variant.stock;
    }

    if (quantity > availableStock) {
      throw Object.assign(new Error('Requested quantity exceeds available stock'), { statusCode: 400 });
    }

    const rawCart = await cartRepository.getCart(userId);
    let newItems = [...rawCart.items];
    
    const existingItemIndex = newItems.findIndex(
      (item) => item.product.toString() === productId && (item.variantId || null) === (variantId || null)
    );

    if (existingItemIndex === -1) {
      throw Object.assign(new Error('Item not found in cart'), { statusCode: 404 });
    }

    if (quantity <= 0) {
      newItems.splice(existingItemIndex, 1);
    } else {
      newItems[existingItemIndex].quantity = quantity;
    }

    const { itemsForDb, itemsForFrontend, totalAmount } = await hydrateAndCalculateTotal(newItems);
    await cartRepository.saveCart(userId, { items: itemsForDb, totalAmount });
    
    return { user: userId, items: itemsForFrontend, totalAmount };
  },

  removeFromCart: async (userId, productId, variantId = null) => {
    const rawCart = await cartRepository.getCart(userId);
    
    const newItems = rawCart.items.filter(
      (item) => !(item.product.toString() === productId && (item.variantId || null) === (variantId || null))
    );

    const { itemsForDb, itemsForFrontend, totalAmount } = await hydrateAndCalculateTotal(newItems);
    await cartRepository.saveCart(userId, { items: itemsForDb, totalAmount });
    
    return { user: userId, items: itemsForFrontend, totalAmount };
  },

  clearCart: async (userId) => {
    await cartRepository.clearCart(userId);
    return { items: [], totalAmount: 0 };
  }
};
