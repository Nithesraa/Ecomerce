import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { clearCartState } from '../../cart/cartSlice.js';
import { clearCurrentOrder } from '../orderSlice.js';

export const OrderSuccessPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder } = useSelector((state) => state.orders);

  useEffect(() => {
    // Clear the cart when landing on success page
    dispatch(clearCartState());

    // If there's no current order, they probably refreshed. Redirect to profile.
    if (!currentOrder) {
      navigate('/profile');
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, navigate, currentOrder]);

  if (!currentOrder) return null;

  return (
    <div className="w-full min-h-[85vh] bg-white dark:bg-[#050505] text-black dark:text-white flex flex-col items-center justify-center px-6 pt-32 pb-24">
      <div className="max-w-2xl w-full flex flex-col items-center text-center">
        
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        
        <h1 className="text-[40px] md:text-[60px] font-black uppercase tracking-tighter leading-none mb-4">
          Order Received
        </h1>
        
        <p className="text-gray-500 mb-12 max-w-md mx-auto text-[14px]">
          Thank you for your purchase. We've received your order and are currently processing it. A confirmation email has been sent to you.
        </p>
        
        <div className="w-full bg-gray-50 dark:bg-[#111111] p-8 border border-[#E2E8F0] dark:border-white/[0.05] flex flex-col sm:flex-row justify-between items-center text-left mb-12 gap-6 sm:gap-0">
          <div>
            <span className="block text-[14px] font-bold tracking-widest text-gray-500 uppercase mb-1">Order Number</span>
            <span className="text-[15px] font-black tracking-widest text-black dark:text-white">{currentOrder.orderId}</span>
          </div>
          <div className="w-px h-12 bg-[#E2E8F0] dark:bg-white/[0.1] hidden sm:block"></div>
          <div>
            <span className="block text-[14px] font-bold tracking-widest text-gray-500 uppercase mb-1">Total Paid</span>
            <span className="text-[15px] font-black tracking-widest text-black dark:text-white">${currentOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link 
            to="/profile"
            className="h-14 px-10 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[15px] hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
          >
            View Order History <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            to="/products"
            className="h-14 px-10 bg-transparent border-2 border-black dark:border-white text-black dark:text-white font-bold uppercase tracking-widest text-[15px] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};
