import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest, registerSchema, loginSchema } from '../validators/authValidator.js';
import { loginLimiter, refreshLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', loginLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', refreshLimiter, authController.refreshToken);
router.get('/me', authenticate, authController.me);

export default router;
