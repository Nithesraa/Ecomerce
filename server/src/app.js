import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';

const app = express();

// 1. Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // We will configure this properly for production later
    credentials: true,
  })
);

// 2. Request Parsing
// Webhooks MUST be parsed as raw buffers for crypto signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Request Logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// 4. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ShopSphere API is running' });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
