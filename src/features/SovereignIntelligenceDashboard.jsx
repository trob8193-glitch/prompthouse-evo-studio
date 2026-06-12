import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Clock, Zap, MessageSquare, ArrowRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { motion } from 'framer-motion';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * PH EVO STUDIO — DASHBOARD (ENTERPRISE GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Live metrics from backend, bridge health, quick actions.
 */

function MetricCard({ icon: Icon, label, value, sub, color = '#00f0ff', pulse = false }) {
  return (
    <div style={{
      background: 'rgba(5,5,8,0.8)', border: `1px solid ${color}30`, borderRadius: 20, padding: '22px 26px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      boxShadow: `0 0 30px ${color}10`,
      transition: 'all 0.4s cubic-bezier(0.2,0.8,0.2,1)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 40px ${color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.boxShadow = `0 0 30px ${color}10`; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        position: 'absolute', top: -50, left: -50, width: 100, height: 100, background: color, filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none'
      }} />
      <div style={{
        width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}15`, border: `1px solid ${color}40`, flexShrink: 0,
        boxShadow: `0 0 20px ${color}30`,
      }}>
        <Icon size={20} color={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: color, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8, opacity: 0.9 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1, textShadow: `0 0 20px ${color}50` }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: '#b4b4c4', marginTop: 8, fontWeight: 600, letterSpacing: '0.02em' }}>{sub}</div>}
      </div>
      {pulse && <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`, animation: 'pulse 1.5s infinite', marginTop: 4 }} />}
    </div>
  );
}

function QuickAction({ icon: Icon, label, sub, onClick, color = '#8a2be2' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(5,5,8,0.8)', border: `1px solid ${color}30`, borderRadius: 20, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', width: '100%',
        transition: 'all 0.4s cubic-bezier(0.2,0.8,0.2,1)', textAlign: 'left',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        boxShadow: `0 0 20px ${color}05`,
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}15`; e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = `0 0 30px ${color}20`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.background = 'rgba(5,5,8,0.8)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = `0 0 20px ${color}05`; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}15`, border: `1px solid ${color}40`, flexShrink: 0,
        boxShadow: `0 0 15px ${color}30`,
      }}>
        <Icon size={18} color={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em', textShadow: `0 0 10px rgba(255,255,255,0.2)` }}>{label}</div>
        <div style={{ fontSize: 11, color: '#b4b4c4', marginTop: 4, fontWeight: 600, letterSpacing: '0.02em' }}>{sub}</div>
      </div>
      <ArrowRight size={16} color={color} style={{ opacity: 0.7 }} />
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
          style={{
            background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: 8, padding: '6px 12px',
            color: '#00f0ff', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6, cursor: refreshing ? 'wait' : 'pointer',
            transition: 'all 0.3s',
          }}
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh'}
        </button>
      }
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}
      >
        {/* Singularity Ambient Glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '120%', height: '120%', pointerEvents: 'none', opacity: 0.2, zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '25%', left: '25%', width: 500, height: 500, background: '#00f0ff', borderRadius: '50%', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
          <div style={{ position: 'absolute', top: '33%', right: '25%', width: 600, height: 600, background: '#8a2be2', borderRadius: '50%', filter: 'blur(180px)', mixBlendMode: 'screen' }} />
        </div>


      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
        <MetricCard
          icon={bridgeStatus === 'connected' ? Wifi : WifiOff}
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
          icon={RefreshCw}
          label="Evolution Cycles"
          value={bridgeData?.evolution_cycles || '0'}
          sub="Self-evolution passes"
          color="#6366f1"
        />
        <MetricCard
          icon={Activity}
          label="Evo Studio IQ"
          value={metrics?.logic?.iq ? metrics.logic.iq.toLocaleString() : '—'}
          sub={`Baseline: ${metrics?.logic?.total_lines || 0} LOC`}
          color="#10b981"
        />
      </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Evo Studio IQ', value: metrics?.logic?.iq ? metrics.logic.iq.toLocaleString() : 'N/A', trend: 'LIVE', icon: Zap, color: 'text-indigo-400' },
            { label: 'Logic Density', value: metrics?.logic?.density || 'N/A', trend: 'PHYSICAL', icon: Cpu, color: 'text-emerald-400' },
            { label: 'Sync Latency', value: metrics?.latency ? `${metrics.latency}ms` : '0ms', trend: 'ZERO-D', icon: Clock, color: 'text-amber-400' },
            { label: 'Foundry Load', value: metrics?.memory?.heapUsed ? (metrics.memory.heapUsed / 1024 / 1024).toFixed(1) + 'MB' : 'N/A', trend: 'STABLE', icon: Activity, color: 'text-rose-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-black/40 border border-slate-800 rounded-2xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                <stat.icon size={48} />
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{stat.label}</div>
              <div className="text-2xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-black uppercase">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* API Truth Status */}
        <div className="p-6 bg-black/40 border border-slate-800 rounded-3xl mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Evo Studio API Mesh</div>
            <button 
              onClick={() => useSovereignStore.getState().runTruthProbe()}
              className="text-[9px] text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300"
            >
              Run Truth Probe
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(bridgeData?.probes || { 
              openai: { status: 'UNKNOWN' }, 
              gemini: { status: 'UNKNOWN' }, 
              stripe: { status: 'UNKNOWN' } 
            }).map(([name, info]) => (
              <div key={name} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${info.status === 'VERIFIED' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : info.status === 'MISSING' ? 'bg-slate-600' : 'bg-rose-500'}`} />
                  <span className={`text-[9px] font-black uppercase ${info.status === 'VERIFIED' ? 'text-emerald-500' : info.status === 'MISSING' ? 'text-slate-600' : 'text-rose-500'}`}>
                    {info.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 28 }}>
        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Quick Actions
          </div>
          <QuickAction
            icon={MessageSquare}
            label="Open AI Chat"
            sub="Start a new production mission with your OpenAI API"
            onClick={() => setActivePage('chat')}
            color="#6366f1"
          />
          <QuickAction
            icon={Zap}
            label="Prompt Registry"
            sub="Browse and manage your prompt stacks"
            onClick={() => setActivePage('prompt-registry')}
            color="#f59e0b"
          />
          <QuickAction
            icon={RefreshCw}
            label="Run Maintenance Cycle"
            sub="Execute a full self-healing maintenance pass"
            onClick={runMaintenance}
            color="#10b981"
          />
          <QuickAction
            icon={Zap}
            label="Trigger Evolution Cycle"
            sub="Execute physical logic evolution & compaction"
            onClick={async () => {
              try {
                const res = await safeFetchBridge('/api/study/initiate', {
                  method: 'POST',
                  body: JSON.stringify({ protocolId: 'DREAM_CYCLE' })
                });
                
                if (!res.ok) throw new Error(res.error || 'Failed to initiate study');
                
                useSovereignStore.getState().addNotification(`Evolution Cycle Complete: ${res.data?.signature}`, 'success');
              } catch (err) {
                useSovereignStore.getState().addNotification(`Evolution Cycle Failed: ${err.message}`, 'error');
              }
            }}
            color="#6366f1"
          />
          <QuickAction
            icon={Activity}
            label="View Metrics"
            sub="Detailed performance monitoring dashboard"
            onClick={() => setActivePage('metrics')}
            color="#8b5cf6"
          />
        </div>

        {/* Recent Chat */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Recent Chat Activity
          </div>
          <div style={{
            background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 16,
            display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflow: 'auto',
          }}>
            {chatMessages.slice(-5).map((msg) => (
              <div key={msg.id} style={{
                padding: '10px 14px', borderRadius: 10,
                background: msg.role === 'user' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.15)' : '#1e293b'}`,
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: msg.role === 'user' ? '#818cf8' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                  {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'AI'}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: 60 }}>
                  {msg.content.slice(0, 200)}{msg.content.length > 200 ? '...' : ''}
                </div>
              </div>
            ))}
            <button
              onClick={() => setActivePage('chat')}
              style={{
                background: 'none', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 12px',
                color: '#6366f1', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              Open Full Chat <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
      </motion.div>
    </IDEPageLayout>
  );
}

export default SovereignIntelligenceDashboard;
