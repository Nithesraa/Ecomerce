import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const FloatingLabelInput = React.forwardRef(({ 
  label, 
  type = 'text', 
  error, 
  icon: Icon, 
  className,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full mb-5">
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-muted">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={cn(
            "peer w-full h-12 bg-transparent border rounded-lg outline-none transition-all duration-200 text-dynamic",
            "focus:ring-2 focus:ring-primary focus:border-transparent",
            Icon ? "pl-10" : "pl-4",
            isPassword ? "pr-10" : "pr-4",
            error ? "border-red-500 focus:ring-red-500" : "border-dynamic hover:border-gray-400 dark:hover:border-gray-500",
            className
          )}
          placeholder=" " // Important for peer-placeholder-shown to work
          {...props}
        />
        <label
          className={cn(
            "absolute text-sm text-muted transition-all duration-200 pointer-events-none",
            "peer-placeholder-shown:text-sm peer-placeholder-shown:top-3",
            "-top-2.5 bg-surface px-1 left-2 text-sm",
            Icon && "peer-placeholder-shown:left-10 left-9",
            error && "text-red-500"
          )}
        >
          {label}
        </label>
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted hover:text-dynamic transition-colors focus:outline-none"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="absolute -bottom-5 left-1 text-sm text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';
