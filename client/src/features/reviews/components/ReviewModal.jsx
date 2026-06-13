import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addReview } from '../reviewSlice.js';
import toast from 'react-hot-toast';

export const ReviewModal = ({ isOpen, onClose, productId, productTitle }) => {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    const action = await dispatch(addReview({ productId, rating, comment }));
    setSubmitting(false);
    
    if (addReview.fulfilled.match(action)) {
      toast.success('Review submitted successfully!');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
            <h3 className="font-bold text-sm text-black dark:text-white">Review {productTitle}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Tap to rate</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-300 dark:text-gray-600'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Write your review (optional)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="What did you like or dislike about this product?"
                  className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={rating === 0 || submitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
