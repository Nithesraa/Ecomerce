import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../api/cartService.js';
import toast from 'react-hot-toast';

const initialState = {
  cart: null,
  loading: false,
  actionLoading: false,
  error: null,
  isDrawerOpen: false,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  try {
    const response = await cartService.getCart();
    return response.data;
  } catch (error) {
    // If not authenticated, cart endpoint will return 401 which is caught by interceptor.
    return thunkAPI.rejectWithValue('Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ productId, quantity }, thunkAPI) => {
  try {
    const response = await cartService.addToCart(productId, quantity);
    toast.success('Added to cart');
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Could not add to cart';
    // toast.error(msg) handles interceptor if not 401
    return thunkAPI.rejectWithValue(msg);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ productId, quantity }, thunkAPI) => {
  try {
    const response = await cartService.updateCartItem(productId, quantity);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue('Could not update cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (productId, thunkAPI) => {
  try {
    const response = await cartService.removeFromCart(productId);
    toast.success('Removed from cart');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue('Could not remove from cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(addToCart.pending, (state) => { state.actionLoading = true; })
      .addCase(addToCart.fulfilled, (state, action) => { 
        state.actionLoading = false; 
        state.cart = action.payload; 
        state.isDrawerOpen = true; // Auto-open drawer on add to cart
      })
      .addCase(addToCart.rejected, (state) => { state.actionLoading = false; })

      .addCase(updateCartItem.fulfilled, (state, action) => { state.cart = action.payload; })
      .addCase(removeFromCart.fulfilled, (state, action) => { state.cart = action.payload; });
  }
});

export const { clearCartState, toggleCartDrawer, closeCartDrawer } = cartSlice.actions;
export default cartSlice.reducer;
