import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Clock, Zap, MessageSquare, ArrowRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { motion } from 'framer-motion';

/**
 * PH EVO STUDIO — DASHBOARD (ENTERPRISE GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Live metrics from backend, bridge health, quick actions.
 */

function MetricCard({ icon: Icon, label, value, sub, color = '#6366f1', pulse = false }) {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: '20px 24px',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}14`, flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{sub}</div>}
      </div>
      {pulse && <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}60`, animation: 'pulse 2s infinite', marginTop: 4 }} />}
    </div>
  );
}

function QuickAction({ icon: Icon, label, sub, onClick, color = '#6366f1' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', width: '100%',
        transition: 'all 0.2s ease', textAlign: 'left',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.background = `${color}08`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.background = '#111827'; }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}14`, flexShrink: 0,
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{label}</div>
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{sub}</div>
      </div>
      <ArrowRight size={14} color="#334155" />
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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }}>
            Studio Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            System overview, live metrics, and quick actions.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
            background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer',
            fontSize: 11, fontWeight: 600,
          }}
        >
          <RefreshCw size={13} style={{ transition: 'transform 0.6s', transform: refreshing ? 'rotate(360deg)' : 'none' }} />
          Refresh
        </button>
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
          label="Sovereign IQ"
          value={metrics?.logic?.iq ? metrics.logic.iq.toLocaleString() : '—'}
          sub={`Baseline: ${metrics?.logic?.total_lines || 0} LOC`}
          color="#10b981"
        />
      </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Sovereign IQ', value: metrics?.logic?.iq ? metrics.logic.iq.toLocaleString() : 'N/A', trend: 'LIVE', icon: Zap, color: 'text-indigo-400' },
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
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sovereign API Mesh</div>
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
                const res = await fetch('http://127.0.0.1:3001/api/study/initiate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ protocolId: 'DREAM_CYCLE' })
                });
                const data = await res.json();
                useSovereignStore.getState().addNotification(`Evolution Cycle Complete: ${data.signature}`, 'success');
                useSovereignStore.getState().fetchMetrics();
              } catch (err) {
                useSovereignStore.getState().addNotification(`Evolution Failed: ${err.message}`, 'error');
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
    </div>
  );
}

export default SovereignIntelligenceDashboard;
