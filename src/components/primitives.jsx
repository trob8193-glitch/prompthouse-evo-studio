import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── FOUNDATION ──────────────────────────────────────────────────────────────

export function Card({ children, className, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border-dim)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-md)]",
        onClick && "cursor-pointer hover:border-[var(--primary-glow)] hover:shadow-[0_0_20px_var(--primary-dim)] transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Panel({ children, className, title }) {
  return (
    <div className={cn("bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-mid)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-lg)]", className)}>
      {title && (
        <div className="px-6 py-4 border-b border-[var(--border-dim)] font-bold text-white tracking-widest uppercase text-sm bg-[var(--bg-surface-top)]">
          {title}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// ─── ACTION ──────────────────────────────────────────────────────────────────

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled, 
  loading, 
  onClick, 
  className 
}) {
  const base = "inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-[var(--radius-md)] transition-all duration-300 min-h-[44px] min-w-[44px] relative overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white hover:shadow-[0_0_20px_var(--accent-cyan-glow)] border border-white/20",
    secondary: "bg-[var(--bg-elevated)] text-white border border-[var(--border-mid)] hover:border-[var(--primary)] hover:bg-[var(--primary-dim)] hover:text-[var(--primary)]",
    destructive: "bg-gradient-to-r from-red-600 to-red-900 text-white hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500/30",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        base, 
        variants[variant], 
        sizes[size], 
        (disabled || loading) && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
    >
      {variant === 'primary' && <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? <span className="animate-pulse flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> ENGAGING...</span> : children}
      </span>
    </button>
  );
}

export function IconButton({ icon: Icon, onClick, variant = 'ghost', className, label }) {
  const variants = {
    primary: "bg-[var(--primary)] text-black hover:bg-white shadow-[0_0_15px_var(--primary-dim)]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white",
    surface: "bg-[var(--bg-elevated)] text-white border border-[var(--border-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
  };

  return (
    <button 
      onClick={onClick} 
      className={cn("w-[44px] h-[44px] rounded-[var(--radius-md)] flex items-center justify-center transition-all duration-300", variants[variant], className)}
      aria-label={label}
      title={label}
    >
      <Icon size={20} />
    </button>
  );
}

// ─── DATA DISPLAY ────────────────────────────────────────────────────────────

export function StatusBadge({ status, label }) {
  const config = {
    verified: { bg: 'rgba(0, 255, 136, 0.1)', color: 'var(--accent-green)', border: 'rgba(0, 255, 136, 0.3)', glow: 'rgba(0, 255, 136, 0.5)' },
    blocked: { bg: 'rgba(255, 51, 102, 0.1)', color: 'var(--accent-red)', border: 'rgba(255, 51, 102, 0.3)', glow: 'rgba(255, 51, 102, 0.5)' },
    executing: { bg: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)', border: 'rgba(0, 240, 255, 0.3)', glow: 'rgba(0, 240, 255, 0.5)' },
    pending: { bg: 'rgba(255, 170, 0, 0.1)', color: 'var(--accent-gold)', border: 'rgba(255, 170, 0, 0.3)', glow: 'rgba(255, 170, 0, 0.5)' },
    archived: { bg: 'rgba(115, 115, 133, 0.1)', color: 'var(--text-dim)', border: 'rgba(115, 115, 133, 0.3)', glow: 'transparent' },
    idle: { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: 'var(--border-dim)', glow: 'transparent' },
  };

  const style = config[status] || config.idle;

  return (
    <span 
      className="inline-flex items-center px-3 py-1 rounded-[var(--radius-full)] text-[10px] font-bold uppercase tracking-widest border transition-all"
      style={{ 
        backgroundColor: style.bg, 
        color: style.color, 
        borderColor: style.border,
        boxShadow: `0 0 10px ${style.glow}` 
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: style.color, boxShadow: `0 0 5px ${style.color}` }} />
      {label || status}
    </span>
  );
}

export function StateView({ state = 'idle', title, message, actionLabel, onAction }) {
  if (state === 'idle' || state === 'success') return null;

  const config = {
    loading: { icon: '⏳', color: 'var(--primary)' },
    empty: { icon: '📭', color: 'var(--text-secondary)' },
    error: { icon: '🚨', color: 'var(--accent-red)' },
    blocked: { icon: '🛑', color: 'var(--accent-red)' }
  };

  const current = config[state];

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-[var(--border-dim)] border-dashed rounded-[var(--radius-xl)] bg-[var(--bg-surface)] backdrop-blur-md">
      <div className="text-4xl mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{current.icon}</div>
      <h3 className="font-bold tracking-widest uppercase mb-4" style={{ color: current.color }}>
        {title || state.toUpperCase()}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-md leading-relaxed">
        {message || `The system is currently in a ${state} state.`}
      </p>
      {onAction && actionLabel && (
        <Button onClick={onAction} variant={state === 'error' ? 'destructive' : 'secondary'}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
