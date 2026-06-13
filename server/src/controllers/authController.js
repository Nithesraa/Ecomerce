import { authService } from '../services/authService.js';
import { getCookieOptions, getClearCookieOptions } from '../utils/cookieOptions.js';

export const authController = {
  register: async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken,
          refreshToken
        },
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const incomingToken = req.body?.refreshToken;
      if (!incomingToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
      }

      const { accessToken, refreshToken } = await authService.refreshToken(incomingToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed',
        data: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const incomingToken = req.body?.refreshToken;
      if (incomingToken) {
        try {
          const { verifyRefreshToken } = await import('../utils/jwt.js');
          const decoded = verifyRefreshToken(incomingToken);
          await authService.logout(decoded.id);
        } catch(e) {}
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: req.user, // populated by authenticate middleware
      });
    } catch (error) {
      next(error);
    }
  }
};
