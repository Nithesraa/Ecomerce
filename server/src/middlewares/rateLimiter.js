import rateLimit from 'express-rate-limit';

// Standard error message for rate limiting
const message = {
  success: false,
  message: 'Too many requests, please try again later.',
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message,
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message,
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message,
  standardHeaders: true,
  legacyHeaders: false,
});
