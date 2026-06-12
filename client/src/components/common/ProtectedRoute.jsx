import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    let loginPath = '/login';
    
    // Smart redirect based on attempted path
    if (location.pathname.startsWith('/dashboard')) {
      if (allowedRoles && allowedRoles.length === 1 && allowedRoles[0] === 'ADMIN') {
        loginPath = '/admin/secure-login';
      } else {
        loginPath = '/seller/login';
      }
    }
    
    // Redirect them to the determined login page, but save the current location
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role not authorized, redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};
