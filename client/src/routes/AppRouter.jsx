import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../features/cart/cartSlice.js';
import { fetchWishlist } from '../features/wishlist/wishlistSlice.js';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { BuyerAuthPage } from '../features/auth/pages/BuyerAuthPage.jsx';
import { SellerAuthPage } from '../features/auth/pages/SellerAuthPage.jsx';
import { AdminAuthPage } from '../features/auth/pages/AdminAuthPage.jsx';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';
import { StoreLayout } from '../components/layout/StoreLayout.jsx';
import { HomePage } from '../features/home/pages/HomePage.jsx';
import { ProductsPage } from '../features/products/pages/ProductsPage.jsx';
import { ProductDetailPage } from '../features/products/pages/ProductDetailPage.jsx';
import { CartPage } from '../features/cart/pages/CartPage.jsx';
import { WishlistPage } from '../features/wishlist/pages/WishlistPage.jsx';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage.jsx';
import { OrderSuccessPage } from '../features/orders/pages/OrderSuccessPage.jsx';
import { ProfilePage } from '../features/auth/pages/ProfilePage.jsx';

import { AdminLayout } from '../components/layout/AdminLayout.jsx';
import { DashboardOverview } from '../features/dashboard/pages/DashboardOverview.jsx';
import { ProductManagement } from '../features/dashboard/pages/ProductManagement.jsx';
import { OrderManagement } from '../features/dashboard/pages/OrderManagement.jsx';
import { CouponManagement } from '../features/dashboard/pages/CouponManagement.jsx';
import { CategoryManagement } from '../features/dashboard/pages/CategoryManagement.jsx';
import { SellerManagement } from '../features/dashboard/pages/SellerManagement.jsx';

const router = createBrowserRouter([
  // Buyer Auth Routes
  { path: '/login', element: <BuyerAuthPage /> },
  { path: '/register', element: <BuyerAuthPage /> },
  
  // Seller Auth Routes
  { path: '/seller/login', element: <SellerAuthPage /> },
  { path: '/seller/register', element: <SellerAuthPage /> },

  // Admin Auth Route
  { path: '/admin/secure-login', element: <AdminAuthPage /> },
  
  // Admin & Seller Dashboard Routes (AdminLayout)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'products', element: <ProductManagement /> },
      { path: 'orders', element: <OrderManagement /> },
      // Admin Only specific routes
      { path: 'sellers', element: <ProtectedRoute allowedRoles={['ADMIN']}><SellerManagement /></ProtectedRoute> },
      { path: 'coupons', element: <ProtectedRoute allowedRoles={['ADMIN']}><CouponManagement /></ProtectedRoute> },
      { path: 'categories', element: <ProtectedRoute allowedRoles={['ADMIN']}><CategoryManagement /></ProtectedRoute> },
    ]
  },

  // Public Routes (With StoreLayout)
  {
    path: '/',
    element: <StoreLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:slug',
        element: <ProductDetailPage />,
      },
      {
        path: 'categories/:slug',
        element: <ProductsPage />, // ProductsPage handles pre-filtering via URL params
      },
      
      // Protected Routes requiring Auth
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'cart', element: <CartPage /> },
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'order-success', element: <OrderSuccessPage /> },
        ]
      }
    ]
  }
]);

export const AppRouter = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  return <RouterProvider router={router} />;
};
