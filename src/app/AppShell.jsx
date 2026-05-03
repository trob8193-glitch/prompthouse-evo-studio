import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BookOpen, Users, Settings, Activity, Shield, Cpu, Terminal, GitMerge, FileCode, Layers, ShieldAlert, MonitorPlay, ShoppingCart } from 'lucide-react';
import { cn } from '../components/primitives.jsx';
import { BotOrb } from '../bot-orb.jsx';


// ─── UTILS FOR READINESS WIDGET ──────────────────────────────────────────────
function getGrade(score) {
  if (score >= 95) return { label: 'Sovereign', cls: 'grade-sovereign' };
  if (score >= 85) return { label: 'Singularity', cls: 'grade-singularity' };
  if (score >= 75) return { label: 'Master', cls: 'grade-master' };
  if (score >= 50) return { label: 'Production', cls: 'grade-production' };
  return { label: 'Draft', cls: 'grade-draft' };
}

function getBarColor(score) {
  if (score >= 95) return 'var(--accent-gold)';
  if (score >= 85) return 'var(--accent-pink)';
  if (score >= 75) return 'var(--accent-violet)';
  if (score >= 50) return 'var(--accent-cyan)';
  return 'var(--text-dim)';
}

function ReadinessWidget({ score }) {
  const grade = getGrade(score);
  return (
    <div className="readiness-widget mt-4">
      <div className="readiness-label">Studio Readiness</div>
      <div className="readiness-score-row">
        <span className="readiness-score-num">{score}</span>
        <span className={`readiness-grade ${grade.cls}`}>{grade.label}</span>
      </div>
      <div className="readiness-bar">
        <div className="readiness-bar-fill" style={{ width: `${score}%`, background: getBarColor(score) }} />
      </div>
    </div>
  );
}

// ─── OS SHELL & NAVIGATION ───────────────────────────────────────────────────

function SidebarItem({ icon: Icon, label, to, isChild = false }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && to !== '/' || (to === '/' && location.pathname === '/');
  
  return (
    <Link 
      to={to} 
      className={cn(
        "nav-item",
        isActive && "active"
      )}
    >
      <Icon className="nav-icon" size={18} />
      <span>{label}</span>
    </Link>
  );
}

function SidebarGroup({ title, children }) {
  return (
    <div className="mb-4">
      <div className="nav-section-label">
        {title}
      </div>
      <div className="flex flex-col gap-1 px-2">
        {children}
      </div>
    </div>
  );
}

export function AppShell({ children }) {
  const [score, setScore] = React.useState(98);

  React.useEffect(() => {
    const syncSovereign = async () => {
      try {
        const res = await fetch('http://localhost:3001/status');
        const data = await res.json();
        if (data.sovereign_brain) {
          // IQ translates to Readiness % (capped at 100 for the bar)
          setScore(Math.min(100, data.sovereign_brain.studio_iq));
        }
      } catch (e) {
        console.warn('[Sovereign] Sync failed. Using last known state.');
      }
    };

    syncSovereign();
    const interval = setInterval(syncSovereign, 10000); // Sync every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="app bg-[var(--bg-void)]">
        
        {/* SIDEBAR NAVIGATION (Restoring legacy styling mixed with new routing) */}
        <nav className="sidebar z-20">
          <div className="sidebar-logo">
            <Link to="/" className="sidebar-logo-mark">
              <div className="logo-icon">PH</div>
              <div className="logo-text">
                <span className="logo-title">Prompt House</span>
                <span className="logo-sub">EVO STUDIO OS</span>
              </div>
            </Link>
          </div>
          
          <div className="sidebar-nav custom-scrollbar">
            <SidebarGroup title="Studio OS">
              <SidebarItem to="/studio/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/studio/workspace" icon={FolderKanban} label="Workspace" />
              <SidebarItem to="/studio/execution" icon={Activity} label="Execution Queue" />
            </SidebarGroup>

            <SidebarGroup title="Prompt Brain">
              <SidebarItem to="/registry" icon={BookOpen} label="Prompt Registry" />
              <SidebarItem to="/os/evo-foundry" icon={Layers} label="Evo Model Foundry" />
              <SidebarItem to="/os/evo-model-config" icon={Cpu} label="Evo LM Config" />
              <SidebarItem to="/cast" icon={Users} label="Evo Cast" />
              <SidebarItem to="/os/duel-arena" icon={Activity} label="Duel Arena" />
              <SidebarItem to="/os/ai-generator" icon={FileCode} label="AI Generator" />

            </SidebarGroup>

            <SidebarGroup title="Reality & Truth">
              <SidebarItem to="/os/reality-twin" icon={Layers} label="Reality Twin" />
              <SidebarItem to="/os/proof-console" icon={ShieldCheck} label="Proof Console" />
              <SidebarItem to="/os/inspector" icon={Terminal} label="Live Inspector" />
            </SidebarGroup>
            
            <SidebarGroup title="Connectors & Forges">
              <SidebarItem to="/os/connectors" icon={Cpu} label="Bridge Matrix" />
              <SidebarItem to="/os/forge-labs" icon={Terminal} label="Forge Labs" />
              <SidebarItem to="/os/gauntlet" icon={ShieldAlert} label="Crash Gauntlet" />

              <SidebarItem to="/os/lane-packs" icon={FileCode} label="Lane Packs" />
              <SidebarItem to="/os/sequencer" icon={GitMerge} label="Sequencer" />
            </SidebarGroup>

            <SidebarGroup title="Platform">
              <SidebarItem to="/os/sovereign-control" icon={Cpu} label="Sovereign Control" />
              <SidebarItem to="/os/grading" icon={Shield} label="Grading & Release" />
              <SidebarItem to="/os/commerce" icon={ShoppingCart} label="Commerce Core" />

              <SidebarItem to="/settings" icon={Settings} label="Settings" />
            </SidebarGroup>
          </div>
          
          <div className="sidebar-footer">
            <ReadinessWidget score={score} />
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="main relative overflow-hidden">
          <header className="main-header z-10 backdrop-blur-sm bg-[var(--bg-base)]/90">
            <div className="flex items-center gap-2 text-sm font-mono text-[var(--text-secondary)]">
              <span>PH EVO</span> / <span className="text-[var(--text-primary)]">OS ROUTER</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                BRIDGE SYNCED
              </span>
            </div>
          </header>
          
          <div className="main-content custom-scrollbar relative">
            {children}
          </div>
          
          <BotOrb view={window.location.pathname.split('/').pop() || 'dashboard'} />
        </main>
        
      </div>
    </BrowserRouter>
  );
}

// Icon Fallback
function ShieldCheck(props) {
  return <Shield {...props} />;
}
