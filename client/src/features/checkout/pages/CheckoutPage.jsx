import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { fetchCheckoutSummary, createOrder, initializePayment } from '../../orders/orderSlice.js';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { checkoutSummary, loading, actionLoading } = useSelector((state) => state.orders);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');

  useEffect(() => {
    // If cart is empty, redirect back to products
    if (!cart?.items?.length) {
      navigate('/products');
      return;
    }
    // Fetch summary on mount
    dispatch(fetchCheckoutSummary(couponCode));
  }, [dispatch, cart, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    dispatch(fetchCheckoutSummary(couponCode));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all shipping fields');
      return;
    }

    // Step 1: Create the Order in MongoDB
    const orderAction = await dispatch(createOrder({ shippingAddress: formData, couponCode, paymentMethod }));
    if (!createOrder.fulfilled.match(orderAction)) return;
    
    const { orderId } = orderAction.payload.data;

    // Step 2: Handle Payment Logic
    if (paymentMethod === 'COD') {
      // Bypass Stripe, directly navigate to success
      navigate('/order-success');
    } else {
      // Initialize Stripe Checkout Session
      const initAction = await dispatch(initializePayment(orderId));
      
      if (!initializePayment.fulfilled.match(initAction)) return;
      
      const paymentData = initAction.payload.data; // { checkoutUrl, sessionId, orderId }

      // Redirect to Stripe Hosted Checkout
      if (paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
      } else {
        toast.error('Failed to get checkout URL');
      }
    }
  };

  if (!cart?.items?.length) return null;

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-[#050505] text-black dark:text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto w-full">
        <h1 className="text-[40px] md:text-[50px] font-black uppercase tracking-tighter leading-none mb-12">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24 items-start">
          
          {/* Left Column: Forms */}
          <div className="w-full lg:w-3/5 flex flex-col gap-12">
            
            {/* Shipping Address */}
            <div className="bg-white dark:bg-[#111111] p-8 md:p-12 border border-[#E2E8F0] dark:border-white/[0.05]">
              <div className="flex items-center gap-4 mb-8">
                <Truck className="w-6 h-6" />
                <h2 className="text-[24px] font-black uppercase tracking-tight">Shipping Address</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[14px] font-bold tracking-widest text-gray-500 uppercase mb-2">Street Address</label>
                  <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full h-14 px-4 bg-transparent border border-[#E2E8F0] dark:border-white/[0.2] focus:border-black dark:focus:border-white outline-none transition-colors" placeholder="123 Main St" required />
                </div>
                <div>
                  <label className="block text-[14px] font-bold tracking-widest text-gray-500 uppercase mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full h-14 px-4 bg-transparent border border-[#E2E8F0] dark:border-white/[0.2] focus:border-black dark:focus:border-white outline-none transition-colors" placeholder="New York" required />
                </div>
                <div>
                  <label className="block text-[14px] font-bold tracking-widest text-gray-500 uppercase mb-2">State / Province</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full h-14 px-4 bg-transparent border border-[#E2E8F0] dark:border-white/[0.2] focus:border-black dark:focus:border-white outline-none transition-colors" placeholder="NY" required />
                </div>
                <div>
                  <label className="block text-[14px] font-bold tracking-widest text-gray-500 uppercase mb-2">ZIP Code</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full h-14 px-4 bg-transparent border border-[#E2E8F0] dark:border-white/[0.2] focus:border-black dark:focus:border-white outline-none transition-colors" placeholder="10001" required />
                </div>
                <div>
                  <label className="block text-[14px] font-bold tracking-widest text-gray-500 uppercase mb-2">Country</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full h-14 px-4 bg-transparent border border-[#E2E8F0] dark:border-white/[0.2] focus:border-black dark:focus:border-white outline-none transition-colors text-black dark:text-white">
                    <option value="United States" className="text-black">United States</option>
                    <option value="Canada" className="text-black">Canada</option>
                    <option value="United Kingdom" className="text-black">United Kingdom</option>
                    <option value="Australia" className="text-black">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-[#111111] p-8 md:p-12 border border-[#E2E8F0] dark:border-white/[0.05]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-6 h-6" />
                  <h2 className="text-[24px] font-black uppercase tracking-tight">Payment</h2>
                </div>
                <div className="flex gap-2 opacity-50">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
              </div>
              
              
              {/* Payment Selection Options */}
              <div className="flex flex-col gap-4 mb-8">
                {/* Stripe Option */}
                <label className={`flex items-start gap-4 p-6 border-2 cursor-pointer transition-colors ${paymentMethod === 'STRIPE' ? 'border-black dark:border-white bg-gray-50 dark:bg-white/[0.02]' : 'border-[#E2E8F0] dark:border-white/[0.1] hover:border-black/50 dark:hover:border-white/50'}`}>
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="STRIPE" 
                      checked={paymentMethod === 'STRIPE'}
                      onChange={() => setPaymentMethod('STRIPE')}
                      className="w-5 h-5 accent-black dark:accent-white"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold uppercase tracking-widest text-[14px]">Pay Online (Stripe)</span>
                      <div className="flex gap-1 opacity-80">
                        <div className="w-8 h-5 bg-[#6772E5] rounded flex items-center justify-center text-[10px] text-white font-bold">Stripe</div>
                        <div className="w-8 h-5 bg-blue-600 rounded"></div>
                        <div className="w-8 h-5 bg-red-500 rounded"></div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-[15px]">Securely pay using Credit Card, Debit Card, or UPI via Stripe's encrypted checkout.</p>
                  </div>
                </label>

                {/* COD Option */}
                <label className={`flex items-start gap-4 p-6 border-2 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-black dark:border-white bg-gray-50 dark:bg-white/[0.02]' : 'border-[#E2E8F0] dark:border-white/[0.1] hover:border-black/50 dark:hover:border-white/50'}`}>
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-5 h-5 accent-black dark:accent-white"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold uppercase tracking-widest text-[14px]">Cash on Delivery</span>
                      <div className="flex gap-1 opacity-80">
                        <Truck className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-[15px]">Pay with cash upon delivery. No upfront payment required.</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'STRIPE' ? (
                <p className="text-[15px] text-gray-500 uppercase tracking-widest text-center mt-6">
                  You will be redirected to Stripe's secure checkout.
                </p>
              ) : (
                <p className="text-[15px] text-gray-500 uppercase tracking-widest text-center mt-6">
                  Your order will be processed immediately.
                </p>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#111111] p-8 md:p-12 border border-[#E2E8F0] dark:border-white/[0.05] sticky top-32">
              <h2 className="text-[24px] font-black uppercase tracking-tight mb-8">In Your Bag</h2>
              
              {/* Cart Items Summary */}
              <div className="flex flex-col gap-6 mb-8 max-h-[300px] overflow-y-auto pr-4">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="flex gap-4">
                    <img 
                      src={item.product?.images?.[0]?.url || '/placeholder.png'} 
                      alt={item.product?.title || 'Product'} 
                      className="w-16 h-20 object-cover bg-gray-100 dark:bg-black"
                    />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-[14px] leading-tight line-clamp-1 mb-1">{item.product?.title || 'Unknown Product'}</h4>
                      <div className="flex justify-between text-[14px] text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-bold text-black dark:text-white">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-[#E2E8F0] dark:border-white/[0.1] mb-8" />

              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} className="flex mb-8">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="PROMO CODE" 
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-black border border-[#E2E8F0] dark:border-white/[0.1] text-[15px] font-bold tracking-widest uppercase outline-none focus:border-black dark:focus:border-white transition-colors placeholder-gray-400"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="h-12 px-6 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[14px] hover:opacity-80 transition-opacity whitespace-nowrap disabled:opacity-50"
                >
                  Apply
                </button>
              </form>

              {/* Totals */}
              {loading && !checkoutSummary ? (
                <div className="animate-pulse flex flex-col gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
                </div>
              ) : checkoutSummary ? (
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-[14px]">Subtotal</span>
                    <span className="font-black text-black dark:text-white">${checkoutSummary.subtotal.toFixed(2)}</span>
                  </div>
                  {checkoutSummary.discount > 0 && (
                    <div className="flex justify-between items-center text-[15px]">
                      <span className="font-bold text-red-500 uppercase tracking-widest text-[14px]">Discount</span>
                      <span className="font-black text-red-500">-${checkoutSummary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-[14px]">Shipping</span>
                    <span className="font-black text-black dark:text-white">{checkoutSummary.shipping === 0 ? 'FREE' : `$${checkoutSummary.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-[14px]">Estimated Tax</span>
                    <span className="font-black text-black dark:text-white">${checkoutSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-[#E2E8F0] dark:border-white/[0.1] mt-2">
                    <span className="text-[15px] font-black uppercase tracking-widest text-black dark:text-white">Total</span>
                    <span className="text-[28px] font-black text-black dark:text-white">${checkoutSummary.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              ) : null}

              <button 
                onClick={handlePlaceOrder}
                disabled={loading || actionLoading || !checkoutSummary}
                className="w-full h-16 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[15px] hover:opacity-80 transition-opacity flex items-center justify-center disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
