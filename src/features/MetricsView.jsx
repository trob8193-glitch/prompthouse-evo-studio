import React, { useEffect } from 'react';
import { Activity, Cpu, HardDrive, Clock, Zap, RefreshCw, TrendingUp } from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — METRICS VIEW (ENTERPRISE GRADE)
 * Full-page live performance dashboard.
 */

export default function MetricsView() {
  const metrics      = useSovereignStore((s) => s.metrics) || {};
  const fetchMetrics = useSovereignStore((s) => s.fetchMetrics);
  const [omega, setOmega] = React.useState(null);

  const { cpu_usage: cpu = {}, memory: mem = {} } = metrics;

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const fmt = (v, suffix = '') => v != null ? `${typeof v === 'number' ? v.toFixed(1) : v}${suffix}` : '—';

  const Card = ({ icon: Icon, title, color, children }) => (
    <div className="card" style={{ padding: 20, borderColor: `${color}18` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}14`, border: `1px solid ${color}22` }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {children}
    </div>
  );

  const Stat = ({ label, value, color = 'var(--text-secondary)' }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</div>
    </div>
  );

  const Bar = ({ value, max, color }) => (
    <div style={{ height: 5, background: 'var(--border-dim)', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${Math.min(((value || 0) / (max || 1)) * 100, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 6px ${color}60` }} />
    </div>
  );

  const formatUptime = (s) => {
    if (!s) return '—';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m ${Math.floor(s % 60)}s`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>Performance Metrics</h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>Live system telemetry — refreshes on demand.</p>
        </div>
        <button onClick={() => fetchMetrics()} className="btn btn-secondary btn-sm">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
        <Card icon={Clock} title="Uptime" color="var(--accent-gold)">
          <Stat label="Process Uptime" value={formatUptime(metrics?.uptime)} color="var(--accent-gold)" />
        </Card>
        <Card icon={Cpu} title="CPU" color="var(--accent-violet)">
          <Stat label="User CPU" value={fmt((cpu.user || 0) / 1000000, 's')} color="var(--accent-violet)" />
        </Card>
        <Card icon={HardDrive} title="Memory" color="var(--accent-cyan)">
          <Stat label="Heap Used" value={fmt((mem.heapUsed || 0) / 1024 / 1024, ' MB')} color="var(--accent-cyan)" />
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Total: {fmt((mem.heapTotal || 0) / 1024 / 1024, ' MB')}</div>
          <Bar value={mem.heapUsed} max={mem.heapTotal || 512 * 1024 * 1024} color="var(--accent-cyan)" />
        </Card>
        <Card icon={Activity} title="Latency" color="var(--accent-pink)">
          <Stat label="Sync Latency" value={metrics?.latency ? `${metrics.latency}ms` : '—'} color="var(--accent-pink)" />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card icon={Zap} title="Cache Performance" color="var(--accent-green)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Stat label="Hit Rate"    value={fmt(metrics?.cache?.hitRate, '%')} color="var(--accent-green)" />
            <Stat label="Cache Size"  value={metrics?.cache?.size ?? '—'} />
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Hits</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-green)' }}>{metrics?.cache?.hits ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Misses</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-red)' }}>{metrics?.cache?.misses ?? '—'}</div>
            </div>
          </div>
        </Card>

        <Card icon={TrendingUp} title="Evolution Status" color="var(--accent-indigo)">
          {omega ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Stat label="Runtime"   value={omega.status || '—'}                                        color="var(--accent-indigo)" />
              <Stat label="Evolution" value={omega.evolution?.active ? 'Active' : 'Idle'}                color={omega.evolution?.active ? 'var(--accent-green)' : 'var(--text-dim)'} />
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', paddingTop: 8 }}>Evolution data unavailable.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
