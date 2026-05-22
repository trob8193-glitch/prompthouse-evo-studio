import React, { useEffect } from 'react';
import { Shield, Wifi, WifiOff, AlertTriangle, Settings, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { SwarmCouncil } from './SwarmCouncil.jsx';

/**
 * PH EVO STUDIO — TOP BAR
 * ═══════════════════════════════════════════════════════════════
 * Persistent header with branding, bridge status, and quick actions.
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
    connected: { icon: Wifi, color: '#22c55e', label: 'Bridge Online', bg: 'rgba(34,197,94,0.08)' },
    disconnected: { icon: WifiOff, color: '#64748b', label: 'Disconnected', bg: 'rgba(100,116,139,0.08)' },
    error: { icon: AlertTriangle, color: '#f59e0b', label: 'Bridge Error', bg: 'rgba(245,158,11,0.08)' },
  };
  const st = statusConfig[bridgeStatus] || statusConfig.disconnected;
  const StatusIcon = st.icon;

  return (
    <header style={{
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 9, 11, 0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
      boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
    }}>
      {/* Left: Toggle + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 6, transition: 'color 0.2s ease' }}
          aria-label="Toggle sidebar"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/assets/generated_logo.png" alt="PH Evo Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              PromptHouse Evo
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1, marginTop: 2 }}>
              Studio
            </div>
          </div>
        </div>
      </div>

      {/* Center: Pulse Telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(9,9,11,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '4px 16px', borderRadius: 20, border: '1px solid var(--border-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}>
          <Shield size={12} color="var(--accent-indigo)" /> LOGIC DENSITY: <span style={{ color: 'var(--text-primary)' }}>{metrics?.logic?.density || '0.00M'} IQ</span>
        </div>
        <div style={{ width: 1, height: 12, background: 'var(--border-mid)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--accent-green)', borderRadius: '50%', boxShadow: '0 0 6px var(--accent-green)' }} /> STUDIO IQ: <span style={{ color: 'var(--text-primary)' }}>{metrics?.logic?.iq?.toLocaleString() || '0'}</span>
        </div>
      </div>

      {/* Right: Status + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SwarmCouncil />
        
        {/* Bridge Status Pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
          borderRadius: 20, background: st.bg, border: `1px solid ${st.color}22`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, boxShadow: bridgeStatus === 'connected' ? `0 0 8px ${st.color}` : 'none' }} />
          <StatusIcon size={12} color={st.color} />
          <span style={{ fontSize: 10, fontWeight: 700, color: st.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {st.label}
          </span>
        </div>

        {/* Notifications */}
        <button
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 6, display: 'flex', position: 'relative', borderRadius: 6, transition: 'color 0.2s ease' }}
          aria-label="Notifications"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          <Bell size={16} />
          {notifications.length > 0 && (
            <div style={{
              position: 'absolute', top: 2, right: 2, width: 8, height: 8,
              borderRadius: '50%', background: 'var(--accent-red)', border: '2px solid var(--bg-void)',
              boxShadow: '0 0 6px var(--accent-red)',
            }} />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActivePage('settings')}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 6, transition: 'color 0.2s ease' }}
          aria-label="Settings"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
