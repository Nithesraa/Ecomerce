import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { closeCartDrawer, updateCartItem, removeFromCart } from '../cartSlice.js';

export const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isDrawerOpen } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        dispatch(closeCartDrawer());
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, dispatch]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ productId, quantity: newQuantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = () => {
    dispatch(closeCartDrawer());
    navigate('/checkout');
  };

  const handleViewCart = () => {
    dispatch(closeCartDrawer());
    navigate('/cart');
  };

  const cartItems = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCartDrawer())}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[400px] bg-white dark:bg-[#050505] shadow-2xl z-[110] flex flex-col border-l border-[#E2E8F0] dark:border-white/[0.05]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] dark:border-white/[0.05]">
              <h2 className="text-[20px] font-black uppercase tracking-tighter text-black dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your Bag ({cartItems.length})
              </h2>
              <button 
                onClick={() => dispatch(closeCartDrawer())}
                className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-black dark:text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mb-8">Looks like you haven't added anything to your bag yet.</p>
                  <button 
                    onClick={() => { dispatch(closeCartDrawer()); navigate('/products'); }}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[14px] hover:opacity-80 transition-opacity"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={item.product?._id || index} className="flex gap-4">
                    <img 
                      src={item.product?.images?.[0]?.url || '/placeholder.png'} 
                      alt={item.product?.title || 'Product'} 
                      className="w-24 h-32 object-cover bg-gray-100 dark:bg-[#111111]"
                    />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <Link 
                            to={`/products/${item.product?.slug || ''}`}
                            onClick={() => dispatch(closeCartDrawer())}
                            className="font-bold text-[15px] text-black dark:text-white hover:underline line-clamp-2 leading-tight"
                          >
                            {item.product?.title || 'Unknown Product'}
                          </Link>
                        </div>
                        <p className="text-[15px] font-bold text-gray-600 dark:text-gray-400">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#E2E8F0] dark:border-white/[0.1] rounded-none bg-white dark:bg-black">
                          <button 
                            onClick={() => item.product?._id && handleUpdateQuantity(item.product._id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-[14px] font-bold text-black dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => item.product?._id && handleUpdateQuantity(item.product._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => item.product?._id && handleRemove(item.product._id)}
                          className="text-[14px] font-bold tracking-widest uppercase text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-[#E2E8F0] dark:border-white/[0.05] bg-gray-50 dark:bg-[#09090b]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[15px] font-bold tracking-wide uppercase text-gray-500">Subtotal</span>
                  <span className="text-lg font-black text-black dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[14px] hover:opacity-80 transition-opacity flex justify-center items-center gap-2"
                  >
                    Checkout
                  </button>
                  <button 
                    onClick={handleViewCart}
                    className="w-full py-4 bg-transparent border-2 border-black dark:border-white text-black dark:text-white font-bold uppercase tracking-widest text-[14px] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
