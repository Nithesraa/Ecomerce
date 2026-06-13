import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupons, deleteCoupon, createCoupon } from '../couponSlice.js';
import { Plus, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export const CouponManagement = () => {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector((state) => state.coupons);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: 0,
    validUntil: '',
    maxUsesPerUser: 1,
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let isoDate;
    try {
      isoDate = new Date(formData.validUntil).toISOString();
    } catch (err) {
      return; // Invalid date, should be caught by HTML5 validation first
    }

    const resultAction = await dispatch(createCoupon({
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue),
      maxUsesPerUser: Number(formData.maxUsesPerUser),
      validUntil: isoDate
    }));
    
    if (createCoupon.fulfilled.match(resultAction)) {
      setShowModal(false);
      setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: 0, validUntil: '', maxUsesPerUser: 1, isActive: true });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Coupons</h1>
          <p className="text-gray-500 mt-1">Create and manage promotional discount codes.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && coupons.length === 0 ? (
          <p className="text-gray-500">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-500 col-span-full">No coupons found.</p>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon._id} className="bg-white dark:bg-[#111] p-6 border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm relative group overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => dispatch(deleteCoupon(coupon._id))}
                  className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-widest text-black dark:text-white uppercase">{coupon.code}</h3>
                  <p className={`text-[15px] font-bold uppercase tracking-widest ${coupon.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    {coupon.discountType === 'PERCENTAGE' ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                    {coupon.discountValue}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min Order:</span>
                  <span className="font-bold text-gray-900 dark:text-white">${coupon.minOrderValue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valid Until:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {format(new Date(coupon.validUntil), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Basic Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-md p-6 border border-gray-200 dark:border-white/[0.05]">
            <h2 className="text-base font-black uppercase tracking-tight mb-6">Create New Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Coupon Code</label>
                <input type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 uppercase" placeholder="e.g. SUMMER50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Type</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})} className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500">
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Value</label>
                  <input type="number" required value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. 20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Valid Until</label>
                <input type="datetime-local" required value={formData.validUntil} onChange={(e) => setFormData({...formData, validUntil: e.target.value})} className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/[0.05] rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
