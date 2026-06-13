import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createProductThunk, updateProductThunk } from '../dashboardSlice.js';
import { categoryService } from '../../../api/categoryService.js';
import toast from 'react-hot-toast';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  discountPercentage: z.coerce.number().min(0).max(100).optional().default(0),
});

export const ProductFormModal = ({ isOpen, onClose, existingProduct }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'DRAFT',
      discountPercentage: 0,
      price: 0,
      stock: 0
    }
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data);
      } catch (err) {
        toast.error('Failed to load categories');
      }
    };
    fetchCats();
  }, []);

  // Initialize form when existingProduct changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingProduct) {
        setValue('title', existingProduct.title);
        setValue('description', existingProduct.description);
        setValue('price', existingProduct.price);
        setValue('stock', existingProduct.stock);
        setValue('category', existingProduct.category?._id || existingProduct.category);
        setValue('status', existingProduct.status);
        setValue('discountPercentage', existingProduct.discountPercentage || 0);
        setExistingImages(existingProduct.images || []);
      } else {
        reset({
          title: '', description: '', price: 0, stock: 0, category: '', status: 'DRAFT', discountPercentage: 0
        });
        setExistingImages([]);
      }
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  }, [isOpen, existingProduct, setValue, reset]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + selectedFiles.length > 5) {
      return toast.error('Maximum 5 images allowed');
    }

    setSelectedFiles(prev => [...prev, ...files]);
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const urls = [...prev];
      URL.revokeObjectURL(urls[index]);
      urls.splice(index, 1);
      return urls;
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      // If updating, we need to pass the remaining existing images URLs 
      // so the backend knows which ones to keep.
      // (Backend expects `existingImages` array or we can just send the stringified array)
      if (existingProduct) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      // Append new files
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      if (existingProduct) {
        await dispatch(updateProductThunk({ id: existingProduct._id, formData })).unwrap();
      } else {
        await dispatch(createProductThunk(formData)).unwrap();
      }
      
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              {existingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
            <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Product Title</label>
                  <input {...register('title')} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" placeholder="e.g. Classic White Sneakers" />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea {...register('description')} rows={4} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none resize-none" placeholder="Product description..." />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Price ($)</label>
                  <input type="number" step="0.01" {...register('price')} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" placeholder="0.00" />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Discount (%)</label>
                  <input type="number" {...register('discountPercentage')} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" placeholder="0" />
                  {errors.discountPercentage && <p className="text-red-500 text-sm mt-1">{errors.discountPercentage.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Stock</label>
                  <input type="number" {...register('stock')} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" placeholder="0" />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Status</label>
                  <select {...register('status')} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none">
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Category</label>
                  <select {...register('category')} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none">
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>

                {/* Images Section */}
                <div className="space-y-3 sm:col-span-2 mt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Product Images</label>
                    <span className="text-sm text-gray-400">{existingImages.length + selectedFiles.length} / 5 max</span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {/* Existing Images */}
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/[0.05] group bg-gray-50 dark:bg-[#222]">
                        <img src={img.url} alt="product" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removeExistingImage(idx)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* New Previews */}
                    {previewUrls.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/[0.05] group bg-gray-50 dark:bg-[#222]">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removeNewImage(idx)} className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Upload Button */}
                    {(existingImages.length + selectedFiles.length) < 5 && (
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-white/[0.1] flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      >
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-[15px] font-bold uppercase">Upload</span>
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileSelect}
                  />
                </div>

              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-[#111] flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="product-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center min-w-[120px] transition-colors shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
