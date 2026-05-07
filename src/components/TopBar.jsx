import React, { useEffect } from 'react';
import { Shield, Wifi, WifiOff, AlertTriangle, Settings, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useSovereignStore } from '../store.js';

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
      padding: '0 20px', borderBottom: '1px solid #1e293b',
      background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
    }}>
      {/* Left: Toggle + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, display: 'flex' }}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/src/assets/logo.png" alt="PH Evo Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1 }}>
              PromptHouse Evo
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1, marginTop: 2 }}>
              Studio
            </div>
          </div>
        </div>
      </div>

      {/* Right: Status + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6, display: 'flex', position: 'relative' }}
          aria-label="Notifications"
        >
          <Bell size={16} />
          {notifications.length > 0 && (
            <div style={{
              position: 'absolute', top: 2, right: 2, width: 8, height: 8,
              borderRadius: '50%', background: '#ef4444', border: '2px solid #0f172a',
            }} />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActivePage('settings')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6, display: 'flex' }}
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
