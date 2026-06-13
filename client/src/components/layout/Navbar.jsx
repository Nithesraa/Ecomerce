import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice.js';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import toast from 'react-hot-toast';
import { LogOut, User, ShoppingBag, Heart, Search, Menu, X, ShoppingCart } from 'lucide-react';
import { setFilters } from '../../features/products/productSlice.js';

export const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle scroll styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(setFilters({ search: searchQuery.trim() }));
      if (!location.pathname.startsWith('/products')) {
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistItemCount = wishlist?.items?.length || 0;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.03)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          
          {/* Left: Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-[14px] font-bold tracking-tight text-[#0F172A] dark:text-white">ShopSphere</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              <Link to="/" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">Home</Link>
              <Link to="/products" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">Catalog</Link>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-[#2563EB] transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100/80 dark:bg-white/[0.03] border border-transparent dark:border-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.06] text-gray-900 dark:text-white pl-11 pr-4 py-2.5 rounded-2xl text-[15px] focus:outline-none focus:bg-white dark:focus:bg-white/[0.05] focus:ring-1 focus:ring-gray-200 dark:focus:ring-white/[0.1] focus:border-gray-200 dark:focus:border-white/[0.1] transition-all placeholder:text-gray-400"
              />
            </form>
          </div>

          {/* Right: Icons & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              
              <Link to="/wishlist" className="relative p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[15px] font-bold flex items-center justify-center rounded-full">
                    {wishlistItemCount}
                  </span>
                )}
              </Link>
              
              <Link to="/cart" className="relative p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#2563EB] text-white text-[15px] font-bold flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-2" />
            </div>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">{user?.name}</span>
                  <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">{user?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-red-500 transition-colors bg-gray-50 dark:bg-[#1E293B] rounded-full"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-[14px] font-semibold text-[#0F172A] dark:text-white hover:text-[#2563EB] transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-semibold px-4 py-2 rounded-full transition-colors">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <ThemeToggle />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="ml-2 p-2 text-[#0F172A] dark:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-lg text-sm"
              />
            </form>
            <div className="flex flex-col space-y-3 text-sm font-medium text-gray-900 dark:text-white">
              <Link to="/">Home</Link>
              <Link to="/products">Catalog</Link>
              <Link to="/wishlist">Wishlist ({wishlistItemCount})</Link>
              <Link to="/cart">Cart ({cartItemCount})</Link>
              
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
              
              {isAuthenticated ? (
                <>
                  <Link to="/profile">Profile ({user?.name})</Link>
                  <button onClick={handleLogout} className="text-left text-red-500">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login">Log in</Link>
                  <Link to="/register" className="text-[#2563EB]">Sign up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
