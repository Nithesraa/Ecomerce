import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, updateCategoryThunk, deleteCategoryThunk } from '../../categories/categorySlice.js';
import { categoryService } from '../../../api/categoryService.js';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await dispatch(updateCategoryThunk({ categoryId: editingCategory._id, data: formData })).unwrap();
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category created successfully');
      }
      handleCloseModal();
      dispatch(fetchCategories()); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || error || 'Failed to process category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Any associated products may become orphaned.')) {
      try {
        await dispatch(deleteCategoryThunk(id)).unwrap();
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error(error || 'Failed to delete category');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Categories</h1>
          <p className="text-gray-500 mt-1">Organize your products into collections.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && categories.length === 0 ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 col-span-full">No categories found.</p>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white dark:bg-[#111] p-6 border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm relative group overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-base tracking-widest text-black dark:text-white uppercase">{category.name}</h3>
                  <p className="text-[15px] font-bold uppercase tracking-widest text-gray-400">
                    /{category.slug}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-500 hover:text-blue-500 bg-gray-50 dark:bg-white/[0.02] rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(category._id)}
                    className="p-2 text-gray-500 hover:text-red-500 bg-gray-50 dark:bg-white/[0.02] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mt-4">
                {category.description || 'No description provided.'}
              </p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-md p-6 border border-gray-200 dark:border-white/[0.05]">
            <h2 className="text-base font-black uppercase tracking-tight mb-6">{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Category Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. Electronics" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                <textarea rows="3" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-[#222] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Category description..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/[0.05] rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
