import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Tag, Grid, LogOut, Store, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice.js';

const NAV_ITEMS = [
  { icon: BarChart3, name: 'Overview', path: '/dashboard', roles: ['ADMIN', 'SELLER'] },
  { icon: Store, name: 'Sellers', path: '/dashboard/sellers', roles: ['ADMIN'] },
  { icon: Package, name: 'Products', path: '/dashboard/products', roles: ['ADMIN', 'SELLER'] },
  { icon: ShoppingBag, name: 'Orders', path: '/dashboard/orders', roles: ['ADMIN', 'SELLER'] },
  { icon: Tag, name: 'Coupons', path: '/dashboard/coupons', roles: ['ADMIN'] },
  { icon: Grid, name: 'Categories', path: '/dashboard/categories', roles: ['ADMIN'] },
];

export const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  // Check if Seller is verified
  if (user?.role === 'SELLER' && user?.isVerifiedSeller === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Store className="w-16 h-16 text-gray-400 mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2 text-center">Account Pending Verification</h1>
        <p className="text-gray-500 text-lg mb-8 text-center max-w-md">
          Your seller account is currently under review by our team. You will be able to access the dashboard once approved.
        </p>
        <button 
          onClick={handleLogout}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/[0.05] flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/[0.05]">
          <h1 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2 text-black dark:text-white">
            <Store className="w-5 h-5" />
            Workspace
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-all ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.02] hover:text-black dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/[0.05]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-black dark:text-white truncate">{user?.name}</span>
              <span className="text-lg text-gray-500 uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <header className="h-16 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/[0.05] flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Dashboard</h2>
          <NavLink to="/" className="text-lg font-medium text-blue-500 hover:underline">
            View Storefront &rarr;
          </NavLink>
        </header>
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
