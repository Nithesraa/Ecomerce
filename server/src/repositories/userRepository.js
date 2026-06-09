import { User } from '../models/User.js';

export const userRepository = {
  findByEmail: async (email) => {
    return User.findOne({ email });
  },
  
  findById: async (id) => {
    // Exclude sensitive fields by default for safety
    return User.findById(id).select('-password -refreshToken');
  },

  findByIdWithSecrets: async (id) => {
    return User.findById(id);
  },

  create: async (userData) => {
    return User.create(userData);
  },

  updateRefreshToken: async (userId, token) => {
    return User.findByIdAndUpdate(userId, { refreshToken: token });
  },
  
  clearRefreshToken: async (userId) => {
    return User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }
};
