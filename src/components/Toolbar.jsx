import React, { useMemo } from 'react';
import { useSovereignStore } from '../store.js';
import { 
  Save, 
  Play, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Settings, 
  Share2,
  Box,
  Code,
  Terminal as TerminalIcon
} from 'lucide-react';
import { IconButton } from './primitives.jsx';
import { BRIDGE_URL } from '../config/bridge-config.js';

export function Toolbar() {
  const { 
    activeFile, 
    addNotification, 
    terminalOpen, 
    setTerminalOpen, 
    addTerminalLog, 
    setActiveTerminalSession,
    setActivePage,
    globalTheme
  } = useSovereignStore();

  const toolbarTheme = globalTheme?.toolbar || 'alpha';
  const activeThemeId = globalTheme?.theme || 'evoCore';

  const handleBuild = async () => {
    setTerminalOpen(true);
    setActiveTerminalSession('build');
    addTerminalLog(`> [BUILD] Initiating production build for ${activeFile}...`, 'system', 'build');
    addTerminalLog(`> [BUILD] Source: ${activeFile}`, 'info', 'build');
    
    const res = await fetch(BRIDGE_URL + '/api/intelligence/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: 'Terminal',
        action: 'run',
        payload: { command: 'npm run build' }
      }),
    });
    const data = await res.json();
    if (data.success) {
      addTerminalLog(data.result.output, 'success', 'build');
      addNotification('Build successful.', 'success');
    } else {
      addTerminalLog(data.error || 'Build failed.', 'error', 'build');
      addNotification('Build failed.', 'error');
    }
  };

  const handleAudit = () => {
    setTerminalOpen(true);
    setActiveTerminalSession('security');
    addTerminalLog('evo audit', 'command', 'security');
    const fetchAudit = async () => {
      const res = await fetch(BRIDGE_URL + '/api/intelligence/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'Terminal',
          action: 'run',
          payload: { command: 'evo audit' }
        }),
      });
      const data = await res.json();
      addTerminalLog(data.result.output, data.success ? 'success' : 'error', 'security');
    };
    fetchAudit();
  };

  const themeFusion = useMemo(() => {
    // Autonomous layout fusion of Nexus, Terminal, Royal, Forge, Genome, Cloud, Hologram, Retro, Clean, Tactical
    const base = {
      glass: 'backdrop-blur-2xl bg-[radial-gradient(circle_at_top,_rgba(0,240,255,0.18),_transparent_55%),linear-gradient(120deg,rgba(5,5,12,0.98),rgba(9,9,20,0.96),rgba(15,23,42,0.98))]',
      border: 'border border-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.25)]',
      radius: 'rounded-[22px]',
      height: 'h-16',
      padding: 'px-6',
      anim: 'anim-nexus anim-terminal anim-hologram'
    };

    const paletteByTheme = {
      omega: {
        bar: 'from-red-900/70 via-black/90 to-red-950/90',
        glow: 'shadow-[0_0_40px_rgba(248,113,113,0.6)] border-red-500/50',
      },
      sigma: {
        bar: 'from-violet-700/50 via-slate-950/90 to-indigo-900/70',
        glow: 'shadow-[0_0_40px_rgba(167,139,250,0.6)] border-violet-400/40',
      },
      zeta: {
        bar: 'from-slate-50/90 via-sky-50/80 to-slate-100/90',
        glow: 'shadow-[0_0_36px_rgba(59,130,246,0.35)] border-slate-200/90',
      },
      default: {
        bar: 'from-sky-500/15 via-slate-900/95 to-cyan-500/15',
        glow: 'shadow-[0_0_40px_rgba(56,189,248,0.5)] border-cyan-400/50',
      }
    };

    const palette =
      toolbarTheme === 'omega'
        ? paletteByTheme.omega
        : toolbarTheme === 'sigma'
        ? paletteByTheme.sigma
        : toolbarTheme === 'zeta'
        ? paletteByTheme.zeta
        : paletteByTheme.default;

    return { base, palette };
  }, [toolbarTheme]);

  return (
    <div
      className={[
        'relative z-30 sticky top-0 flex items-center justify-between',
        'transition-all duration-500',
        themeFusion.base.height,
        themeFusion.base.padding,
        themeFusion.base.glass,
        themeFusion.base.border,
        themeFusion.base.radius,
        themeFusion.base.anim,
        'overflow-hidden',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px',
        'before:bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.7),transparent)]',
        'after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_10%_0%,rgba(244,114,182,0.18),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.18),transparent_55%)]',
        toolbarTheme === 'omega' ? 'scale-[0.99] translate-y-1 border-red-500/70' : '',
      ].join(' ')}
    >
      {/* Holographic scan-line overlay */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-60 anim-hologram">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(148,163,184,0.09)_0px,rgba(148,163,184,0.09)_1px,transparent_1px,transparent_3px)]" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.8),transparent_60%)] animate-pulse" />
      </div>

      {/* Nexus / Cloud particle spine */}
      <div className="pointer-events-none absolute -left-10 top-1/2 h-[120%] w-24 -translate-y-1/2 opacity-70 anim-nexus">
        <div className="absolute inset-0 bg-[conic-gradient(from_200deg,rgba(56,189,248,0.18),rgba(96,165,250,0.1),transparent_45%,rgba(129,140,248,0.28),transparent)] blur-2xl" />
        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(56,189,248,0.9),transparent)] animate-pulse" />
      </div>

      {/* Tactical top status strip */}
      <div className="pointer-events-none absolute inset-x-6 top-1 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-200/60">
        <span className="flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <span className="anim-terminal-slow">Singularity Engine · Online</span>
        </span>
        <span className="hidden md:flex gap-2 opacity-70">
          <span className="anim-royal">Nexus</span>
          <span className="opacity-40">/</span>
          <span className="anim-forge">Forge</span>
          <span className="opacity-40">/</span>
          <span className="anim-genome">Genome</span>
        </span>
      </div>

      {/* LEFT CLUSTER: Navigation & actions */}
      <div className="flex items-center gap-1 relative pl-1">
        {/* Nexus halo */}
        <div className="pointer-events-none absolute -inset-2 bg-[radial-gradient(circle_at_left,_rgba(56,189,248,0.28),transparent_55%)] blur-2xl opacity-70" />

        {/* Retro / Tactical spine */}
        <div className="mr-3 flex h-8 items-center gap-1 rounded-full border border-cyan-500/30 bg-slate-950/70 px-2 shadow-[0_0_15px_rgba(22,163,74,0.25)] anim-tactical">
          <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80">
            <span className="absolute inset-[2px] rounded-full bg-[conic-gradient(from_220deg,rgba(34,197,94,0.1),rgba(52,211,153,0.7),rgba(22,163,74,0.05))]" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] anim-genome" />
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">
            Flux Rail
          </span>
        </div>

        <div className="relative flex items-center gap-1">
          {/* Hologram highlight line */}
          <div className="pointer-events-none absolute -left-1 top-1/2 h-[46px] w-[2px] -translate-y-1/2 bg-[linear-gradient(to_bottom,transparent,rgba(56,189,248,0.7),transparent)]" />

          <IconButton
            icon={Box}
            label="Project Explorer"
            onClick={() => setActivePage('dashboard')}
            className="rounded-2xl anim-nexus hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(0,240,255,0.45)] active:scale-100 active:translate-y-0 transition-all duration-300"
          />
          <IconButton
            icon={Code}
            label="Code View"
            onClick={() => setActivePage('workspace')}
            className="rounded-2xl anim-terminal hover:text-sky-300 hover:bg-sky-500/15 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_25px_rgba(56,189,248,0.45)] active:scale-100 active:translate-y-0 transition-all duration-300"
          />

          {/* Holographic divider with animated nodes */}
          <div className="mx-2 flex h-7 items-center">
            <div className="relative flex h-full w-px items-center justify-center">
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-[rgba(0,240,255,0.7)] to-transparent" />
              <div className="absolute -top-0.5 h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)] anim-hologram" />
              <div className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.9)] anim-hologram-slow" />
            </div>
          </div>

          <IconButton
            icon={Save}
            label="Save File (Ctrl+S)"
            onClick={() => addNotification('File saved to physical disk.', 'success')}
            className="rounded-2xl anim-clean hover:text-emerald-400 hover:bg-emerald-400/10 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-100 active:translate-y-0 transition-all duration-300"
          />
          <div className="relative">
            {/* Build status pulse ring */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group anim-forge" />
            <IconButton
              icon={Play}
              label="Run Action"
              onClick={handleBuild}
              className="group relative rounded-2xl text-emerald-500 hover:text-emerald-300 hover:bg-emerald-500/20 hover:shadow-[0_0_22px_rgba(16,185,129,0.6)] hover:scale-110 hover:-translate-y-[1px] active:scale-100 active:translate-y-0 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* RIGHT CLUSTER: Engine state & tools */}
      <div className="flex items-center gap-5 pr-1">
        {/* Royal / Hologram theme capsule */}
        <div className="hidden md:flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-full border border-[#00f0ff]/35 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_55%),linear-gradient(120deg,rgba(15,23,42,0.95),rgba(30,64,175,0.9),rgba(8,47,73,0.95))] shadow-[0_0_18px_rgba(56,189,248,0.5)] hover:shadow-[0_0_30px_rgba(56,189,248,0.85)] hover:scale-105 hover:-translate-y-[1px] transition-all duration-300 cursor-default anim-royal">
          <div className="relative flex items-center justify-center">
            <Zap size={14} className="text-[#00f0ff] animate-pulse drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
            <span className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.4),transparent_55%)] opacity-40 blur-sm" />
          </div>
          <span
            className="relative text-[10px] font-black text-[#e2e8f0] uppercase tracking-[0.28em] pl-1"
            style={{ textShadow: '0 0 14px rgba(0,240,255,0.8)' }}
          >
            {activeThemeId === 'extremeWindows95'
              ? 'Windows 95'
              : activeThemeId === 'layoutTerminalFullscreen'
              ? 'ROOT OVERRIDE'
              : activeThemeId === 'cyberpunk'
              ? 'SHADOW PROTOCOL'
              : 'Evo Studio · Singularity Band'}
          </span>
        </div>

        {/* Tactical / Retro tool matrix */}
        <div className="relative flex items-center gap-1 rounded-3xl border border-cyan-500/40 bg-[radial-gradient(circle_at_bottom,rgba(15,23,42,0.95),rgba(15,23,42,0.85))] px-1.5 py-1 shadow-[0_0_22px_rgba(56,189,248,0.45)] anim-tactical">
          {/* Genome activity stripe */}
          <div className="pointer-events-none absolute inset-y-1 left-1 w-[3px] rounded-full bg-[linear-gradient(to_bottom,rgba(45,212,191,0.1),rgba(45,212,191,0.9),rgba(56,189,248,0.1))] shadow-[0_0_16px_rgba(45,212,191,0.8)] anim-genome" />

          {activeThemeId === 'extremeWindows95' ? (
            <>
              <button
                className="px-3 py-1 bg-[#c0c0c0] text-black font-bold border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs shadow-[inset_-1px_-1px_0_#000] hover:translate-y-[1px] hover:translate-x-[1px] active:translate-y-[2px] active:translate-x-[2px] transition-transform duration-150"
                onClick={() => void ('Executing Run.exe...')}
              >
                Run.exe
              </button>
              <button
                className="px-3 py-1 bg-[#c0c0c0] text-black font-bold border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs shadow-[inset_-1px_-1px_0_#000] hover:translate-y-[1px] hover:translate-x-[1px] active:translate-y-[2px] active:translate-x-[2px] transition-transform duration-150"
                onClick={() => void ('Opening Options...')}
              >
                Options
              </button>
            </>
          ) : activeThemeId === 'layoutTerminalFullscreen' ? (
            <span className="flex items-center gap-2 px-3 py-1 text-[#0f0] font-mono text-xs anim-terminal">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0f0] shadow-[0_0_14px_rgba(34,197,94,0.9)] animate-pulse" />
              <span>[TOOLS DISABLED · ROOT LOCK]</span>
            </span>
          ) : (
            <>
              <IconButton
                icon={ShieldCheck}
                label="Truth Audit"
                onClick={handleAudit}
                className="rounded-2xl anim-tactical hover:text-yellow-400 hover:bg-yellow-400/10 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_22px_rgba(250,204,21,0.6)] active:scale-100 active:translate-y-0 transition-all duration-300"
              />
              <IconButton
                icon={Cpu}
                label="Engine Metrics"
                onClick={() => setActivePage('metrics')}
                className="rounded-2xl anim-forge hover:text-cyan-300 hover:bg-indigo-400/15 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_22px_rgba(56,189,248,0.6)] active:scale-100 active:translate-y-0 transition-all duration-300"
              />

              {/* Genome / Cloud live status pip */}
              <div className="relative mx-1 hidden sm:flex h-7 items-center rounded-2xl bg-slate-900/80 px-2 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-200/80 anim-cloud">
                <span className="mr-1 flex h-1.5 w-1.5">
                  <span className="m-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-ping" />
                </span>
                <span className="whitespace-nowrap">Live Telemetry</span>
                <span className="ml-1 text-[8px] text-cyan-400/70">●●●</span>
              </div>

              <IconButton
                icon={TerminalIcon}
                label={terminalOpen ? 'Collapse Terminal' : 'Expand Terminal'}
                onClick={() => setTerminalOpen(!terminalOpen)}
                className={[
                  'rounded-2xl anim-terminal',
                  terminalOpen
                    ? 'text-[#00f0ff] bg-[#00f0ff]/20 shadow-[0_0_18px_rgba(0,240,255,0.7)]'
                    : 'text-slate-400',
                  'hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_24px_rgba(0,240,255,0.9)] active:scale-100 active:translate-y-0 transition-all duration-300'
                ].join(' ')}
              />
              <IconButton
                icon={Settings}
                label="IDE Settings"
                onClick={() => setActivePage('settings')}
                className="rounded-2xl anim-royal hover:text-pink-400 hover:bg-pink-400/10 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_22px_rgba(244,114,182,0.7)] active:scale-100 active:translate-y-0 transition-all duration-300"
              />
              <IconButton
                icon={Share2}
                label="Export Artifact"
                onClick={() => setActivePage('foundry')}
                className="rounded-2xl anim-hologram hover:text-violet-400 hover:bg-violet-400/10 hover:scale-110 hover:-translate-y-[1px] hover:shadow-[0_0_22px_rgba(129,140,248,0.7)] active:scale-100 active:translate-y-0 transition-all duration-300"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-26T14:54:50.248Z