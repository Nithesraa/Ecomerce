import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '../../api/wishlistService.js';
import toast from 'react-hot-toast';

const initialState = {
  wishlist: null,
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, thunkAPI) => {
  try {
    const response = await wishlistService.getWishlist();
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to fetch wishlist');
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggleWishlist', async (productId, thunkAPI) => {
  try {
    const response = await wishlistService.toggleWishlist(productId);
    toast.success(response.message || 'Wishlist updated');
    return response.data; // Should return updated wishlist
  } catch (error) {
    return thunkAPI.rejectWithValue('Could not update wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.wishlist = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.loading = false; state.wishlist = action.payload; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      });
  }
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
