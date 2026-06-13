import React from 'react';
import {
  LayoutDashboard, MessageSquare, Code2, Cpu, Rocket, Shield, Settings,
  Activity, Eye, Sparkles, BarChart3, FolderOpen, Gauge, Zap,
  ExternalLink, Share2, Aperture, Gamepad2, LayoutTemplate, Palette, Lock, ScrollText, Globe, Bot, Smartphone, ShieldCheck, CreditCard,
  Briefcase, Boxes, Database, Fingerprint, Search, Clock, Orbit,
  Moon, Hammer, Swords, Copy, Wrench, Puzzle, Chrome, Terminal as TermIcon, Link2, Truck, ShoppingCart, Wand2
} from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — IDE SIDEBAR NAVIGATION
 * ═══════════════════════════════════════════════════════════════
 * IDE-style Activity Bar and Collapsible Primary Sidebar.
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
      { id: 'workspace', label: 'Workspace Explorer', icon: FolderOpen },
      { id: 'ghost-editor', label: 'Ghost Editor', icon: Sparkles },
      { id: 'nightforge', label: 'NightForge', icon: Moon },
      { id: 'autonomous-command', label: 'Autonomous HQ', icon: Cpu },
      { id: 'self-build-forge', label: 'Self-Build Forge', icon: Hammer },
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
      { id: 'omni-bond', label: 'Omni-Bond Nexus', icon: Fingerprint },
      { id: 'omni-bot', label: 'OmniBot Remote', icon: Bot },
      { id: 'rare-capabilities', label: 'Rare Capabilities', icon: Orbit },
      { id: 'evo-duel', label: 'Evo Duel Arena', icon: Swords },
      { id: 'worktwin', label: 'WorkTwin Vault', icon: Copy },
      { id: 'tool-autogen', label: 'Tool Auto-Gen', icon: Wrench },
      { id: 'pattern-miner', label: 'Pattern Miner', icon: Search },
      { id: 'promptlink', label: 'PromptLink', icon: Link2 },
      { id: 'ai-prompt-gen', label: 'AI Prompt Gen', icon: Wand2 },
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
      { id: 'temporal-trace', label: 'Temporal Trace', icon: Clock },
      { id: 'witness-console', label: 'Witness Console', icon: Search },
      { id: 'forge-terminal', label: 'Forge Terminal', icon: TermIcon },
      { id: 'deploy-rail', label: 'Deploy Rail', icon: Truck },
    ],
  },
  {
    id: 'monetization',
    label: 'Monetization',
    items: [
      { id: 'commerce', label: 'Commerce Engine', icon: CreditCard },
      { id: 'commerce-dashboard', label: 'Commerce Dashboard', icon: BarChart3 },
      { id: 'commerce-rail', label: 'Commerce Rail', icon: ShoppingCart },
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
      { id: 'chrome-extension', label: 'Chrome Extension', icon: Chrome },
    ],
  },
];

export function Navigation() {
  const activePage = useSovereignStore((s) => s.activePage);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const collapsed = useSovereignStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSovereignStore((s) => s.toggleSidebar);

  const [activeGroup, setActiveGroup] = React.useState(() => {
    for (const group of NAV_GROUPS) {
      if (group.items.some(item => item.id === activePage)) return group.id;
    }
    return NAV_GROUPS[0].id;
  });

  React.useEffect(() => {
    for (const group of NAV_GROUPS) {
      if (group.items.some(item => item.id === activePage)) {
        setActiveGroup(group.id);
        break;
      }
    }
  }, [activePage]);

  const activeGroupData = NAV_GROUPS.find(g => g.id === activeGroup) || NAV_GROUPS[0];

  const getGroupIcon = (id) => {
    switch (id) {
      case 'studio': return LayoutDashboard;
      case 'governance': return Shield;
      case 'intelligence': return Sparkles;
      case 'operations': return Activity;
      case 'monetization': return CreditCard;
      case 'user': return Settings;
      case 'system': return Database;
      default: return Boxes;
    }
  };

  return (
    <nav style={{
      height: '100%',
      display: 'flex',
      flexShrink: 0,
      zIndex: 1000,
      transition: 'width 0.3s cubic-bezier(0.2,0.8,0.2,1)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(5,5,8,0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)'
    }}>
      {/* Activity Bar */}
      <div style={{
        width: 50,
        background: 'rgba(2,2,4,0.6)',
        borderRight: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12
      }}>
        {NAV_GROUPS.map((group) => {
          const isActive = activeGroup === group.id;
          const GIcon = getGroupIcon(group.id);
          return (
            <button
              key={group.id}
              onClick={() => {
                setActiveGroup(group.id);
                if (collapsed) toggleSidebar();
              }}
              title={group.label}
              style={{
                width: 40, height: 40, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? '#ffffff' : '#5a5a72',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                marginBottom: 8, transition: 'all 0.2s',
                position: 'relative', border: 'none', cursor: 'pointer'
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#00f0ff'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#5a5a72'; }}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '25%', bottom: '25%', width: 2, background: '#00f0ff', borderRadius: '0 2px 2px 0', boxShadow: '0 0 10px #00f0ff' }} />}
              <GIcon size={22} style={{ opacity: isActive ? 1 : 0.8, filter: isActive ? 'drop-shadow(0 0 6px rgba(0,240,255,0.4))' : 'none', color: isActive ? '#00f0ff' : 'inherit' }} />
            </button>
          );
        })}
      </div>

      {/* Primary Sidebar */}
      {!collapsed && (
        <div style={{
          width: 200,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div style={{
            fontSize: 10, fontWeight: 800, color: '#737385', textTransform: 'uppercase',
            letterSpacing: '0.15em', padding: '16px 14px 10px',
          }}>
            {activeGroupData.label}
          </div>
          
          <div style={{ padding: '0 8px', flex: 1 }}>
            {activeGroupData.items.map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                    fontSize: 12, fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#8e8e9f',
                    background: isActive ? 'rgba(0,240,255,0.1)' : 'transparent',
                    border: '1px solid transparent', textAlign: 'left', marginBottom: 2,
                    transition: 'all 0.2s', borderColor: isActive ? 'rgba(0,240,255,0.2)' : 'transparent'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={14} style={{ color: isActive ? '#00f0ff' : 'inherit', opacity: isActive ? 1 : 0.7 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{
            padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 9, color: '#00f0ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
            background: 'rgba(0,0,0,0.2)'
          }}>
            ⚡ Singularity v2.0
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
