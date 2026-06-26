import React, { useEffect, useState } from 'react';
import { Shield, Wifi, WifiOff, AlertTriangle, Settings, Bell, PanelLeftClose, PanelLeft, LayoutTemplate, Share2 } from 'lucide-react';
import { useSovereignStore } from '../store.js';

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
    connected: { icon: Wifi, color: 'text-emerald-400', label: 'Bridge Online', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]' },
    disconnected: { icon: WifiOff, color: 'text-slate-400', label: 'Disconnected', bg: 'bg-slate-400/10', border: 'border-slate-400/20', dot: 'bg-slate-400' },
    error: { icon: AlertTriangle, color: 'text-amber-400', label: 'Bridge Error', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400' },
  };
  const st = statusConfig[bridgeStatus] || statusConfig.disconnected;
  const StatusIcon = st.icon;

  const bgThemeMap = {
    beta: 'bg-white/5',
    gamma: 'bg-[#1a0033]',
    delta: 'bg-[#02140a]/80',
    epsilon: 'bg-[#3e2723]',
    zeta: 'bg-white',
    eta: 'bg-[#002828]/80',
    theta: 'bg-[radial-gradient(circle_at_top_right,rgba(200,0,255,0.2),transparent)]',
    iota: 'bg-white',
    kappa: 'bg-black'
  };
  const headerBg = bgThemeMap[globalTheme.routing] || 'bg-transparent';

  return (
    <header className={`h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-xl shrink-0 z-[100] relative shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${headerBg}`}>
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
      
      {/* Left Group */}
      <div className={`flex items-center gap-4 ${copilotFullscreen ? 'flex-1' : ''}`}>
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-3xl bg-linear-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.3)] text-sm">
            ⚡
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-tight leading-none">
              PromptHouse Evo
            </div>
            <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest leading-none mt-1">
              Studio — Singularity
            </div>
          </div>
        </div>

        {/* When split, append Left Telemetry here */}
        {copilotFullscreen && (
          <div className="flex items-center gap-4 bg-cyan-400/5 px-5 py-1.5 rounded-full border border-cyan-400/15 shadow-[0_0_15px_rgba(0,240,255,0.05)] ml-5">
            <div className="flex items-center gap-2 text-slate-300 text-[11px] font-bold tracking-wider">
              <Shield size={12} className="text-cyan-400" /> LOGIC DENSITY: <span className="text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">{metrics?.logic?.density || '0.00M'} IQ</span>
            </div>
          </div>
        )}
      </div>

      {/* Center Group (Only visible when not split) */}
      {!copilotFullscreen && (
        <div className="flex items-center gap-4 bg-cyan-400/5 px-5 py-1.5 rounded-full border border-cyan-400/15 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-bold tracking-wider">
            <Shield size={12} className="text-cyan-400" /> LOGIC DENSITY: <span className="text-white drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">{metrics?.logic?.density || '0.00M'} IQ</span>
          </div>
          <div className="w-px h-3.5 bg-cyan-400/20" />
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-bold tracking-wider">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" /> 
            STUDIO IQ: <span className="text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">{metrics?.logic?.iq?.toLocaleString() || '0'}</span>
          </div>
          <div className="w-px h-3.5 bg-cyan-400/20" />
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-bold tracking-wider">
            <Share2 size={12} className="text-fuchsia-500" /> ROUTING PORT: 
            <span className="text-white drop-shadow-[0_0_10px_rgba(217,70,239,0.4)]">
              {globalTheme.theme === 'extremeWindows95' ? 'PORT 80 (HTTP 1.0)' :
               globalTheme.theme === 'cyberpunk' ? 'PORT 666 (SHADOW)' :
               globalTheme.theme === 'layoutTerminalFullscreen' ? 'ROOT:22 (SSH)' :
               globalTheme.theme === 'vercelClean' ? 'EDGE_NETWORK' : 'AUTO_TETHER_555'}
            </span>
          </div>
        </div>
      )}

      {/* Right Group */}
      <div className={`flex items-center gap-3 justify-end ${copilotFullscreen ? 'flex-1' : ''}`}>
        
        {/* When split, prepend Right Telemetry here */}
        {copilotFullscreen && (
          <div className="flex items-center gap-4 bg-cyan-400/5 px-5 py-1.5 rounded-full border border-cyan-400/15 shadow-[0_0_15px_rgba(0,240,255,0.05)] mr-2">
            <div className="flex items-center gap-2 text-slate-300 text-[11px] font-bold tracking-wider">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" /> 
              STUDIO IQ: <span className="text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">{metrics?.logic?.iq?.toLocaleString() || '0'}</span>
            </div>
            <div className="w-px h-3.5 bg-cyan-400/20" />
            <div className="flex items-center gap-2 text-slate-300 text-[11px] font-bold tracking-wider">
              <Share2 size={12} className="text-fuchsia-500" /> PORT: 
              <span className="text-white drop-shadow-[0_0_10px_rgba(217,70,239,0.4)]">
                {globalTheme.theme === 'extremeWindows95' ? 'PORT 80' : 'AUTO_TETHER_555'}
              </span>
            </div>
          </div>
        )}
        
        {/* Metamorphosis Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black tracking-wider hover:bg-white/10 transition-colors"
          >
            <LayoutTemplate size={14} /> METAMORPHOSIS: {globalTheme.layout.toUpperCase()}
          </button>
          
          {showThemeMenu && (
            <div className="absolute top-[120%] right-0 w-48 bg-[#0a0a0f]/95 border border-white/10 rounded-3xl p-2 flex flex flex-col gap-4 gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa'].map(t => (
                <button
                  key={t}
                  onClick={() => { 
                    setGlobalTheme({ layout: t, ui: t, bots: t, wiring: t, building: t, routing: t, inventing: t, agent: t, brain: t, module: t }); 
                    setShowThemeMenu(false); 
                  }}
                  className={`px-3 py-2 text-left rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    globalTheme.layout === t ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t} Version
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Bridge Status Pill */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-300 ${st.bg} ${st.border} ${bridgeStatus === 'connected' ? 'shadow-[0_0_12px_rgba(52,211,153,0.15)]' : ''}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${st.dot} ${bridgeStatus === 'connected' ? 'animate-pulse' : ''}`} />
          <StatusIcon size={12} className={st.color} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${st.color}`}>
            {st.label}
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => setActivePage('proof-console')}
          className="relative text-slate-400 hover:text-cyan-400 transition-colors p-1.5"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {notifications.length > 0 && (
            <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#050508] shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActivePage('settings')}
          className="text-slate-400 hover:text-cyan-400 transition-colors p-1.5"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
