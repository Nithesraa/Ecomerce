import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';
import { BrowsingEvent } from '../src/models/BrowsingEvent.js';
import { OrderItem } from '../src/models/OrderItem.js';
import { Order } from '../src/models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedAnalytics = async () => {
  await connectDB();

  console.log('Clearing old analytics data...');
  await BrowsingEvent.deleteMany({});
  
  // Note: we won't delete all orders because that might mess up their actual orders,
  // but we can create some new ones if they are missing. For now, let's just create some new ones.

  const products = await Product.find().limit(20);
  const users = await User.find().limit(5);

  if (products.length === 0 || users.length === 0) {
    console.log('Please ensure there are products and users in the DB first.');
    process.exit(1);
  }

  console.log('Seeding BrowsingEvents...');
  const eventsToCreate = [];
  
  for (let i = 0; i < 200; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    // 70% chance view, 20% cart, 10% purchase
    const rand = Math.random();
    let type = 'VIEW';
    if (rand > 0.7 && rand <= 0.9) type = 'ADD_TO_CART';
    if (rand > 0.9) type = 'PURCHASE';

    eventsToCreate.push({
      user: randomUser._id,
      product: randomProduct._id,
      eventType: type,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
    });
  }

  await BrowsingEvent.insertMany(eventsToCreate);

  console.log('Seeding fake Orders & OrderItems for Similar Products testing...');
  // Let's create pairs of products that are often bought together.
  // Pair 1: Product 0 and Product 1
  // Pair 2: Product 2 and Product 3
  
  for (let i = 0; i < 5; i++) {
    const user = users[i % users.length];
    const order = await Order.create({
      user: user._id,
      totalAmount: 100,
      shippingAddress: { street: '1', city: 'A', state: 'B', country: 'C', zipCode: '11111' }
    });

    // Pair 1
    await OrderItem.create({
      order: order._id,
      product: products[0]._id,
      productTitle: products[0].title,
      seller: products[0].seller,
      quantity: 1,
      priceAtPurchase: products[0].price
    });
    await OrderItem.create({
      order: order._id,
      product: products[1]._id,
      productTitle: products[1].title,
      seller: products[1].seller,
      quantity: 1,
      priceAtPurchase: products[1].price
    });
  }

  for (let i = 0; i < 5; i++) {
    const user = users[i % users.length];
    const order = await Order.create({
      user: user._id,
      totalAmount: 200,
      shippingAddress: { street: '1', city: 'A', state: 'B', country: 'C', zipCode: '11111' }
    });

    // Pair 2
    await OrderItem.create({
      order: order._id,
      product: products[2]._id,
      productTitle: products[2].title,
      seller: products[2].seller,
      quantity: 1,
      priceAtPurchase: products[2].price
    });
    await OrderItem.create({
      order: order._id,
      product: products[3]._id,
      productTitle: products[3].title,
      seller: products[3].seller,
      quantity: 1,
      priceAtPurchase: products[3].price
    });
  }

  console.log('Analytics Data Seeded Successfully!');
  process.exit(0);
};

seedAnalytics();
