import { useMemo } from 'react';
import { motion } from 'framer-motion';

export const PasswordStrengthMeter = ({ password }) => {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return score;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4); // Max score is 4
  }, [password]);

  const getColor = (score) => {
    switch (score) {
      case 0: return 'bg-gray-200 dark:bg-gray-700';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-emerald-500';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const getLabel = (score) => {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  return (
    <div className="mt-1 w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-muted font-medium">Password strength</span>
        {password && (
          <span className={`text-sm font-semibold ${strength > 2 ? 'text-emerald-500' : 'text-muted'}`}>
            {getLabel(strength)}
          </span>
        )}
      </div>
      <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
        {[1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            initial={false}
            animate={{
              backgroundColor: strength >= level ? getColor(strength) : 'var(--border-color)',
            }}
            transition={{ duration: 0.3 }}
            className={`flex-1 ${strength === 0 ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            style={{ 
               backgroundColor: strength === 0 ? 'var(--border-color)' : undefined 
            }}
          />
        ))}
      </div>
    </div>
  );
};
