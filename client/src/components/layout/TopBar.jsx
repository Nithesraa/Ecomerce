import { useState } from 'react';
import { ShoppingBag, Search, SlidersHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';

export const TopBar = () => {
  const { cart } = useSelector((state) => state.cart);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="w-full h-24 flex items-center justify-between px-10 border-b border-gray-100 dark:border-white/[0.04]">
      
      {/* Left: Stats */}
      <div className="flex flex-col">
        <span className="text-[32px] font-bold text-gray-900 dark:text-white leading-none">37</span>
        <span className="text-[15px] font-medium text-gray-400">Orders Last 7 days</span>
      </div>

      {/* Center: Toggle Pill */}
      <div className="hidden md:flex bg-gray-50 dark:bg-white/[0.02] p-1.5 rounded-full border border-gray-100 dark:border-white/[0.04]">
        {['Dashboard', 'Website'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-full text-[15px] font-semibold transition-all ${
              activeTab === tab 
                ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        
        {/* Cart Pill */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 transition-colors rounded-full border border-gray-100 dark:border-white/[0.06]">
          <ShoppingBag className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="text-[14px] font-semibold text-gray-900 dark:text-white">Cart</span>
          {cartItemCount > 0 && (
            <span className="bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[15px] font-bold ml-1">
              {cartItemCount}
            </span>
          )}
        </button>

        {/* Avatars */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            <img className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0F0F0F]" src="https://i.pravatar.cc/100?img=1" alt="Avatar" />
            <img className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0F0F0F]" src="https://i.pravatar.cc/100?img=2" alt="Avatar" />
            <div className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0F0F0F] bg-gray-100 flex items-center justify-center text-[14px] font-bold text-gray-600 z-10">
              +4
            </div>
          </div>
          <div className="ml-3 flex items-center gap-2">
            <img className="w-9 h-9 rounded-full" src="https://i.pravatar.cc/100?img=3" alt="Ryana" />
            <span className="text-[15px] font-semibold text-gray-900 dark:text-white">Ryana</span>
          </div>
        </div>

      </div>

    </div>
  );
};
