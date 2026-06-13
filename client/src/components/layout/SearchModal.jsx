import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center px-6"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-4 text-black dark:text-white hover:opacity-50 transition-opacity"
          >
            <X className="w-8 h-8" />
          </button>

          <form onSubmit={handleSubmit} className="w-full max-w-4xl relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent border-b-4 border-black dark:border-white text-[40px] md:text-[80px] font-black uppercase tracking-tighter text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-800 focus:outline-none pb-4"
            />
            <button 
              type="submit"
              className="absolute right-0 bottom-8 text-black dark:text-white hover:opacity-50 transition-opacity"
            >
              <Search className="w-10 h-10 md:w-16 md:h-16" />
            </button>
          </form>
          
          <div className="mt-12 flex gap-4 text-[14px] font-bold tracking-widest uppercase text-gray-500">
            <span>Popular:</span>
            <button onClick={() => { setQuery('jacket'); handleSubmit({ preventDefault: () => {} }); }} className="hover:text-black dark:hover:text-white transition-colors">Jacket</button>
            <button onClick={() => { setQuery('shoes'); handleSubmit({ preventDefault: () => {} }); }} className="hover:text-black dark:hover:text-white transition-colors">Shoes</button>
            <button onClick={() => { setQuery('dress'); handleSubmit({ preventDefault: () => {} }); }} className="hover:text-black dark:hover:text-white transition-colors">Dress</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
