import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice.js';
import productReducer from '../features/products/productSlice.js';
import categoryReducer from '../features/categories/categorySlice.js';
import cartReducer from '../features/cart/cartSlice.js';
import wishlistReducer from '../features/wishlist/wishlistSlice.js';
import orderReducer from '../features/orders/orderSlice.js';

import dashboardReducer from '../features/dashboard/dashboardSlice.js';
import couponReducer from '../features/dashboard/couponSlice.js';
import reviewReducer from '../features/reviews/reviewSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
    dashboard: dashboardReducer,
    coupons: couponReducer,
    reviews: reviewReducer,
  },
  devTools: import.meta.env.NODE_ENV !== 'production',
});
