import { CategoryCard } from './CategoryCard.jsx';
import { cn } from '../../utils/cn.js';

export const CategoryGrid = ({ categories = [], loading = false, className }) => {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {categories.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
};
