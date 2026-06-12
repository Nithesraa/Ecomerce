import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useParams } from 'react-router-dom';
import { fetchProducts, setFilters, setPage } from '../productSlice.js';
import { fetchCategories } from '../../categories/categorySlice.js';
import { ProductGrid } from '../../../components/products/ProductGrid.jsx';
import { ProductFilters } from '../../../components/products/ProductFilters.jsx';
import { Helmet } from 'react-helmet-async';

export const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { slug: categorySlug } = useParams();

  const { products, loading, filters, pagination } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL or Params once
  useEffect(() => {
    dispatch(fetchCategories());
    
    const initialFilters = {
      search: searchParams.get('search') || '',
      category: ''
    };
    
    const categoryQuery = searchParams.get('category');
    
    if (categoryQuery && categories.length > 0) {
      // Find category by slug
      const cat = categories.find(c => c.slug === categoryQuery);
      if (cat) {
        initialFilters.category = cat._id;
      } else {
        // Fallback: If it's already an ID, use it directly
        initialFilters.category = categoryQuery;
      }
    } else if (categorySlug && categories.length > 0) {
      const cat = categories.find(c => c.slug === categorySlug);
      if (cat) {
        initialFilters.category = cat._id;
      }
    }

    // Only dispatch if categories are loaded so we don't prematurely clear filters
    if (categories.length > 0 || (!categoryQuery && !categorySlug)) {
      dispatch(setFilters(initialFilters));
      setIsInitialized(true);
    }
  }, [dispatch, searchParams, categorySlug, categories.length]);

  // Fetch products whenever filters or page changes
  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchProducts({ ...filters, page: pagination.page, limit: pagination.limit }));
    }
  }, [dispatch, filters, pagination.page, pagination.limit, isInitialized]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      dispatch(setPage(newPage));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white flex flex-col pt-32 pb-24 overflow-hidden">
      <Helmet>
        <title>Shop Collection | ShopSphere</title>
        <meta name="description" content="Browse our premium collection of modern, high-quality products." />
      </Helmet>

      {/* Header */}
      <div className="w-full px-6 md:px-12 mb-16">
        <h1 className="text-[60px] md:text-[100px] font-black uppercase tracking-tighter leading-none border-b-4 border-black dark:border-white pb-6">
          Shop All
        </h1>
        <div className="flex items-center justify-between mt-6">
          <p className="text-[17px] font-bold tracking-widest uppercase text-gray-500">
            Showing {products.length} of {pagination.total} Products
          </p>
        </div>
      </div>

      <div className="w-full px-6 md:px-12 flex flex-col lg:flex-row gap-16 items-start">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-32">
          <ProductFilters />
        </div>

        {/* Main Product Grid */}
        <div className="flex-1 flex flex-col">
          <ProductGrid products={products} loading={loading} skeletonCount={12} />
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-lg font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
              
              <span className="text-lg text-gray-500 dark:text-gray-400 mx-4">
                Page {pagination.page} of {totalPages}
              </span>

              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-lg font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
