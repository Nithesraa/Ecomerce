import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../api/productService.js';

const initialState = {
  products: [],
  featuredProducts: [],
  productDetail: null,
  loading: false,
  detailLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0
  },
  filters: {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt_desc'
  }
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, thunkAPI) => {
    try {
      const response = await productService.getProducts(params);
      return response; // { success, data, total, page, limit }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, thunkAPI) => {
    try {
      const response = await productService.getProducts({ isFeatured: true, limit: 8 });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch featured products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, thunkAPI) => {
    try {
      const response = await productService.getProductBySlug(slug);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch product';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to page 1 on filter change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    clearProductDetail: (state) => {
      state.productDetail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Featured
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      // Fetch Product Detail
      .addCase(fetchProductBySlug.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.productDetail = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, setPage, clearFilters, clearProductDetail } = productSlice.actions;
export default productSlice.reducer;
