import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const StarRating = ({ rating, count, className }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />;
          }
          if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />;
          }
          return <Star key={i} className="w-4 h-4 text-[#E2E8F0] dark:text-[#334155]" />;
        })}
      </div>
      {count !== undefined && (
        <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">({count})</span>
      )}
    </div>
  );
};
