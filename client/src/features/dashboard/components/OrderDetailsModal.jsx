import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Truck, CheckCircle, Package, MapPin, DollarSign, Clock } from 'lucide-react';
import { updateOrderStatusThunk, clearSelectedOrder } from '../dashboardSlice.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const OrderDetailsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { selectedOrder, loading } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);
  
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (selectedOrder?.order) {
      setStatus(selectedOrder.order.orderStatus);
    }
  }, [selectedOrder]);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(clearSelectedOrder());
    onClose();
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder?.order) return;
    try {
      await dispatch(updateOrderStatusThunk({ orderId: selectedOrder.order._id, status })).unwrap();
    } catch (err) {
      // Toast handled by thunk
    }
  };

  const { order, items } = selectedOrder || {};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-white/[0.05]"
        >
          {loading || !order ? (
            <div className="p-10 text-center text-gray-500">Loading order details...</div>
          ) : (
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.05] sticky top-0 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    Order #{order._id.slice(-6).toUpperCase()}
                    <span className={`text-[18px] px-2 py-1 rounded-full tracking-widest font-bold ${
                      order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                      order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </h2>
                  <p className="text-lg text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:bg-gray-100 hover:text-black dark:hover:bg-white/10 dark:hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col: Items & Summary */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                  {/* Items */}
                  <section>
                    <h3 className="text-lg font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Ordered Items
                    </h3>
                    <div className="flex flex-col gap-4">
                      {items?.map((item) => (
                        <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/[0.05]">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">{item.productTitle}</span>
                            <span className="text-lg text-gray-500">Qty: {item.quantity}</span>
                          </div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Financial Summary */}
                  <section className="bg-gray-50 dark:bg-white/[0.02] rounded-xl p-5 border border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Payment Summary
                    </h3>
                    <div className="flex flex-col gap-2 text-lg">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>${(order.totalAmount + order.discountAmount).toFixed(2)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                          <span>-${order.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-200 dark:border-white/[0.05]">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-gray-900 dark:text-white pt-2">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Col: Address & Actions */}
                <div className="flex flex-col gap-8">
                  {/* Shipping Address */}
                  <section>
                    <h3 className="text-lg font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Shipping Address
                    </h3>
                    <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-white/[0.05] text-lg text-gray-700 dark:text-gray-300 flex flex-col gap-1">
                      <span className="font-bold text-black dark:text-white mb-1">Customer Info</span>
                      <span>{order.shippingAddress.street}</span>
                      <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                      <span>{order.shippingAddress.zipCode}</span>
                      <span>{order.shippingAddress.country}</span>
                    </div>
                  </section>

                  {/* Order Status Controller / Actions */}
                  <section>
                    <h3 className="text-lg font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> {user.role === 'USER' ? 'Order Actions' : 'Update Status'}
                    </h3>
                    
                    {user.role === 'USER' ? (
                      <div className="flex flex-col gap-3">
                        {['PENDING', 'PROCESSING'].includes(order.orderStatus) && (
                          <button
                            onClick={() => { setStatus('CANCELLED'); setTimeout(handleStatusUpdate, 0); }}
                            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-red-700 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                        {order.orderStatus === 'DELIVERED' && (
                          <button
                            onClick={() => { setStatus('RETURN_REQUESTED'); setTimeout(handleStatusUpdate, 0); }}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-4 rounded-lg text-lg hover:scale-[1.02] transition-transform"
                          >
                            Request Return
                          </button>
                        )}
                        {!['PENDING', 'PROCESSING', 'DELIVERED'].includes(order.orderStatus) && (
                          <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/[0.05] text-center text-lg text-gray-500">
                            No actions available for this order status.
                          </div>
                        )}
                      </div>
                    ) : (
                      // Admin / Seller Status Dropdown
                      order.orderStatus === 'CANCELLED' || order.orderStatus === 'RETURNED' ? (
                        <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-white/[0.05] text-center text-lg text-gray-500">
                          This order is permanently {order.orderStatus}.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="RETURN_REQUESTED">RETURN REQUESTED</option>
                            {user.role === 'ADMIN' && <option value="RETURNED">RETURNED</option>}
                            {user.role === 'ADMIN' && <option value="CANCELLED">CANCELLED</option>}
                          </select>
                          <button
                            onClick={handleStatusUpdate}
                            disabled={status === order.orderStatus}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 px-4 rounded-lg text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                          >
                            Update Status
                          </button>
                        </div>
                      )
                    )}
                  </section>
                </div>

              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
