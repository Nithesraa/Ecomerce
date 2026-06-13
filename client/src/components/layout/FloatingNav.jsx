import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, Heart, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCartDrawer } from '../../features/cart/cartSlice.js';
import { SearchModal } from './SearchModal.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistItemCount = wishlist?.items?.length || 0;
  
  // If we are on the homepage, the navbar starts transparent over the huge hero video/image
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed inset-x-0 z-50 transition-all duration-500 ${
    isScrolled || !isHome
      ? 'top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/[0.05] py-4 shadow-sm'
      : 'top-10 bg-transparent py-6'
  }`;

  const textClasses = isScrolled || !isHome 
    ? 'text-black dark:text-white' 
    : 'text-white drop-shadow-md';

  return (
    <>
      {/* Infinite Marquee Announcement Bar (Only on Home Page) */}
      {isHome && (
        <div className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 overflow-hidden flex items-center absolute top-0 inset-x-0 z-[60]">
          <div className="animate-marquee whitespace-nowrap flex gap-10 items-center">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-[12px] font-bold uppercase tracking-widest">
                Free Worldwide Shipping on orders over $150 <span className="mx-8 opacity-40">•</span> Just Dropped: The Winter Collection
              </span>
            ))}
          </div>
        </div>
      )}

      <header className={`${navClasses}`}>
        <div className="w-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className={`text-base font-black tracking-tighter uppercase ${textClasses}`}>
          ShopSphere
        </Link>

        {/* Center: Links (Hidden on Mobile/Tablet) */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
          {['New Arrivals', 'Men', 'Women', 'Collections'].map((link) => (
            <Link 
              key={link} 
              to="/products" 
              className={`text-[12px] xl:text-[13px] font-bold tracking-widest uppercase hover:opacity-70 transition-opacity whitespace-nowrap ${textClasses}`}
            >
              {link}
            </Link>
          ))}
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SELLER') && (
            <Link 
              to="/dashboard" 
              className={`text-[12px] xl:text-[13px] font-black text-[#2563EB] tracking-widest uppercase hover:opacity-70 transition-opacity whitespace-nowrap`}
            >
              Workspace
            </Link>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 xl:gap-6">
          {!isAuthenticated && (
            <Link 
              to="/seller/register"
              className={`hidden lg:flex items-center justify-center h-8 xl:h-9 px-3 xl:px-4 rounded-full border border-current ${textClasses} text-[11px] xl:text-[12px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors whitespace-nowrap`}
            >
              Become a Seller
            </Link>
          )}

          <div className="hidden md:block mr-2">
            <ThemeToggle />
          </div>

          <button 
            onClick={() => setIsSearchOpen(true)}
            className={`${textClasses} hover:opacity-70 transition-opacity`}
          >
            <Search className="w-5 h-5" />
          </button>
          
          {isAuthenticated ? (
            <Link to="/profile" className={`${textClasses} hover:opacity-70 transition-opacity hidden md:block`}>
              <User className="w-5 h-5" />
            </Link>
          ) : (
            <Link 
              to="/login"
              className="hidden lg:flex items-center justify-center h-8 px-4 rounded-full bg-[#2563EB] text-white text-[12px] xl:text-[13px] font-bold uppercase tracking-widest hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
            >
              Log In
            </Link>
          )}
          
          <Link to={isAuthenticated ? "/wishlist" : "/login"} className={`relative flex items-center gap-2 ${textClasses} hover:opacity-70 transition-opacity hidden md:block`}>
            <Heart className="w-5 h-5" />
            {wishlistItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black dark:bg-white text-white dark:text-black w-4 h-4 flex items-center justify-center rounded-full text-[15px] font-bold">
                {wishlistItemCount}
              </span>
            )}
          </Link>
          
          <button 
            onClick={() => dispatch(toggleCartDrawer())} 
            className={`relative flex items-center gap-2 ${textClasses} hover:opacity-70 transition-opacity`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[15px] font-bold">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setIsMobileMenuOpen(true)} className={`${textClasses}`}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
      
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[110] w-[80%] max-w-sm bg-white dark:bg-black shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-black/10 dark:border-white/10">
                <span className="text-lg font-black tracking-tighter uppercase text-black dark:text-white">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex flex-col p-6 gap-6 overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shop</span>
                  {['New Arrivals', 'Men', 'Women', 'Collections'].map((link) => (
                    <Link 
                      key={link} 
                      to="/products" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-bold tracking-widest uppercase text-black dark:text-white"
                    >
                      {link}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-black/10 dark:bg-white/10 my-2"></div>

                <div className="flex flex-col gap-4">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account</span>
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold tracking-widest uppercase text-black dark:text-white flex items-center gap-3">
                        <User className="w-5 h-5" /> Profile
                      </Link>
                      <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold tracking-widest uppercase text-black dark:text-white flex items-center gap-3">
                        <Heart className="w-5 h-5" /> Wishlist ({wishlistItemCount})
                      </Link>
                      {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black tracking-widest uppercase text-[#2563EB]">
                          Workspace
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold tracking-widest uppercase text-black dark:text-white">
                        Log In / Register
                      </Link>
                      <Link to="/seller/register" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold tracking-widest uppercase text-gray-500">
                        Become a Seller
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
    </>
  );
};
