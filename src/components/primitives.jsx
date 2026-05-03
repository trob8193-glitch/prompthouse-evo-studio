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
        "bg-[var(--surface-color)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-[var(--space-24)]",
        onClick && "cursor-pointer hover:border-[var(--border-strong)] transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Panel({ children, className, title }) {
  return (
    <div className={cn("bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden", className)}>
      {title && (
        <div className="px-[var(--space-16)] py-[var(--space-12)] border-b border-[var(--border-color)] font-[var(--text-card-title)]">
          {title}
        </div>
      )}
      <div className="p-[var(--space-16)]">
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
  const base = "inline-flex items-center justify-center font-[var(--text-label)] uppercase tracking-wider rounded-[var(--radius-md)] transition-all min-h-[44px] min-w-[44px]";
  
  const variants = {
    primary: "bg-[var(--accent-color)] text-white hover:bg-[#7c3aed] shadow-[var(--shadow-glow)]",
    secondary: "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]",
    destructive: "bg-[var(--error-color)] text-white hover:bg-[#dc2626]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
  };

  const sizes = {
    sm: "px-[var(--space-12)] py-[var(--space-8)] text-[10px]",
    md: "px-[var(--space-16)] py-[var(--space-12)]",
    lg: "px-[var(--space-24)] py-[var(--space-16)] text-sm"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        base, 
        variants[variant], 
        sizes[size], 
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? <span className="animate-pulse">Loading...</span> : children}
    </button>
  );
}

export function IconButton({ icon: Icon, onClick, variant = 'ghost', className, label }) {
  const variants = {
    primary: "bg-[var(--accent-color)] text-white hover:bg-[#7c3aed]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]",
    surface: "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-strong)]"
  };

  return (
    <button 
      onClick={onClick} 
      className={cn("w-[44px] h-[44px] rounded-[var(--radius-md)] flex items-center justify-center transition-colors", variants[variant], className)}
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
    verified: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--proof-verified)' },
    blocked: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--state-blocked)' },
    executing: { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--state-executing)' },
    pending: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--state-pending)' },
    archived: { bg: 'rgba(113, 113, 122, 0.1)', color: 'var(--state-archived)' },
    idle: { bg: 'var(--surface-elevated)', color: 'var(--text-secondary)' },
  };

  const style = config[status] || config.idle;

  return (
    <span 
      className="inline-flex items-center px-[var(--space-8)] py-[var(--space-4)] rounded-[var(--radius-full)] font-[var(--text-status)] uppercase tracking-wider border border-transparent"
      style={{ backgroundColor: style.bg, color: style.color, borderColor: style.bg }}
    >
      {label || status}
    </span>
  );
}

export function StateView({ state = 'idle', title, message, actionLabel, onAction }) {
  if (state === 'idle' || state === 'success') return null;

  const config = {
    loading: { icon: '⏳', color: 'var(--accent-color)' },
    empty: { icon: '📭', color: 'var(--text-secondary)' },
    error: { icon: '🚨', color: 'var(--error-color)' },
    blocked: { icon: '🛑', color: 'var(--state-blocked)' }
  };

  const current = config[state];

  return (
    <div className="flex flex-col items-center justify-center p-[var(--space-48)] text-center border border-[var(--border-color)] border-dashed rounded-[var(--radius-xl)] bg-[var(--surface-color)]">
      <div className="text-4xl mb-[var(--space-16)]">{current.icon}</div>
      <h3 className="font-[var(--text-card-title)] mb-[var(--space-8)]" style={{ color: current.color }}>
        {title || state.toUpperCase()}
      </h3>
      <p className="font-[var(--text-body)] text-[var(--text-secondary)] mb-[var(--space-24)] max-w-md">
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
