import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Product } from '../src/models/Product.js';
import { Category } from '../src/models/Category.js';
import { User } from '../src/models/User.js';

const SEED_DATA = {
  Fashion: [
    { title: 'Classic White T-Shirt', price: 19.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80' },
    { title: 'Denim Jacket Vintage', price: 59.99, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80' },
    { title: 'Slim Fit Jeans Black', price: 45.00, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80' },
    { title: 'Summer Floral Dress', price: 34.50, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80' },
    { title: 'Leather Biker Jacket', price: 120.00, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80' },
    { title: 'Oversized Hoodie', price: 40.00, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80' },
    { title: 'Formal Oxford Shirt', price: 35.00, image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&w=500&q=80' },
    { title: 'Yoga Leggings', price: 28.99, image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=500&q=80' },
    { title: 'Knit Winter Beanie', price: 15.00, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=500&q=80' },
    { title: 'Casual Chino Pants', price: 38.00, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80' }
  ],
  Home: [
    { title: 'Ceramic Coffee Mug', price: 12.99, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=80' },
    { title: 'Minimalist Wall Clock', price: 45.00, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=500&q=80' },
    { title: 'Fluffy Throw Blanket', price: 30.00, image: 'https://images.unsplash.com/photo-1580828369066-88b9a21ce1ec?auto=format&fit=crop&w=500&q=80' },
    { title: 'Scented Candle Set', price: 24.99, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=80' },
    { title: 'Indoor Potted Plant', price: 18.50, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80' },
    { title: 'Bamboo Cutting Board', price: 22.00, image: 'https://images.unsplash.com/photo-1615526685810-7212ebcc3c68?auto=format&fit=crop&w=500&q=80' },
    { title: 'Woven Storage Basket', price: 28.00, image: 'https://images.unsplash.com/photo-1596201594950-ec22510b65dc?auto=format&fit=crop&w=500&q=80' },
    { title: 'Linen Pillow Covers', price: 16.99, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80' },
    { title: 'Nordic Table Lamp', price: 55.00, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80' },
    { title: 'Wooden Serving Tray', price: 35.00, image: 'https://images.unsplash.com/photo-1581452292723-5a0d33e7215c?auto=format&fit=crop&w=500&q=80' }
  ],
  Sports: [
    { title: 'Pro Yoga Mat', price: 29.99, image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=500&q=80' },
    { title: 'Adjustable Dumbbell Set', price: 149.99, image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=500&q=80' },
    { title: 'Resistance Bands', price: 14.50, image: 'https://images.unsplash.com/photo-1598266663439-2056e6900339?auto=format&fit=crop&w=500&q=80' },
    { title: 'Protein Shaker Bottle', price: 9.99, image: 'https://images.unsplash.com/photo-1566450653303-2614cbb292ea?auto=format&fit=crop&w=500&q=80' },
    { title: 'Jump Rope', price: 12.00, image: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=500&q=80' },
    { title: 'Kettlebell 10kg', price: 35.00, image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=80' },
    { title: 'Foam Roller', price: 18.00, image: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?auto=format&fit=crop&w=500&q=80' },
    { title: 'Boxing Gloves', price: 45.00, image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&w=500&q=80' },
    { title: 'Treadmill Cover', price: 25.00, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80' },
    { title: 'Gym Duffle Bag', price: 32.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80' }
  ],
  Beauty: [
    { title: 'Hydrating Face Serum', price: 38.00, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80' },
    { title: 'Matte Lipstick Set', price: 24.00, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=500&q=80' },
    { title: 'Night Repair Cream', price: 45.00, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=500&q=80' },
    { title: 'Rosewater Toner', price: 18.50, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { title: 'Eyeshadow Palette', price: 32.00, image: 'https://images.unsplash.com/photo-1512496015851-a1c848523b08?auto=format&fit=crop&w=500&q=80' },
    { title: 'Vegan Makeup Brushes', price: 28.00, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80' },
    { title: 'Argan Hair Oil', price: 22.00, image: 'https://images.unsplash.com/photo-1608248593842-8021c6a81ec4?auto=format&fit=crop&w=500&q=80' },
    { title: 'Charcoal Face Mask', price: 15.00, image: 'https://images.unsplash.com/photo-1556228720-192a6af4e86e?auto=format&fit=crop&w=500&q=80' },
    { title: 'Vitamin C Serum', price: 35.00, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7ceb449b?auto=format&fit=crop&w=500&q=80' },
    { title: 'Exfoliating Body Scrub', price: 20.00, image: 'https://images.unsplash.com/photo-1556228720-192a6af4e86e?auto=format&fit=crop&w=500&q=80' }
  ],
  Books: [
    { title: 'The Great Gatsby', price: 10.99, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80' },
    { title: 'To Kill a Mockingbird', price: 12.50, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=80' },
    { title: '1984 George Orwell', price: 9.99, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80' },
    { title: 'Pride and Prejudice', price: 8.50, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80' },
    { title: 'The Hobbit', price: 14.00, image: 'https://images.unsplash.com/photo-1629196914168-3a36279f72db?auto=format&fit=crop&w=500&q=80' },
    { title: 'Atomic Habits', price: 16.99, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=80' },
    { title: 'Sapiens', price: 18.00, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80' },
    { title: 'Thinking, Fast and Slow', price: 15.50, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80' },
    { title: 'The Alchemist', price: 11.00, image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80' },
    { title: 'Dune', price: 13.99, image: 'https://images.unsplash.com/photo-1629196914168-3a36279f72db?auto=format&fit=crop&w=500&q=80' }
  ],
  Shoes: [
    { title: 'Running Sneakers Pro', price: 89.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80' },
    { title: 'Classic Canvas Low', price: 45.00, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=80' },
    { title: 'Leather Oxford Shoes', price: 120.00, image: 'https://images.unsplash.com/photo-1614252339460-e17131b73e5a?auto=format&fit=crop&w=500&q=80' },
    { title: 'Comfort Walk Slip-ons', price: 55.00, image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=500&q=80' },
    { title: 'High-Top Basketball Shoes', price: 110.00, image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=500&q=80' },
    { title: 'Suede Chelsea Boots', price: 95.00, image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=500&q=80' },
    { title: 'Summer Flip Flops', price: 15.00, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=500&q=80' },
    { title: 'Trail Hiking Boots', price: 130.00, image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=500&q=80' },
    { title: 'Formal Dress Loafers', price: 85.00, image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=500&q=80' },
    { title: 'Platform Chunky Sneakers', price: 75.00, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?auto=format&fit=crop&w=500&q=80' }
  ]
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('No categories found. Run category seeder first.');
      process.exit(1);
    }
    
    // Find any user to be the seller
    let seller = await User.findOne({ role: 'ADMIN' });
    if (!seller) seller = await User.findOne({});
    if (!seller) {
      console.log('No users found. Creating a dummy seller...');
      seller = await User.create({ name: 'System Admin', email: 'admin@shopsphere.local', password: 'password123', role: 'ADMIN', isEmailVerified: true });
    }

    let totalInserted = 0;

    for (const category of categories) {
      const items = SEED_DATA[category.name];
      if (!items) {
        console.log(`No mock data found for category: ${category.name}`);
        continue;
      }

      console.log(`Seeding 10 products for ${category.name}...`);
      for (const [index, item] of items.entries()) {
        const uniqueId = Math.random().toString(36).substring(2, 7);
        const slug = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uniqueId}`;
        await Product.create({
          title: item.title,
          slug,
          sku: `SKU-${category.name.toUpperCase().substring(0, 3)}-${uniqueId.toUpperCase()}-${index}`,
          description: `Premium ${category.name} quality item. Beautiful design and incredible durability. Perfectly suited for modern lifestyles.`,
          price: item.price,
          category: category._id,
          seller: seller._id,
          stock: Math.floor(Math.random() * 100) + 10,
          images: [{ url: item.image, publicId: `seed-${Date.now()}` }],
          averageRating: Number((Math.random() * 2 + 3).toFixed(1)), // Random 3.0 to 5.0
          reviewCount: Math.floor(Math.random() * 50),
          isActive: true,
          status: 'ACTIVE'
        });
        totalInserted++;
      }
    }

    // Fix previously seeded products
    await Product.updateMany({ status: 'DRAFT' }, { status: 'ACTIVE' });

    console.log(`Successfully seeded ${totalInserted} products across ${categories.length} categories!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seed();
