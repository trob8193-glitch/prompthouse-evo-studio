import React from 'react';
import {
  LayoutDashboard, MessageSquare, Code2, Cpu, Rocket, Shield, Settings,
  Activity, Eye, Sparkles, BarChart3, FolderOpen, Gauge, Zap, ShieldAlert,
  ExternalLink, Share2, Aperture, Gamepad2, LayoutTemplate, Palette, Lock, ScrollText, Globe, Bot, Smartphone, ShieldCheck, CreditCard,
  Briefcase, Boxes, Database, Fingerprint, Search, Clock, Orbit,
  Moon, Hammer, Swords, Copy, Wrench, Puzzle, Terminal as TermIcon, Link2, Truck, ShoppingCart, Wand2
} from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { OrganizationSwitcher } from './OrganizationSwitcher.jsx';

/**
 * PH EVO STUDIO — IDE SIDEBAR NAVIGATION
 * ═══════════════════════════════════════════════════════════════
 * IDE-style Activity Bar and Collapsible Primary Sidebar.
 * Drives the activePage state in the Zustand store.
 */

import layoutSchema from '../config/layout-schema.json';

const IconMap = {
  LayoutDashboard, MessageSquare, Code2, Cpu, Rocket, Shield, Settings,
  Activity, Eye, Sparkles, BarChart3, FolderOpen, Gauge, Zap, ShieldAlert,
  ExternalLink, Share2, Aperture, Gamepad2, LayoutTemplate, Palette, Lock, ScrollText, Globe, Bot, Smartphone, ShieldCheck, CreditCard,
  Briefcase, Boxes, Database, Fingerprint, Search, Clock, Orbit,
  Moon, Hammer, Swords, Copy, Wrench, Puzzle, Terminal: TermIcon, Link2, Truck, ShoppingCart, Wand2
};

export const NAV_GROUPS = layoutSchema.navigationGroups.map(group => ({
  ...group,
  items: group.items.map(item => ({
    ...item,
    icon: IconMap[item.icon] || Sparkles
  }))
}));
export function Navigation() {
  const activePage = useSovereignStore((s) => s.activePage);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const collapsed = useSovereignStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSovereignStore((s) => s.toggleSidebar);
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const moduleTheme = globalTheme?.module || 'alpha';
  const coreTheme = globalTheme?.core || 'alpha';

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
      transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      background: 'transparent',
      padding: '12px 0 12px 12px'
    }}>
      <div style={{
        display: 'flex',
        height: '100%',
        borderRadius: coreTheme === 'omega' ? 0 : coreTheme === 'sigma' ? 30 : moduleTheme === 'zeta' ? 0 : moduleTheme === 'theta' ? 40 : 16,
        border: coreTheme === 'omega' ? '2px solid #f00' : coreTheme === 'sigma' ? '1px solid rgba(139, 92, 246, 0.8)' : moduleTheme === 'zeta' ? '4px solid #000' : moduleTheme === 'theta' ? 'none' : '1px solid var(--border-mid)',
        background: coreTheme === 'omega' ? '#200' : coreTheme === 'sigma' ? 'rgba(139, 92, 246, 0.1)' : moduleTheme === 'zeta' ? '#fff' : moduleTheme === 'gamma' ? '#1a0033' : moduleTheme === 'epsilon' ? '#3e2723' : 'var(--bg-glass-heavy)',
        backdropFilter: moduleTheme === 'zeta' || moduleTheme === 'epsilon' ? 'none' : 'blur(40px)',
        WebkitBackdropFilter: moduleTheme === 'zeta' || moduleTheme === 'epsilon' ? 'none' : 'blur(40px)',
        boxShadow: moduleTheme === 'gamma' ? '4px 4px 0 #ff00ff' : moduleTheme === 'theta' ? '0 0 50px rgba(200,0,255,0.1)' : 'var(--shadow-md)',
        overflow: 'hidden'
      }}>
        {/* Activity Bar */}
        <div style={{
          width: 56,
          background: 'rgba(0,0,0,0.2)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 16
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
                  width: 44, height: 44, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                  background: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
                  marginBottom: 8, transition: 'var(--transition)',
                  position: 'relative', border: 'none', cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-glass)' : 'none'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-dim)'; }}
              >
                {isActive && <div style={{ position: 'absolute', left: -6, top: '25%', bottom: '25%', width: 3, background: 'var(--accent-cyan)', borderRadius: '0 4px 4px 0', boxShadow: '0 0 12px var(--accent-cyan)' }} />}
                <GIcon size={22} className="evo-icon-glow" style={{ opacity: isActive ? 1 : 0.7, color: 'inherit' }} />
              </button>
            );
          })}
        </div>

        {/* Primary Sidebar */}
        {!collapsed && (
          <div style={{
            width: 220,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            <OrganizationSwitcher />
            
            <div className="hologram-text-glow" style={{
              fontSize: 10, fontWeight: 800, color: 'var(--hologram-color)', textTransform: 'uppercase',
              letterSpacing: '0.2em', padding: '20px 16px 12px',
            }}>
              {activeGroupData.label}
            </div>
            
            <div style={{ padding: '0 12px', flex: 1 }}>
              {activeGroupData.items.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={isActive ? "hologram-text-glow-accent" : "hologram-text-glow"}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      fontSize: 13, fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      background: isActive ? 'var(--accent-cyan-dim)' : 'transparent',
                      border: '1px solid transparent', textAlign: 'left', marginBottom: 4,
                      transition: 'var(--transition)', borderColor: isActive ? 'var(--border-neon)' : 'transparent',
                      boxShadow: isActive ? 'var(--shadow-glass), inset 0 0 20px rgba(0,240,255,0.05)' : 'none'
                    }}
                    onMouseEnter={e => { if (!isActive) Object.assign(e.currentTarget.style, { background: 'var(--bg-glass-light)', color: 'white' }); }}
                    onMouseLeave={e => { if (!isActive) Object.assign(e.currentTarget.style, { background: 'transparent', color: 'var(--text-secondary)' }); }}
                  >
                    <Icon size={16} className="evo-icon-glow" style={{ color: 'inherit', opacity: isActive ? 1 : 0.8 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hologram-text-glow-accent" style={{
              padding: '16px 20px', borderTop: '1px solid var(--border-subtle)',
              fontSize: 9, color: 'var(--hologram-color)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
              background: 'transparent'
            }}>
              ⚡ Singularity v2.0
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
