import React, { useState, useEffect } from 'react';
import { useSovereignStore } from './store.js';

import { Log } from './core/autonomy/SovereignLogger.js';
import { BRIDGE_URL } from './config/bridge-config.js';

export function AgentBridgeView() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);

  const fetchReceipts = async () => {
    try {
      const res = await fetch(BRIDGE_URL + '/api/browser-bridge/list');
      const data = await res.json();
      setReceipts(data.sort((a, b) => b.id.localeCompare(a.id)));
    } catch (e) {
      Log.error('Failed to fetch receipts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    const interval = setInterval(fetchReceipts, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ marginTop: 20 }}>
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Bridge Status</div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-desc">Active listeners for Chrome & Edge extensions.</div>
          </div>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
            <div className="flex-col gap-12">
              <div className="flex items-center justify-between">
                <span>Local Endpoint</span>
                <code style={{ color: 'var(--accent-cyan)' }}>http://127.0.0.1:3001/api/browser-bridge</code>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Handshakes</span>
                <span className="badge badge-dim">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Receipt Volume</span>
                <span>{receipts.length} Captured</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Quick Actions</div>
          </div>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
            <div className="flex-col gap-8">
              <button className="glass-extreme shadow-[0_0_15px_rgba(217,70,239,0.1)] active:scale-95 text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95-sm" onClick={fetchReceipts}>RESCAN_VAULT</button>
              <button className="glass-extreme shadow-[0_0_15px_rgba(217,70,239,0.1)] active:scale-95 text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95-sm" disabled onClick={() => void('Clearing receipts...')}>CLEAR_RECEIPTS</button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ marginTop: 20 }}>
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Incoming Context Stream</div>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-desc">Real-time receipts from your browser extensions.</div>
        </div>
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
          {loading ? (
            <div>Loading stream...</div>
          ) : receipts.length === 0 ? (
            <div className="prompt-block" style={{ textAlign: 'center', padding: 40 }}>
              Waiting for browser context... Use the extension to send a !page
            </div>
          ) : (
            <div className="flex-col gap-12">
              {receipts.map(r => (
                <div key={r.id} className="receipt-item glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ background: 'var(--bg-void)', margin: 0 }}>
                  <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
                    <div className="flex-col gap-4">
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{r.type?.toUpperCase() || 'CONTEXT'} CAPTURE</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{r.url || 'No URL'}</div>
                    </div>
                    <div className="flex-col gap-4" style={{ alignItems: 'flex-end' }}>
                      <span className="badge badge-gold" style={{ fontSize: 9 }}>{r.status || 'BUILT'}</span>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{new Date(parseInt(r.id.split('_')[0])).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
