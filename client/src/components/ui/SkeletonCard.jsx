import { cn } from '../../utils/cn.js';

export const SkeletonCard = ({ className }) => {
  return (
    <div className={cn("w-full h-full flex flex-col gap-3 p-3 bg-white dark:bg-[#111] rounded-2xl border border-[#E2E8F0] dark:border-white/[0.05] shadow-sm", className)}>
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/5] bg-gray-200 dark:bg-white/5 animate-pulse rounded-xl" />
      
      {/* Content Skeleton */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="w-3/4 h-4 bg-gray-200 dark:bg-white/5 animate-pulse rounded" />
        <div className="w-1/2 h-4 bg-gray-200 dark:bg-white/5 animate-pulse rounded" />
        
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1/3 h-5 bg-gray-200 dark:bg-white/5 animate-pulse rounded" />
          <div className="w-1/4 h-3 bg-gray-200 dark:bg-white/5 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
};
