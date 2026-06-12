import React, { useState, useRef, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { 
  Terminal as TerminalIcon, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Trash2, 
  Maximize2, 
  Minimize2,
  Copy,
  Download,
  Settings,
  History,
  Shield,
  Zap,
  Activity,
  Layers,
  Command,
  Search,
  Cpu,
  Radio
} from 'lucide-react';

const BRIDGE_URL = import.meta.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001';

const COMMAND_CATALOG = [
  { id: 'audit', label: 'Nuclear Truth Audit', command: 'evo:audit', session: 'security', description: 'Full studio wiring and truth-state audit.', tags: ['audit', 'truth', 'security'] },
  { id: 'compact', label: 'Logic Compaction', command: 'evo:compact', session: 'main', description: 'Compresses file logic density by purging entropy.', tags: ['compact', 'logic', 'density'] },
  { id: 'shard-purge', label: 'Purge Shard Cache', command: 'evo:shard:purge', session: 'main', description: 'Deletes temporary .evo-shards metadata.', tags: ['shard', 'purge', 'memory'] },
  { id: 'iq-status', label: 'System IQ Status', command: 'evo:iq:status', session: 'main', description: 'Reports current studio intelligence growth.', tags: ['iq', 'status', 'evolution'] },
  { id: 'truth-sign', label: 'Sign Truth Artifact', command: 'evo:truth:sign', session: 'security', description: 'Physically signs an artifact as reality-anchored.', tags: ['sign', 'truth', 'security'] },
  { id: 'drift-hunt', label: 'Reality Drift Hunt', command: 'evo:drift:hunt', session: 'security', description: 'Searches for logic drift and UI gaps in src/features.', tags: ['hunt', 'drift', 'reality'] },
  { id: 'bridge-pulse', label: 'Bridge Integrity Pulse', command: 'evo:bridge:pulse', session: 'main', description: 'Verifies bridge latency and handshake stability.', tags: ['pulse', 'bridge', 'integrity'] },
  { id: 'ledger-sync', label: 'Evo Studio Ledger Sync', session: 'main', command: 'evo:ledger:sync', description: 'Synchronizes local state with the cryptoledger.', tags: ['sync', 'ledger', 'signed'] },
  { id: 'ghost-manifest', label: 'Ghost Editor Manifest', session: 'watch', command: 'evo:ghost:manifest', description: 'Generates session manifest for ghost iteration.', tags: ['ghost', 'manifest', 'iter'] },
  { id: 'foundry-reforge', label: 'Reforge Foundry Core', session: 'build', command: 'evo:foundry:reforge', description: 'Re-compiles core foundry logic engines.', tags: ['reforge', 'foundry', 'build'] },
  { id: 'install', label: 'Install Dependencies', command: 'npm install', session: 'build', description: 'Installs package dependencies for the workspace.', tags: ['npm', 'deps'] },
  { id: 'npm-outdated', label: 'Check Outdated Deps', command: 'npm outdated', session: 'build', description: 'Lists installed packages that have newer versions.', tags: ['npm', 'update', 'deps'] },
  { id: 'npm-doctor', label: 'NPM Health Check', command: 'npm doctor', session: 'build', description: 'Runs a set of checks to verify npm environment.', tags: ['npm', 'health', 'fix'] },
  { id: 'npm-prune', label: 'Prune Unused Deps', command: 'npm prune', session: 'build', description: 'Removes extraneous packages from node_modules.', tags: ['npm', 'cleanup'] },
  { id: 'ai-pack', label: 'Context Pack Manifest', command: 'npm run ai:pack', session: 'main', description: 'Generates a condensed context pack for AI consumption.', tags: ['ai', 'context', 'pack'] },
  { id: 'ai-train', label: 'Autonomous Self-Train', command: 'npm run ai:train', session: 'watch', description: 'Starts the background self-evolution training loop.', tags: ['ai', 'train', 'evolve'] },
  { id: 'ai-review', label: 'AI Code Review', command: 'npm run ai:review', session: 'main', description: 'Performs a deep logic review of the current workspace.', tags: ['ai', 'review', 'audit'] },
  { id: 'ai-daemon', label: 'Evo Studio AI Daemon', command: 'npm run ai:daemon', session: 'watch', description: 'Launches the persistent background evolution engine.', tags: ['ai', 'daemon', 'system'] },
  { id: 'agent-repl', role: 'Agent REPL Session', command: 'npm run agent:repl', session: 'main', description: 'Opens an interactive shell with the Evo Agent.', tags: ['agent', 'repl', 'chat'] },
  { id: 'verify-setup', label: 'Verify Studio Setup', command: 'npm run verify:agent', session: 'main', description: 'Verifies API and filesystem integrity for the studio.', tags: ['verify', 'setup', 'health'] },
  { id: 'info', label: 'System Info Snapshot', command: 'evo info', session: 'main', description: 'Reports OS, node version, and local IP.', tags: ['info', 'diagnostics'] },
  { id: 'connect-bridge', label: 'Bond Bridge Node', command: 'evo connect 127.0.0.1:3001', session: 'security', description: 'Attempts a direct TCP handshake to PromptBridge.', tags: ['connect', 'bridge'] },
  { id: 'connect-vite', label: 'Bond Studio Node', command: 'evo connect 127.0.0.1:5173', session: 'security', description: 'Verifies local studio runtime reachability.', tags: ['connect', 'studio'] },
  { id: 'dev', label: 'Launch Dev Server', command: 'npm run dev', session: 'watch', description: 'Starts Vite dev runtime for frontend iteration.', tags: ['dev', 'vite'] },
  { id: 'bridge', label: 'Launch PromptBridge', command: 'npm run bridge', session: 'watch', description: 'Starts local PromptBridge API/runtime server.', tags: ['bridge', 'server'] },
  { id: 'dev-all', label: 'Launch Full Stack', command: 'npm run dev:all', session: 'watch', description: 'Starts studio UI and bridge in one process.', tags: ['dev', 'fullstack'] },
  { id: 'test', label: 'Run Test Suite', command: 'npm test', session: 'build', description: 'Executes Vitest suite for studio validation.', tags: ['test', 'vitest'] },
  { id: 'build', label: 'Build Production Bundle', command: 'npm run build', session: 'build', description: 'Compiles production artifacts with Vite.', tags: ['build', 'release'] },
  { id: 'preview', label: 'Preview Production Build', command: 'npm run preview', session: 'watch', description: 'Serves built assets for local release check.', tags: ['preview', 'vite'] },
  { id: 'audit-npm', label: 'Dependency Security Audit', command: 'npm audit --audit-level=moderate', session: 'security', description: 'Checks package vulnerabilities at moderate+.', tags: ['security', 'audit'] },
  { id: 'git-status', label: 'Git Status', command: 'git status --short', session: 'main', description: 'Shows current modified and untracked files.', tags: ['git', 'status'] },
  { id: 'git-branch', label: 'Git Branch Overview', command: 'git branch --show-current', session: 'main', description: 'Shows the active working branch.', tags: ['git', 'branch'] },
  { id: 'git-diff', label: 'Git Diff Summary', command: 'git diff --stat', session: 'main', description: 'Displays changed-file summary with line deltas.', tags: ['git', 'diff'] },
  { id: 'node-version', label: 'Node Version', command: 'node -v', session: 'main', description: 'Prints active Node.js version.', tags: ['node', 'runtime'] },
  { id: 'npm-version', label: 'NPM Version', command: 'npm -v', session: 'main', description: 'Prints active npm version.', tags: ['npm', 'runtime'] },
  { id: 'python-version', label: 'Python Version', command: 'python --version', session: 'main', description: 'Prints active Python version.', tags: ['python', 'runtime'] },
  { id: 'flutter-doctor', label: 'Flutter Doctor Health Check', command: 'flutter doctor', session: 'main', description: 'Reaches out to the OS, executes the native Flutter binary, and streams the full diagnostic report of your iOS/Android/Web dev environment directly back into your browser terminal, daemons, and Evo LLM.', tags: ['flutter', 'mobile', 'doctor', 'ai'] },
  { id: 'bond-omni', label: 'Omni-Bond (Global IDE Fusion)', command: 'evo bond omni', session: 'main', description: 'Fuses all IDE tethers simultaneously. Injects Evo Studio constraints globally for Cursor, Windsurf, VS Code, WebStorm, Zed, Codex, and Antigravity in one massive strike.', tags: ['ide', 'omni', 'bond', 'global', 'all'] },
  { id: 'bond-vscode', label: 'Bond IDE: VS Code', command: 'evo bond vscode', session: 'main', description: 'Acts as the physical hookup/handshake. Executes the VS Code binary hook on your host machine, instantly ripping open the Evo Studio Studio workspace inside native Visual Studio Code.', tags: ['ide', 'vscode', 'bond', 'handshake'] },
  { id: 'bond-cursor', label: 'Bond IDE: Cursor AI', command: 'evo bond cursor', session: 'main', description: 'Bonds the workspace to Cursor. Injects Evo Studio Copilot instructions into .cursorrules before hooking the physical IDE.', tags: ['ide', 'cursor', 'bond', 'ai'] },
  { id: 'bond-windsurf', label: 'Bond IDE: Windsurf', command: 'evo bond windsurf', session: 'main', description: 'Bonds the workspace to Windsurf. Injects Evo Studio Cascade instructions into .windsurfrules before hooking the physical IDE.', tags: ['ide', 'windsurf', 'bond', 'ai'] },
  { id: 'bond-webstorm', label: 'Bond IDE: WebStorm', command: 'evo bond webstorm', session: 'main', description: 'Bonds the workspace to JetBrains WebStorm. Establishes AI Assistant project constraints before hooking the physical IDE.', tags: ['ide', 'webstorm', 'jetbrains', 'bond'] },
  { id: 'bond-zed', label: 'Bond IDE: Zed', command: 'evo bond zed', session: 'main', description: 'Bonds the workspace to Zed. Injects native settings and tethers the built-in AI before hooking the physical IDE.', tags: ['ide', 'zed', 'bond', 'ai'] },
  { id: 'bond-codex', label: 'Bond IDE: Codex', command: 'evo bond codex', session: 'main', description: 'Bonds the workspace to OpenAI Codex. Injects the Evo Studio Lore into .codex/manifest.json before hooking.', tags: ['ide', 'codex', 'bond', 'ai', 'openai'] },
  { id: 'bond-antigravity', label: 'Bond IDE: Antigravity', command: 'evo bond antigravity', session: 'main', description: 'Bonds the workspace to the native Antigravity IDE. Injects core memory directives into the Antigravity neural subsystem.', tags: ['ide', 'antigravity', 'bond', 'ai'] },
  { id: 'evo-repair', label: 'Evo Code Repair', command: 'evo repair', session: 'main', description: 'Triggers autonomous AI repair on a specific file.', tags: ['repair', 'fix', 'ai'] },
  { id: 'evo-doctor', label: 'Evo Studio Doctor', command: 'evo doctor', session: 'main', description: 'Diagnoses studio systems and background daemons.', tags: ['doctor', 'health', 'system'] },
  { id: 'pwd', label: 'Working Directory', command: 'pwd', session: 'main', description: 'Shows current workspace path.', tags: ['path', 'workspace'] },
  { id: 'files', label: 'List Workspace Files', command: 'Get-ChildItem', session: 'main', description: 'Lists files and folders in current directory.', tags: ['files', 'inspect'] },
  { id: 'clear', label: 'Clear Terminal', command: 'clear', session: 'main', description: 'Clears terminal output logs.', tags: ['clear', 'cls', 'clean'] },
  { id: 'launch-studio', label: 'Launch Studio God Mode', command: 'npm run launch:studio', session: 'watch', description: 'Boots frontend, bridge, daemons, and watchdogs concurrently.', tags: ['launch', 'studio', 'godmode'] },
  { id: 'desktop', label: 'Desktop Mode', command: 'npm run desktop', session: 'watch', description: 'Boots the studio natively as an Electron Desktop application.', tags: ['desktop', 'electron'] },
  { id: 'daemons-all', label: 'Boot All Daemons', command: 'npm run daemons:all', session: 'watch', description: 'Boots just the background AI engine daemons without UI shell.', tags: ['daemons', 'ai', 'background'] },
  { id: 'self-evolve', label: 'Self Evolve', command: 'npm run self:evolve', session: 'main', description: 'Triggers the autonomous self-evolution cycle.', tags: ['evolve', 'ai', 'autonomous'] },
  { id: 'self-invent', label: 'Self Invent', command: 'npm run self:invent', session: 'main', description: 'Triggers the self-invention daemon.', tags: ['invent', 'ai', 'architecture'] },
  { id: 'evolve-propose', label: 'Evolve Propose', command: 'npm run evolve:propose', session: 'main', description: 'Generates a proposal for the next evolution step.', tags: ['evolve', 'propose'] },
  { id: 'evolve-sandbox', label: 'Evolve Sandbox', command: 'npm run evolve:sandbox', session: 'main', description: 'Sandboxes and tests a proposed evolution patch.', tags: ['evolve', 'sandbox', 'test'] },
  { id: 'reality-audit', label: 'Reality Audit', command: 'npm run reality:audit', session: 'security', description: 'The Nuclear Master Reality Audit.', tags: ['audit', 'reality', 'nuclear'] },
  { id: 'platform-ready', label: 'Platform Ready Check', command: 'npm run platform:ready', session: 'security', description: 'Strict platform compliance check and release receipt.', tags: ['platform', 'ready', 'release'] },
  { id: 'audit-dead-surfaces', label: 'Audit Dead Surfaces', command: 'npm run audit:dead-surfaces', session: 'security', description: 'Scans live UI code for inert buttons or disconnected links.', tags: ['audit', 'dead', 'ui'] },
  { id: 'cost', label: 'Cost Firewall', command: 'npm run cost', session: 'main', description: 'Triggers Cost Firewall v2 summary.', tags: ['cost', 'metrics', 'firewall'] },
  { id: 'maturity-check', label: 'Maturity Check', command: 'npm run maturity:check', session: 'main', description: 'Evaluates studio maturity score.', tags: ['maturity', 'score', 'iq'] },
  { id: 'layer-ops', label: 'Layer Ops', command: 'npm run layer:ops', session: 'main', description: 'Verifies health of SQLite and vector memories.', tags: ['layer', 'ops', 'database'] },
  { id: 'egit-status', label: 'E-Git Status', command: 'npm run egit:status', session: 'main', description: 'Hooks into evolutionary git manager to check file states.', tags: ['egit', 'git', 'status'] }
];

// ═══════════════════════════════════════════════════════════════════════════
// EVOSHELL PULSATING BORDER + HOLOGRAPHIC LAYER STYLES
// ═══════════════════════════════════════════════════════════════════════════
const shellStyles = `
@keyframes evoShellBorderPulse {
  0%   { border-color: rgba(99,102,241,0.8); box-shadow: 0 0 10px rgba(99,102,241,0.4), inset 0 0 10px rgba(99,102,241,0.2); }
  25%  { border-color: rgba(0,240,255,1);    box-shadow: 0 0 15px rgba(0,240,255,0.6),  inset 0 0 15px rgba(0,240,255,0.3); }
  50%  { border-color: rgba(236,72,153,0.9); box-shadow: 0 0 20px rgba(236,72,153,0.5), inset 0 0 20px rgba(236,72,153,0.3); }
  75%  { border-color: rgba(16,185,129,0.8); box-shadow: 0 0 15px rgba(16,185,129,0.5), inset 0 0 15px rgba(16,185,129,0.3); }
  100% { border-color: rgba(99,102,241,0.8); box-shadow: 0 0 10px rgba(99,102,241,0.4), inset 0 0 10px rgba(99,102,241,0.2); }
}

@keyframes evoTitleShimmer {
  0%   { background-position: -200% center; text-shadow: 0 0 10px rgba(0,240,255,0.3); }
  50%  { text-shadow: 0 0 20px rgba(236,72,153,0.6); }
  100% { background-position: 200% center; text-shadow: 0 0 10px rgba(0,240,255,0.3); }
}

@keyframes evoPulseOrb {
  0%, 100% { opacity: 0.5; transform: scale(1); filter: blur(20px); }
  50%      { opacity: 1;   transform: scale(1.5); filter: blur(30px); }
}

@keyframes evoScanLine {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 0.5; }
  90%  { opacity: 0.5; }
  100% { transform: translateY(100vh); opacity: 0; }
}

.evo-shell-container {
  border: 1px solid rgba(0,240,255,0.8);
  animation: evoShellBorderPulse 4s ease-in-out infinite;
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
}

.evo-shell-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
  background: linear-gradient(180deg, rgba(0,240,255,0.05) 0%, transparent 40%, transparent 60%, rgba(236,72,153,0.05) 100%);
}

.evo-shell-title {
  background: linear-gradient(90deg, #818cf8, #00f0ff, #ec4899, #10b981, #818cf8);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: evoTitleShimmer 4s linear infinite;
}

.evo-pulse-orb {
  animation: evoPulseOrb 2s ease-in-out infinite;
}

.evo-scan-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.evo-scan-overlay::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(0,240,255,0.1), transparent);
  animation: evoScanLine 8s linear infinite;
}

.evo-stat-badge {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 2px 8px;
  transition: all 0.2s;
}
.evo-stat-badge:hover {
  background: rgba(99,102,241,0.08);
  border-color: rgba(99,102,241,0.25);
}

.evo-cmd-card {
  background: rgba(5,5,12,0.6);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.evo-cmd-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, rgba(99,102,241,0.5), rgba(0,240,255,0.3));
  opacity: 0;
  transition: opacity 0.2s;
}
.evo-cmd-card:hover {
  background: rgba(99,102,241,0.06);
  border-color: rgba(99,102,241,0.3);
  transform: translateX(2px);
}
.evo-cmd-card:hover::before {
  opacity: 1;
}

.evo-input-glow:focus-within {
  box-shadow: 0 0 0 1px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.08);
}

.evo-log-entry {
  padding: 3px 0;
  border-left: 2px solid transparent;
  padding-left: 8px;
  transition: border-color 0.15s;
}
.evo-log-entry:hover {
  border-left-color: rgba(99,102,241,0.3);
}
`;

export function Terminal() {
  const { 
    terminalOpen, 
    setTerminalOpen, 
    terminalSessions, 
    activeTerminalSession,
    setActiveTerminalSession,
    addTerminalLog, 
    clearTerminal,
    terminalTheme,
    setTerminalTheme,
    terminalHistory,
    addTerminalHistory,
    addBondedNode,
    bondedNodes,
    metrics
  } = useSovereignStore();

  const [command, setCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [catalogFilter, setCatalogFilter] = useState('');
  const [sessionCwds, setSessionCwds] = useState({});
  const scrollRef = useRef(null);

  const logs = terminalSessions[activeTerminalSession] || [];
  const normalizedFilter = catalogFilter.trim().toLowerCase();
  const filteredCommands = COMMAND_CATALOG.filter((item) => {
    if (!normalizedFilter) return true;
    const searchText = `${item.label} ${item.command} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
    return searchText.includes(normalizedFilter);
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, terminalOpen]);

  const runCommandText = async (cmdText, session = activeTerminalSession) => {
    if (!cmdText || executing) return;
    setExecuting(true);
    addTerminalLog(`$ ${cmdText}`, 'command', session);
    addTerminalHistory(cmdText);

    try {
      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'Terminal',
          action: 'run',
          payload: { command: cmdText, session }
        }),
      });
      const data = await res.json();
      if (data.success) {
        const result = data.result || {};
        addTerminalLog(result.output || 'EvoShell: Completed.', 'success', session, result.signature, result.duration);
        if (result.node) addBondedNode(result.node);
        if (result.cwd) setSessionCwds(prev => ({ ...prev, [session]: result.cwd }));
      } else {
        addTerminalLog(data.error || 'EvoShell: Failed.', 'error', session);
      }
    } catch (err) {
      addTerminalLog(`System Error: ${err.message}`, 'error', session);
    } finally {
      setExecuting(false);
    }
  };

  const handleRunCommand = async (e) => {
    e?.preventDefault();
    if (!command.trim() || executing) return;
    const cmdText = command.trim();
    
    if (cmdText.toLowerCase() === 'clear' || cmdText.toLowerCase() === 'cls') {
      clearTerminal(activeTerminalSession);
      setCommand('');
      setHistoryIndex(-1);
      return;
    }

    setCommand('');
    setHistoryIndex(-1);
    await runCommandText(cmdText, activeTerminalSession);
  };

  const runCatalogCommand = async (item) => {
    if (executing) return;
    if (item.session && item.session !== activeTerminalSession) {
      setActiveTerminalSession(item.session);
    }
    setCommand(item.command);
    setHistoryIndex(-1);
    await runCommandText(item.command, item.session || activeTerminalSession);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < terminalHistory.length) {
        setHistoryIndex(nextIndex);
        setCommand(terminalHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setCommand(terminalHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const copyToClipboard = () => {
    const text = logs.map(l => l.content).join('\n');
    navigator.clipboard.writeText(text);
    addTerminalLog('System: Terminal output copied to clipboard.', 'system', activeTerminalSession);
  };

  const downloadLogs = () => {
    const text = logs.map(l => l.content).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evoshell_log_${activeTerminalSession}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MINIMIZED BAR — pulsating collapsed state
  // ═══════════════════════════════════════════════════════════════════════
  if (!terminalOpen) return (
    <>
      <style>{shellStyles}</style>
      <button 
        onClick={() => setTerminalOpen(true)}
        className="evo-shell-container h-10 w-full flex items-center px-6 z-30 shrink-0 group"
        style={{ background: 'linear-gradient(90deg, rgba(5,5,8,0.95), rgba(10,10,20,0.95))' }}
      >
        <div className="evo-pulse-orb w-2 h-2 rounded-full mr-3" style={{ background: '#6366f1' }} />
        <TerminalIcon size={14} style={{ color: '#818cf8', marginRight: 8 }} />
        <span className="evo-shell-title" style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          EvoShell Master Control
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Radio size={10} style={{ color: '#10b981' }} />
          <span style={{ fontSize: 8, color: '#475569', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>STANDBY</span>
        </span>
        <ChevronUp size={14} style={{ color: '#475569', marginLeft: 12 }} />
      </button>
    </>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // FULL TERMINAL — pulsating border, layered glow, holographic title
  // ═══════════════════════════════════════════════════════════════════════
  const themeColors = {
    evo:     { accent: '#818cf8', accentDim: 'rgba(99,102,241,0.1)',  logBg: 'rgba(5,5,12,0.85)' },
    matrix:  { accent: '#34d399', accentDim: 'rgba(52,211,153,0.08)', logBg: 'rgba(0,0,0,0.9)' },
    classic: { accent: '#94a3b8', accentDim: 'rgba(148,163,184,0.06)', logBg: 'rgba(30,30,30,0.9)' }
  };
  const tc = themeColors[terminalTheme] || themeColors.evo;

  return (
    <>
      <style>{shellStyles}</style>
      <div 
        className={`evo-shell-container w-full ${isFullscreen ? 'flex-1' : ''} flex flex-col z-40 shrink-0 relative overflow-hidden`}
        style={{ 
          background: 'linear-gradient(180deg, rgba(5,5,12,0.98), rgba(2,2,8,0.99))',
          minHeight: isFullscreen ? undefined : 340,
          height: isFullscreen ? undefined : 340,
          borderRadius: 0
        }}
      >
        {/* Scan Line Overlay */}
        <div className="evo-scan-overlay" />

        {/* ══ MASTER HEADER ══ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px',
          background: 'linear-gradient(90deg, rgba(99,102,241,0.04), rgba(0,240,255,0.02), transparent)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Left: Title + Sessions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="evo-pulse-orb" style={{ width: 6, height: 6, borderRadius: '50%', background: tc.accent }} />
              <Cpu size={14} style={{ color: tc.accent }} />
              <span className="evo-shell-title" style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                EvoShell Master Control
              </span>
              <span style={{ fontSize: 7, color: '#334155', fontWeight: 800, letterSpacing: '0.15em', marginLeft: 4 }}>v4.0</span>
            </div>
            
            {/* Session Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(0,0,0,0.4)', padding: 3, borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
              {Object.keys(terminalSessions).map((session) => (
                <button
                  key={session}
                  onClick={() => setActiveTerminalSession(session)}
                  style={{
                    padding: '4px 10px', borderRadius: 4, fontSize: 8, fontWeight: 800,
                    letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeTerminalSession === session ? tc.accent : 'transparent',
                    color: activeTerminalSession === session ? '#000' : '#475569',
                    boxShadow: activeTerminalSession === session ? `0 0 12px ${tc.accent}40` : 'none'
                  }}
                >
                  {session}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Theme + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Theme Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { id: 'evo', color: '#818cf8' },
                { id: 'matrix', color: '#34d399' },
                { id: 'classic', color: '#64748b' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTerminalTheme(t.id)}
                  style={{
                    width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: t.color,
                    opacity: terminalTheme === t.id ? 1 : 0.3,
                    boxShadow: terminalTheme === t.id ? `0 0 8px ${t.color}` : 'none',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.06)' }} />

            {/* Action Buttons */}
            {[
              { icon: Copy, title: 'Copy Output', onClick: copyToClipboard },
              { icon: Download, title: 'Download Logs', onClick: downloadLogs },
              { icon: Trash2, title: 'Clear Session', onClick: () => clearTerminal(activeTerminalSession), hoverColor: '#f43f5e' },
              { icon: isFullscreen ? Minimize2 : Maximize2, title: 'Fullscreen', onClick: () => setIsFullscreen(!isFullscreen) },
              { icon: ChevronDown, title: 'Minimize', onClick: () => setTerminalOpen(false) }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                title={btn.title}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', transition: 'color 0.15s', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = btn.hoverColor || tc.accent}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                <btn.icon size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* ══ STATS BAR ══ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '4px 20px',
          background: 'rgba(0,0,0,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.03)'
        }}>
          {[
            { icon: Activity, color: '#818cf8', label: 'Latency', value: metrics?.latency ? `${parseFloat(metrics.latency).toFixed(0)}ms` : '4ms' },
            { icon: Shield, color: '#10b981', label: 'Bonding', value: bondedNodes.length > 0 ? `${bondedNodes.length} Nodes` : 'Standalone' },
            { icon: Zap, color: '#f59e0b', label: 'Power', value: metrics ? 'Optimal' : 'Standby' },
            { icon: Layers, color: '#818cf8', label: 'Session', value: activeTerminalSession.toUpperCase() },
            { icon: Radio, color: '#10b981', label: 'Bridge', value: 'Connected' }
          ].map((stat, i) => (
            <div key={i} className="evo-stat-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <stat.icon size={9} style={{ color: stat.color }} />
              <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>
                {stat.label}:
              </span>
              <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* ══ COMMAND DECK ══ */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setCatalogOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                borderRadius: 6, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                border: `1px solid ${tc.accent}30`, color: tc.accent, background: 'transparent', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${tc.accent}15`; e.currentTarget.style.borderColor = `${tc.accent}60`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${tc.accent}30`; }}
            >
              <Command size={11} />
              Command Deck {filteredCommands.length}/{COMMAND_CATALOG.length}
              {catalogOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
              <Search size={11} style={{ color: '#334155' }} />
              <input
                type="text"
                value={catalogFilter}
                onChange={e => setCatalogFilter(e.target.value)}
                placeholder="Filter commands..."
                aria-label="Filter command catalog"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 10, color: '#cbd5e1', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {catalogOpen && (
            <div style={{ padding: '0 20px 10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
              {filteredCommands.map(item => (
                <button
                  key={item.id}
                  onClick={() => runCatalogCommand(item)}
                  disabled={executing}
                  className="evo-cmd-card"
                  style={executing ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, color: tc.accent, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{item.label}</span>
                    <span style={{ fontSize: 7, color: '#334155', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{item.session}</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 9, color: '#475569', lineHeight: 1.3 }}>{item.description}</div>
                  <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 9, color: '#34d399', opacity: 0.8 }}>{item.command}</div>
                </button>
              ))}
              {filteredCommands.length === 0 && (
                <div style={{ gridColumn: '1/-1', fontSize: 10, color: '#334155', padding: '12px 0' }}>No commands match this filter.</div>
              )}
            </div>
          )}
        </div>

        {/* ══ TERMINAL OUTPUT ══ */}
        <div 
          ref={scrollRef}
          style={{
            flex: 1, overflowY: 'auto', padding: '12px 20px',
            fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
            fontSize: 11, background: tc.logBg
          }}
        >
          {logs.map((log) => (
            <div key={log.id} className="evo-log-entry" style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', gap: 12, lineHeight: 1.6 }}>
                <span style={{ color: '#1e293b', fontSize: 8, marginTop: 3, flexShrink: 0, userSelect: 'none', fontWeight: 700 }}>
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span style={{
                  wordBreak: 'break-all', whiteSpace: 'pre-wrap', flex: 1,
                  color: log.type === 'command' ? '#e2e8f0' :
                         log.type === 'error' ? '#fb7185' :
                         log.type === 'success' ? '#34d399' :
                         log.type === 'system' ? tc.accent : '#94a3b8',
                  fontWeight: log.type === 'command' ? 700 : log.type === 'system' ? 800 : 400,
                  textShadow: log.type === 'error' ? '0 0 8px rgba(251,113,133,0.3)' :
                              log.type === 'success' ? '0 0 8px rgba(52,211,153,0.2)' : 'none'
                }}>
                  {log.content}
                </span>
              </div>
              {log.signature && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 44, marginTop: 2, fontSize: 7, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(99,102,241,0.4)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={7} /> TRUTH_SIG: {log.signature}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={7} /> LATENCY: {log.duration}ms</span>
                  <span style={{ color: 'rgba(16,185,129,0.4)' }}>[REALITY_SIGNED]</span>
                </div>
              )}
            </div>
          ))}
          {executing && (
            <div style={{ display: 'flex', gap: 12, padding: '4px 0' }}>
              <span style={{ color: '#1e293b', fontSize: 8, marginTop: 3, fontWeight: 700 }}>[......]</span>
              <span style={{ color: tc.accent, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <div className="evo-pulse-orb" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f0ff' }} />
                ANCHORING_REALITY...
              </span>
            </div>
          )}
        </div>

        {/* ══ INPUT BAR ══ */}
        <form 
          onSubmit={handleRunCommand}
          className="evo-input-glow"
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
            background: 'linear-gradient(90deg, rgba(99,102,241,0.03), transparent)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ color: '#10b981', fontWeight: 900, fontSize: 11 }}>PS</span>
            <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 10, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={sessionCwds[activeTerminalSession] || 'C:\\PH\\Evo\\Studio'}>
              {sessionCwds[activeTerminalSession] || 'C:\\PH\\Evo\\Studio'}
            </span>
            <span className="evo-shell-title" style={{ fontWeight: 900, fontSize: 12, letterSpacing: '-0.5px' }}>❯❯❯</span>
          </div>
          <input 
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={executing}
            aria-label="Terminal command input"
            placeholder="Enter command..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e2e8f0', fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: 12
            }}
            autoFocus
          />
          {command.trim() && (
            <button 
              type="submit" 
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer',
                color: tc.accent, transition: 'all 0.15s', display: 'flex'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = tc.accent; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Play size={16} fill="currentColor" />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, opacity: 0.3, transition: 'opacity 0.2s' }}>
            <History size={13} style={{ color: '#475569' }} />
            <Settings size={13} style={{ color: '#475569' }} />
          </div>
        </form>
      </div>
    </>
  );
}
