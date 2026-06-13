import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, X, Tag } from 'lucide-react';
import { updateCartItem, removeFromCart, clearCartState } from '../cartSlice.js';

export const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const cartItems = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Mock calculation
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ productId, quantity: newQuantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode === 'WELCOME10') {
      setDiscount(subtotal * 0.1);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-[#050505] text-black dark:text-white px-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-[40px] md:text-[50px] font-black uppercase tracking-tighter mb-4 text-center">Your Cart Is Empty</h1>
        <p className="text-gray-500 mb-10 text-center max-w-md text-[14px]">
          Looks like you haven't added any products to your cart yet. Discover our latest collections.
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[14px] hover:opacity-80 transition-opacity"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex items-end justify-between border-b-2 border-black dark:border-white pb-6 mb-12">
          <h1 className="text-[40px] md:text-[50px] font-black uppercase tracking-tighter leading-none">Your Cart</h1>
          <span className="text-[15px] font-bold tracking-widest uppercase text-gray-500">{cartItems.length} Items</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
          
          {/* Cart Items List */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            {cartItems.map((item, index) => (
              <div key={item.product?._id || index} className="flex gap-6 pb-8 border-b border-[#E2E8F0] dark:border-white/[0.1]">
                <img 
                  src={item.product?.images?.[0]?.url || '/placeholder.png'} 
                  alt={item.product?.title || 'Product'} 
                  className="w-32 h-40 md:w-40 md:h-52 object-cover bg-gray-100 dark:bg-[#111111]"
                />
                
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link 
                        to={`/products/${item.product?.slug || ''}`}
                        className="text-[15px] md:text-[20px] font-black uppercase tracking-tight text-black dark:text-white hover:underline leading-none mb-2 block"
                      >
                        {item.product?.title || 'Unknown Product'}
                      </Link>
                      <p className="text-[15px] font-bold tracking-widest text-gray-500 uppercase">
                        {item.product?.category?.name || 'Category'}
                      </p>
                    </div>
                    <p className="text-[20px] font-black text-black dark:text-white">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[14px] font-bold tracking-widest uppercase text-gray-500">Quantity</span>
                      <div className="flex items-center border border-[#E2E8F0] dark:border-white/[0.2] bg-transparent">
                        <button 
                          onClick={() => item.product?._id && handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-black dark:text-white text-[15px]">{item.quantity}</span>
                        <button 
                          onClick={() => item.product?._id && handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => item.product?._id && handleRemove(item.product._id)}
                      className="text-[14px] font-bold tracking-widest uppercase text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-start pt-4">
              <button 
                onClick={() => navigate('/products')}
                className="text-[15px] font-bold tracking-widest uppercase text-black dark:text-white hover:underline transition-all"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3 flex flex-col bg-gray-50 dark:bg-[#09090b] p-8 border border-[#E2E8F0] dark:border-white/[0.05]">
            <h2 className="text-[20px] font-black uppercase tracking-tighter mb-8">Order Summary</h2>
            
            {/* Coupon Section */}
            <form onSubmit={handleApplyCoupon} className="flex mb-8 border-b border-[#E2E8F0] dark:border-white/[0.1] pb-8">
              <div className="relative flex-1">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="PROMO CODE" 
                  className="w-full h-12 pl-12 pr-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-white/[0.1] text-[15px] font-bold tracking-widest uppercase outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white placeholder-gray-400"
                />
              </div>
              <button 
                type="submit"
                className="h-12 px-6 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[14px] hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                Apply
              </button>
            </form>

            {/* Totals */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-center text-[15px]">
                <span className="font-bold text-gray-500">Subtotal</span>
                <span className="font-black text-black dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-bold text-gray-500">Discount</span>
                  <span className="font-black text-red-500">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[15px]">
                <span className="font-bold text-gray-500">Shipping</span>
                <span className="font-black text-black dark:text-white">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between items-center text-[15px]">
                <span className="font-bold text-gray-500">Estimated Tax</span>
                <span className="font-black text-black dark:text-white">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t-2 border-black dark:border-white mb-8">
              <span className="text-[15px] font-black uppercase tracking-widest text-black dark:text-white">Total</span>
              <span className="text-[24px] font-black text-black dark:text-white">${total.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full h-16 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[15px] hover:opacity-80 transition-opacity flex items-center justify-center gap-3"
            >
              Checkout
            </button>
            <p className="text-center text-[14px] font-bold tracking-widest text-gray-500 uppercase mt-4">
              Secure Checkout & Free Returns
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};
