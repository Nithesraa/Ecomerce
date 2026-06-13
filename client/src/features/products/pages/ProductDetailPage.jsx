import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug, clearProductDetail } from '../productSlice.js';
import { addToCart } from '../../../features/cart/cartSlice.js';
import { toggleWishlist } from '../../../features/wishlist/wishlistSlice.js';
import { ProductGallery } from '../../../components/products/ProductGallery.jsx';
import { ProductGrid } from '../../../components/products/ProductGrid.jsx';
import { RelatedProducts } from '../../../components/products/RelatedProducts.jsx';
import { ProductReviews } from '../../../components/products/ProductReviews.jsx';
import { StarRating } from '../../../components/ui/StarRating.jsx';
import { Heart, ShoppingBag, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { productService } from '../../../api/productService.js';
import { analyticsApi } from '../../analytics/analyticsApi.js';
import toast from 'react-hot-toast';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productDetail: product, detailLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
    return () => {
      dispatch(clearProductDetail());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?._id) {
      // Record VIEW event
      analyticsApi.recordEvent(product._id, 'VIEW');

      // Fetch Similar Products (AI Recommendations)
      analyticsApi.getSimilarProducts(product._id)
        .then(res => setSimilarProducts(res))
        .catch(err => console.error(err));

      // Fetch Related Products (Same Category Fallback)
      if (product.category?._id) {
        productService.getProducts({ category: product.category._id, limit: 5 }).then(res => {
          setRelatedProducts(res.data.filter(p => p._id !== product._id).slice(0, 4));
        }).catch(err => console.error(err));
      }
    }
  }, [product]);

  if (detailLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div className="w-3/4 h-10 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-1/4 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-1/2 h-8 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400">The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const discountedPrice = product.discountPercentage > 0 
    ? product.price - (product.price * (product.discountPercentage / 100))
    : product.price;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast('Please log in to add items to your cart', { icon: '🔒' });
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
    analyticsApi.recordEvent(product._id, 'ADD_TO_CART');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast('Please log in to add items to your wishlist', { icon: '🔒' });
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
    analyticsApi.recordEvent(product._id, 'WISHLIST');
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white flex flex-col pt-32 pb-24 overflow-hidden">
      <Helmet>
        <title>{product.title} | ShopSphere</title>
        <meta name="description" content={product.description?.substring(0, 160) || ''} />
      </Helmet>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 w-full">
      {/* Top Section: Gallery & Info */}
      <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 mb-32 items-start">
        
        {/* Left: Gallery */}
        <div className="w-full lg:w-1/2">
          <ProductGallery images={product.images} />
        </div>

        {/* Right: Info (Sticky Purchase Panel) */}
        <div className="w-full lg:w-1/3 flex flex-col lg:sticky lg:top-32">
          <p className="text-[14px] font-bold uppercase tracking-widest text-gray-500 mb-4">
            {product.category?.name}
          </p>
          <h1 className="text-[40px] md:text-[50px] font-black text-black dark:text-white tracking-tighter uppercase leading-[0.9] mb-6">
            {product.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <StarRating rating={product.averageRating} count={product.reviewCount} />
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
            <span className="text-[14px] font-bold tracking-widest uppercase text-gray-500">
              SKU: {product.sku || 'N/A'}
            </span>
          </div>

          <div className="flex items-end gap-4 mb-8 border-b-2 border-black dark:border-white pb-8">
            <span className="text-[40px] font-black tracking-tighter text-black dark:text-white leading-none">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <div className="flex flex-col">
                <span className="text-[15px] text-gray-400 line-through font-bold">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            )}
            {product.discountPercentage > 0 && (
              <span className="ml-auto px-3 py-1 bg-black dark:bg-white text-white dark:text-black font-bold tracking-widest text-[14px] uppercase">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-[14px] leading-relaxed mb-10">
            {product.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-bold tracking-widest uppercase text-black dark:text-white">Quantity</span>
              <span className="text-[14px] font-bold tracking-widest uppercase text-gray-500">
                {product.stock > 0 ? `${product.stock} IN STOCK` : <span className="text-red-500">OUT OF STOCK</span>}
              </span>
            </div>
            
            <div className="flex items-center border border-[#E2E8F0] dark:border-white/[0.2] bg-transparent w-full">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-14 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-black dark:text-white">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-14 h-14 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase text-[14px] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-opacity"
              >
                <ShoppingBag className="w-5 h-5" />
                Add To Bag
              </button>
              <button 
                onClick={handleWishlist}
                className="w-full h-14 border-2 border-black dark:border-white bg-transparent text-black dark:text-white font-bold tracking-widest uppercase text-[14px] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-3"
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 border border-[#E2E8F0] dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-black dark:text-white" />
              <span className="text-[14px] font-bold tracking-widest uppercase text-gray-600 dark:text-gray-400">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-black dark:text-white" />
              <span className="text-[14px] font-bold tracking-widest uppercase text-gray-600 dark:text-gray-400">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCcw className="w-5 h-5 text-black dark:text-white" />
              <span className="text-[14px] font-bold tracking-widest uppercase text-gray-600 dark:text-gray-400">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full mt-12 mb-32">
        <div className="flex gap-8 border-b-2 border-gray-200 dark:border-white/[0.1] mb-12">
          {['description', 'specifications', 'shipping', 'reviews'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-black tracking-widest uppercase text-[15px] md:text-[15px] transition-colors border-b-2 -mb-0.5 ${
                activeTab === tab 
                  ? 'border-black dark:border-white text-black dark:text-white' 
                  : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab} {tab === 'reviews' ? `(${product.reviewCount})` : ''}
            </button>
          ))}
        </div>

        <div className="min-h-[200px] text-gray-600 dark:text-gray-400 leading-relaxed text-[14px] max-w-4xl">
          {activeTab === 'description' && (
            <div className="animate-in fade-in duration-500">
              <p>{product.description}</p>
            </div>
          )}
          {activeTab === 'specifications' && (
            <div className="animate-in fade-in duration-500">
              <p>Authentic ShopSphere Product. SKU: {product.sku}. Material and care instructions vary by category. Please check label before washing.</p>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="animate-in fade-in duration-500">
              <p className="mb-4"><strong>Free Worldwide Shipping on orders over $150.</strong></p>
              <p>Standard delivery takes 3-5 business days. Express delivery available at checkout. Returns are accepted within 30 days of purchase. Items must be in original condition with tags attached.</p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="animate-in fade-in duration-500">
              <ProductReviews product={product} />
            </div>
          )}
        </div>
      </div>
      
      {/* Similar Products (AI) Section */}
      {similarProducts?.length > 0 && (
        <div className="w-full pt-16 border-t border-gray-200 dark:border-white/[0.1] mb-16">
          <h2 className="text-xl font-black tracking-tighter uppercase text-black dark:text-white mb-10">Customers Also Bought</h2>
          <ProductGrid products={similarProducts} loading={false} />
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts?.length > 0 && (
        <div className="w-full pt-16 border-t border-gray-200 dark:border-white/[0.1]">
          <h2 className="text-xl font-black tracking-tighter uppercase text-black dark:text-white mb-10">You May Also Like</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
      
      </div>
    </div>
  );
};
