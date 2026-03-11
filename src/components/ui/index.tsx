// Reusable UI Components for RunTrack
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ─── Button ─────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', loading, icon, className = '', ...props
}) => {
  const base = 'inline-flex items-center gap-2 font-body font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white hover:scale-105 active:scale-95',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20',
    outline: 'border border-brand-500/50 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const glowStyle = variant === 'primary' ? { boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)' } : {};
  
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={glowStyle}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, unit, icon, color = 'brand', trend, className = ''
}) => {
  const colorMap: Record<string, string> = {
    brand: 'text-brand-400',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass rounded-2xl p-5 relative overflow-hidden ${className}`}
    >
      {/* Subtle glow background */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 bg-brand-500 blur-2xl" />
      
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{label}</span>
        {icon && (
          <div className={`${colorMap[color] || colorMap.brand} p-1`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-1">
        <span className="font-display text-3xl text-white">{value}</span>
        {unit && <span className="text-gray-400 text-sm mb-1 font-body">{unit}</span>}
      </div>
      
      {trend !== undefined && (
        <div className={`mt-2 text-xs font-body ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs yesterday
        </div>
      )}
    </motion.div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass rounded-2xl p-5 ${className}`}>
    <div className="skeleton h-3 w-20 rounded-full mb-4" />
    <div className="skeleton h-8 w-28 rounded-lg mb-2" />
    <div className="skeleton h-3 w-16 rounded-full" />
  </div>
);

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md', className = ''
}) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <Loader2 className={`${sizeMap[size]} animate-spin text-brand-500 ${className}`} />
  );
};

// ─── Full Page Loader ─────────────────────────────────────────────────────────
export const FullPageLoader: React.FC = () => (
  <div className="min-h-screen bg-night-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-brand-500/20 animate-pulse-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
      <p className="text-gray-400 font-body text-sm tracking-widest uppercase">Loading RunTrack</p>
    </div>
  </div>
);

// ─── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-body font-medium text-gray-300">{label}</label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-red-400 text-xs font-body">{error}</p>}
  </div>
);

// ─── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-body font-medium text-gray-300">{label}</label>}
    <select
      className={`input-field appearance-none cursor-pointer ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-night-800">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// ─── Badge ──────────────────────────────────────────────────────────────────────
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'run' | 'walk' | 'info';
}> = ({ children, variant = 'info' }) => {
  const map = {
    run: 'bg-brand-500/20 text-brand-400 border-brand-500/20',
    walk: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    info: 'bg-night-700 text-gray-300 border-night-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium border ${map[variant]}`}>
      {children}
    </span>
  );
};

// ─── Divider ───────────────────────────────────────────────────────────────────
export const Divider: React.FC = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-night-700 to-transparent" />
);

// ─── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-night-800 flex items-center justify-center mb-4 text-brand-500">
      {icon}
    </div>
    <h3 className="text-lg font-body font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 font-body text-sm max-w-sm mb-6">{description}</p>
    {action}
  </motion.div>
);
