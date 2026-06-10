import React, { useEffect } from 'react';
import { Shield, Wifi, WifiOff, AlertTriangle, Settings, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';
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
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
    }}>
      {/* Left: Toggle + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
      </div>

      {/* Center: Pulse Telemetry */}
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
      </div>

      {/* Right: Status + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ModelSelector />
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
        
        <SwarmCouncil />
        
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
