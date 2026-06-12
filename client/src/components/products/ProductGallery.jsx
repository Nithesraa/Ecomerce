import { useState } from 'react';
import { cn } from '../../utils/cn.js';

export const ProductGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${images[activeIndex].url})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div 
        className="relative w-full aspect-square bg-gray-50 dark:bg-[#111] rounded-2xl overflow-hidden p-8 flex items-center justify-center border border-gray-100 dark:border-white/5 cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img 
          src={images[activeIndex].url} 
          alt="Product" 
          className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-opacity duration-300 group-hover:opacity-0"
        />
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-multiply dark:mix-blend-normal"
          style={{ ...zoomStyle, backgroundRepeat: 'no-repeat' }}
        ></div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "w-20 h-20 shrink-0 rounded-xl overflow-hidden p-2 flex items-center justify-center border-2 transition-all bg-gray-50 dark:bg-[#111]",
                activeIndex === idx 
                  ? "border-black dark:border-white shadow-sm" 
                  : "border-transparent hover:border-gray-200 dark:hover:border-white/10"
              )}
            >
              <img 
                src={img.url} 
                alt="Thumbnail" 
                className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
