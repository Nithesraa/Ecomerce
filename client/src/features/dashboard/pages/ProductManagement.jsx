import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerProducts, deleteProductThunk, approveProductThunk, rejectProductThunk } from '../dashboardSlice.js';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Check, X } from 'lucide-react';
import { ProductFormModal } from '../components/ProductFormModal.jsx';

export const ProductManagement = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchSellerProducts());
  }, [dispatch]);

  const handleApprove = (productId) => {
    if (window.confirm('Approve this product for the global store?')) {
      dispatch(approveProductThunk(productId));
    }
  };

  const handleReject = (productId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason !== null) {
      dispatch(rejectProductThunk({ productId, reason }));
    }
  };

  const filteredProducts = products?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProductThunk(productId));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Products</h1>
          <p className="text-gray-500 mt-1">Manage your inventory, pricing, and variants.</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-lg flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
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
                <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Product</th>
                <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Inventory</th>
                <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest">Price</th>
                <th className="p-4 text-lg font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-200 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-[#222] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{product.title}</p>
                          <p className="text-lg text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[18px] font-bold uppercase tracking-wider ${
                        product.status === 'ACTIVE' ? 'bg-green-50 text-green-600 dark:bg-green-500/10' :
                        product.status === 'DRAFT' ? 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400' :
                        'bg-red-50 text-red-600 dark:bg-red-500/10'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-lg font-medium text-gray-900 dark:text-white">
                      {product.stock} in stock
                    </td>
                    <td className="p-4 text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role === 'ADMIN' && product.status === 'PENDING_APPROVAL' && (
                          <>
                            <button 
                              onClick={() => handleApprove(product._id)}
                              className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(product._id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingProduct={selectedProduct}
      />
    </div>
  );
};
