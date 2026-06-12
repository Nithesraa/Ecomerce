import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { toggleWishlist, fetchWishlist } from '../wishlistSlice.js';
import { addToCart } from '../../cart/cartSlice.js';
import toast from 'react-hot-toast';

export const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wishlist, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const items = wishlist?.items || [];

  const handleRemove = (productId) => {
    dispatch(toggleWishlist(productId));
  };

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(toggleWishlist(product._id)); // Remove from wishlist after moving
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="animate-pulse flex gap-2">
          <div className="w-3 h-3 bg-black dark:bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-black dark:bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-black dark:bg-white rounded-full"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-[#050505] text-black dark:text-white px-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mb-8">
          <Heart className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-[40px] md:text-[50px] font-black uppercase tracking-tighter mb-4 text-center leading-none">No Saved Items</h1>
        <p className="text-gray-500 mb-10 text-center max-w-md text-[17px]">
          Your wishlist is currently empty. Start saving items you love by clicking the heart icon.
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[17px] hover:opacity-80 transition-opacity"
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex items-end justify-between border-b-2 border-black dark:border-white pb-6 mb-12">
          <h1 className="text-[40px] md:text-[50px] font-black uppercase tracking-tighter leading-none">Wishlist</h1>
          <span className="text-[18px] font-bold tracking-widest uppercase text-gray-500">{items.length} Items</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {items.map((product) => (
            <div key={product._id} className="group flex flex-col relative">
              <div className="relative w-full aspect-[4/5] bg-gray-100 dark:bg-[#111111] overflow-hidden mb-4">
                <img 
                  src={product.images?.[0]?.url || '/placeholder.png'} 
                  alt={product.title}
                  className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-[1.03] transition-transform duration-700"
                />
                
                {/* Remove from Wishlist Button */}
                <button 
                  onClick={(e) => { e.preventDefault(); handleRemove(product._id); }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10 text-red-500"
                  title="Remove from wishlist"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                {/* Move to Cart Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button 
                    onClick={(e) => { e.preventDefault(); handleMoveToCart(product); }}
                    disabled={product.stock === 0}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[18px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                </div>
              </div>

              <Link to={`/products/${product.slug}`} className="flex flex-col">
                <p className="text-[17px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  {product.category?.name || 'Category'}
                </p>
                <h3 className="text-[18px] font-black uppercase tracking-tight text-black dark:text-white leading-tight mb-2">
                  {product.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-black text-black dark:text-white">
                    ${(product.discountPercentage > 0 
                        ? product.price - (product.price * (product.discountPercentage / 100))
                        : product.price).toFixed(2)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-[18px] font-bold text-gray-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
