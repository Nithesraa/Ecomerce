import { Link } from 'react-router-dom';
import { ShoppingBag, Twitter, Facebook, Instagram, Github, ArrowRight, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-white dark:bg-[#030712] border-t border-gray-200 dark:border-white/10 pt-24 pb-12 overflow-hidden transition-colors duration-300">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/10 blur-[128px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-purple-500/10 blur-[128px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:-translate-y-1">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                ShopSphere
              </span>
            </Link>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-sm">
              Powering modern commerce. ShopSphere provides the premium infrastructure for seamless buying and selling globally. Engineered for the future.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Github, href: "#" },
              ].map((Social, index) => (
                <a 
                  key={index} 
                  href={Social.href} 
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <Social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-lg tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Shop
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'All Products', path: '/products' },
                { name: 'Electronics', path: '/products?category=electronics' },
                { name: 'Fashion', path: '/products?category=fashion' },
                { name: 'Home & Living', path: '/products?category=home' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group inline-block">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-lg tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Support
            </h4>
            <ul className="space-y-4">
              {['Help Center', 'Track Order', 'Returns & Refunds', 'Contact Us'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-lg text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative group inline-block">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-lg tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              Stay Updated
            </h4>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
              Subscribe to get special offers and once-in-a-lifetime deals.
            </p>
            <form className="relative group" onSubmit={(e) => e.preventDefault()}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-500/50 dark:focus:border-blue-500 transition-all text-lg placeholder:text-gray-400"
              />
              <button 
                type="submit"
                className="absolute inset-y-1 right-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} <span className="font-semibold text-gray-900 dark:text-white">ShopSphere</span>, Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-lg text-gray-500 dark:text-gray-400">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item, i) => (
              <a key={i} href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gray-900 dark:bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
