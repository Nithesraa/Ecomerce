import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Heart } from 'lucide-react';
import { fetchMyOrders, fetchOrderById, clearCurrentOrder, updateMyOrderStatus } from '../../orders/orderSlice.js';
import { fetchWishlist, toggleWishlist } from '../../wishlist/wishlistSlice.js';
import { logoutUser } from '../authSlice.js';
import { ReviewModal } from '../../reviews/components/ReviewModal.jsx';
import { generateOrderInvoice } from '../../../utils/pdfGenerator.js';
import { Download } from 'lucide-react';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orders, currentOrder, loading: ordersLoading, pagination } = useSelector((state) => state.orders);
  const { wishlist, loading: wishlistLoading } = useSelector((state) => state.wishlist);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 1, limit: 10 }));
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleViewOrder = (orderId) => {
    dispatch(fetchOrderById(orderId));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => dispatch(clearCurrentOrder()), 300);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return 'text-green-500';
      case 'PROCESSING': return 'text-blue-500';
      case 'SHIPPED': return 'text-purple-500';
      case 'CANCELLED': return 'text-red-500';
      case 'PENDING': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const totalSpent = orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  const wishlistItems = wishlist?.items || [];

  const timelineSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const getTimelineProgress = (status) => {
    if (!status) return 0;
    if (status === 'CANCELLED') return -1;
    const index = timelineSteps.indexOf(status);
    return index >= 0 ? index : 0;
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-black text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-sans transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row gap-16 md:gap-24">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4 flex flex-col gap-12 shrink-0">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">Account</h1>
            <p className="text-lg font-semibold tracking-[0.2em] text-gray-500 uppercase">Welcome, {user?.email?.split('@')[0]}</p>
          </div>
          
          <nav className="flex flex-col gap-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-left text-lg font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-between group ${activeTab === 'overview' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Overview
              {activeTab === 'overview' && <span className="w-8 h-px bg-black dark:bg-white inline-block"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`text-left text-lg font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-between group ${activeTab === 'orders' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Order History
              {activeTab === 'orders' && <span className="w-8 h-px bg-black dark:bg-white inline-block"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`text-left text-lg font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-between group ${activeTab === 'saved' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Saved Items
              {activeTab === 'saved' && <span className="w-8 h-px bg-black dark:bg-white inline-block"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`text-left text-lg font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-between group ${activeTab === 'details' ? 'text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Account Details
              {activeTab === 'details' && <span className="w-8 h-px bg-black dark:bg-white inline-block"></span>}
            </button>
            {user?.role === 'ADMIN' || user?.role === 'SELLER' ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-left text-lg font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black dark:hover:text-white transition-all duration-300 flex items-center justify-between"
              >
                Go to Workspace
              </button>
            ) : null}
            <button 
              onClick={handleLogout}
              className="text-left text-lg font-bold uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-all duration-300 flex items-center justify-between mt-8"
            >
              Log Out
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-3/4">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-[500px]"
          >

            {activeTab === 'overview' && (
              <div className="flex flex-col gap-16">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="border-t border-black/10 dark:border-white/10 pt-6">
                    <p className="text-lg font-bold tracking-[0.3em] text-gray-500 uppercase mb-4">Total Orders</p>
                    <p className="text-4xl font-light">{pagination?.total || orders.length}</p>
                  </div>
                  <div className="border-t border-black/10 dark:border-white/10 pt-6">
                    <p className="text-lg font-bold tracking-[0.3em] text-gray-500 uppercase mb-4">Total Spent</p>
                    <p className="text-4xl font-light">${totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="border-t border-black/10 dark:border-white/10 pt-6">
                    <p className="text-lg font-bold tracking-[0.3em] text-gray-500 uppercase mb-4">Saved Items</p>
                    <p className="text-4xl font-light">{wishlistItems.length}</p>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-[0.2em] border-b border-black/10 dark:border-white/10 pb-6 mb-8 flex justify-between items-end">
                    <span>Recent Orders</span>
                    <button onClick={() => setActiveTab('orders')} className="text-gray-400 hover:text-black dark:hover:text-white text-lg font-bold uppercase tracking-widest transition-colors">View All</button>
                  </h2>
                  
                  {orders.length === 0 ? (
                    <p className="text-lg text-gray-500 uppercase tracking-widest py-8">No recent orders.</p>
                  ) : (
                    <div className="flex flex-col">
                      {orders.slice(0, 2).map((order) => (
                        <div key={order._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center py-6 border-b border-black/5 dark:border-white/5 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors -mx-4 px-4">
                          <div className="col-span-3">
                            <span className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">#{order._id.substring(order._id.length - 8)}</span>
                          </div>
                          <div className="col-span-3 text-lg text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="col-span-2">
                            <span className={`text-lg font-bold uppercase tracking-[0.2em] ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                          </div>
                          <div className="col-span-2 md:text-right">
                            <span className="text-lg font-medium">${order.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="col-span-2 flex justify-start md:justify-end mt-4 md:mt-0">
                            <button 
                              onClick={() => handleViewOrder(order._id)}
                              className="text-lg font-bold tracking-[0.2em] uppercase text-black dark:text-white border-b border-transparent hover:border-black dark:hover:border-white transition-colors pb-0.5"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wishlist Overview */}
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-[0.2em] border-b border-black/10 dark:border-white/10 pb-6 mb-8 flex justify-between items-end">
                    <span>Saved Items</span>
                    <button onClick={() => setActiveTab('saved')} className="text-gray-400 hover:text-black dark:hover:text-white text-lg font-bold uppercase tracking-widest transition-colors">View All</button>
                  </h2>
                  
                  {wishlistItems.length === 0 ? (
                    <p className="text-lg text-gray-500 uppercase tracking-widest py-8">Your wishlist is empty.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {wishlistItems.slice(0, 4).map((item) => (
                        <div key={item._id} className="group cursor-pointer" onClick={() => navigate(`/product/${item.product._id}`)}>
                          <div className="aspect-[3/4] bg-gray-100 dark:bg-white/5 mb-4 overflow-hidden relative">
                            <img src={item.product?.images?.[0]?.url || '/placeholder.png'} alt="Product" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700" />
                          </div>
                          <h3 className="text-lg font-bold uppercase tracking-widest mb-1 truncate">{item.product?.title}</h3>
                          <p className="text-lg font-medium">${item.product?.price?.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'details' && (
              <div className="max-w-2xl">
                <h2 className="text-lg font-bold uppercase tracking-[0.2em] border-b border-black/10 dark:border-white/10 pb-6 mb-10">Profile Details</h2>
                
                <div className="flex flex-col gap-10">
                  <div>
                    <label className="block text-lg font-bold tracking-[0.3em] text-gray-500 uppercase mb-4">Email Address</label>
                    <div className="text-2xl font-medium tracking-wide">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-lg font-bold tracking-[0.3em] text-gray-500 uppercase mb-4">Account Role</label>
                    <div className="text-xl font-semibold tracking-widest uppercase">
                      {user?.role}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <h2 className="text-lg font-bold uppercase tracking-[0.2em] border-b border-black/10 dark:border-white/10 pb-6 mb-10 flex justify-between items-end">
                  <span>Saved Items</span>
                  <span className="text-gray-400 text-lg font-bold uppercase tracking-widest">{wishlistItems.length} Items</span>
                </h2>
                
                {wishlistLoading && wishlistItems.length === 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-white/5 animate-pulse"></div>
                    ))}
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="py-20 flex flex-col items-start border-t border-b border-black/10 dark:border-white/10">
                    <p className="text-lg font-medium text-gray-500 uppercase tracking-widest mb-8">You have no saved items.</p>
                    <button 
                      onClick={() => navigate('/products')} 
                      className="text-lg font-bold uppercase tracking-[0.2em] flex items-center gap-4 hover:gap-6 transition-all border-b border-black dark:border-white pb-1"
                    >
                      Explore Products <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                    {wishlistItems.map((item) => (
                      <div key={item._id} className="group relative">
                        <div 
                          className="aspect-[3/4] bg-gray-100 dark:bg-white/5 mb-4 overflow-hidden relative cursor-pointer"
                          onClick={() => navigate(`/product/${item.product._id}`)}
                        >
                          <img src={item.product?.images?.[0]?.url || '/placeholder.png'} alt="Product" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleWishlist(item.product._id));
                          }}
                          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                        >
                          <Heart className="w-5 h-5 fill-black dark:fill-white text-black dark:text-white" />
                        </button>
                        <h3 className="text-lg font-bold uppercase tracking-widest mb-1 truncate pr-8" title={item.product?.title}>{item.product?.title}</h3>
                        <p className="text-lg font-medium">${item.product?.price?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-bold uppercase tracking-[0.2em] border-b border-black/10 dark:border-white/10 pb-6 mb-10 flex justify-between items-end">
                  <span>Order History</span>
                  <span className="text-gray-400 text-lg font-bold uppercase tracking-widest">{pagination?.total || orders.length} Orders</span>
                </h2>
                
                {ordersLoading && orders.length === 0 ? (
                  <div className="flex flex-col gap-6">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 animate-pulse rounded-none"></div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-20 flex flex-col items-start border-t border-b border-black/10 dark:border-white/10">
                    <p className="text-lg font-medium text-gray-500 uppercase tracking-widest mb-8">You have no order history.</p>
                    <button 
                      onClick={() => navigate('/products')} 
                      className="text-lg font-bold uppercase tracking-[0.2em] flex items-center gap-4 hover:gap-6 transition-all border-b border-black dark:border-white pb-1"
                    >
                      Start Shopping <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-4 text-lg font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-black/10 dark:border-white/10 mb-6">
                      <div className="col-span-2">Order</div>
                      <div className="col-span-3">Date</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Payment</div>
                      <div className="col-span-1 text-right">Total</div>
                      <div className="col-span-2"></div>
                    </div>

                    {/* Table Rows */}
                    {orders.map((order) => (
                      <div key={order._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center py-6 border-b border-black/5 dark:border-white/5 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors -mx-4 px-4">
                        <div className="col-span-2">
                          <span className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">#{order._id.substring(order._id.length - 8)}</span>
                        </div>
                        <div className="col-span-3 text-lg text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="col-span-2">
                          <span className={`text-[15px] font-bold uppercase tracking-[0.2em] ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                        </div>
                        <div className="col-span-2">
                          <span className={`text-[12px] font-bold uppercase tracking-[0.2em] px-3 py-1 border ${order.paymentStatus === 'PAID' ? 'border-green-500 text-green-500' : order.paymentStatus === 'FAILED' ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}`}>
                            {order.paymentStatus || 'PENDING'}
                          </span>
                        </div>
                        <div className="col-span-1 md:text-right">
                          <span className="text-lg font-medium">${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="col-span-2 flex justify-start md:justify-end mt-4 md:mt-0">
                          <button 
                            onClick={() => handleViewOrder(order._id)}
                            className="text-[14px] font-bold tracking-[0.2em] uppercase text-black dark:text-white border-b border-transparent hover:border-black dark:hover:border-white transition-colors pb-0.5"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Classy Side Panel Modal for Order Details */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/20 dark:bg-black/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[210] w-full max-w-2xl bg-white dark:bg-[#050505] shadow-2xl flex flex-col border-l border-black/10 dark:border-white/10"
            >
              <div className="p-8 md:p-12 border-b border-black/10 dark:border-white/10 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold uppercase tracking-[0.2em]">Order Summary</h3>
                <div className="flex items-center gap-4">
                  {currentOrder && (
                    <button 
                      onClick={() => generateOrderInvoice(currentOrder)}
                      className="text-[14px] font-bold uppercase tracking-widest flex items-center gap-2 border border-black/20 dark:border-white/20 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Receipt
                    </button>
                  )}
                  <button 
                    onClick={handleCloseModal} 
                    className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <X className="w-8 h-8 stroke-1" />
                  </button>
                </div>
              </div>
              
              <div className="p-8 md:p-12 overflow-y-auto flex-1">
                {!currentOrder ? (
                  <div className="animate-pulse space-y-12">
                    <div className="h-px bg-gray-200 dark:bg-white/10 w-full"></div>
                    <div className="h-px bg-gray-200 dark:bg-white/10 w-full"></div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-16">
                    {/* Order ID & Date */}
                    <div>
                      <p className="text-lg font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">Order Reference</p>
                      <p className="text-3xl font-light tracking-tight mb-2">#{currentOrder.order?._id}</p>
                      <p className="text-lg font-semibold text-gray-500 uppercase tracking-widest">{currentOrder.order?.createdAt ? formatDate(currentOrder.order.createdAt) : ''}</p>
                    </div>

                    {/* Order Tracking Timeline */}
                    {currentOrder.order?.orderStatus === 'CANCELLED' ? (
                      <div className="py-6 px-8 border border-red-500/20 bg-red-500/5 text-red-500">
                        <p className="text-lg font-bold uppercase tracking-widest text-center">Order Cancelled</p>
                      </div>
                    ) : (
                      <div className="relative pt-8 pb-4">
                        {/* Connecting Line */}
                        <div className="absolute top-12 left-0 w-full h-1 bg-gray-200 dark:bg-white/10 -z-10 rounded-full"></div>
                        <div 
                          className="absolute top-12 left-0 h-1 bg-black dark:bg-white -z-10 rounded-full transition-all duration-1000"
                          style={{ width: `${(getTimelineProgress(currentOrder.order?.orderStatus) / (timelineSteps.length - 1)) * 100}%` }}
                        ></div>
                        
                        <div className="flex justify-between relative z-0">
                          {timelineSteps.map((step, index) => {
                            const currentProgress = getTimelineProgress(currentOrder.order?.orderStatus);
                            const isCompleted = index <= currentProgress;
                            const isCurrent = index === currentProgress;
                            
                            return (
                              <div key={step} className="flex flex-col items-center gap-4 w-1/4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${isCompleted ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-200 text-gray-400 dark:bg-[#111] dark:text-gray-600'}`}>
                                  {isCompleted ? '✓' : index + 1}
                                </div>
                                <span className={`text-[13px] font-bold tracking-widest uppercase transition-colors duration-500 ${isCurrent ? 'text-black dark:text-white' : isCompleted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h4 className="text-lg font-bold tracking-[0.3em] text-gray-400 uppercase mb-8 border-b border-black/10 dark:border-white/10 pb-4">Purchases</h4>
                      <div className="flex flex-col gap-8">
                        {currentOrder.items?.map((item, index) => (
                          <div key={index} className="flex gap-6 group">
                            <div className="w-28 h-36 bg-gray-100 dark:bg-white/5 shrink-0 overflow-hidden">
                              <img src={item.product?.images?.[0]?.url || '/placeholder.png'} alt="Product" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                            <div className="flex-1 flex flex-col pt-1">
                              <span className="font-semibold text-lg uppercase tracking-wide leading-relaxed mb-2">{item.product?.title || 'Product'}</span>
                              <span className="text-lg font-medium text-gray-500 mb-auto">Qty: {item.quantity}</span>
                              
                              <div className="flex items-end justify-between mt-4">
                                <span className="font-medium text-lg">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                                
                                {currentOrder.order?.orderStatus === 'DELIVERED' && item.product?._id && (
                                  <button 
                                    onClick={() => {
                                      setReviewModalData({ productId: item.product._id, title: item.product.title });
                                    }}
                                    className="text-lg font-bold uppercase tracking-[0.2em] border-b border-black dark:border-white pb-0.5"
                                  >
                                    Write Review
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12">
                      {/* Shipping */}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold tracking-[0.3em] text-gray-400 uppercase mb-6 border-b border-black/10 dark:border-white/10 pb-4">Shipping</h4>
                        <div className="text-lg font-medium text-gray-600 dark:text-gray-400 leading-loose uppercase tracking-widest">
                          <p>{currentOrder.order?.shippingAddress?.street}</p>
                          <p>{currentOrder.order?.shippingAddress?.city}, {currentOrder.order?.shippingAddress?.state}</p>
                          <p>{currentOrder.order?.shippingAddress?.zipCode}</p>
                          <p>{currentOrder.order?.shippingAddress?.country}</p>
                        </div>
                      </div>

                      {/* Payment and Actions */}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold tracking-[0.3em] text-gray-400 uppercase mb-6 border-b border-black/10 dark:border-white/10 pb-4">Payment & Actions</h4>
                        <div className="flex flex-col gap-4 text-lg font-medium tracking-widest uppercase mb-8">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="font-bold">{currentOrder.order?.paymentStatus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Method</span>
                            <span className="font-bold">{currentOrder.order?.paymentMethod || 'CARD'}</span>
                          </div>
                          <div className="flex justify-between mt-2 pt-4 border-t border-black/10 dark:border-white/10">
                            <span className="font-bold text-gray-500">Total</span>
                            <span className="font-bold text-lg">${currentOrder.order?.totalAmount?.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-col gap-3 mt-4">
                          {['PENDING', 'PROCESSING'].includes(currentOrder.order?.orderStatus) && (
                            <button
                              onClick={() => dispatch(updateMyOrderStatus({ orderId: currentOrder.order._id, status: 'CANCELLED' }))}
                              className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-lg uppercase tracking-widest hover:bg-red-700 transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}
                          {currentOrder.order?.orderStatus === 'DELIVERED' && (
                            <button
                              onClick={() => dispatch(updateMyOrderStatus({ orderId: currentOrder.order._id, status: 'RETURN_REQUESTED' }))}
                              className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-4 rounded-lg text-lg uppercase tracking-widest hover:scale-[1.02] transition-transform"
                            >
                              Request Return
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ReviewModal 
        isOpen={!!reviewModalData}
        onClose={() => setReviewModalData(null)}
        productId={reviewModalData?.productId}
        productTitle={reviewModalData?.title}
      />
    </div>
  );
};
