import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Clock, Zap, MessageSquare, ArrowRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { motion } from 'framer-motion';
import { BRIDGE_URL } from '../config/bridge-config.js';

/**
 * PH EVO STUDIO — DASHBOARD (ENTERPRISE GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Live metrics from backend, bridge health, and quick actions.
 */

function MetricCard({ icon: Icon, label, value, sub, color = 'var(--accent-indigo)', pulse = false }) {
  return (
    <div className="card" style={{
      padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 14,
      borderColor: `${color}22`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}16`, flexShrink: 0, border: `1px solid ${color}22`,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{sub}</div>}
      </div>
      {pulse && <div style={{
        width: 8, height: 8, borderRadius: '50%', background: color,
        boxShadow: `0 0 8px ${color}`, animation: 'pulse 2s infinite', marginTop: 4,
      }} />}
    </div>
  );
}

function QuickAction({ icon: Icon, label, sub, onClick, color = 'var(--accent-indigo)' }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="card"
      style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', width: '100%', textAlign: 'left', background: 'rgba(20,20,23,0.5)',
        borderColor: 'var(--border-dim)',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}14`, flexShrink: 0, border: `1px solid ${color}22`,
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{sub}</div>
      </div>
      <ArrowRight size={14} color="var(--text-muted)" />
    </motion.button>
  );
}

export function SovereignIntelligenceDashboard() {
  const metrics        = useSovereignStore((s) => s.metrics);
  const fetchMetrics   = useSovereignStore((s) => s.fetchMetrics);
  const bridgeStatus   = useSovereignStore((s) => s.bridgeStatus);
  const bridgeData     = useSovereignStore((s) => s.bridgeData);
  const setActivePage  = useSovereignStore((s) => s.setActivePage);
  const runMaintenance = useSovereignStore((s) => s.runMaintenance);
  const chatMessages   = useSovereignStore((s) => s.chatMessages);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
            Studio Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
            System overview, live metrics, and quick actions.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={13} style={{ transition: 'transform 0.6s', transform: refreshing ? 'rotate(360deg)' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <MetricCard
          icon={bridgeStatus === 'connected' ? Wifi : WifiOff}
          label="Bridge Status"
          value={bridgeStatus === 'connected' ? 'Online' : 'Offline'}
          sub={bridgeData?.version || 'Not connected'}
          color={bridgeStatus === 'connected' ? 'var(--accent-green)' : 'var(--accent-red)'}
          pulse={bridgeStatus === 'connected'}
        />
        <MetricCard icon={Clock} label="Uptime" value={formatUptime(metrics?.uptime)} sub="Server process" color="var(--accent-gold)" />
        <MetricCard
          icon={Cpu} label="CPU Usage"
          value={metrics?.cpu_usage?.user ? `${(metrics.cpu_usage.user / 1000000).toFixed(1)}s` : '—'}
          sub="User time" color="var(--accent-violet)"
        />
        <MetricCard
          icon={HardDrive} label="Heap Memory"
          value={metrics?.memory?.heapUsed ? `${(metrics.memory.heapUsed / 1024 / 1024).toFixed(1)} MB` : '—'}
          sub={metrics?.memory?.rss ? `RSS: ${(metrics.memory.rss / 1024 / 1024).toFixed(1)} MB` : ''}
          color="var(--accent-cyan)"
        />
        <MetricCard
          icon={Activity} label="Avg Latency"
          value={metrics?.latency ? `${parseFloat(metrics.latency).toFixed(1)}ms` : '—'}
          sub="Request average" color="var(--accent-pink)"
        />
        <MetricCard
          icon={Zap} label="Cache Hit Rate"
          value={metrics?.cache?.hitRate !== undefined ? `${metrics.cache.hitRate.toFixed(0)}%` : '—'}
          sub={metrics?.cache ? `${metrics.cache.hits} hits / ${metrics.cache.misses} misses` : ''}
          color="var(--accent-green)"
        />
        <MetricCard
          icon={RefreshCw} label="Evolution Cycles"
          value={bridgeData?.evolution_cycles || '0'} sub="Self-evolution passes"
          color="var(--accent-indigo)"
        />
        <MetricCard
          icon={Activity} label="Sovereign IQ"
          value={metrics?.logic?.iq ? metrics.logic.iq.toLocaleString() : '—'}
          sub={`Baseline: ${metrics?.logic?.total_lines || 0} LOC`}
          color="var(--accent-green)"
        />
      </div>

      {/* Live Stats Tray */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Sovereign IQ',  value: metrics?.logic?.iq ? metrics.logic.iq.toLocaleString() : 'N/A', trend: 'LIVE',     color: 'var(--accent-indigo)' },
          { label: 'Logic Density', value: metrics?.logic?.density || 'N/A',                               trend: 'PHYSICAL',  color: 'var(--accent-green)'  },
          { label: 'Sync Latency',  value: metrics?.latency ? `${metrics.latency}ms` : '0ms',              trend: 'ZERO-D',    color: 'var(--accent-gold)'   },
          { label: 'Foundry Load',  value: metrics?.memory?.heapUsed ? (metrics.memory.heapUsed / 1024 / 1024).toFixed(1) + 'MB' : 'N/A', trend: 'STABLE', color: 'var(--accent-pink)' },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }} className="card" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden', borderColor: `${stat.color}18` }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.08, color: stat.color, fontSize: 48, lineHeight: 1 }}>●</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>{stat.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: stat.color, boxShadow: `0 0 6px ${stat.color}` }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: stat.color, textTransform: 'uppercase' }}>{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* API Truth Status */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sovereign API Mesh</div>
          <button
            onClick={() => useSovereignStore.getState().runTruthProbe?.()}
            style={{ fontSize: 9, color: 'var(--accent-indigo)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Run Truth Probe
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {Object.entries(bridgeData?.probes || { openai: { status: 'UNKNOWN' }, gemini: { status: 'UNKNOWN' }, stripe: { status: 'UNKNOWN' } }).map(([name, info]) => (
            <div key={name} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: info.status === 'VERIFIED' ? 'var(--accent-green)' : info.status === 'MISSING' ? 'var(--text-muted)' : 'var(--accent-red)', boxShadow: info.status === 'VERIFIED' ? '0 0 6px var(--accent-green)' : 'none' }} />
                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: info.status === 'VERIFIED' ? 'var(--accent-green)' : info.status === 'MISSING' ? 'var(--text-muted)' : 'var(--accent-red)' }}>{info.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Quick Actions</div>
          <QuickAction icon={MessageSquare} label="Open AI Chat" sub="Start a new production mission" onClick={() => setActivePage('chat')} color="var(--accent-indigo)" />
          <QuickAction icon={Zap} label="Prompt Registry" sub="Browse and manage your prompt stacks" onClick={() => setActivePage('prompt-registry')} color="var(--accent-gold)" />
          <QuickAction icon={RefreshCw} label="Run Maintenance Cycle" sub="Execute a full self-healing maintenance pass" onClick={runMaintenance} color="var(--accent-green)" />
          <QuickAction icon={Zap} label="Trigger Evolution Cycle" sub="Execute physical logic evolution & compaction"
            onClick={async () => {
              try {
                const res = await fetch(`${BRIDGE_URL}/api/study/initiate`, {
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
            color="var(--accent-violet)"
          />
          <QuickAction icon={Activity} label="View Metrics" sub="Detailed performance monitoring dashboard" onClick={() => setActivePage('metrics')} color="var(--accent-cyan)" />
        </div>

        {/* Recent Chat */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Recent Chat Activity</div>
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {chatMessages.slice(-5).length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No recent chat activity.</div>
            )}
            {chatMessages.slice(-5).map((msg) => (
              <div key={msg.id} style={{
                padding: '10px 14px', borderRadius: 10,
                background: msg.role === 'user' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.18)' : 'var(--border-dim)'}`,
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: msg.role === 'user' ? 'var(--accent-violet)' : 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'AI'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: 60 }}>
                  {msg.content.slice(0, 200)}{msg.content.length > 200 ? '...' : ''}
                </div>
              </div>
            ))}
            <button
              onClick={() => setActivePage('chat')}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 4, width: '100%', justifyContent: 'center' }}
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
