import { Outlet } from 'react-router-dom';
import { FloatingNav } from './FloatingNav.jsx';
import { CartDrawer } from '../../features/cart/components/CartDrawer.jsx';
import { PageTransition } from './PageTransition.jsx';
import { AnimatePresence } from 'framer-motion';

export const StoreLayout = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white dark:bg-black text-black dark:text-white flex flex-col font-sans">
      <FloatingNav />
      <CartDrawer />
      
      {/* Main Content (Edge to Edge) */}
      <main className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Premium Minimal Footer */}
      <footer className="w-full bg-black dark:bg-[#050505] text-white py-16 px-6 md:px-12 mt-auto relative overflow-hidden border-t border-white/10">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent"></div>
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none transition-all duration-700"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-16 relative z-10">
          <div className="group">
            <h3 className="font-bold uppercase tracking-[0.3em] text-lg mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">ShopSphere</h3>
            <p className="text-gray-400/80 text-lg leading-relaxed max-w-xs transition-colors group-hover:text-gray-300">
              Engineered for the future of commerce. Premium infrastructure for global brands.
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] text-lg mb-6 text-gray-200">Shop</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-lg">
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">Men</a></li>
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">Women</a></li>
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">New Arrivals</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] text-lg mb-6 text-gray-200">Support</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-lg">
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">FAQ</a></li>
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">Returns</a></li>
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] text-lg mb-6 text-gray-200">Legal</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-lg">
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">Terms of Service</a></li>
              <li><a href="#" className="inline-block hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 hover:after:w-full">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 text-[17px] text-gray-500/80 uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <span className="hover:text-gray-300 transition-colors cursor-default">&copy; {new Date().getFullYear()} ShopSphere Inc.</span>
          <span className="hover:text-gray-300 transition-colors cursor-default">All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
