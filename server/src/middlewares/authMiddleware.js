import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/userRepository.js';
import { SellerProfile } from '../models/SellerProfile.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;

    if (user.role === 'SELLER') {
      const sellerProfile = await SellerProfile.findOne({ user: user._id });
      if (sellerProfile) {
        req.user.sellerProfileId = sellerProfile._id;
        req.user.isVerifiedSeller = sellerProfile.isVerified;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await userRepository.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore error, just proceed without user
  }
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden, insufficient permissions' });
    }
    next();
  };
};
