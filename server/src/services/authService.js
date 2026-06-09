import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const authService = {
  register: async ({ name, email, password, role }) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.create({ name, email, password, role });
    
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  },

  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.isLocked) {
      const error = new Error(`Account is locked until ${new Date(user.lockUntil).toLocaleTimeString()}. Try again later.`);
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Reset attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await userRepository.updateRefreshToken(user._id, hashedRefreshToken);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  },

  refreshToken: async (token) => {
    if (!token) {
      const error = new Error('Refresh token is required');
      error.statusCode = 401;
      throw error;
    }

    try {
      const decoded = verifyRefreshToken(token);
      const user = await userRepository.findByIdWithSecrets(decoded.id);
      
      if (!user || !user.refreshToken) {
        const error = new Error('Invalid refresh token');
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await bcrypt.compare(token, user.refreshToken);
      if (!isMatch) {
        const error = new Error('Invalid refresh token');
        error.statusCode = 401;
        throw error;
      }

      const newAccessToken = generateAccessToken(user._id, user.role);
      const newRefreshToken = generateRefreshToken(user._id);

      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await userRepository.updateRefreshToken(user._id, hashedRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (err) {
      const error = new Error(err.message || 'Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }
  },

  logout: async (userId) => {
    await userRepository.clearRefreshToken(userId);
  }
};
