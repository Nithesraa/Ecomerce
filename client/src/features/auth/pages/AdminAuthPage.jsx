import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginUser } from '../authSlice.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const AdminAuthPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        if (user.role === 'ADMIN') {
          toast.success('Admin authentication successful');
          navigate('/dashboard', { replace: true });
        } else {
          toast.error('Access Denied. Insufficient privileges.');
          // Since they don't have admin privileges, we don't let them in this portal
        }
      } else {
        toast.error(resultAction.payload || 'Authentication failed');
      }
    } catch (err) {
      toast.error('A secure connection error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-white/30">
      {/* Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="bg-[#111] border border-white/[0.05] p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white">System Access</h1>
            <p className="text-lg text-gray-500 font-mono mt-2 uppercase tracking-widest">Restricted Internal Portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-600" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  disabled={isLoading}
                  className="w-full bg-black/50 border border-white/[0.1] text-white pl-11 pr-4 py-3.5 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-mono text-lg placeholder:text-gray-700"
                  placeholder="admin@internal.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-[18px] font-mono mt-2 uppercase">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-600" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  disabled={isLoading}
                  className="w-full bg-black/50 border border-white/[0.1] text-white pl-11 pr-4 py-3.5 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-mono text-lg placeholder:text-gray-700"
                  placeholder="••••••••••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-[18px] font-mono mt-2 uppercase">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-[17px] font-mono text-center uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-black uppercase tracking-[0.2em] text-[17px] py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authenticate'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
            <p className="text-[18px] font-mono text-gray-600 uppercase tracking-widest">
              Unauthorized access is strictly prohibited and logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
