import React from 'react';
import {
  LayoutDashboard, MessageSquare, Code2, Cpu, Rocket, Shield, Settings,
  Activity, Eye, Swords, Sparkles, BarChart3, FolderOpen, Gauge, Zap,
  ExternalLink, Share2, FlaskConical, BrainCircuit
} from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — SIDEBAR NAVIGATION
 * ═══════════════════════════════════════════════════════════════
 * Collapsible sidebar with grouped navigation items.
 * Drives the activePage state in the Zustand store.
 */

export const NAV_GROUPS = [
  {
    id: 'core',
    label: 'Core OS',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'studio', label: 'Studio Builder', icon: Sparkles },
      { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
    ],
  },
  {
    id: 'ops',
    label: 'Operations',
    items: [
      { id: 'forge', label: 'Forge & Execute', icon: FlaskConical },
      { id: 'audit', label: 'Proof & Audit', icon: Shield },
      { id: 'system', label: 'System Core', icon: Settings },
    ],
  }
];

export function Navigation() {
  const activePage    = useSovereignStore((s) => s.activePage);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const collapsed     = useSovereignStore((s) => s.sidebarCollapsed);

  return (
    <nav
      style={{
        width: collapsed ? 56 : 220,
        minWidth: collapsed ? 56 : 220,
        height: '100%',
        borderRight: '1px solid var(--border-subtle)',
        background: 'rgba(9, 9, 11, 0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1000,
      }}
    >
      <div style={{ padding: collapsed ? '12px 6px' : '12px 10px', flex: 1 }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.id} style={{ marginBottom: 20 }}>
            {/* Group Label */}
            {!collapsed && (
              <div style={{
                fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.1em', padding: '4px 10px', marginBottom: 4,
              }}>
                {group.label}
              </div>
            )}

            {/* Nav Items */}
            {group.items.map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: collapsed ? '8px 0' : '7px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    marginBottom: 2,
                    textAlign: 'left',
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: collapsed ? 0 : -10, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20, borderRadius: '0 3px 3px 0', background: 'var(--accent-indigo)',
                      boxShadow: '0 0 8px var(--accent-indigo)',
                    }} />
                  )}
                  <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                  {!collapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
          fontSize: 9, color: 'var(--text-muted)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          PH Evo Studio v2.0
        </div>
      )}
    </nav>
  );
}

export default Navigation;