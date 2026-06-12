import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, fetchSellerOrderItems, getOrderDetailsThunk, updateSellerOrderItemStatusThunk, updateOrderStatusThunk } from '../dashboardSlice.js';
import { Search, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { OrderDetailsModal } from '../components/OrderDetailsModal.jsx';
import toast from 'react-hot-toast';

export const OrderManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading } = useSelector((state) => state.dashboard);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSeller = user?.role === 'SELLER';

  useEffect(() => {
    if (isSeller) {
      dispatch(fetchSellerOrderItems());
    } else {
      dispatch(fetchAdminOrders()); 
    }
  }, [dispatch, isSeller]);

  const handleViewOrder = (orderId) => {
    dispatch(getOrderDetailsThunk(orderId));
    setIsModalOpen(true);
  };

  const handleUpdateItemStatus = async (itemId, newStatus) => {
    await dispatch(updateSellerOrderItemStatusThunk({ orderItemId: itemId, status: newStatus }));
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await dispatch(updateOrderStatusThunk({ orderId, status: newStatus }));
  };

  const filteredItems = orders?.filter(item => {
    if (isSeller) {
      return item._id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.order?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return item._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.shippingAddress?.street?.toLowerCase().includes(searchTerm.toLowerCase());
    }
  }) || [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
            {isSeller ? 'Order Items' : 'Orders'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isSeller ? 'Manage individual products to fulfill.' : 'View and manage customer orders.'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={isSeller ? "Search by Item ID, Product, or Customer..." : "Search by Order ID or Address..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-lg pl-10 pr-4 py-2.5 text-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/[0.05]">
                {isSeller ? (
                  <>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Item / Order ID</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Product</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Qty & Price</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                  </>
                ) : (
                  <>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Customer / Address</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Total</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading {isSeller ? 'items' : 'orders'}...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No {isSeller ? 'items' : 'orders'} found.</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id} className="border-b border-gray-200 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    {isSeller ? (
                      // SELLER VIEW
                      <>
                        <td className="p-4 text-lg font-mono text-gray-900 dark:text-white">
                          <div><span className="text-sm text-gray-400">Item:</span> #{item._id.slice(-6).toUpperCase()}</div>
                          <div><span className="text-sm text-gray-400">Ord:</span> #{item.order?._id?.slice(-6).toUpperCase()}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/40'} 
                              alt="product" 
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                            />
                            <span className="text-lg font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                              {item.productTitle}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{item.order?.user?.name || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{item.order?.user?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{item.quantity}x</div>
                          <div className="text-sm text-gray-500">${(item.priceAtPurchase || 0).toFixed(2)}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={item.fulfillmentStatus}
                            onChange={(e) => handleUpdateItemStatus(item._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider outline-none cursor-pointer border ${
                              item.fulfillmentStatus === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                              item.fulfillmentStatus === 'SHIPPED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              item.fulfillmentStatus === 'PACKED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PACKED">Packed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleViewOrder(item.order?._id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-white/[0.05] rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" /> Order Details
                          </button>
                        </td>
                      </>
                    ) : (
                      // ADMIN VIEW
                      <>
                        <td className="p-4 text-lg font-mono text-gray-900 dark:text-white">
                          #{item._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="p-4 text-lg text-gray-500">
                          {format(new Date(item.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.user?.name || 'Guest'}
                            </span>
                            <span className="text-lg text-gray-500">
                              {item.shippingAddress?.city}, {item.shippingAddress?.country}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-lg font-bold text-gray-900 dark:text-white">
                          ${(item.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <select
                            value={item.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(item._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider outline-none cursor-pointer border ${
                              item.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                              item.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="RETURN_REQUESTED">Return Requested</option>
                            <option value="RETURNED">Returned</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleViewOrder(item._id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-white/[0.05] rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
