import React, { useState, useEffect } from 'react';
import { useSovereignStore } from './store.js';
import { Activity, Cpu, Database, Server } from 'lucide-react';
const BRIDGE_URL = 'http://127.0.0.1:3001';

export function RealExecutionView() {
  const metrics = useSovereignStore((s) => s.metrics);
  const fetchMetrics = useSovereignStore((s) => s.fetchMetrics);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);

  const [queue, setQueue] = useState([]);
  const [queueError, setQueueError] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [lastQueueSync, setLastQueueSync] = useState(null);

  useEffect(() => {
    const timer = setInterval(fetchMetrics, 5000);
    fetchMetrics();

    let disposed = false;
    async function fetchQueue() {
      setQueueLoading(true);
      try {
        const res = await fetch(`${BRIDGE_URL}/api/queue/master`, { signal: AbortSignal.timeout(2000) });
        if (!res.ok) throw new Error(`Queue endpoint returned ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Queue payload must be an array');
        const mapped = data.map((item, index) => ({
          id: item?.id ?? `item-${index + 1}`,
          name: item?.name ?? 'Unnamed work item',
          domain: item?.domain ?? 'unspecified',
          module: item?.module ?? 'unspecified',
          description: item?.description ?? '',
          status: item?.status ?? item?.state ?? item?.truth_state ?? 'UNSPECIFIED',
          progress: Number.isFinite(item?.progress) ? item.progress : null,
        }));
        if (!disposed) {
          setQueue(mapped);
          setQueueError(null);
          setLastQueueSync(Date.now());
        }
      } catch (e) {
        if (!disposed) {
          setQueueError(e.message);
        }
      } finally {
        if (!disposed) setQueueLoading(false);
      }
    }

    fetchQueue();
    const queuePollTimer = setInterval(fetchQueue, 8000);

    return () => {
      disposed = true;
      clearInterval(timer);
      clearInterval(queuePollTimer);
    };
  }, [fetchMetrics]);

  const domainCount = new Set(queue.map((q) => q.domain)).size;

  if (bridgeStatus !== 'connected') {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#111827', borderRadius: 24, border: '1px dashed #1e293b' }}>
        <Server size={48} color="#475569" style={{ marginBottom: 16 }} />
        <h3 style={{ color: '#94a3b8' }}>Bridge Offline</h3>
        <p style={{ color: '#475569' }}>Connect the bridge to see live execution metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        <MetricBox icon={Activity} label="Uptime" value={`${Math.floor(metrics?.uptime / 60 || 0)}m ${Math.floor(metrics?.uptime % 60 || 0)}s`} />
        <MetricBox icon={Cpu} label="CPU User Time" value={metrics?.cpu_usage?.user !== undefined ? `${(metrics.cpu_usage.user / 1000).toFixed(1)} ms` : '—'} />
        <MetricBox icon={Database} label="Heap Memory" value={metrics?.memory?.heapUsed ? `${(metrics.memory.heapUsed / 1024 / 1024).toFixed(1)} MB` : '—'} />
        <MetricBox icon={Database} label="Queue Items" value={`${queue.length}`} />
        <MetricBox icon={Activity} label="Domains" value={`${domainCount}`} />
      </div>

      <div style={{ padding: 20, background: '#111827', border: '1px solid #1e293b', borderRadius: 16 }}>
        <h3 style={{ color: '#f8fafc', fontSize: 14, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>Execution Queue (Live)</h3>
        <div style={{ color: '#64748b', fontSize: 11, marginBottom: 16 }}>
          {queueLoading ? 'Syncing queue...' : `Last sync: ${lastQueueSync ? new Date(lastQueueSync).toLocaleTimeString() : 'never'}`}
        </div>
        {queueError && (
          <div style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 11 }}>
            Queue fetch failed: {queueError}
          </div>
        )}
        <div className="space-y-3">
          {queue.length === 0 && !queueLoading && !queueError && (
            <div style={{ color: '#94a3b8', fontSize: 12, padding: 12, border: '1px solid #1e293b', borderRadius: 10 }}>
              No queue records returned by `/api/queue/master`.
            </div>
          )}
          {queue.map(job => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-black/20 border border-slate-800/50 rounded-lg">
              <div className="flex-1">
                <div className="text-xs text-slate-300 font-bold">{job.name}</div>
                <div className="text-[10px] text-slate-600 font-mono">{job.id} • {job.domain} • {job.module}</div>
                {job.description ? <div className="text-[10px] text-slate-500 mt-1">{job.description}</div> : null}
              </div>
              <div className="w-52 flex items-center justify-end">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {job.status}
                </span>
                {job.progress !== null ? (
                  <span className="text-[10px] text-slate-500 ml-3 font-mono">{job.progress}%</span>
                ) : (
                  <span className="text-[10px] text-slate-600 ml-3">No progress metric</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ icon: Icon, label, value }) {
  return (
    <div style={{ padding: 20, background: '#111827', border: '1px solid #1e293b', borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', marginBottom: 8 }}>
        <Icon size={14} /> <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#f8fafc' }}>{value}</div>
    </div>
  );
}
