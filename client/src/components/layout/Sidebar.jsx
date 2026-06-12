import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice.js';
import { 
  Sparkles, 
  Compass, 
  Shirt, 
  Laptop, 
  Home, 
  Plus, 
  Users, 
  LogOut,
  ShoppingBag,
  CloudLightning
} from 'lucide-react';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const navLinks = [
    { name: 'Popular Products', icon: Sparkles, path: '/popular' },
    { name: 'Explore Now', icon: Compass, path: '/', active: location.pathname === '/' || location.pathname === '/products' },
    { name: 'Clothing and Shoes', icon: Shirt, path: '/categories/fashion' },
    { name: 'Electronics & Tech', icon: Laptop, path: '/categories/electronics' },
    { name: 'Gifts and Living', icon: Home, path: '/categories/home' },
    { name: 'Inspiration', icon: CloudLightning, path: '/inspiration' },
  ];

  const quickActions = [
    { name: 'Request for product', icon: Plus },
    { name: 'Add member', icon: Users },
  ];

  return (
    <aside className="w-[280px] flex-shrink-0 border-r border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#0F0F0F] h-full flex flex-col py-8 px-6">
      
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 mb-12 px-2">
        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Buy<span className="text-blue-600">More</span>
        </span>
      </Link>

      {/* Main Nav */}
      <nav className="flex flex-col gap-2 mb-10">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-[16px] font-medium text-[17px] transition-all ${
              link.active 
                ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)]' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-white/[0.02] dark:hover:text-white'
            }`}
          >
            <link.icon className="w-[18px] h-[18px]" />
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="mb-auto">
        <p className="text-[17px] font-bold text-gray-400 uppercase tracking-widest px-6 mb-4">Quick actions</p>
        <div className="flex flex-col gap-1">
          {quickActions.map((action) => (
            <button key={action.name} className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-[18px] font-medium rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.02] w-full text-left">
              <action.icon className="w-4 h-4" />
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Last Orders (Static Example) */}
      <div className="mb-8 px-4">
        <p className="text-[17px] font-bold text-gray-400 uppercase tracking-widest mb-4">Last orders <span className="bg-gray-100 text-gray-600 px-1.5 rounded ml-1">37</span></p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-[10px] flex items-center justify-center">
              <img src="/placeholder.png" alt="shoe" className="w-6 h-6 mix-blend-multiply" />
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-semibold text-gray-900 dark:text-white">Nike Air Max</span>
              <span className="text-[17px] text-gray-400">Arrives today</span>
            </div>
          </div>
          <button className="text-[18px] font-semibold text-blue-600 text-left mt-1 hover:underline">See all</button>
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-600 transition-colors text-[18px] font-medium rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 w-full text-left mt-4"
      >
        <LogOut className="w-[18px] h-[18px]" />
        Logout
      </button>

    </aside>
  );
};
