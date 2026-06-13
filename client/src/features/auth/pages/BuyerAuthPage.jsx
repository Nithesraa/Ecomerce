import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../authSlice.js';
import toast from 'react-hot-toast';
import { Loader2, ShoppingBag, Lock } from 'lucide-react';

import { AuthInput } from '../../../components/ui/AuthInput.jsx';
import { ThemeToggle } from '../../../components/ui/ThemeToggle.jsx';

/* ── schemas ─────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});
const registerSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

/* ── icons ───────────────────────────────────────── */
const GoogleIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const AppleIcon = () => (
  <svg className="w-5 h-5 fill-[#0F172A] dark:fill-white" viewBox="0 0 24 24">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.25.82 2.98.82.74 0 1.94-.92 3.44-.76 1.48.1 2.51.68 3.23 1.63-2.65 1.65-2.2 5.38.38 6.55-.54 1.55-1.34 3.14-2.03 4.73zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.41-3.74 4.25z" />
  </svg>
);

/* ── component ───────────────────────────────────── */
export const BuyerAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((s) => s.auth);
  const [isSignIn, setIsSignIn] = useState(location.pathname !== '/register');

  useEffect(() => { setIsSignIn(location.pathname !== '/register'); }, [location.pathname]);
  const toggleMode = () => navigate(isSignIn ? '/register' : '/login', { replace: true });

  const { register: rl, handleSubmit: hsl, formState: { errors: el } } = useForm({ resolver: zodResolver(loginSchema) });
  const { register: rs, handleSubmit: hss, formState: { errors: es }, reset: resetS } = useForm({ resolver: zodResolver(registerSchema) });

  const onLogin = async (d) => {
    try {
      const u = await dispatch(loginUser(d)).unwrap();
      toast.success(`Welcome back, ${u.name}!`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (e) { toast.error(e || 'Sign in failed'); }
  };
  const onRegister = async (d) => {
    try {
      await dispatch(registerUser({ name: d.name, email: d.email, password: d.password })).unwrap();
      toast.success('Account created!');
      resetS();
      toggleMode();
    } catch (e) { toast.error(e || 'Registration failed'); }
  };

  const loading = status === 'loading';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#050505] font-sans antialiased transition-colors duration-300">

      {/* theme toggle */}
      <div className="absolute top-5 right-5 z-50"><ThemeToggle /></div>

      {/* ═══════════════════════════════════════════
          LEFT PANEL – Brand & Product Messaging
          ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[46%] bg-white dark:bg-[#0a0a0a] border-r border-[#E2E8F0] dark:border-white/[0.08] relative overflow-hidden transition-colors duration-300">

        {/* ── oversized background typography ── */}
        <div className="absolute inset-0 flex flex-col justify-center pointer-events-none select-none opacity-[0.06] dark:opacity-[0.035] -translate-x-[8%]" aria-hidden="true">
          <span className="text-[160px] leading-[0.85] font-black tracking-tighter text-[#0F172A] dark:text-white whitespace-nowrap">POWERING</span>
          <span className="text-[160px] leading-[0.85] font-black tracking-tighter text-[#0F172A] dark:text-white whitespace-nowrap ml-12">MODERN</span>
          <span className="text-[160px] leading-[0.85] font-black tracking-tighter text-[#0F172A] dark:text-white whitespace-nowrap ml-24">COMMERCE</span>
        </div>

        {/* ── dot grid ── */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(#94A3B8 0.6px, transparent 0.6px)', backgroundSize: '28px 28px' }} />

        {/* ── subtle ambient gradient ── */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[5%] right-[-5%] w-[55%] h-[55%] rounded-full bg-blue-200/20 dark:bg-blue-800/10 blur-[100px] pointer-events-none"
        />

        {/* ── logo (absolute top-left) ── */}
        <div className="absolute top-8 left-10 xl:left-14 flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 bg-[#2563EB] rounded-[10px] flex items-center justify-center">
            <ShoppingBag className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[#0F172A] dark:text-white transition-colors">ShopSphere</span>
        </div>

        {/* ── main content (vertically centered) ── */}
        <div className="relative z-10 flex flex-col justify-center h-full px-10 xl:px-14">
          <div className="max-w-md">

            {/* hero headline */}
            <div className="flex">
              <div className="w-[3px] rounded-full bg-[#2563EB] mr-6 shrink-0" />
              <div>
                <h1 className="text-[56px] xl:text-[72px] font-extrabold tracking-tight leading-[0.95] text-[#0F172A] dark:text-white transition-colors">
                  <span className="block">Powering</span>
                  <span className="block">Modern</span>
                  <span className="block text-[#2563EB]">Commerce.</span>
                </h1>
                <p className="mt-5 text-[14px] leading-relaxed font-medium text-[#64748B] dark:text-[#94A3B8] max-w-sm transition-colors">
                  Manage products, orders, and payments from a single platform.
                </p>
              </div>
            </div>

            {/* enterprise statement */}
            <div className="mt-10 pt-7 border-t border-[#E2E8F0] dark:border-white/[0.06] transition-colors">
              <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-[#334155] dark:text-[#64748B] mb-2">Enterprise Grade</p>
              <p className="text-[15px] text-[#475569] dark:text-[#94A3B8] leading-relaxed transition-colors">
                Trusted by ambitious businesses building the future of commerce.
              </p>
            </div>

            {/* built for */}
            <div className="mt-8">
              <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-[#334155] dark:text-[#64748B] mb-3">Built for</p>
              <div className="space-y-1.5 text-[15px] font-semibold">
                <p className="text-[#0F172A] dark:text-white transition-colors">Marketplace Owners</p>
                <p className="text-[#334155] dark:text-white/70">Independent Sellers</p>
                <p className="text-[#64748B] dark:text-white/50">Growing Brands</p>
                <p className="text-[#94A3B8] dark:text-white/30">Modern Retailers</p>
              </div>
            </div>

          </div>
        </div>

        {/* copyright */}
        <div className="absolute bottom-6 left-10 xl:left-14 z-10">
          <p className="text-[14px] text-[#94A3B8] dark:text-[#64748B] transition-colors">
            © {new Date().getFullYear()} ShopSphere, Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL – Authentication
          ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-6 sm:px-10 transition-colors duration-300">

        {/* subtle spotlight */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[450px] h-[450px] rounded-full bg-blue-50 dark:bg-blue-900/10 blur-[100px] opacity-70" />
        </div>

        {/* mobile logo */}
        <div className="lg:hidden absolute top-5 left-5 flex items-center gap-2 z-10">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[14px] tracking-tight text-[#0F172A] dark:text-white">ShopSphere</span>
        </div>

        {/* ── premium auth card ── */}
        <div className="w-full max-w-[520px] relative z-10 bg-white dark:bg-[#0a0a0a] border border-[#E2E8F0] dark:border-white/[0.08] rounded-3xl px-8 sm:px-10 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_6px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_6px_20px_rgba(0,0,0,0.2)] transition-colors duration-300">

          <AnimatePresence mode="wait">

            {/* ── SIGN IN ── */}
            {isSignIn ? (
              <motion.div key="signin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>

                <div className="mb-6">
                  <h2 className="text-[24px] font-bold tracking-tight text-[#0F172A] dark:text-white mb-1">Welcome back</h2>
                  <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8]">Sign in to continue to your account.</p>
                </div>

                {/* social */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button type="button" onClick={() => toast('Google sign-in coming soon!', { icon: '🚀' })} className="flex items-center justify-center gap-2.5 h-[42px] border border-[#E2E8F0] dark:border-white/[0.08] rounded-lg bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-[#111] transition-colors text-[14px] font-semibold text-[#0F172A] dark:text-white">
                    <GoogleIcon /> Google
                  </button>
                  <button type="button" onClick={() => toast('Apple sign-in coming soon!', { icon: '🚀' })} className="flex items-center justify-center gap-2 h-[42px] border border-[#E2E8F0] dark:border-white/[0.08] rounded-lg bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-[#111] transition-colors text-[14px] font-semibold text-[#0F172A] dark:text-white">
                    <AppleIcon /> Apple
                  </button>
                </div>

                {/* divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/[0.06]" />
                  <span className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">Or</span>
                  <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/[0.06]" />
                </div>

                {/* form */}
                <form onSubmit={hsl(onLogin)}>
                  <AuthInput label="Email address" type="email" {...rl('email')} error={el.email?.message} />
                  <AuthInput label="Password" type="password" {...rl('password')} error={el.password?.message} />

                  <div className="flex justify-between items-center mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] dark:border-white/[0.15] dark:bg-black" />
                      <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium">Remember me</span>
                    </label>
                    <a href="#" className="text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">Forgot password?</a>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full h-[44px] rounded-lg text-[15px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] focus:outline-none focus:ring-[3px] focus:ring-[#2563EB]/20 disabled:opacity-50 transition-colors shadow-sm">
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Sign in'}
                  </button>
                </form>

                <div className="mt-5 text-center flex flex-col gap-2">
                  <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                    Don't have an account?{' '}
                    <button onClick={toggleMode} className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">Create account</button>
                  </p>
                  <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                    Are you a business?{' '}
                    <button onClick={() => navigate('/seller/login')} className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">Go to Seller Portal</button>
                  </p>
                </div>
              </motion.div>

            ) : (

              /* ── SIGN UP ── */
              <motion.div key="signup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>

                <div className="mb-6">
                  <h2 className="text-[24px] font-bold tracking-tight text-[#0F172A] dark:text-white mb-1">Create your account</h2>
                  <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8]">Start selling, managing products, and growing your business.</p>
                </div>

                {/* social */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button type="button" onClick={() => toast('Google sign-up coming soon!', { icon: '🚀' })} className="flex items-center justify-center gap-2.5 h-[42px] border border-[#E2E8F0] dark:border-white/[0.08] rounded-lg bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-[#111] transition-colors text-[14px] font-semibold text-[#0F172A] dark:text-white">
                    <GoogleIcon /> Google
                  </button>
                  <button type="button" onClick={() => toast('Apple sign-up coming soon!', { icon: '🚀' })} className="flex items-center justify-center gap-2 h-[42px] border border-[#E2E8F0] dark:border-white/[0.08] rounded-lg bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-[#111] transition-colors text-[14px] font-semibold text-[#0F172A] dark:text-white">
                    <AppleIcon /> Apple
                  </button>
                </div>

                {/* divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/[0.06]" />
                  <span className="text-[14px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">Or</span>
                  <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-white/[0.06]" />
                </div>

                {/* form */}
                <form onSubmit={hss(onRegister)}>
                  <AuthInput label="Full name" type="text" {...rs('name')} error={es.name?.message} />
                  <AuthInput label="Email address" type="email" {...rs('email')} error={es.email?.message} />
                  <AuthInput label="Password" type="password" {...rs('password')} error={es.password?.message} />

                  <div className="mt-1">
                    <button type="submit" disabled={loading}
                      className="w-full h-[44px] rounded-lg text-[15px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] focus:outline-none focus:ring-[3px] focus:ring-[#2563EB]/20 disabled:opacity-50 transition-colors shadow-sm">
                      {loading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Create account'}
                    </button>
                  </div>
                </form>

                <div className="mt-5 text-center flex flex-col gap-2">
                  <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                    Already have an account?{' '}
                    <button onClick={toggleMode} className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">Sign in</button>
                  </p>
                  <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                    Want to sell on ShopSphere?{' '}
                    <button onClick={() => navigate('/seller/register')} className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">Become a Partner</button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* trust line */}
        <div className="absolute bottom-5 flex items-center gap-1.5 z-10">
          <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
          <p className="text-[15px] font-medium text-[#94A3B8]">Protected by industry-standard security and encryption.</p>
        </div>
      </div>
    </div>
  );
};
