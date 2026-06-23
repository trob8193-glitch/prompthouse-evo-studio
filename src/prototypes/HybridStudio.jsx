import React from 'react';
import { Cpu, Hexagon, MonitorPlay, Sparkles, X, Activity, Terminal } from 'lucide-react';

export default function HybridStudio({ config, onBack }) {
  const { layout, theme, bots } = config;

  // --- ADVANCED THEME EXTRACTION ---
  const getThemeStyles = () => {
    switch (theme) {
      case 'alpha': return {
        container: { background: '#020203', color: '#00f0ff', fontFamily: 'monospace' },
        bgLayer: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.05) 0%, #020203 100%)', zIndex: 0 },
        panel: { background: 'rgba(5,5,8,0.9)', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: 0, boxShadow: '0 0 20px rgba(0, 240, 255, 0.1), inset 0 0 10px rgba(0,240,255,0.05)', backdropFilter: 'blur(24px)' },
        header: { background: 'rgba(2,2,3,0.95)', borderBottom: '2px solid rgba(255, 0, 255, 0.5)', boxShadow: '0 4px 30px rgba(255,0,255,0.1)' },
        textMain: { color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.3)' },
        textAccent: { color: '#00f0ff', textShadow: '0 0 15px #00f0ff', letterSpacing: '0.1em' },
        fxOrb: null
      };
      case 'beta': return {
        container: { background: '#0a0a0f', color: '#ffffff', fontFamily: 'system-ui, sans-serif' },
        bgLayer: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.03), transparent)', zIndex: 0 },
        panel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(40px)' },
        header: { background: 'rgba(10,10,15,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' },
        textMain: { color: '#ffffff', fontWeight: 300, letterSpacing: '0.05em' },
        textAccent: { color: '#a5b4fc', textShadow: '0 0 20px rgba(165,180,252,0.4)' },
        fxOrb: { position: 'absolute', top: '10%', right: '20%', width: '40vw', height: '40vw', background: '#ffffff', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.03, mixBlendMode: 'screen' }
      };
      case 'gamma': return {
        container: { background: '#05000a', color: '#ff6a00', fontFamily: 'monospace' },
        bgLayer: { position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,255,0.03) 2px, rgba(255,0,255,0.03) 4px)', zIndex: 0 },
        panel: { background: 'rgba(10,0,20,0.8)', border: '2px solid #ff00ff', borderRadius: '8px', boxShadow: '4px 4px 0 rgba(255,106,0,0.5)', backdropFilter: 'blur(10px)' },
        header: { background: '#0a0014', borderBottom: '2px solid #ff6a00', boxShadow: '0 0 20px rgba(255,106,0,0.2)' },
        textMain: { color: '#ff6a00', textShadow: '2px 2px 0 rgba(255,0,255,0.5)' },
        textAccent: { color: '#ff00ff', textShadow: '0 0 10px #ff00ff' },
        fxOrb: null
      };
      case 'delta': return {
        container: { background: '#010a05', color: '#10b981', fontFamily: 'sans-serif' },
        bgLayer: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at bottom, rgba(16,185,129,0.1) 0%, #010a05 100%)', zIndex: 0 },
        panel: { background: 'rgba(2,20,10,0.6)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '40px', boxShadow: '0 0 40px rgba(16,185,129,0.05)', backdropFilter: 'blur(30px)' },
        header: { background: 'rgba(1,10,5,0.8)', borderBottom: '1px solid rgba(16,185,129,0.1)', backdropFilter: 'blur(20px)' },
        textMain: { color: '#a7f3d0', fontWeight: 200 },
        textAccent: { color: '#34d399', textShadow: '0 0 20px rgba(52,211,153,0.5)' },
        fxOrb: { position: 'absolute', bottom: '-10%', left: '10%', width: '600px', height: '600px', background: '#10b981', borderRadius: '50%', filter: 'blur(200px)', opacity: 0.1, mixBlendMode: 'screen' }
      };
    }
  };

  const ts = getThemeStyles();

  // --- BOTS EXTRACTION ---
  const renderBot = (i) => {
    switch (bots) {
      case 'alpha': return (
        <div style={{ width: 50, height: 50, background: 'rgba(0,0,0,0.8)', border: '1px solid #00f0ff', boxShadow: '0 0 15px rgba(0,240,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: '#00f0ff', opacity: 0.1, animation: 'pulse 2s infinite' }} />
          <Cpu style={{ color: '#ff00ff', filter: 'drop-shadow(0 0 8px #ff00ff)' }} />
        </div>
      );
      case 'beta': return (
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
          <Sparkles style={{ color: '#ffffff', filter: 'drop-shadow(0 0 10px #ffffff)' }} />
        </div>
      );
      case 'gamma': return (
        <div style={{ width: 50, height: 50, background: '#0a001a', border: '2px solid #ff6a00', boxShadow: '2px 2px 0 #ff00ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MonitorPlay style={{ color: '#ff00ff' }} />
        </div>
      );
      case 'delta': return (
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(2,20,10,0.9)', border: '1px solid rgba(16,185,129,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.3)', animation: 'pulse 3s infinite' }} />
          <Hexagon style={{ color: '#34d399', filter: 'drop-shadow(0 0 12px #10b981)' }} />
        </div>
      );
    }
  };

  // --- LAYOUT RENDERING ---
  const renderLayout = () => {
    switch (layout) {
      case 'alpha': 
        return (
          <div style={{ flex: 1, display: 'flex', gap: 24, padding: 24, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
            <div style={{ ...ts.panel, width: 320, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
              <h3 style={{ ...ts.textAccent, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>Core Swarm Nodes</h3>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                  {renderBot(i)}
                  <div>
                    <div style={{ ...ts.textMain, fontSize: 14, fontWeight: 'bold' }}>ENTITY_{i}</div>
                    <div style={{ ...ts.textAccent, fontSize: 10, opacity: 0.7 }}>ONLINE</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...ts.panel, flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ ...ts.textMain, fontSize: 28, fontWeight: 900, letterSpacing: '0.05em' }}>HYBRID_CORE_SYSTEM</h2>
              <div style={{ flex: 1, border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <Terminal size={64} style={{ ...ts.textAccent, opacity: 0.3 }} />
              </div>
            </div>
          </div>
        );
      case 'beta': 
        return (
          <div style={{ flex: 1, display: 'flex', gap: 32, padding: 40, maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ ...ts.panel, padding: 32 }}>
                 <h2 style={{ ...ts.textMain, fontSize: 32, fontWeight: 300, marginBottom: 16 }}>Hybrid Dashboard</h2>
                 <p style={{ ...ts.textMain, opacity: 0.7, lineHeight: 1.6 }}>Evolved Beta Layout architecture infused with dynamically extracted parameters.</p>
               </div>
               <div style={{ ...ts.panel, flex: 1, padding: 32, display: 'flex', flexDirection: 'column' }}>
                  <Activity size={48} style={{ ...ts.textAccent, marginBottom: 24 }} />
                  <div style={{ ...ts.textMain, fontSize: 24, fontWeight: 500 }}>System Telemetry</div>
               </div>
            </div>
            <div style={{ ...ts.panel, width: 340, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ ...ts.textAccent, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Roster</h3>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', cursor: 'pointer' }}>
                  {renderBot(i)}
                  <div style={{ ...ts.textMain, fontSize: 15, fontWeight: 500 }}>Assistant {i}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'gamma': 
        return (
          <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', zIndex: 1 }}>
            <div style={{ height: '50%', display: 'flex', gap: 32 }}>
              <div style={{ ...ts.panel, flex: 1, padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ ...ts.textAccent, fontSize: 24, fontWeight: 900, marginBottom: 24 }}>NEURAL GRID</div>
                <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, transition: 'all 0.3s' }}>
                      {renderBot(i)}
                      <div style={{ ...ts.textMain, fontWeight: 'bold' }}>NODE {i}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ ...ts.panel, flex: 1, padding: 24 }}>
              <div style={{ ...ts.textMain, fontWeight: 'bold', marginBottom: 16 }}>SYSTEM LOG</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Waiting for input...</div>
            </div>
          </div>
        );
      case 'delta': 
        return (
          <div style={{ flex: 1, padding: 40, display: 'flex', gap: 32, position: 'relative', zIndex: 1 }}>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
               <div style={{ ...ts.panel, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <h2 style={{ ...ts.textMain, fontSize: 42, fontWeight: 200, letterSpacing: '0.02em' }}>Symbiotic Core</h2>
                 <Activity size={64} style={{ ...ts.textAccent }} />
               </div>
               <div style={{ ...ts.panel, flex: 1, padding: 40 }}>
                  <h3 style={{ ...ts.textAccent, fontSize: 24, fontWeight: 300 }}>Fluid Dynamics Hub</h3>
               </div>
             </div>
             <div style={{ ...ts.panel, width: '30%', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
               {[1,2,3,4].map(i => (
                  <div key={i} style={{ padding: 16, borderRadius: 50, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 20 }}>
                    {renderBot(i)}
                    <div style={{ ...ts.textMain, fontSize: 16, fontWeight: 500 }}>Organism {i}</div>
                  </div>
               ))}
             </div>
          </div>
        );
    }
  };

  return (
    <div style={{ ...ts.container, width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={ts.bgLayer} />
      {ts.fxOrb && <div style={ts.fxOrb} />}

      <div style={{ ...ts.header, height: 80, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ ...ts.textMain, fontSize: 20, fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>EVO STUDIO // HYBRID</div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, ...ts.textAccent, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}>
            L:{layout.toUpperCase()} | T:{theme.toUpperCase()} | B:{bots.toUpperCase()}
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '10px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 'bold', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
          <X size={16} /> DECONSTRUCT
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {renderLayout()}
      </div>
    </div>
  );
}
