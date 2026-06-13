import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { fetchCategories } from '../../categories/categorySlice.js';
import { fetchFeaturedProducts } from '../../products/productSlice.js';
import { ProductCard } from '../../../components/products/ProductCard.jsx';
import { ProductGrid } from '../../../components/products/ProductGrid.jsx';
import { analyticsApi } from '../../analytics/analyticsApi.js';

export const HomePage = () => {
  const dispatch = useDispatch();
  const { categories, loading: catLoading } = useSelector((state) => state.categories);
  const { featuredProducts, loading: prodLoading } = useSelector((state) => state.products);

  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeaturedProducts());
    
    // Fetch AI Recommendations
    analyticsApi.getPersonalizedRecommendations()
      .then(res => setRecommendedProducts(res))
      .catch(err => console.error(err))
      .finally(() => setRecLoading(false));
  }, [dispatch]);

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-black overflow-hidden">
      <Helmet>
        <title>ShopSphere | Premium E-commerce</title>
        <meta name="description" content="Shop the future with ShopSphere. Discover our premium collection of modern electronics, clothing, and accessories." />
      </Helmet>
      
      {/* 100vh Hero Section */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center -mt-[112px]">
        {/* Massive Background Image with Parallax */}
        <motion.div className="absolute inset-0 z-0" style={{ y: y1 }}>
          <img 
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000" 
            alt="Hero" 
            className="w-full h-full object-cover scale-110"
          />
          {/* Subtle gradient overlay to ensure text legibility */}
          <div className="absolute inset-0 bg-black/40"></div>
        </motion.div>
        
        <motion.div 
          style={{ opacity }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full px-6 md:px-12 flex flex-col items-center text-center mt-20"
        >
          <h1 className="text-[40px] sm:text-[60px] md:text-[70px] lg:text-[80px] font-black text-white leading-none tracking-tighter uppercase mb-6 drop-shadow-xl">
            Engineered <br /> for Everyday.
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link 
              to="/products?search=men"
              className="w-full sm:w-auto px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-[15px] hover:bg-gray-200 transition-colors"
            >
              Shop Men
            </Link>
            <Link 
              to="/products?search=women"
              className="w-full sm:w-auto px-10 py-4 bg-black text-white font-bold uppercase tracking-widest text-[15px] hover:bg-gray-900 transition-colors"
            >
              Shop Women
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Recommended For You Section */}
      {(recommendedProducts?.length > 0 || recLoading) && (
        <section className="w-full px-6 md:px-12 pt-32 pb-16 border-b border-gray-200 dark:border-white/[0.1]">
          <div className="flex items-end justify-between mb-8 md:mb-10">
            <h2 className="text-[28px] md:text-[40px] lg:text-[48px] font-black text-black dark:text-white uppercase tracking-tighter leading-none">
              Recommended For You
            </h2>
            <Link to="/products" className="text-[14px] font-bold tracking-widest uppercase text-gray-500 hover:text-black dark:hover:text-white transition-colors border-b-2 border-transparent hover:border-black dark:hover:border-white pb-1">
              View All
            </Link>
          </div>
          <ProductGrid products={recommendedProducts} loading={recLoading} skeletonCount={4} />
        </section>
      )}

      {/* Shop By Category */}
      <section className="w-full px-6 md:px-12 py-24 md:py-32">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <h2 className="text-[28px] md:text-[40px] lg:text-[48px] font-black text-black dark:text-white uppercase tracking-tighter leading-none">
            Shop By Category
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px] md:auto-rows-[40vh]">
          {catLoading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="bg-gray-100 dark:bg-white/[0.05] animate-pulse col-span-1"></div>)
          ) : (
            categories?.map((category, index) => {
              // Map stunning, world-class aesthetic images to categories based on their names
              const categoryMap = {
                'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600',
                'fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600',
                'home': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600',
                'sports': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600',
                'beauty': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1600',
                'books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1600'
              };
              
              // Fallbacks if a random category exists
              const defaultImages = [
                "https://images.unsplash.com/photo-1550614000-4b95d4edc6e3?q=80&w=1600",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600",
                "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1600",
                "https://images.unsplash.com/photo-1596462502278-27bf85033c5a?q=80&w=1600"
              ];
              
              const catName = category.name?.toLowerCase() || '';
              // Strictly prioritize our world-class curated images over any broken database images
              const bgImage = categoryMap[catName] || defaultImages[index % defaultImages.length];
              const fallbackImage = defaultImages[(index + 1) % defaultImages.length];

              // Create an asymmetric grid layout based on the index
              let spanClass = 'col-span-1 row-span-1';
              if (index === 0) spanClass = 'md:col-span-2 md:row-span-2'; // Massive spotlight
              else if (index === 1) spanClass = 'md:col-span-2 md:row-span-1'; // Wide banner
              else if (index === 2) spanClass = 'md:col-span-1 md:row-span-1'; // Small box
              else if (index === 3) spanClass = 'md:col-span-1 md:row-span-1'; // Small box
              else if (index >= 4) spanClass = 'md:col-span-4 md:row-span-1'; // Full width banner

              return (
                <Link 
                  key={category._id} 
                  to={`/products?category=${category.slug}`} 
                  className={`relative group overflow-hidden bg-[#111111] ${spanClass}`}
                >
                  <img 
                    src={bgImage} 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
                    alt={category.name} 
                    onError={(e) => { 
                      if (e.target.src !== fallbackImage) {
                        e.target.src = fallbackImage;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500"></div>
                  <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                    <h3 className={`text-white font-black uppercase tracking-tighter mb-4 leading-none ${index === 0 ? 'text-[40px] md:text-[60px]' : 'text-[24px] md:text-[32px]'}`}>
                      {category.name}
                    </h3>
                    <span className="bg-white text-black px-6 py-3 font-bold text-[14px] tracking-widest uppercase hover:bg-gray-200 transition-colors">
                      Explore
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

    </div>
  );
};
