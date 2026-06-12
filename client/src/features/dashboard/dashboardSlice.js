import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../api/dashboardService.js';
import toast from 'react-hot-toast';

export const fetchSellerOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, thunkAPI) => {
    try {
      const response = await dashboardService.getSellerOverview();
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch overview';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  'dashboard/fetchSellerOrders',
  async (_, thunkAPI) => {
    try {
      const response = await dashboardService.getSellerOrders();
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch seller orders';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'dashboard/fetchAdminOrders',
  async (_, thunkAPI) => {
    try {
      const response = await dashboardService.getAdminOrders();
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch admin orders';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchSellerOrderItems = createAsyncThunk(
  'dashboard/fetchSellerOrderItems',
  async (_, thunkAPI) => {
    try {
      const response = await dashboardService.getSellerOrderItems();
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch seller order items';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const updateSellerOrderItemStatusThunk = createAsyncThunk(
  'dashboard/updateSellerOrderItemStatus',
  async ({ orderItemId, status }, thunkAPI) => {
    try {
      const response = await dashboardService.updateSellerOrderItemStatus(orderItemId, status);
      toast.success('Item status updated');
      return response.data.data || response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update item status';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

import { productService } from '../../api/productService.js';

export const fetchSellerProducts = createAsyncThunk(
  'dashboard/fetchSellerProducts',
  async (_, thunkAPI) => {
    try {
      const response = await productService.getSellerProducts();
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch seller products';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createProductThunk = createAsyncThunk(
  'dashboard/createProduct',
  async (formData, thunkAPI) => {
    try {
      const response = await productService.createProduct(formData);
      toast.success('Product created successfully');
      return response.data.product || response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create product';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'dashboard/updateProduct',
  async ({ id, formData }, thunkAPI) => {
    try {
      const response = await productService.updateProduct(id, formData);
      toast.success('Product updated successfully');
      return response.data.product || response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update product';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const approveProductThunk = createAsyncThunk(
  'dashboard/approveProduct',
  async (productId, thunkAPI) => {
    try {
      // Need to add approveProduct to productService
      const response = await productService.approveProduct(productId);
      toast.success('Product approved');
      return response.data.product || response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to approve product';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const rejectProductThunk = createAsyncThunk(
  'dashboard/rejectProduct',
  async ({ productId, reason }, thunkAPI) => {
    try {
      const response = await productService.rejectProduct(productId, reason);
      toast.success('Product rejected');
      return response.data.product || response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reject product';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  'dashboard/deleteProduct',
  async (id, thunkAPI) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete product';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  'dashboard/updateOrderStatus',
  async ({ orderId, status }, thunkAPI) => {
    try {
      const response = await dashboardService.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      return response.data.data || response.data; // Depending on backend response shape
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update order status';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const getOrderDetailsThunk = createAsyncThunk(
  'dashboard/getOrderDetails',
  async (orderId, thunkAPI) => {
    try {
      const response = await dashboardService.getOrderDetails(orderId);
      return response.data.data || response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch order details';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const initialState = {
  overview: null,
  orders: [],
  selectedOrder: null,
  products: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchSellerOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchSellerOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Seller Orders
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Admin Orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Order Details
      .addCase(getOrderDetailsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Seller Order Items
      .addCase(fetchSellerOrderItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSellerOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload; // Reuse 'orders' state variable to hold order items for simplicity
      })
      .addCase(fetchSellerOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Seller Order Item Status
      .addCase(updateSellerOrderItemStatusThunk.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      
      // Update Order Status (Admin)
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      
      // Products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Product
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      
      // Update Product
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      
      // Delete Product
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      
      // Approve Product
      .addCase(approveProductThunk.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      
      // Reject Product
      .addCase(rejectProductThunk.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      });
  }
});

export const { clearSelectedOrder } = dashboardSlice.actions;
export default dashboardSlice.reducer;
