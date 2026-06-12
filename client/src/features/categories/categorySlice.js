import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '../../api/categoryService.js';

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await categoryService.getCategories();
      return response.data; // Server returns { success: true, data: [...] }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch categories';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateCategoryThunk = createAsyncThunk(
  'categories/updateCategory',
  async ({ categoryId, data }, thunkAPI) => {
    try {
      const response = await categoryService.updateCategory(categoryId, data);
      return response.data.data || response.data; // adjust based on generic response structure
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update category';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, thunkAPI) => {
    try {
      await categoryService.deleteCategory(categoryId);
      return categoryId;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete category';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c._id !== action.payload);
      });
  }
});

export default categorySlice.reducer;
