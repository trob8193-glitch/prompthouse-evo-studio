import React, { useState, useEffect } from 'react';
import { Shield, Activity, RefreshCw, Power, PowerOff, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

function Panel({ title, icon: Icon, color = '#00f0ff', children, action }) {
  return (
    <section style={{
      background: 'rgba(5,5,8,0.8)',
      border: `1px solid ${color}33`,
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      backdropFilter: 'blur(20px)',
      boxShadow: `0 0 30px ${color}15`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: color, filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 900,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textShadow: `0 0 15px ${color}60`,
          position: 'relative',
          zIndex: 1,
        }}>
          {Icon && <Icon size={18} color={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />}
          {title}
        </h2>
        {action && <div style={{ position: 'relative', zIndex: 1 }}>{action}</div>}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </section>
  );
}

export function SelfEvolutionDashboard() {
  const [status, setStatus] = useState(null);
  const [runs, setRuns] = useState([]);
  const [queue, setQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [sRes, rRes, qRes] = await Promise.all([
        safeFetchBridge('/api/evolution/status'),
        safeFetchBridge('/api/evolution/runs?limit=10'),
        safeFetchBridge('/api/evolution/queue')
      ]);
      if (sRes.ok) setStatus(sRes.data);
      if (rRes.ok) setRuns(rRes.data.runs || []);
      if (qRes.ok) setQueue(qRes.data.queue || []);
    } catch (e) {
      console.error('Failed to fetch evolution data', e);
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleKillSwitch = async () => {
    if (!status) return;
    const isEngaged = status.killSwitchEngaged;
    const endpoint = isEngaged ? '/api/evolution/kill-switch/release' : '/api/evolution/kill-switch/engage';
    
    try {
      const res = await safeFetchBridge(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual toggle from dashboard' })
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const handleQueueAction = async (id, action) => {
    try {
      const res = await safeFetchBridge(`/api/evolution/queue/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `Owner ${action}` })
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  return (
    <IDEPageLayout
      title="Evolution Command Center"
      description="Real-time control and monitoring of the autonomous background mutation engine."
      icon={Shield}
      actions={
        <button 
          onClick={fetchData}
          disabled={refreshing}
          className="glass-extreme px-4 py-2 rounded-xl border-cyan-500/30 text-neon-cyan text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500/10 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh'}
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DAEMON STATUS */}
        <Panel 
          title="Daemon Status" 
          icon={Activity} 
          color={status?.killSwitchEngaged ? '#ef4444' : status?.active ? '#10b981' : '#f59e0b'}
          action={
            <button 
              onClick={handleToggleKillSwitch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all"
              style={{
                borderColor: status?.killSwitchEngaged ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)',
                color: status?.killSwitchEngaged ? '#ef4444' : '#10b981',
                backgroundColor: status?.killSwitchEngaged ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
              }}
            >
              {status?.killSwitchEngaged ? <PowerOff size={14} /> : <Power size={14} />}
              {status?.killSwitchEngaged ? 'Kill Switch: ENGAGED' : 'Kill Switch: OFF'}
            </button>
          }
        >
          {status ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">State</div>
                <div className="text-xl font-black text-white flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {status.active ? 'ACTIVE' : 'IDLE'}
                </div>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Cycle Count</div>
                <div className="text-xl font-black text-white">{status.cycleCount || 0}</div>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Evolutions</div>
                <div className="text-xl font-black text-emerald-400">{status.totalEvolutions || 0}</div>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Consecutive Fails</div>
                <div className={`text-xl font-black ${status.consecutiveFailures > 0 ? 'text-rose-400' : 'text-white'}`}>
                  {status.consecutiveFailures || 0}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> Loading status...</div>
          )}
        </Panel>

        {/* APPROVAL QUEUE */}
        <Panel title="Approval Queue" icon={AlertCircle} color="#f59e0b">
          {queue.length === 0 ? (
            <div className="text-sm text-slate-400 flex items-center gap-2 italic">
              <CheckCircle size={16} className="text-emerald-500/50" /> No pending approvals.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {queue.map(item => (
                <div key={item.id} className="bg-black/40 p-4 rounded-2xl border border-amber-500/20 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-black text-amber-400 mb-1">Pending Architecture Change</div>
                      <div className="text-sm text-white">{item.suggestion?.description || 'Unknown proposal'}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.id.slice(0,8)}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleQueueAction(item.id, 'approve')}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleQueueAction(item.id, 'reject')}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

      </div>

      {/* RECENT RUNS */}
      <Panel title="Recent Mutations Ledger" icon={Clock} color="#8b5cf6">
        {runs.length === 0 ? (
          <div className="text-sm text-slate-400 italic">No runs recorded yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {runs.map(run => (
              <div key={run.id} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${run.applied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {run.applied ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-mono mb-1">{new Date(run.startedAt).toLocaleTimeString()} • {run.id.slice(0,8)}</div>
                    <div className="text-sm text-white font-medium">{run.suggestion || 'Background evaluation cycle'}</div>
                    <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${run.applied ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {run.truthState}
                    </div>
                  </div>
                </div>
                {run.shadowBuildResult && !run.applied && (
                  <div className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                    Shadow Build Failed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

    </IDEPageLayout>
  );
}

export default SelfEvolutionDashboard;
