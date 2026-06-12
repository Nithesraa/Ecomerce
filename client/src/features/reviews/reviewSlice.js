import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/axios.js';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async ({ productId, page = 1, limit = 10, sort = 'newest' }, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/products/${productId}/reviews?page=${page}&limit=${limit}&sort=${sort}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const checkEligibility = createAsyncThunk(
  'reviews/checkEligibility',
  async (productId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/products/${productId}/reviews/eligibility`);
      return response.data.data.isEligible;
    } catch (error) {
      return false; // Fail silently, default to not eligible
    }
  }
);

export const addReview = createAsyncThunk(
  'reviews/addReview',
  async ({ productId, rating, comment }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/products/${productId}/reviews`, { rating, comment });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, rating, comment }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/reviews/${reviewId}`, { rating, comment });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

const initialState = {
  reviews: [],
  page: 1,
  totalPages: 1,
  totalReviews: 0,
  loading: false,
  error: null,
  isEligible: false,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.page = 1;
      state.totalPages = 1;
      state.totalReviews = 0;
      state.isEligible = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Eligibility
      .addCase(checkEligibility.fulfilled, (state, action) => {
        state.isEligible = action.payload;
      })
      // Fetch
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.totalReviews = action.payload.totalReviews;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
        state.totalReviews += 1;
        state.isEligible = false; // Cannot review twice
      })
      // Update
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
        state.totalReviews = Math.max(0, state.totalReviews - 1);
        state.isEligible = true; // Can review again
      });
  }
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
