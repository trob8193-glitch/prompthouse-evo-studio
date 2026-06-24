import React, { useEffect, useState } from 'react';
import { Shield, Wifi, WifiOff, AlertTriangle, Settings, Bell, PanelLeftClose, PanelLeft, LayoutTemplate, Share2 } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { SwarmCouncil } from './SwarmCouncil.jsx';
import ModelSelector from './ModelSelector.jsx';

/**
 * PH EVO STUDIO — TOP BAR (SINGULARITY DESIGN)
 */
export default function TopBar() {
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const fetchBridgeStatus = useSovereignStore((s) => s.fetchBridgeStatus);
  const sidebarCollapsed = useSovereignStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSovereignStore((s) => s.toggleSidebar);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const notifications = useSovereignStore((s) => s.notifications);
  const metrics = useSovereignStore((s) => s.metrics);
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const setGlobalTheme = useSovereignStore((s) => s.setGlobalTheme);
  const copilotFullscreen = useSovereignStore((s) => s.copilotFullscreen);

  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    fetchBridgeStatus();
    const interval = setInterval(fetchBridgeStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchBridgeStatus]);

  const statusConfig = {
    connected: { icon: Wifi, color: '#00ff88', label: 'Bridge Online', bg: 'rgba(0,255,136,0.06)' },
    disconnected: { icon: WifiOff, color: '#737385', label: 'Disconnected', bg: 'rgba(115,115,133,0.06)' },
    error: { icon: AlertTriangle, color: '#ffaa00', label: 'Bridge Error', bg: 'rgba(255,170,0,0.06)' },
  };
  const st = statusConfig[bridgeStatus] || statusConfig.disconnected;
  const StatusIcon = st.icon;

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: '1px solid var(--border-mid)',
      background: globalTheme.routing === 'beta' ? 'rgba(255,255,255,0.05)' : 
                  globalTheme.routing === 'gamma' ? '#1a0033' : 
                  globalTheme.routing === 'delta' ? 'rgba(2,20,10,0.8)' : 
                  globalTheme.routing === 'epsilon' ? '#3e2723' : 
                  globalTheme.routing === 'zeta' ? '#ffffff' : 
                  globalTheme.routing === 'eta' ? 'rgba(0,40,40,0.8)' : 
                  globalTheme.routing === 'theta' ? 'radial-gradient(circle at top right, rgba(200,0,255,0.2), transparent)' : 
                  globalTheme.routing === 'iota' ? '#ffffff' : 
                  globalTheme.routing === 'kappa' ? '#000000' : 'transparent',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      position: 'relative', zIndex: 100, flexShrink: 0,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Decorative Top Line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)', opacity: 0.5 }} />
      
      {/* Left Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: copilotFullscreen ? 1 : 'unset' }}>
        <button
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: '#737385', cursor: 'pointer', padding: 4, display: 'flex', transition: 'color 0.2s' }}
          aria-label="Toggle sidebar"
          onMouseEnter={(e) => e.currentTarget.style.color = '#00f0ff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737385'}
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #00f0ff, #8a2be2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,240,255,0.3)',
            fontSize: 14
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              PromptHouse Evo
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.15em', lineHeight: 1, marginTop: 3 }}>
              Studio — Singularity
            </div>
          </div>
        </div>

        {/* When split, append Left Telemetry here */}
        {copilotFullscreen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(0,240,255,0.04)', padding: '5px 20px', borderRadius: 24, border: '1px solid rgba(0,240,255,0.15)', boxShadow: '0 0 15px rgba(0,240,255,0.05)', marginLeft: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b4b4c4', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
              <Shield size={12} color="#00f0ff" /> LOGIC DENSITY: <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(0,240,255,0.4)' }}>{metrics?.logic?.density || '0.00M'} IQ</span>
            </div>
          </div>
        )}
      </div>

      {/* Center Group (Only visible when not split) */}
      {!copilotFullscreen && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 16, 
          background: 'rgba(0,240,255,0.04)', padding: '5px 20px', borderRadius: 24, 
          border: '1px solid rgba(0,240,255,0.15)',
          boxShadow: '0 0 15px rgba(0,240,255,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b4b4c4', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
            <Shield size={12} color="#00f0ff" /> LOGIC DENSITY: <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(0,240,255,0.4)' }}>{metrics?.logic?.density || '0.00M'} IQ</span>
          </div>
          <div style={{ width: 1, height: 14, background: 'rgba(0,240,255,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b4b4c4', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 8px rgba(0,255,136,0.8)', animation: 'pulse 2s infinite' }} /> STUDIO IQ: <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(0,255,136,0.4)' }}>{metrics?.logic?.iq?.toLocaleString() || '0'}</span>
          </div>
          <div style={{ width: 1, height: 14, background: 'rgba(0,240,255,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b4b4c4', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
            <Share2 size={12} color="#ff00ff" /> ROUTING PORT: 
            <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,0,255,0.4)' }}>
              {globalTheme.theme === 'extremeWindows95' ? 'PORT 80 (HTTP 1.0)' :
               globalTheme.theme === 'cyberpunk' ? 'PORT 666 (SHADOW NODE)' :
               globalTheme.theme === 'layoutTerminalFullscreen' ? 'ROOT:22 (SSH)' :
               globalTheme.theme === 'vercelClean' ? 'EDGE_NETWORK_BETA' : 'AUTO_TETHER_555'}
            </span>
          </div>
        </div>
      )}

      {/* Right Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: copilotFullscreen ? 1 : 'unset', justifyContent: 'flex-end' }}>
        
        {/* When split, prepend Right Telemetry here */}
        {copilotFullscreen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(0,240,255,0.04)', padding: '5px 20px', borderRadius: 24, border: '1px solid rgba(0,240,255,0.15)', boxShadow: '0 0 15px rgba(0,240,255,0.05)', marginRight: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b4b4c4', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 8px rgba(0,255,136,0.8)', animation: 'pulse 2s infinite' }} /> STUDIO IQ: <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(0,255,136,0.4)' }}>{metrics?.logic?.iq?.toLocaleString() || '0'}</span>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(0,240,255,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b4b4c4', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
              <Share2 size={12} color="#ff00ff" /> PORT: 
              <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,0,255,0.4)' }}>
                {globalTheme.theme === 'extremeWindows95' ? 'PORT 80' : 'AUTO_TETHER_555'}
              </span>
            </div>
          </div>
        )}
        
        {/* <SwarmCouncil /> */}

        {/* Metamorphosis Theme Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
              borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <LayoutTemplate size={14} /> METAMORPHOSIS: {globalTheme.layout.toUpperCase()}
          </button>
          
          {showThemeMenu && (
            <div style={{
              position: 'absolute', top: '120%', right: 0, width: 180,
              background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)'
            }}>
              {['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa'].map(t => (
                <button
                  key={t}
                  onClick={() => { 
                    setGlobalTheme({ layout: t, ui: t, bots: t, wiring: t, building: t, routing: t, inventing: t, agent: t, brain: t, module: t }); 
                    setShowThemeMenu(false); 
                  }}
                  style={{
                    padding: '8px 12px', textAlign: 'left', borderRadius: 6,
                    background: globalTheme.layout === t ? 'rgba(0,240,255,0.1)' : 'transparent',
                    color: globalTheme.layout === t ? '#00f0ff' : '#a0a0b0',
                    border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
                >
                  {t} Version
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Bridge Status Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px',
          borderRadius: 24, background: st.bg, border: `1px solid ${st.color}33`,
          boxShadow: bridgeStatus === 'connected' ? `0 0 12px ${st.color}22` : 'none',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ 
            width: 6, height: 6, borderRadius: '50%', background: st.color, 
            boxShadow: bridgeStatus === 'connected' ? `0 0 10px ${st.color}` : 'none',
            animation: bridgeStatus === 'connected' ? 'pulse 2s infinite' : 'none'
          }} />
          <StatusIcon size={12} color={st.color} />
          <span style={{ fontSize: 10, fontWeight: 800, color: st.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {st.label}
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => setActivePage('proof-console')}
          style={{ background: 'none', border: 'none', color: '#737385', cursor: 'pointer', padding: 6, display: 'flex', position: 'relative', transition: 'color 0.2s' }}
          aria-label="Notifications"
          onMouseEnter={(e) => e.currentTarget.style.color = '#00f0ff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737385'}
        >
          <Bell size={16} />
          {notifications.length > 0 && (
            <div style={{
              position: 'absolute', top: 2, right: 2, width: 8, height: 8,
              borderRadius: '50%', background: '#ff3366', border: '2px solid rgba(5,5,8,0.9)',
              boxShadow: '0 0 8px rgba(255,51,102,0.6)'
            }} />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActivePage('settings')}
          style={{ background: 'none', border: 'none', color: '#737385', cursor: 'pointer', padding: 6, display: 'flex', transition: 'color 0.2s' }}
          aria-label="Settings"
          onMouseEnter={(e) => e.currentTarget.style.color = '#00f0ff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737385'}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
