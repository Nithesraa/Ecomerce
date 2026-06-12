import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const AuthInput = React.forwardRef(({ 
  label, type = 'text', error, className, ...props 
}, ref) => {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={ref}
          type={isPw ? (show ? 'text' : 'password') : type}
          placeholder=" "
          className={cn(
            "peer w-full h-[48px] px-3.5 pt-5 pb-1",
            "bg-white dark:bg-[#111]",
            "border border-[#E2E8F0] dark:border-white/[0.08] rounded-lg",
            "outline-none transition-all duration-200",
            "text-[18px] font-medium text-black dark:text-white",
            "focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/8 dark:focus:ring-[#2563EB]/15",
            "hover:border-slate-300 dark:hover:border-white/15",
            isPw && "pr-11",
            error && "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/8",
            className
          )}
          {...props}
        />
        <label className={cn(
          "absolute left-3.5 top-[14px] text-[18px] text-[#64748B] dark:text-[#94A3B8]",
          "transition-all duration-200 pointer-events-none origin-left",
          "peer-focus:-translate-y-[10px] peer-focus:scale-[0.78] peer-focus:text-[#2563EB] peer-focus:font-semibold",
          "peer-not-placeholder-shown:-translate-y-[10px] peer-not-placeholder-shown:scale-[0.78]",
          "peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-[#64748B] dark:peer-not-placeholder-shown:text-[#94A3B8]",
          error && "peer-focus:text-red-500"
        )}>
          {label}
        </label>
        {isPw && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] dark:hover:text-slate-300 transition-colors focus:outline-none"
            tabIndex="-1">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      <div className="h-4 mt-0.5 pl-0.5">
        {error && <p className="text-[18px] text-red-500 font-medium leading-4">{error}</p>}
      </div>
    </div>
  );
});

AuthInput.displayName = 'AuthInput';
