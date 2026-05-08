import { Activity, Cpu, HardDrive, Clock, Zap, RefreshCw, TrendingUp } from 'lucide-react';
import { useSovereignStore } from '../store.js';


/**
 * PH EVO STUDIO — METRICS VIEW (ENTERPRISE GRADE)
 * Full-page live performance dashboard.
 */

export default function MetricsView() {
  const BRIDGE_URL = 'http://127.0.0.1:3001';

  const metrics = useSovereignStore((s) => s.metrics);
  const loading = useSovereignStore((s) => s.metricsLoading);
  const fetchAll = useSovereignStore((s) => s.fetchMetrics);
  const [omega, setOmega] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fmt = (v, suffix = '') => v != null ? `${typeof v === 'number' ? v.toFixed(1) : v}${suffix}` : '—';

  const Card = ({ icon: Icon, title, color, children }) => (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}14` }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{title}</span>
      </div>
      {children}
    </div>
  );

  const Stat = ({ label, value, color = '#94a3b8' }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</div>
    </div>
  );

  const Bar = ({ value, max, color }) => (
    <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
    </div>
  );

  const formatUptime = (s) => { if (!s) return '—'; const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m ${Math.floor(s % 60)}s`; };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }}>Performance Metrics</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Live system telemetry — refreshes every 15 seconds.</p>
        </div>
        <button onClick={() => { setLoading(true); fetchAll(); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
        <Card icon={Clock} title="Uptime" color="#f59e0b">
          <Stat label="Process Uptime" value={formatUptime(metrics?.uptime)} color="#f59e0b" />
        </Card>
        <Card icon={Cpu} title="CPU" color="#8b5cf6">
          <Stat label="User CPU" value={fmt(cpu.user / 1000000, 's')} color="#8b5cf6" />
        </Card>
        <Card icon={HardDrive} title="Memory" color="#06b6d4">
          <Stat label="Heap Used" value={fmt(mem.heapUsed / 1024 / 1024, ' MB')} color="#06b6d4" />
          <div style={{ fontSize: 11, color: '#475569' }}>Total: {fmt(mem.heapTotal / 1024 / 1024, ' MB')}</div>
          <Bar value={mem.heapUsed} max={mem.heapTotal || 512 * 1024 * 1024} color="#06b6d4" />
        </Card>
        <Card icon={Activity} title="Latency" color="#f43f5e">
          <Stat label="Sync Latency" value={metrics?.latency ? `${metrics.latency}ms` : '—'} color="#f43f5e" />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card icon={Zap} title="Cache Performance" color="#10b981">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Stat label="Hit Rate" value={fmt(metrics?.cache?.hitRate, '%')} color="#10b981" />
            <Stat label="Cache Size" value={metrics?.cache?.size ?? '—'} />
            <div><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Hits</div><div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>{metrics?.cache?.hits ?? '—'}</div></div>
            <div><div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Misses</div><div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{metrics?.cache?.misses ?? '—'}</div></div>
          </div>
        </Card>

        <Card icon={TrendingUp} title="Evolution Status" color="#6366f1">
          {omega ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Stat label="Runtime" value={omega.status || '—'} color="#6366f1" />
              <Stat label="Evolution" value={omega.evolution?.active ? 'Active' : 'Idle'} color={omega.evolution?.active ? '#22c55e' : '#64748b'} />
            </div>
          ) : <div style={{ fontSize: 12, color: '#475569' }}>Evolution data unavailable.</div>}
        </Card>
      </div>
    </div>
  );
}
