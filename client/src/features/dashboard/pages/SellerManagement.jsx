import { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardService } from '../../../api/dashboardService.js';

export const SellerManagement = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSellers();
      if (res.success) {
        setSellers(res.data);
      }
    } catch (error) {
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);



  const handleVerifyToggle = async (sellerId, currentStatus) => {
    try {
      const res = await dashboardService.verifySeller(sellerId, !currentStatus);
      if (res.success) {
        toast.success(res.message);
        setSellers(sellers.map(s => s._id === sellerId ? { ...s, isVerified: !currentStatus } : s));
      }
    } catch (error) {
      toast.error('Failed to update seller status');
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white">Seller Accounts</h1>
          <p className="text-gray-500 mt-1 font-medium">Verify and manage partner stores</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#222] border-b border-gray-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Store</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined On</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No sellers found
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-bold text-black dark:text-white">{seller.storeName}</div>
                          <div className="text-sm text-gray-500">{seller.businessEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black dark:text-white">{seller.user?.name}</div>
                      <div className="text-sm text-gray-500">{seller.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        seller.isVerified 
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                      }`}>
                        {seller.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleVerifyToggle(seller._id, seller.isVerified)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                          seller.isVerified
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                            : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20'
                        }`}
                      >
                        {seller.isVerified ? (
                          <>
                            <XCircle className="w-4 h-4" /> Reject
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" /> Approve
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
