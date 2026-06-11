import React from 'react';
import {
  LayoutDashboard, MessageSquare, Code2, Cpu, Rocket, Shield, Settings,
  Activity, Eye, Sparkles, BarChart3, FolderOpen, Gauge, Zap,
  ExternalLink, Share2, Aperture, Gamepad2, LayoutTemplate, Palette, Lock, ScrollText, Globe, Bot, Smartphone, ShieldCheck, CreditCard
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
    id: 'studio',
    label: 'Studio',
    items: [
      { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
      { id: 'saas-builder', label: 'Singularity Studio', icon: Rocket },
      { id: 'portfolio', label: 'App Market', icon: Globe },
      { id: 'studio-marketplace', label: 'Omni-Marketplace', icon: Globe },
      { id: 'launch-proof', label: 'Launch Proof', icon: Shield },
      { id: 'chat', label: 'Evo Copilot', icon: MessageSquare },
      { id: 'agent-chat', label: 'Evo Agent Chat', icon: Bot },
      { id: 'workspace', label: 'Workspace Explorer', icon: FolderOpen },
      { id: 'ghost-editor', label: 'Ghost Editor', icon: Sparkles },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { id: 'self-evolution', label: 'Self-Evolution', icon: Zap },
      { id: 'cost-firewall', label: 'Cost Firewall', icon: Lock },
      { id: 'review-ledger', label: 'Review Ledger', icon: ScrollText },
      { id: 'proof-docs', label: 'Proof Docs', icon: Shield },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { id: 'prompt-registry', label: 'Prompt Registry', icon: Code2 },
      { id: 'evo-diffuser', label: 'Evo Diffuser', icon: Aperture },
      { id: 'evo-pixelator', label: 'Evo Pixelator', icon: Gamepad2 },
      { id: 'evo-layout', label: 'Evo Layout', icon: LayoutTemplate },
      { id: 'theme-evolution', label: 'Theme Evolution', icon: Palette },
      { id: 'evopulse-grid', label: 'EvoPulse Grid', icon: Share2 },
      { id: 'ai-generator', label: 'AI Generator', icon: Sparkles },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'execution-queue', label: 'Execution Queue', icon: Rocket },
      { id: 'brain-surfaces', label: 'Brain Surfaces', icon: Cpu },
      { id: 'proof-console', label: 'Proof Console', icon: Shield },
      { id: 'proof-center', label: 'Proof Center', icon: Shield },
      { id: 'evo-eyes', label: 'Evo Eyes', icon: Eye },
      { id: 'realtime-validation', label: 'Validation Pipeline', icon: ShieldCheck },
      { id: 'metrics', label: 'Metrics', icon: BarChart3 },
      { id: 'deployment-center', label: 'Deployment Center', icon: Rocket },
      { id: 'mobile-singularity', label: 'Mobile Hub', icon: Smartphone },
    ],
  },
  {
    id: 'monetization',
    label: 'Monetization',
    items: [
      { id: 'commerce', label: 'Commerce Engine', icon: CreditCard },
    ],
  },
  {
    id: 'user',
    label: 'User',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'pricing', label: 'Upgrade to Pro', icon: Zap },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'connections', label: 'Connections', icon: ExternalLink },
      { id: 'grading', label: 'Grading & Release', icon: Gauge },
      { id: 'visual-physics', label: 'Visual Physics', icon: Zap },
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
        width: collapsed ? 60 : 240,
        minWidth: collapsed ? 60 : 240,
        height: '100%',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(5,5,8,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.3s cubic-bezier(0.2,0.8,0.2,1), min-width 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1000,
      }}
    >
      <div style={{ padding: collapsed ? '16px 8px' : '16px 14px', flex: 1 }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.id} style={{ marginBottom: 24 }}>
            {!collapsed && (
              <div style={{
                fontSize: 10, fontWeight: 800, color: '#4a4a5e', textTransform: 'uppercase',
                letterSpacing: '0.2em', padding: '6px 12px', marginBottom: 6,
              }}>
                {group.label}
              </div>
            )}

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
                    gap: 12,
                    width: '100%',
                    padding: collapsed ? '10px 0' : '9px 14px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    border: '1px solid transparent',
                    borderRadius: 14,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#ffffff' : '#737385',
                    background: isActive 
                      ? 'linear-gradient(90deg, rgba(0,240,255,0.1), transparent)' 
                      : 'transparent',
                    borderColor: isActive ? 'rgba(0,240,255,0.2)' : 'transparent',
                    boxShadow: isActive ? 'inset 3px 0 0 #00f0ff' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
                    marginBottom: 3,
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#737385';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: collapsed ? 0 : -14, top: '15%', bottom: '15%',
                      width: 3, borderRadius: '0 4px 4px 0', background: '#00f0ff',
                      boxShadow: '0 0 16px #00f0ff',
                    }} />
                  )}
                  <Icon size={16} style={{ 
                    flexShrink: 0, 
                    opacity: isActive ? 1 : 0.6,
                    color: isActive ? '#00f0ff' : 'inherit',
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(0,240,255,0.5))' : 'none',
                    transition: 'all 0.3s ease'
                  }} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {!collapsed && (
        <div style={{
          padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 9, color: '#00f0ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
          background: 'rgba(0,0,0,0.2)',
          textShadow: '0 0 10px rgba(0,240,255,0.3)'
        }}>
          ⚡ Singularity v2.0
        </div>
      )}
    </nav>
  );
}

export default Navigation;
