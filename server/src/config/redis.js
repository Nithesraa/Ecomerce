import { Redis } from 'ioredis';
import { env } from './env.js';
import logger from '../utils/logger.js';

let redisClient = null;

export const connectRedis = () => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connection established successfully');
  });

  redisClient.on('error', (err) => {
    logger.error('❌ Redis connection error:', err);
  });

  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    return connectRedis();
  }
  return redisClient;
};
