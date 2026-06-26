import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Clock, Zap, MessageSquare, ArrowRight, RefreshCw, Wifi, Hexagon, Leaf, Sparkles, Cloud, MonitorPlay, Disc, Server, Radio, Database, Dna, Bot, Cog, Wrench, Compass, Flame, Square, Hash, AlignJustify, Maximize, Scan, Grid, Focus, Target, Star, Moon, Orbit, Circle, Sun, Wind, SunDim, Gamepad, Ghost, Coins, Sword } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { motion } from 'framer-motion';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';

function MetricCard({ icon: Icon, label, value, sub, color = '#00f0ff', pulse = false }) {
  return (
    <div 
      className="glass-extreme rounded-4xl border-cyan-500/20 p-6 flex-col items-start gap-4 transition-all duration-500 hover:border-cyan-400 hover:shadow-[0_0_50px_rgba(0,240,255,0.2)] hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden bg-black/40 backdrop-blur-3xl animate-gem-breath"
      style={{ '--glow-color': color }}
    >
      <div className="absolute -top-10 -left-10 w-32 h-32 blur-[60px] opacity-30 pointer-events-none" style={{ background: color }} />
      
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.1)] z-10" style={{ background: `${color}15` }}>
        <Icon size={24} color={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-90" style={{ color: color }}>
          {label}
        </div>
        <div className="text-3xl font-black text-white tracking-tighter leading-none mb-2" style={{ textShadow: `0 0 20px ${color}50` }}>
          {value}
        </div>
        {sub && <div className="text-xs text-slate-400 font-bold tracking-wider">{sub}</div>}
      </div>

      {pulse && <div className="absolute top-6 right-6 w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" style={{ background: color, color: color }} />}
    </div>
  );
}

function QuickAction({ icon: Icon, label, sub, onClick, color = '#8a2be2' }) {
  return (
    <button
      onClick={onClick}
      className="glass-extreme border-cyan-500/30 rounded-2xl p-5 flex items-center gap-4 cursor-pointer w-full text-left backdrop-blur-3xl transition-all duration-300 hover:border-cyan-400 hover:translate-x-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] group relative overflow-hidden animate-gem-breath"
    >
      <div className="w-10 h-10 rounded-3xl flex items-center justify-center border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.05)] z-10" style={{ background: `${color}15` }}>
        <Icon size={18} color={color} />
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <div className="text-sm font-black text-white tracking-wider group-hover:text-cyan-300 transition-colors">{label}</div>
        <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{sub}</div>
      </div>
      <ArrowRight size={16} color={color} className="opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

export function SovereignIntelligenceDashboard() {
  const metrics = useSovereignStore((s) => s.metrics);
  const fetchMetrics = useSovereignStore((s) => s.fetchMetrics);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const bridgeData = useSovereignStore((s) => s.bridgeData);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const runMaintenance = useSovereignStore((s) => s.runMaintenance);
  const chatMessages = useSovereignStore((s) => s.chatMessages);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setTimeout(() => setRefreshing(false), 600);
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <IDEPageLayout
      title="Studio Command Center"
      description="System overview, live metrics, and quick actions"
      actions={
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="glass-extreme px-4 py-2 rounded-3xl border-cyan-500/30 text-neon-cyan text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500/10 transition-all hover:scale-105"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh'}
        </button>
      }
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 gap-8 relative z-10"
      >
        {/* Asymmetrical Bento Box Grid for Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2 [&>*:nth-child(1)]:row-span-2 [&>*:nth-child(4)]:col-span-1 lg:[&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:row-span-2">
          <MetricCard
            icon={Wifi}
            label="Bridge Status"
            value={bridgeStatus === 'connected' ? 'Online' : 'Offline'}
            sub={bridgeData?.version || 'Not connected'}
            color={bridgeStatus === 'connected' ? '#22c55e' : '#ef4444'}
            pulse={bridgeStatus === 'connected'}
          />
          <MetricCard
            icon={Clock}
            label="Uptime"
            value={formatUptime(metrics?.uptime)}
            sub="Server process"
            color="#f59e0b"
          />
          <MetricCard
            icon={Cpu}
            label="CPU Usage"
            value={metrics?.cpu_usage?.user ? `${(metrics.cpu_usage.user / 1000000).toFixed(1)}s` : '—'}
            sub="User time"
            color="#8b5cf6"
          />
          <MetricCard
            icon={HardDrive}
            label="Heap Memory"
            value={metrics?.memory?.heapUsed ? `${(metrics.memory.heapUsed / 1024 / 1024).toFixed(1)} MB` : '—'}
            sub={metrics?.memory?.rss ? `RSS: ${(metrics.memory.rss / 1024 / 1024).toFixed(1)} MB` : ''}
            color="#06b6d4"
          />
          <MetricCard
            icon={Activity}
            label="Avg Latency"
            value={metrics?.latency ? `${parseFloat(metrics.latency).toFixed(1)}ms` : '—'}
            sub="Request average"
            color="#f43f5e"
          />
          <MetricCard
            icon={Zap}
            label="Cache Hit Rate"
            value={metrics?.cache?.hitRate !== undefined ? `${metrics.cache.hitRate.toFixed(0)}%` : '—'}
            sub={metrics?.cache ? `${metrics.cache.hits} hits / ${metrics.cache.misses} misses` : ''}
            color="#10b981"
          />
          <MetricCard
            icon={Bot}
            label="Swarm Fleet"
            value={metrics?.swarm_size || bridgeData?.swarm?.active_nodes || 0}
            sub="Live Agent Nodes"
            color="#6366f1"
          />
        </div>

        {/* API Truth Status Bento Block */}
        <div className="glass-extreme border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.05)] rounded-4xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs text-cyan-500/70 font-black uppercase tracking-widest">Evo Studio API Mesh</div>
            <button 
              onClick={() => useSovereignStore.getState().runTruthProbe()}
              className="text-[10px] text-neon-cyan font-black uppercase tracking-widest hover:text-indigo-300 transition-colors"
            >
              Run Truth Probe
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(bridgeData?.probes || { 
              openai: { status: 'UNKNOWN' }, 
              gemini: { status: 'UNKNOWN' }, 
              stripe: { status: 'UNKNOWN' } 
            }).map(([name, info]) => (
              <div key={name} className="p-4 glass-extreme border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-2xl flex items-center justify-between group hover:border-cyan-400 transition-all">
                <span className="text-xs text-slate-300 font-black uppercase tracking-wider">{name}</span>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${info.status === 'VERIFIED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : info.status === 'MISSING' ? 'bg-slate-600' : 'bg-rose-500 shadow-[0_0_10px_#ef4444]'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${info.status === 'VERIFIED' ? 'text-emerald-500' : info.status === 'MISSING' ? 'text-slate-600' : 'text-rose-500'}`}>
                    {info.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Foundry Mastery Roadmap */}
        <div className="glass-extreme border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.05)] rounded-4xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs text-cyan-500/70 font-black uppercase tracking-widest">Foundry Mastery Roadmap</div>
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">Phase 6 Active: Sovereignty</div>
          </div>
          
          <div className="flex flex flex-col gap-4 md:flex-row gap-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-black/40 backdrop-blur-md border border-white/5/50 -translate-y-1/2 hidden md:block rounded-full" />
            
            {[
              { phase: 1, name: 'Handshake', status: 'COMPLETED', icon: Wifi },
              { phase: 2, name: 'Seeding', status: 'COMPLETED', icon: Database },
              { phase: 3, name: 'Engineering', status: 'COMPLETED', icon: Wrench },
              { phase: 4, name: 'Registry', status: 'COMPLETED', icon: Server },
              { phase: 5, name: 'Evolution', status: 'COMPLETED', icon: Dna },
              { phase: 6, name: 'Sovereignty', status: 'ACTIVE', icon: Sparkles }
            ].map((step, i) => (
              <div key={step.phase} className="flex-1 relative z-10">
                <div className={`p-4 rounded-2xl border backdrop-blur-xl transition-all ${step.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : step.status === 'ACTIVE' ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.2)] scale-105' : 'bg-black/40 border-white/5 opacity-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-3xl flex items-center justify-center ${step.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : step.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-white/5 text-slate-400'}`}>
                      <step.icon size={14} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Phase {step.phase}</div>
                      <div className={`text-sm font-black tracking-wider ${step.status === 'COMPLETED' ? 'text-emerald-300' : step.status === 'ACTIVE' ? 'text-cyan-300' : 'text-slate-300'}`}>{step.name}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: step.status === 'COMPLETED' ? '#10b981' : step.status === 'ACTIVE' ? '#00f0ff' : '#64748b' }}>
                    {step.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action and Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4 gap-4">
            <div className="text-[10px] font-black text-cyan-500/70 uppercase tracking-widest mb-2 pl-2">Quick Actions</div>
            <QuickAction icon={MessageSquare} label="Open AI Chat" sub="Start a new production mission" onClick={() => setActivePage('chat')} color="#6366f1" />
            <QuickAction icon={Zap} label="Prompt Registry" sub="Browse and manage your prompt stacks" onClick={() => setActivePage('prompt-registry')} color="#f59e0b" />
            <QuickAction icon={RefreshCw} label="Run Maintenance Cycle" sub="Execute a full self-healing pass" onClick={runMaintenance} color="#10b981" />
            <QuickAction icon={Activity} label="View Metrics" sub="Detailed performance dashboard" onClick={() => setActivePage('metrics')} color="#8b5cf6" />
          </div>

          <div>
            <div className="text-[10px] font-black text-cyan-500/70 uppercase tracking-widest mb-4 pl-2">Recent Chat Activity</div>
            <div className="glass-extreme border-cyan-500/30 rounded-4xl p-6 flex-col gap-4 max-h-[400px] overflow-auto custom-scrollbar">
              {chatMessages.slice(-5).map((msg) => (
                <div key={msg.id} className="p-4 rounded-3xl border-cyan-500/10 bg-black/40">
                  <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: msg.role === 'user' ? '#00f0ff' : '#8b5cf6' }}>
                    {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'AI'}
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap truncate max-h-[60px]">
                    {msg.content}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setActivePage('chat')}
                className="mt-2 glass-extreme px-4 py-3 rounded-3xl border-indigo-500/30 text-neon-cyan text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-indigo-400 transition-all hover:bg-indigo-500/10"
              >
                Open Full Chat <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </IDEPageLayout>
  );
}

export default SovereignIntelligenceDashboard;
