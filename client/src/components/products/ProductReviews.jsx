import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, addReview, checkEligibility, clearReviews } from '../../features/reviews/reviewSlice.js';
import { Star, MessageSquare, ThumbsUp, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

const RatingStars = ({ rating, interactive = false, onRate }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star
            className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-300 dark:text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
};

export const ProductReviews = ({ product }) => {
  const dispatch = useDispatch();
  const { reviews, loading, isEligible, totalReviews } = useSelector(state => state.reviews);
  const { user } = useSelector(state => state.auth);
  
  const [sort, setSort] = useState('newest');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product?._id) {
      dispatch(fetchReviews({ productId: product._id, page: 1, limit: 10, sort }));
      if (user) {
        dispatch(checkEligibility(product._id));
      }
    }
    return () => {
      dispatch(clearReviews());
    };
  }, [dispatch, product?._id, user, sort]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setSubmitting(true);
    await dispatch(addReview({ productId: product._id, rating, comment }));
    setSubmitting(false);
    setRating(0);
    setComment('');
  };

  const calculatePercentage = (count) => {
    if (!product.reviewCount) return 0;
    return Math.round((count / product.reviewCount) * 100);
  };

  const distribution = [
    { stars: 5, count: product?.ratingDistribution?.five || 0 },
    { stars: 4, count: product?.ratingDistribution?.four || 0 },
    { stars: 3, count: product?.ratingDistribution?.three || 0 },
    { stars: 2, count: product?.ratingDistribution?.two || 0 },
    { stars: 1, count: product?.ratingDistribution?.one || 0 },
  ];

  return (
    <div className="mt-16 pt-10 border-t border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-black dark:text-white" />
        <h2 className="text-xl font-black uppercase tracking-tight text-black dark:text-white">Customer Reviews</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Summary & Form */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Summary Card */}
          <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black text-black dark:text-white">
                {product?.averageRating ? product.averageRating.toFixed(1) : '0.0'}
              </span>
              <div className="pb-1">
                <RatingStars rating={Math.round(product?.averageRating || 0)} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-6">Based on {product?.reviewCount || 0} reviews</p>

            <div className="flex flex-col gap-3">
              {distribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-3 text-sm">
                  <div className="w-12 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    {dist.stars} <Star className="w-3 h-3 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${calculatePercentage(dist.count)}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-gray-500 font-mono text-sm">{dist.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Review Form has been moved to Order History */}

        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm text-black dark:text-white">Showing {reviews.length} of {totalReviews} reviews</h3>
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:outline-none"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="flex flex-col gap-6">
            {loading && reviews.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="pb-6 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                        {review.user?.firstName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-black dark:text-white">
                          {review.user?.firstName} {review.user?.lastName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <RatingStars rating={review.rating} />
                          {review.isVerifiedPurchase && (
                            <span className="text-[15px] uppercase tracking-wider font-bold text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mt-3">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <button className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Helpful ({review.helpfulVotes || 0})
                    </button>
                    {user && user._id === review.user?._id && (
                      <div className="flex items-center gap-3 ml-auto">
                        <button className="text-sm font-medium text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 font-medium">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
