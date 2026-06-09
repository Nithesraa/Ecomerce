import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Connect to Redis
    connectRedis();

    // 3. Start Express Server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // 4. Graceful Shutdown
    const gracefulShutdown = () => {
      logger.info('SIGTERM/SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
