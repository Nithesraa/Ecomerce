import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponService } from '../../api/couponService.js';
import toast from 'react-hot-toast';

export const fetchCoupons = createAsyncThunk(
  'coupons/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await couponService.getAllCoupons();
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch coupons';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupons/create',
  async (couponData, thunkAPI) => {
    try {
      const response = await couponService.createCoupon(couponData);
      toast.success('Coupon created successfully');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create coupon';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupons/delete',
  async (id, thunkAPI) => {
    try {
      await couponService.deleteCoupon(id);
      toast.success('Coupon deleted');
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete coupon';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.push(action.payload);
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c._id !== action.payload);
      });
  }
});

export default couponSlice.reducer;
