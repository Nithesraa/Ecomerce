import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { dashboardService } from './src/services/dashboardService.js';
import { Product } from './src/models/Product.js';
import { OrderItem } from './src/models/OrderItem.js';
import { SellerProfile } from './src/models/SellerProfile.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI);

  console.log('\n📦 Setting up Mock Dashboard Data...');
  const sellerId = new mongoose.Types.ObjectId();
  
  await SellerProfile.create({
    _id: sellerId,
    user: new mongoose.Types.ObjectId(),
    storeName: 'DB Store ' + Date.now(),
    businessEmail: `db-${Date.now()}@store.com`
  });

  // Create 3 active products, 1 low stock
  const p1 = await Product.create({
    title: 'DB Product 1 (Low Stock)',
    slug: 'db-product-1-' + Date.now(),
    sku: 'db-1-' + Date.now(),
    description: 'Test',
    price: 100,
    category: new mongoose.Types.ObjectId(),
    seller: sellerId,
    status: 'ACTIVE',
    stock: 2, // Low stock <= 5
  });

  const p2 = await Product.create({
    title: 'DB Product 2 (Normal Stock)',
    slug: 'db-product-2-' + Date.now(),
    sku: 'db-2-' + Date.now(),
    description: 'Test',
    price: 200,
    category: new mongoose.Types.ObjectId(),
    seller: sellerId,
    status: 'ACTIVE',
    stock: 10,
  });

  const p3 = await Product.create({
    title: 'DB Product 3 (Normal Stock)',
    slug: 'db-product-3-' + Date.now(),
    sku: 'db-3-' + Date.now(),
    description: 'Test',
    price: 300,
    category: new mongoose.Types.ObjectId(),
    seller: sellerId,
    status: 'ACTIVE',
    stock: 20,
  });

  // Create 2 Orders containing 3 items total
  // Order 1: 2x p1 (2 * 100 = 200) + 1x p2 (1 * 200 = 200) -> Total Revenue 400
  // Order 2: 3x p3 (3 * 300 = 900) -> Total Revenue 900
  // Expected Total Revenue: 1300
  // Expected Products Sold: 6
  // Expected Unique Orders: 2

  const order1Id = new mongoose.Types.ObjectId();
  const order2Id = new mongoose.Types.ObjectId();

  await OrderItem.create([
    { order: order1Id, product: p1._id, productTitle: p1.title, priceAtPurchase: 100, quantity: 2, seller: sellerId },
    { order: order1Id, product: p2._id, productTitle: p2.title, priceAtPurchase: 200, quantity: 1, seller: sellerId },
    { order: order2Id, product: p3._id, productTitle: p3.title, priceAtPurchase: 300, quantity: 3, seller: sellerId },
  ]);

  console.log('\n=======================================');
  console.log('📊 DASHBOARD API VERIFICATION');
  console.log('=======================================');

  const metrics = await dashboardService.getSellerOverview(sellerId);
  console.log('Retrieved Metrics:', metrics);

  if (metrics.totalRevenue === 1300) console.log('✅ Revenue calculated correctly (1300)');
  else throw new Error(`Revenue mismatch: ${metrics.totalRevenue} !== 1300`);

  if (metrics.productsSold === 6) console.log('✅ Products Sold calculated correctly (6)');
  else throw new Error(`Products Sold mismatch: ${metrics.productsSold} !== 6`);

  if (metrics.totalOrders === 2) console.log('✅ Total Orders calculated correctly (2)');
  else throw new Error(`Total Orders mismatch: ${metrics.totalOrders} !== 2`);

  if (metrics.activeProducts === 3) console.log('✅ Active Products calculated correctly (3)');
  else throw new Error(`Active Products mismatch: ${metrics.activeProducts} !== 3`);

  if (metrics.lowStockProducts === 1) console.log('✅ Low Stock Products calculated correctly (1)');
  else throw new Error(`Low Stock Products mismatch: ${metrics.lowStockProducts} !== 1`);

  console.log('\n✨ All Dashboard API Verifications Passed!');

  // Cleanup
  await SellerProfile.findByIdAndDelete(sellerId);
  await Product.deleteMany({ seller: sellerId });
  await OrderItem.deleteMany({ seller: sellerId });

  process.exit(0);
}

runTests().catch(console.error);
