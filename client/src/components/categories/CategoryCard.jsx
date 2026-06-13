import { Link } from 'react-router-dom';
import { Laptop, Shirt, Home, Dumbbell, BookOpen, Sparkles, Folder } from 'lucide-react';
import { motion } from 'framer-motion';

const getCategoryIcon = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('electronic') || normalized.includes('tech')) return Laptop;
  if (normalized.includes('fashion') || normalized.includes('clothing') || normalized.includes('apparel')) return Shirt;
  if (normalized.includes('home') || normalized.includes('furniture')) return Home;
  if (normalized.includes('sport') || normalized.includes('fitness')) return Dumbbell;
  if (normalized.includes('book')) return BookOpen;
  if (normalized.includes('beauty') || normalized.includes('cosmetic')) return Sparkles;
  return Folder;
};

export const CategoryCard = ({ category }) => {
  const Icon = getCategoryIcon(category.name);

  return (
    <Link to={`/categories/${category.slug}`}>
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-white/[0.01] border border-[#E2E8F0] dark:border-white/[0.04] hover:border-gray-300 dark:hover:border-white/[0.1] rounded-2xl cursor-pointer shadow-none hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all group h-full"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 mb-4 group-hover:bg-gray-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-gray-900 transition-colors">
          <Icon className="w-[22px] h-[22px]" />
        </div>
        <h3 className="text-[14px] font-semibold tracking-wide text-gray-900 dark:text-[#fafafa] text-center">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] text-center mt-1.5 line-clamp-2">
            {category.description}
          </p>
        )}
      </motion.div>
    </Link>
  );
};
