import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './src/models/Product.js';
import { Category } from './src/models/Category.js';
import { User } from './src/models/User.js';

dotenv.config();

const seedHeroProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopsphere');
    console.log('Connected to MongoDB');

    // Get an admin user or the first seller
    let seller = await User.findOne({ role: 'SELLER' });
    if (!seller) seller = await User.findOne({ role: 'ADMIN' });
    if (!seller) seller = await User.findOne();
    
    // Get fashion category
    let fashionCategory = await Category.findOne({ name: /Fashion|Clothing/i });
    if (!fashionCategory) {
      fashionCategory = await Category.create({ name: 'Fashion', slug: 'fashion', description: 'Fashion category' });
    }

    const newProducts = [
      {
        title: "Men's Premium Essential Tee",
        slug: "mens-premium-essential-tee-" + Date.now(),
        sku: "MENS-TEE-" + Date.now(),
        description: "The perfect everyday t-shirt for men. Crafted from ultra-soft organic cotton.",
        price: 35.00,
        discountPercentage: 0,
        category: fashionCategory._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800", publicId: "mock1" }],
        stock: 100,
        tags: ["men", "clothing", "t-shirt", "essential"],
        status: "ACTIVE",
        isFeatured: true
      },
      {
        title: "Men's Classic Leather Jacket",
        slug: "mens-classic-leather-jacket-" + Date.now(),
        sku: "MENS-JKT-" + Date.now(),
        description: "A timeless classic leather jacket for men. Perfect for any season.",
        price: 250.00,
        discountPercentage: 10,
        category: fashionCategory._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800", publicId: "mock2" }],
        stock: 50,
        tags: ["men", "clothing", "jacket", "leather"],
        status: "ACTIVE",
        isFeatured: true
      },
      {
        title: "Women's Silk Summer Dress",
        slug: "womens-silk-summer-dress-" + Date.now(),
        sku: "WOMENS-DRS-" + Date.now(),
        description: "Elegant silk summer dress for women. Lightweight and beautiful.",
        price: 120.00,
        discountPercentage: 15,
        category: fashionCategory._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800", publicId: "mock3" }],
        stock: 75,
        tags: ["women", "clothing", "dress", "summer"],
        status: "ACTIVE",
        isFeatured: true
      },
      {
        title: "Women's Designer Handbag",
        slug: "womens-designer-handbag-" + Date.now(),
        sku: "WOMENS-BAG-" + Date.now(),
        description: "Premium designer handbag for women. The perfect accessory.",
        price: 450.00,
        discountPercentage: 0,
        category: fashionCategory._id,
        seller: seller._id,
        images: [{ url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800", publicId: "mock4" }],
        stock: 25,
        tags: ["women", "accessories", "bag", "designer"],
        status: "ACTIVE",
        isFeatured: true
      }
    ];

    await Product.insertMany(newProducts);
    console.log('Successfully seeded 4 mock products for men and women!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedHeroProducts();
