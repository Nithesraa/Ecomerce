import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import logger from './utils/logger.js';
import { initSocket } from './socket/index.js';
import { startCartRecoveryJob } from './jobs/cartRecoveryJob.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Connect to Redis
    connectRedis();

    // 3. Start Express Server
    const server = http.createServer(app);

    // 4. Initialize Socket.IO
    initSocket(server);

    // Start background jobs
    startCartRecoveryJob();

    server.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // 5. Graceful Shutdown
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
