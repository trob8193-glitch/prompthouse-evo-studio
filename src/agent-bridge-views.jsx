import React, { useState, useEffect } from 'react';
import { useSovereignStore } from './store.js';

export function AgentBridgeView() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);

  const fetchReceipts = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/browser-bridge/list');
      const data = await res.json();
      setReceipts(data.sort((a, b) => b.id.localeCompare(a.id)));
    } catch (e) {
      console.error('Failed to fetch receipts:', e);
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
    <div className="flex-col animate-in">
      <div className="flex-between">
        <div>
          <div className="page-title">🌉 Agent Bridge Control</div>
          <div className="page-subtitle">Monitoring browser context receipts and local studio handshakes.</div>
        </div>
        <div className={`badge ${bridgeStatus === 'connected' ? 'badge-green' : 'badge-red'}`}>
          {bridgeStatus === 'connected' ? 'BRIDGE_ONLINE' : 'BRIDGE_OFFLINE'}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Bridge Status</div>
            <div className="card-desc">Active listeners for Chrome & Edge extensions.</div>
          </div>
          <div className="card-body">
            <div className="flex-col gap-12">
              <div className="flex-between">
                <span>Local Endpoint</span>
                <code style={{ color: 'var(--accent-cyan)' }}>http://127.0.0.1:3001/api/browser-bridge</code>
              </div>
              <div className="flex-between">
                <span>Active Handshakes</span>
                <span className="badge badge-dim">2</span>
              </div>
              <div className="flex-between">
                <span>Receipt Volume</span>
                <span>{receipts.length} Captured</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick Actions</div>
          </div>
          <div className="card-body">
            <div className="flex-col gap-8">
              <button className="btn btn-secondary btn-sm" onClick={fetchReceipts}>RESCAN_VAULT</button>
              <button className="btn btn-secondary btn-sm" disabled>CLEAR_RECEIPTS</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Incoming Context Stream</div>
          <div className="card-desc">Real-time receipts from your browser extensions.</div>
        </div>
        <div className="card-body">
          {loading ? (
            <div>Loading stream...</div>
          ) : receipts.length === 0 ? (
            <div className="prompt-block" style={{ textAlign: 'center', padding: 40 }}>
              Waiting for browser context... Use the extension to send a page!
            </div>
          ) : (
            <div className="flex-col gap-12">
              {receipts.map(r => (
                <div key={r.id} className="receipt-item card" style={{ background: 'var(--bg-void)', margin: 0 }}>
                  <div className="flex-between" style={{ padding: '12px 16px' }}>
                    <div className="flex-col">
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{r.type?.toUpperCase() || 'CONTEXT'} CAPTURE</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{r.url || 'No URL'}</div>
                    </div>
                    <div className="flex-col" style={{ alignItems: 'flex-end' }}>
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
