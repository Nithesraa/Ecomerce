import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-500 ease-in-out ${
        isDark ? 'bg-[#111] border border-white/20' : 'bg-gray-200 border border-gray-300'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <div className="absolute left-2 flex items-center justify-center pointer-events-none">
        <Sun className="w-4 h-4 text-yellow-500" />
      </div>
      <div className="absolute right-2 flex items-center justify-center pointer-events-none">
        <Moon className="w-4 h-4 text-blue-400" />
      </div>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
          isDark ? 'bg-white ml-auto' : 'bg-white mr-auto shadow-sm'
        }`}
      />
    </button>
  );
};
