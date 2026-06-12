import { useRef } from 'react';
import { ProductCard } from './ProductCard.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const RelatedProducts = ({ products = [] }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full relative group">
      {/* Carousel Navigation */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-12 h-12 bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-white/[0.1] shadow-lg flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <ChevronLeft className="w-6 h-6 text-black dark:text-white" />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-12 h-12 bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-white/[0.1] shadow-lg flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
      >
        <ChevronRight className="w-6 h-6 text-black dark:text-white" />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="w-full flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product._id} className="min-w-[280px] md:min-w-[320px] lg:min-w-[350px] snap-start flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Custom styles to hide scrollbar for webkit */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
