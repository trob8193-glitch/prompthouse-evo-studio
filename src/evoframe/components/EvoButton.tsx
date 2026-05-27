import React, { useEffect, useState } from 'react';
import { registry } from '../core/commandRegistry';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface EvoButtonProps {
  command: string;
  payload?: any;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

/**
 * PH EVO STUDIO — EVOBUTTON
 * ═══════════════════════════════════════════════════════════════
 * A command-validated component. 
 * Blocks rendering if command is unregistered or points to fake logic.
 */
export const EvoButton: React.FC<EvoButtonProps> = ({ 
  command, 
  payload, 
  label, 
  variant = 'primary',
  className = ''
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Physical Command Validation
    const cmd = registry.getCommand(command);
    if (!cmd) {
      console.error(`❌ [EvoFrame] Blocking EvoButton: Command "${command}" is NOT REGISTERED.`);
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [command]);

  const handleClick = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await registry.runCommand(command, payload);
    } finally {
      setLoading(false);
    }
  };

  if (isValid === false) {
    return (
      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-3 grayscale opacity-50 cursor-not-allowed">
        <AlertTriangle size={14} className="text-rose-500" />
        <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Command Blocked: {command}</span>
      </div>
    );
  }

  const baseStyles = "px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20",
    secondary: "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700",
    danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20"
  };

  return (
    <button 
      onClick={handleClick}
      disabled={!isValid || loading}
      className={`${baseStyles} ${variants[variant]} ${className} ${loading ? 'animate-pulse opacity-70' : ''}`}
    >
      {loading ? <Zap size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
      {label}
    </button>
  );
};
