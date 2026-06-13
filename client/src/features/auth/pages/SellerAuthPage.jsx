import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ArrowRight, Loader2, BarChart, Globe, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginUser, registerUser } from '../authSlice.js';

// Schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Company name is too short'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SellerAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  const isLoginPath = location.pathname.includes('login');
  const [isLogin, setIsLogin] = useState(isLoginPath);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    navigate(!isLogin ? '/seller/login' : '/seller/register', { replace: true });
  };

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        const resultAction = await dispatch(loginUser(data));
        if (loginUser.fulfilled.match(resultAction)) {
          toast.success('Welcome back to your workspace');
          navigate('/dashboard', { replace: true });
        } else {
          toast.error(resultAction.payload || 'Login failed');
        }
      } else {
        // Enforce SELLER role
        const sellerData = { ...data, role: 'SELLER' };
        const resultAction = await dispatch(registerUser(sellerData));
        if (registerUser.fulfilled.match(resultAction)) {
          toast.success('Partnership account created! Please log in.');
          setIsLogin(true);
          navigate('/seller/login', { replace: true });
        } else {
          toast.error(resultAction.payload || 'Registration failed');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative z-10 shadow-2xl">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-black hover:opacity-70 transition-opacity">
          <Store className="w-5 h-5" />
          <span className="font-black tracking-tighter uppercase text-sm">ShopSphere</span>
        </Link>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-black mb-2">
              {isLogin ? 'Seller Login' : 'Become a Partner'}
            </h1>
            <p className="text-gray-500 font-medium mb-10">
              {isLogin ? 'Access your dashboard and manage your store.' : 'Join thousands of brands selling globally.'}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">Company Name</label>
                    <input
                      {...register('name')}
                      type="text"
                      disabled={isLoading}
                      className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="e.g. Acme Corp"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="name@company.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  disabled={isLoading}
                  className="w-full bg-gray-50 border border-gray-200 text-black px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                {isLogin ? "Don't have a seller account?" : "Already a partner?"}
                <button onClick={toggleMode} className="ml-2 text-blue-600 font-bold hover:underline">
                  {isLogin ? 'Apply Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Value Proposition (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] items-center justify-center p-24 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,_#3b82f6_0%,_transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,_#8b5cf6_0%,_transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6 leading-tight">Scale your brand globally.</h2>
          <p className="text-gray-400 text-sm mb-12">
            Join the platform built for modern commerce. Manage your inventory, track analytics, and reach millions of customers instantly.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Global Reach</h3>
                <p className="text-gray-400 text-sm">Access customers in over 150 countries with automated localization and currency conversion.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                <BarChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Advanced Analytics</h3>
                <p className="text-gray-400 text-sm">Make data-driven decisions with real-time insights into sales, traffic, and customer behavior.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-green-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Secure Operations</h3>
                <p className="text-gray-400 text-sm">Enterprise-grade security protecting your data, your revenue, and your customers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
