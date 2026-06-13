import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { StarRating } from '../ui/StarRating.jsx';
import { QuickViewModal } from './QuickViewModal.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice.js';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice.js';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

export const ProductCard = ({ product }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const discountedPrice = product.discountPercentage > 0 
    ? product.price - (product.price * (product.discountPercentage / 100))
    : product.price;

  const handleAddToCart = (e) => {
    if (e) e.preventDefault(); 
    if (!isAuthenticated) {
      toast('Please log in to add items to your cart', { icon: '🔒' });
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      toast('Please log in to add items to your wishlist', { icon: '🔒' });
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="group flex flex-col cursor-pointer w-full h-full"
        onClick={() => window.location.href = `/products/${product.slug}`}
      >
        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] bg-[#F6F6F6] dark:bg-[#111111] overflow-hidden flex items-center justify-center">
          <img 
            src={product.images[0]?.url || '/placeholder.png'} 
            alt={product.title} 
            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Stark Add to Bag Button (Slide Up on Hover) */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleAddToCart(e); }}
            className="absolute bottom-0 inset-x-0 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[14px] py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
          >
            Add to Bag <ShoppingCart className="w-4 h-4" />
          </button>

          {/* Quick View trigger icon (Top Right) */}
          <button 
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation(); 
              setShowQuickView(true); 
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 z-20"
          >
            <Eye className="w-4 h-4 text-black dark:text-white" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col mt-4">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-bold text-[14px] text-black dark:text-white leading-tight uppercase tracking-tight">
              {product.title}
            </h3>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-bold text-black dark:text-white">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-[15px] text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <p className="text-[15px] text-gray-500 font-medium mt-1">
            {product.category?.name || 'Category'}
          </p>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <QuickViewModal 
            product={product} 
            onClose={() => setShowQuickView(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};
