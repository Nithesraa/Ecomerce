import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { env } from './src/config/env.js';
import { orderService } from './src/services/orderService.js';
import { paymentService } from './src/services/paymentService.js';
import { razorpayService } from './src/services/razorpayService.js';
import { Product } from './src/models/Product.js';
import { Category } from './src/models/Category.js';
import { SellerProfile } from './src/models/SellerProfile.js';
import { webhookController } from './src/controllers/webhookController.js';

async function runTests() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI);

  const userId = new mongoose.Types.ObjectId();

  console.log('\n📦 Setting up Mock Data...');
  const category = await Category.create({ name: 'WH Cat ' + Date.now(), slug: 'wh-cat-' + Date.now() });
  const seller = await SellerProfile.create({ 
    user: new mongoose.Types.ObjectId(), 
    storeName: 'WH Store ' + Date.now(),
    businessEmail: `wh-${Date.now()}@store.com`
  });
  
  const product = await Product.create({
    title: 'Webhook Product',
    slug: 'test-wh-' + Date.now(),
    sku: 'test-wh-' + Date.now(),
    description: 'Test',
    price: 500,
    category: category._id,
    seller: seller._id,
    status: 'ACTIVE',
    stock: 10,
    images: [{ url: 'test', publicId: 'test' }]
  });

  // Mock a cart logic manually to create an order
  const orderData = {
    user: userId,
    shippingAddress: { street: '1', city: '1', state: '1', country: '1', zipCode: '1' },
    totalAmount: 500,
    items: [{
      product: product._id,
      productTitle: product.title,
      priceAtPurchase: product.price,
      seller: seller._id,
      quantity: 1
    }]
  };
  
  const { Order } = await import('./src/models/Order.js');
  const { OrderItem } = await import('./src/models/OrderItem.js');

  const order = await Order.create(orderData);
  await OrderItem.create(orderData.items.map(item => ({ ...item, order: order._id })));

  const rpOrder = await paymentService.initializePayment(order._id);

  console.log('\n=======================================');
  console.log('🔗 WEBHOOK VERIFICATION');
  console.log('=======================================');

  // Build the webhook payload
  const payload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_mock_' + Date.now(),
          order_id: rpOrder.razorpayOrderId,
          notes: {
            orderId: order._id.toString()
          }
        }
      }
    }
  };

  const rawBody = JSON.stringify(payload);
  
  // Sign it
  // For the test, if env.RAZORPAY_KEY_ID is mock, razorpayService.verifyWebhookSignature expects 'mock_webhook_signature'.
  // We will pass 'mock_webhook_signature' if using mocked mode, or generate it if using real secret.
  let signature = 'mock_webhook_signature';
  if (env.RAZORPAY_WEBHOOK_SECRET) {
    signature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
  }

  const req = {
    headers: {
      'x-razorpay-signature': signature
    },
    body: {
      toString: () => rawBody // mock express.raw Buffer
    }
  };

  const res = {
    status: (code) => {
      console.log(`[Response Status]: ${code}`);
      return {
        json: (data) => console.log(`[Response JSON]:`, data)
      };
    }
  };

  const next = (err) => {
    if (err) console.error('Next called with error:', err);
  };

  console.log('\n[1] Firing Webhook (First Time)...');
  await webhookController.handleRazorpayWebhook(req, res, next);
  
  const verifiedOrder = await Order.findById(order._id);
  if (verifiedOrder.paymentStatus === 'PAID') {
    console.log('✅ Order marked as PAID correctly via Webhook.');
  } else {
    throw new Error('Order not updated to PAID.');
  }

  console.log('\n[2] Firing Webhook (Duplicate / Idempotency Check)...');
  await webhookController.handleRazorpayWebhook(req, res, next);
  console.log('✅ Duplicate webhook handled without throwing (Expected 200 OK above).');

  console.log('\n✨ Webhook verifications passed!');

  // Cleanup
  await Order.findByIdAndDelete(order._id);
  await OrderItem.deleteMany({ order: order._id });
  await Product.findByIdAndDelete(product._id);
  await Category.findByIdAndDelete(category._id);
  await SellerProfile.findByIdAndDelete(seller._id);

  process.exit(0);
}

runTests().catch(console.error);
