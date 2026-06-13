import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCartDrawer } from '../../features/cart/cartSlice.js';
import { SearchModal } from './SearchModal.jsx';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';

export const FloatingNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
              <span key={i} className="text-[17px] font-bold uppercase tracking-[0.2em]">
                Free Worldwide Shipping on orders over $150 <span className="mx-8 opacity-40">•</span> Just Dropped: The Winter Collection
              </span>
            ))}
          </div>
        </div>
      )}

      <header className={`${navClasses}`}>
        <div className="w-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className={`text-2xl font-black tracking-tighter uppercase ${textClasses}`}>
          ShopSphere
        </Link>

        {/* Center: Links (Hidden on Mobile/Tablet) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
          {['New Arrivals', 'Men', 'Women', 'Collections'].map((link) => (
            <Link 
              key={link} 
              to="/products" 
              className={`text-[14px] xl:text-[16px] font-bold tracking-widest uppercase hover:opacity-70 transition-opacity whitespace-nowrap ${textClasses}`}
            >
              {link}
            </Link>
          ))}
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SELLER') && (
            <Link 
              to="/dashboard" 
              className={`text-[14px] xl:text-[16px] font-black text-[#2563EB] tracking-widest uppercase hover:opacity-70 transition-opacity whitespace-nowrap`}
            >
              Workspace
            </Link>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 xl:gap-6">
          {!isAuthenticated && (
            <Link 
              to="/seller/register"
              className={`hidden lg:flex items-center justify-center h-9 xl:h-10 px-4 xl:px-5 rounded-full border border-current ${textClasses} text-[13px] xl:text-[15px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors whitespace-nowrap`}
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
              className="hidden lg:flex items-center justify-center h-9 px-5 rounded-full bg-[#2563EB] text-white text-[14px] xl:text-[16px] font-bold uppercase tracking-widest hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
            >
              Log In
            </Link>
          )}
          
          <Link to={isAuthenticated ? "/wishlist" : "/login"} className={`relative flex items-center gap-2 ${textClasses} hover:opacity-70 transition-opacity hidden md:block`}>
            <Heart className="w-5 h-5" />
            {wishlistItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black dark:bg-white text-white dark:text-black w-4 h-4 flex items-center justify-center rounded-full text-[18px] font-bold">
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
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[18px] font-bold">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button className={`${textClasses}`}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
      
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
    </>
  );
};
