import React from 'react';
import {
  LayoutDashboard, MessageSquare, Code2, Cpu, Rocket, Shield, Settings,
  Activity, Eye, Swords, Sparkles, BarChart3, FolderOpen, Gauge, Zap, ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — SIDEBAR NAVIGATION
 * ═══════════════════════════════════════════════════════════════
 * Collapsible sidebar with grouped navigation items.
 * Drives the activePage state in the Zustand store.
 */

const NAV_GROUPS = [
  {
    id: 'studio',
    label: 'Studio',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'chat', label: 'AI Chat', icon: MessageSquare },
      { id: 'workspace', label: 'Workspace', icon: FolderOpen },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { id: 'prompt-registry', label: 'Prompt Registry', icon: Code2 },
      { id: 'forge-labs', label: 'Forge Labs', icon: Sparkles },
      { id: 'duel-arena', label: 'Duel Arena', icon: Swords },
      { id: 'ai-generator', label: 'AI Generator', icon: Zap },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'execution-queue', label: 'Execution Queue', icon: Rocket },
      { id: 'proof-console', label: 'Proof Console', icon: Shield },
      { id: 'evo-eyes', label: 'Evo Eyes', icon: Eye },
      { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'settings', label: 'Settings & API', icon: Settings },
      { id: 'connections', label: 'Connections', icon: ExternalLink },
      { id: 'grading', label: 'Grading & Release', icon: Gauge },
      { id: 'commerce', label: 'Commerce', icon: Activity },
      { id: 'foundry', label: 'Foundry Labs', icon: Cpu },
    ],
  },
];

export function Navigation() {
  const activePage = useSovereignStore((s) => s.activePage);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const collapsed = useSovereignStore((s) => s.sidebarCollapsed);

  return (
    <nav
      style={{
        width: collapsed ? 56 : 220,
        minWidth: collapsed ? 56 : 220,
        height: '100%',
        borderRight: '1px solid #1e293b',
        background: '#0c1222',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: collapsed ? '12px 6px' : '12px 10px', flex: 1 }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.id} style={{ marginBottom: 20 }}>
            {/* Group Label */}
            {!collapsed && (
              <div style={{
                fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase',
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: collapsed ? '8px 0' : '7px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#c7d2fe' : '#64748b',
                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                    transition: 'all 0.15s ease',
                    marginBottom: 2,
                    textAlign: 'left',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    if (!isActive) e.currentTarget.style.color = '#94a3b8';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                    if (!isActive) e.currentTarget.style.color = '#64748b';
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: collapsed ? 0 : -10, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 20, borderRadius: '0 3px 3px 0', background: '#6366f1',
                    }} />
                  )}
                  <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #1e293b',
          fontSize: 9, color: '#334155', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          PH Evo Studio v2.0
        </div>
      )}
    </nav>
  );
}

export default Navigation;