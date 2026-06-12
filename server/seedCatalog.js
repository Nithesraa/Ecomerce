import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from './src/models/Category.js';
import { Product } from './src/models/Product.js';
import { User } from './src/models/User.js';

dotenv.config();

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets, phones, laptops and more' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories' },
  { name: 'Home', slug: 'home', description: 'Furniture, decor, and appliances' },
  { name: 'Sports', slug: 'sports', description: 'Fitness equipment and sporting goods' },
  { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup, and grooming' },
  { name: 'Books', slug: 'books', description: 'Fiction, non-fiction, and educational' },
];

const generateProducts = (categoryId, sellerId, catName) => {
  if (catName === 'Electronics') {
    return [
      {
        title: 'MacBook Pro 16" M3 Max',
        slug: 'macbook-pro-16-m3-max',
        sku: 'MBP-16-M3-001',
        description: 'The most powerful MacBook ever built. Features the M3 Max chip with 16-core CPU and 40-core GPU.',
        price: 3499,
        discountPercentage: 5,
        category: categoryId,
        seller: sellerId,
        images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000', publicId: 'demo/macbook' }],
        stock: 50,
        averageRating: 4.9,
        reviewCount: 124,
        status: 'ACTIVE',
        isFeatured: true
      },
      {
        title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        slug: 'sony-wh-1000xm5',
        sku: 'SONY-WH-005',
        description: 'Industry leading noise cancellation with two processors and eight microphones.',
        price: 398,
        discountPercentage: 10,
        category: categoryId,
        seller: sellerId,
        images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000', publicId: 'demo/sony' }],
        stock: 120,
        averageRating: 4.8,
        reviewCount: 342,
        status: 'ACTIVE',
        isFeatured: true
      }
    ];
  } else if (catName === 'Fashion') {
    return [
      {
        title: 'Minimalist Cotton T-Shirt',
        slug: 'minimalist-cotton-tshirt',
        sku: 'TSHIRT-001',
        description: 'Premium heavy-weight cotton t-shirt designed for everyday wear.',
        price: 35,
        category: categoryId,
        seller: sellerId,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000', publicId: 'demo/shirt' }],
        stock: 200,
        averageRating: 4.5,
        reviewCount: 89,
        status: 'ACTIVE',
        isFeatured: true
      },
      {
        title: 'Classic Denim Jacket',
        slug: 'classic-denim-jacket',
        sku: 'JACKET-002',
        description: 'Timeless denim jacket with a relaxed fit and vintage wash.',
        price: 120,
        category: categoryId,
        seller: sellerId,
        images: [{ url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000', publicId: 'demo/jacket' }],
        stock: 45,
        averageRating: 4.7,
        reviewCount: 56,
        status: 'ACTIVE',
        isFeatured: false
      }
    ];
  } else if (catName === 'Home') {
    return [
      {
        title: 'Ergonomic Office Chair',
        slug: 'ergonomic-office-chair',
        sku: 'CHAIR-001',
        description: 'Fully adjustable ergonomic chair designed for long hours of comfortable working.',
        price: 450,
        discountPercentage: 15,
        category: categoryId,
        seller: sellerId,
        images: [{ url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000', publicId: 'demo/chair' }],
        stock: 30,
        averageRating: 4.6,
        reviewCount: 210,
        status: 'ACTIVE',
        isFeatured: true
      }
    ];
  } else if (catName === 'Sports') {
    return [
      {
        title: 'Adjustable Dumbbell Set',
        slug: 'adjustable-dumbbell-set',
        sku: 'DUMBBELL-001',
        description: 'Space-saving adjustable dumbbells replacing 15 sets of weights.',
        price: 399,
        category: categoryId,
        seller: sellerId,
        images: [{ url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000', publicId: 'demo/dumbbell' }],
        stock: 15,
        averageRating: 4.9,
        reviewCount: 432,
        status: 'ACTIVE',
        isFeatured: true
      }
    ];
  }
  return [];
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Clear existing
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing categories and products.');

    // Find or create a seller
    let seller = await User.findOne({ role: 'SELLER' });
    if (!seller) {
      seller = await User.findOne({}); // Just use any user if no seller
    }
    const sellerId = seller ? seller._id : new mongoose.Types.ObjectId();

    // Create Categories and Products
    for (const catData of categories) {
      const category = await Category.create(catData);
      console.log(`Created category: ${category.name}`);
      
      const productsData = generateProducts(category._id, sellerId, category.name);
      if (productsData.length > 0) {
        await Product.insertMany(productsData);
        console.log(`Created ${productsData.length} products for ${category.name}`);
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
