import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { StarRating } from '../ui/StarRating.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice.js';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const QuickViewModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast('Please log in to add items to your cart', { icon: '🔒' });
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    onClose();
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast('Please log in to add items to your wishlist', { icon: '🔒' });
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-white dark:bg-[#09090b] rounded-[24px] shadow-2xl shadow-black/20 overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh] border border-[#E2E8F0] dark:border-white/[0.06]"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all hover:bg-gray-100 dark:hover:bg-white/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image */}
          <div className="w-full md:w-1/2 bg-gray-50/50 dark:bg-white/[0.01] border-b md:border-b-0 md:border-r border-[#E2E8F0] dark:border-white/[0.04] p-8 flex items-center justify-center min-h-[300px]">
            <img 
              src={product.images[0]?.url || '/placeholder.png'} 
              alt={product.title}
              className="max-w-full max-h-[450px] object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center overflow-y-auto">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-[#fafafa] mb-3 tracking-tight">
              {product.title}
            </h2>
            
            <StarRating rating={product.averageRating} count={product.reviewCount} className="mb-6 opacity-80" />
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-[28px] font-extrabold text-gray-900 dark:text-[#fafafa] leading-none">
                ${product.price.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="px-2 py-1 text-[14px] font-bold text-gray-900 dark:text-gray-900 bg-gray-200 dark:bg-white rounded-md tracking-wider">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-[14px] leading-relaxed mb-10 line-clamp-4">
              {product.description}
            </p>

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={handleAddToCart}
                className="flex-1 h-[52px] bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/10 dark:shadow-white/5"
              >
                <ShoppingBag className="w-5 h-5" />
                Add To Cart
              </button>
              <button 
                onClick={handleWishlist}
                className="w-[52px] h-[52px] flex items-center justify-center border border-gray-200 dark:border-white/[0.1] hover:border-gray-400 dark:hover:border-white/[0.2] hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-xl text-gray-600 dark:text-gray-400 transition-all"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              onClick={() => { onClose(); navigate(`/products/${product.slug}`); }}
              className="mt-6 text-center text-[14px] font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              View Full Details →
            </button>
          </div>
        </motion.div>
    </motion.div>
  );
};
