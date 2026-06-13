import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../features/products/productSlice.js';

export const ProductFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value }));
  };

  const handleSortChange = (e) => {
    dispatch(setFilters({ sort: e.target.value }));
  };

  const handlePriceChange = (e) => {
    dispatch(setFilters({ [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-10 border-b-2 border-black dark:border-white pb-4">
        <h3 className="text-base font-black uppercase tracking-tighter text-black dark:text-white leading-none">Filters</h3>
        <button 
          onClick={() => dispatch(clearFilters())}
          className="text-[14px] font-bold tracking-widest uppercase text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <h4 className="text-[14px] font-bold tracking-widest uppercase text-gray-400 mb-4">Category</h4>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="category"
              value=""
              checked={filters.category === '' || !filters.category}
              onChange={handleCategoryChange}
              className="w-5 h-5 accent-black dark:accent-white cursor-pointer"
            />
            <span className={`text-[14px] font-bold uppercase tracking-tight transition-colors ${!filters.category ? 'text-black dark:text-white' : 'text-gray-500 group-hover:text-black dark:group-hover:text-white'}`}>
              All Categories
            </span>
          </label>
          
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                value={cat._id}
                checked={filters.category === cat._id}
                onChange={handleCategoryChange}
                className="w-5 h-5 accent-black dark:accent-white cursor-pointer"
              />
              <span className={`text-[14px] font-bold uppercase tracking-tight transition-colors ${filters.category === cat._id ? 'text-black dark:text-white' : 'text-gray-500 group-hover:text-black dark:group-hover:text-white'}`}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div className="mb-10">
        <h4 className="text-[14px] font-bold tracking-widest uppercase text-gray-400 mb-4">Sort By</h4>
        <div className="relative">
          <select 
            value={filters.sort} 
            onChange={handleSortChange}
            className="w-full bg-transparent border-b border-gray-300 dark:border-white/[0.2] text-black dark:text-white pb-3 outline-none focus:border-black dark:focus:border-white transition-all text-[15px] font-bold uppercase tracking-tight appearance-none cursor-pointer"
          >
            <option value="createdAt_desc" className="text-black">Newest Arrivals</option>
            <option value="price_asc" className="text-black">Price: Low to High</option>
            <option value="price_desc" className="text-black">Price: High to Low</option>
            <option value="averageRating_desc" className="text-black">Highest Rated</option>
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -mt-1 pointer-events-none text-black dark:text-white">↓</div>
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-10">
        <h4 className="text-[14px] font-bold tracking-widest uppercase text-gray-400 mb-4">Price Range</h4>
        <div className="flex items-center gap-6">
          <input 
            type="number" 
            name="minPrice"
            placeholder="Min" 
            value={filters.minPrice}
            onChange={handlePriceChange}
            className="w-full bg-transparent border-b border-gray-300 dark:border-white/[0.2] text-black dark:text-white pb-3 outline-none focus:border-black dark:focus:border-white transition-all text-[15px] font-bold uppercase tracking-tight placeholder-gray-400"
          />
          <span className="text-gray-300 dark:text-gray-600">-</span>
          <input 
            type="number" 
            name="maxPrice"
            placeholder="Max" 
            value={filters.maxPrice}
            onChange={handlePriceChange}
            className="w-full bg-transparent border-b border-gray-300 dark:border-white/[0.2] text-black dark:text-white pb-3 outline-none focus:border-black dark:focus:border-white transition-all text-[15px] font-bold uppercase tracking-tight placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );
};
