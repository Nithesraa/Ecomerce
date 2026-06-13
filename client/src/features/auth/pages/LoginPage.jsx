import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../authSlice.js';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const onSubmit = async (data) => {
  try {
    const user = await dispatch(loginUser(data)).unwrap();

    console.log("LOGIN USER:", user);
    console.log("LOCAL STORAGE:", localStorage.getItem("user"));

    toast.success(`Welcome back, ${user.name}!`);
    navigate(from, { replace: true });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    toast.error(error || 'Failed to login');
  }
};

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await dispatch(loginUser(data)).unwrap();
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      // Error toast is handled locally or in the thunk's UI wrapper.
      // Since unwrap throws the rejected payload, we can toast it here.
      toast.error(error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                    } rounded-md focus:outline-none sm:text-sm`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                    } rounded-md focus:outline-none sm:text-sm`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            </button>
          </div>
          <div className="text-sm text-center">
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
