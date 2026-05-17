/**
 * PH EVO STUDIO — MASTER UI DESIGN SYSTEM
 * ═══════════════════════════════════════════════════════════════
 * Production-ready tokens and component blueprints for cross-platform
 * excellence. No Ghost-Stubs. No dead buttons.
 */

export const DESIGN_SYSTEM = {
  tokens: {
    colors: {
      primary: 'hsl(230, 80%, 60%)', // Sovereign Blue
      accent: 'hsl(160, 80%, 45%)', // Evolution Green
      danger: 'hsl(0, 70%, 50%)',
      surface: 'hsl(220, 15%, 10%)',
      text: 'hsl(210, 20%, 98%)',
      subtext: 'hsl(215, 15%, 65%)'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '40px'
    },
    typography: {
      h1: { size: '32px', weight: '900', letter: '0.05em' },
      h2: { size: '24px', weight: '800', letter: '0.02em' },
      body: { size: '14px', weight: '400', letter: '0' },
      caption: { size: '11px', weight: '700', letter: '0.05em' }
    }
  },
  
  // REUSABLE COMPONENT WRAPPERS (Logic Blueprints)
  components: {
    Button: {
      base: 'px-6 py-2.5 rounded-xl font-black transition-all active:scale-95',
      variants: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20',
        ghost: 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
      }
    },
    Card: {
      base: 'bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl'
    },
    StateWrapper: {
      loading: 'animate-pulse bg-slate-800/50 rounded-lg',
      error: 'border-rose-500/50 bg-rose-500/5 text-rose-500',
      success: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500'
    }
  },

  // SCREEN TEMPLATES
  templates: {
    dashboard: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8',
    screen_shell: 'min-h-screen bg-slate-950 text-slate-100 flex flex-col'
  }
};
