import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkoutService } from '../../api/checkoutService.js';
import { orderService } from '../../api/orderService.js';
import { paymentService } from '../../api/paymentService.js';
import toast from 'react-hot-toast';

const initialState = {
  checkoutSummary: null,
  orders: [],
  currentOrder: null,
  loading: false,
  actionLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

export const fetchCheckoutSummary = createAsyncThunk(
  'orders/fetchSummary',
  async (couponCode, thunkAPI) => {
    try {
      const response = await checkoutService.getSummary(couponCode);
      return response;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch checkout summary';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async ({ shippingAddress, couponCode, paymentMethod }, thunkAPI) => {
    try {
      const response = await orderService.createOrder(shippingAddress, couponCode, paymentMethod);
      return response;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create order';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const initializePayment = createAsyncThunk(
  'orders/initializePayment',
  async (orderId, thunkAPI) => {
    try {
      const response = await paymentService.initializePayment(orderId);
      return response;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to initialize payment';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);



export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async ({ page, limit }, thunkAPI) => {
    try {
      const response = await orderService.getMyOrders(page, limit);
      return response;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch orders';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, thunkAPI) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch order details';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const updateMyOrderStatus = createAsyncThunk(
  'orders/updateMyOrderStatus',
  async ({ orderId, status }, thunkAPI) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, { status });
      toast.success(`Order status updated to ${status}`);
      return response;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update order status';
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearCheckoutSummary: (state) => {
      state.checkoutSummary = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Checkout Summary
      .addCase(fetchCheckoutSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckoutSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutSummary = action.payload.data;
      })
      .addCase(fetchCheckoutSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Initialize Payment
      .addCase(initializePayment.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(initializePayment.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(initializePayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.limit = action.payload.limit;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order By Id
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateMyOrderStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateMyOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (state.currentOrder && state.currentOrder.order._id === action.payload.data._id) {
          state.currentOrder.order = action.payload.data;
        }
        // Update it in the orders list as well
        const orderIndex = state.orders.findIndex(o => o._id === action.payload.data._id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload.data;
        }
      })
      .addCase(updateMyOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentOrder, clearCheckoutSummary } = orderSlice.actions;
export default orderSlice.reducer;
