import cloudinary from '../config/cloudinary.js';
import { productRepository } from '../repositories/productRepository.js';
import mongoose from 'mongoose';

const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'shopsphere/products' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
  }
};

export const productService = {
  createProduct: async (productData, sellerId, files) => {
    const images = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadImageToCloudinary(file.buffer);
        images.push(result);
      }
    }

    // Generate slug from title
    const slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    // Generate sku if not provided
    const sku = productData.sku || `SKU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const data = {
      ...productData,
      slug,
      sku,
      seller: sellerId,
      images,
      status: 'PENDING_APPROVAL', // Default for new products
    };

    return productRepository.create(data);
  },

  getProducts: async (filters, options) => {
    // If not admin/seller checking their own, only show ACTIVE
    if (!filters.showAllStatus) {
      filters.status = 'ACTIVE';
    }
    delete filters.showAllStatus;

    if (filters.category && !mongoose.Types.ObjectId.isValid(filters.category)) {
      return { products: [], total: 0 };
    }

    return productRepository.findProducts(filters, options);
  },

  getProductBySlug: async (slug) => {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  },

  getSellerProducts: async (sellerId, options) => {
    // Seller can see all their products regardless of status
    return productRepository.findProducts({ seller: sellerId }, options);
  },

  updateProduct: async (id, updateData, user) => {
    const product = await productRepository.findById(id);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    // Ownership Validation
    const sellerProfileId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
    if (sellerProfileId !== user.sellerProfileId?.toString() && user.role !== 'ADMIN') {
      throw Object.assign(new Error('Forbidden: You do not own this product'), { statusCode: 403 });
    }

    return productRepository.update(id, updateData);
  },

  deleteProduct: async (id, user) => {
    const product = await productRepository.findById(id);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    // Ownership Validation
    const sellerProfileId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
    if (sellerProfileId !== user.sellerProfileId?.toString() && user.role !== 'ADMIN') {
      throw Object.assign(new Error('Forbidden: You do not own this product'), { statusCode: 403 });
    }

    // Soft Delete
    return productRepository.update(id, { isDeleted: true, status: 'ARCHIVED' });
  }
};
