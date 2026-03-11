// Reusable UI Components for RunTrack
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronUp, ChevronDown, Check } from 'lucide-react';

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
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };
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
    brand: 'text-brand-400', blue: 'text-blue-400', green: 'text-emerald-400',
    purple: 'text-purple-400', red: 'text-red-400', yellow: 'text-yellow-400',
  };
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`glass rounded-2xl p-5 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 bg-brand-500 blur-2xl" />
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{label}</span>
        {icon && <div className={`${colorMap[color] || colorMap.brand} p-1`}>{icon}</div>}
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

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md', className = ''
}) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <Loader2 className={`${sizeMap[size]} animate-spin text-brand-500 ${className}`} />;
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

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', type, ...props }) => {
  // ── Custom number input with styled arrow buttons ──────────────────────────
  if (type === 'number') {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);

    const step = (dir: 1 | -1) => {
      const el = inputRef.current;
      if (!el) return;
      const current = parseFloat(el.value) || 0;
      const min = el.min !== '' ? parseFloat(el.min) : -Infinity;
      const max = el.max !== '' ? parseFloat(el.max) : Infinity;
      const stepVal = el.step !== '' ? parseFloat(el.step) : 1;
      const next = Math.min(max, Math.max(min, current + dir * stepVal));
      // Trigger React's synthetic onChange by using the native setter
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      nativeSetter?.set?.call(el, String(next));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-body font-medium text-gray-300">{label}</label>}
        <div
          className={`
            flex items-center bg-night-800 border rounded-xl overflow-hidden transition-all duration-200
            ${error ? 'border-red-500' : focused ? 'border-brand-500' : 'border-night-600 hover:border-night-500'}
          `}
          style={{}}
        >
          {/* Optional left icon */}
          {icon && <div className="pl-4 text-gray-400 flex-shrink-0">{icon}</div>}

          {/* The actual input — native spinners hidden via Tailwind */}
          <input
            ref={inputRef}
            type="number"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              flex-1 bg-transparent py-3 text-white placeholder-gray-500
              outline-none font-body text-base
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              ${icon ? 'pl-2 pr-0' : 'px-4'}
              ${className}
            `}
            {...props}
          />

          {/* Custom up / down arrows */}
          <div className="flex flex-col self-stretch border-l border-night-600 flex-shrink-0 w-9">
            <motion.button
              type="button"
              whileTap={{ scale: 0.8, backgroundColor: 'rgba(249,115,22,0.15)' }}
              onMouseDown={e => { e.preventDefault(); step(1); }}
              className="flex-1 flex items-center justify-center text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 transition-colors border-b border-night-600"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.8, backgroundColor: 'rgba(249,115,22,0.15)' }}
              onMouseDown={e => { e.preventDefault(); step(-1); }}
              className="flex-1 flex items-center justify-center text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs font-body">{error}</p>}
      </div>
    );
  }

  // ── Default text / email / password input ──────────────────────────────────
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-body font-medium text-gray-300">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={type}
          className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs font-body">{error}</p>}
    </div>
  );
};

// ─── Select — fully custom curtain dropdown ────────────────────────────────────
interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, className = '' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (optValue: string) => {
    // Synthesize a change event — all existing onChange handlers work unchanged
    onChange?.({ target: { value: optValue }, currentTarget: { value: optValue } } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-body font-medium text-gray-300">{label}</label>}

      {/* ── Trigger ─────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`
          w-full flex items-center justify-between bg-night-800 border px-4 py-3
          text-white font-body text-base text-left
          transition-all duration-200 outline-none select-none
          ${open
            ? 'border-brand-500 rounded-t-xl rounded-b-none'
            : 'border-night-600 hover:border-night-500 rounded-xl'
          }
        `}
        style={{}}
      >
        <span className="truncate">{selected?.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="text-gray-400 flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* ── Curtain panel — unrolls downward ────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0.6 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 z-50 overflow-hidden
                       bg-night-800 border border-t-0 border-brand-500/40 rounded-b-xl"
            style={{ transformOrigin: 'top center' }}
          >
            {/* Hairline gradient connecting trigger to panel */}
            <div className="h-px bg-gradient-to-r from-transparent via-brand-500/25 to-transparent" />

            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {options.map((opt, i) => {
                const isSelected = opt.value === value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.12 }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3
                      font-body text-sm text-left transition-colors duration-100
                      ${isSelected ? 'text-brand-400 bg-brand-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                      ${i < options.length - 1 ? 'border-b border-night-700/50' : ''}
                    `}
                  >
                    <span>{opt.label}</span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, rotate: -45, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-brand-400 flex-shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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