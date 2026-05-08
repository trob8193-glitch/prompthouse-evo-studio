/**
 * PromptHouse Evo Studio — PromptLink / PromptBridge UI Panel
 * Owner: Cipher Lynx | Schema Beaver | Blueprint Orca
 * Truth State: built
 * 
 * Shows the provider registry, handshake status, PromptLink call gate,
 * and live capture feed from the Browser Agent Bridge.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  getRegistry,
  updateProvider,
  validatePromptLinkCall,
  handshakePromptBridge,
  syncPromptLink,
} from './promptlink-registry.js';
import { addProofReceipt } from './prompt-base.js';

const STATUS_COLORS = {
  verified: '#4ade80',
  built: '#38bdf8',
  recommended: '#f5c842',
  blocked: '#f87171',
  inferred: '#94a3b8',
};

export function PromptLinkView() {
  const [registry, setRegistry] = useState([]);
  const [bridgeStatus, setBridgeStatus] = useState(null);
  const [handshaking, setHandshaking] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('registry');
  const [bridgeCapsules, setBridgeCapsules] = useState([]);
  const [proofReceipts, setProofReceipts] = useState([]);

  const log = useCallback((msg, type = 'info') => {
    setLogs(l => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0, 49)]);
  }, []);

  useEffect(() => {
    setRegistry(getRegistry());
    doHandshake();
  }, []);

  const doHandshake = useCallback(async () => {
    setHandshaking(true);
    log('🤝 Initiating PromptBridge handshake...', 'system');
    const result = await handshakePromptBridge();
    setBridgeStatus(result);
    if (result.connected) {
      log(`✅ Bridge connected (${result.latency}ms). Status: ${result.bridgeState?.status}`, 'success');
      await syncPromptLink({ event: 'studio_hello', studioVersion: '2.0.0' });
      log('📡 PromptLink sync event sent.', 'info');
      addProofReceipt('browser_bridge', 'promptlink_handshake', 'verified', { latency: result.latency });
      // Load bridge data
      try {
        const caps = await fetch('http://127.0.0.1:3001/api/browser-bridge/forgecapsule').then(r => r.json());
        const receipts = await fetch('http://127.0.0.1:3001/api/browser-bridge/proof').then(r => r.json());
        setBridgeCapsules(Array.isArray(caps) ? caps.slice(0, 20) : []);
        setProofReceipts(Array.isArray(receipts) ? receipts.slice(0, 20) : []);
      } catch { /* Bridge may not have data yet */ }
    } else {
      log(`🔴 Bridge offline: ${result.error}. Dry-run mode active.`, 'warn');
    }
    setHandshaking(false);
  }, [log]);

  const testProvider = useCallback((provider) => {
    const result = validatePromptLinkCall(provider.id, 'manual_test');
    if (result.allowed) {
      log(`✅ Provider '${provider.displayName}' passed gate check.`, 'success');
    } else {
      log(`⛔ Provider '${provider.displayName}' BLOCKED: ${result.reason}`, 'warn');
    }
  }, [log]);

  const toggleProvider = useCallback((provider) => {
    if (provider.approvalPolicy === 'blocked') {
      log(`⛔ Cannot enable '${provider.displayName}' — hard-blocked by Boundary.`, 'warn');
      return;
    }
    if (!provider.enabled && provider.approvalPolicy === 'owner_required') {
      log(`⚠️ Enabling '${provider.displayName}' requires owner approval. Enabling in local registry only.`, 'warn');
    }
    const updated = updateProvider(provider.id, { enabled: !provider.enabled });
    setRegistry(getRegistry());
    log(`${updated.enabled ? '🟢 Enabled' : '⚫ Disabled'}: ${updated.displayName}`, 'info');
  }, [log]);

  const TABS = [
    { id: 'registry', label: '🔌 Provider Registry' },
    { id: 'handshake', label: '🤝 Handshake & Sync' },
    { id: 'capsules', label: `📦 Bridge Capsules (${bridgeCapsules.length})` },
    { id: 'receipts', label: `🛡️ Proof Receipts (${proofReceipts.length})` },
    { id: 'logs', label: '📋 Logs' },
  ];

  return (
    <div className="flex-col animate-in">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">🔗 PromptLink / PromptBridge</div>
          <div className="page-subtitle">Provider registry, handshake status, and live browser capture feed.</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
            background: bridgeStatus?.connected ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${bridgeStatus?.connected ? '#4ade80' : '#f87171'}`,
            color: bridgeStatus?.connected ? '#4ade80' : '#f87171',
          }}>
            {bridgeStatus === null ? '⏳ Checking...' : bridgeStatus.connected ? `🟢 LIVE (${bridgeStatus.latency}ms)` : '🔴 OFFLINE'}
          </div>
          <button className="btn btn-primary btn-sm" onClick={doHandshake} disabled={handshaking}>
            {handshaking ? '⏳ Syncing...' : '🤝 Re-Handshake'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Registry Tab */}
      {activeTab === 'registry' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {registry.map(provider => (
            <div
              key={provider.id}
              className="card"
              style={{
                cursor: 'pointer',
                border: `1px solid ${selectedProvider?.id === provider.id ? 'var(--accent-gold)' : 'var(--border-dim)'}`,
                transition: 'all 0.2s',
              }}
              onClick={() => setSelectedProvider(provider)}
            >
              <div className="card-body" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{provider.displayName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{provider.baseUrl}</div>
                  </div>
                  <span style={{
                    padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                    background: `${STATUS_COLORS[provider.status] || '#444'}22`,
                    color: STATUS_COLORS[provider.status] || '#fff',
                    border: `1px solid ${STATUS_COLORS[provider.status] || '#444'}44`,
                  }}>{provider.status}</span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {provider.capabilities.map(c => (
                    <span key={c} className="badge badge-dim" style={{ fontSize: 9 }}>{c}</span>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Auth: <strong>{provider.authType}</strong> · Approval: <strong>{provider.approvalPolicy}</strong>
                  {provider.budgetCapUSD > 0 && <> · Budget: <strong>${provider.budgetCapUSD}</strong></>}
                  {provider.credentialEnvKey && <> · Env: <code style={{ color: 'var(--accent-cyan)' }}>{provider.credentialEnvKey}</code></>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-sm"
                    onClick={e => { e.stopPropagation(); toggleProvider(provider); }}
                    style={{
                      background: provider.enabled ? 'rgba(74,222,128,0.2)' : 'var(--bg-elevated)',
                      border: `1px solid ${provider.enabled ? '#4ade80' : 'var(--border-dim)'}`,
                      color: provider.enabled ? '#4ade80' : 'var(--text-muted)',
                      fontWeight: 800,
                    }}
                  >
                    {provider.enabled ? '🟢 Enabled' : '⚫ Disabled'}
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); testProvider(provider); }}>
                    🔑 Test Gate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Handshake Tab */}
      {activeTab === 'handshake' && (
        <div className="card">
          <div className="card-header"><div className="card-title">🤝 PromptBridge Handshake & PromptLink Sync</div></div>
          <div className="card-body flex-col">
            {bridgeStatus && (
              <div style={{ padding: 16, background: 'var(--bg-void)', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <div style={{ color: bridgeStatus.connected ? '#4ade80' : '#f87171', fontWeight: 800, marginBottom: 8 }}>
                  {bridgeStatus.connected ? '✅ BRIDGE CONNECTED' : '🔴 BRIDGE OFFLINE'}
                </div>
                <pre style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  {JSON.stringify(bridgeStatus, null, 2)}
                </pre>
              </div>
            )}
            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(74,222,128,0.05)', borderRadius: 8, border: '1px solid rgba(74,222,128,0.2)', fontSize: 12 }}>
              <strong style={{ color: '#4ade80' }}>Extension Install:</strong> Load unpacked from{' '}
              <code style={{ color: 'var(--accent-cyan)' }}>public/chrome-extension/</code> in{' '}
              <code style={{ color: 'var(--accent-cyan)' }}>chrome://extensions</code> with Developer Mode ON.
              <br />Use <kbd>Ctrl+Shift+P</kbd> on any page to capture selection.
            </div>
          </div>
        </div>
      )}

      {/* Bridge Capsules */}
      {activeTab === 'capsules' && (
        <div className="card">
          <div className="card-header"><div className="card-title">📦 Browser Capture Feed (ForgeCapuses)</div></div>
          <div className="card-body">
            {bridgeCapsules.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-title">No captures yet</div><div className="empty-sub">Use Ctrl+Shift+P on any page or right-click → Capture to Studio</div></div>
            ) : bridgeCapsules.map(c => (
              <div key={c.id} style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 4 }}>{c.id}</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{c.pageTitle} — {c.sourceUrl}</div>
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.selectedText?.slice(0, 200)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Receipts */}
      {activeTab === 'receipts' && (
        <div className="card">
          <div className="card-header"><div className="card-title">🛡️ Bridge Proof Receipts</div></div>
          <div className="card-body">
            {proofReceipts.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🛡️</div><div className="empty-title">No receipts yet</div></div>
            ) : proofReceipts.map(r => (
              <div key={r.id} style={{ padding: 10, background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 6, fontSize: 11 }}>
                <span style={{ color: STATUS_COLORS[r.status] || '#fff', fontWeight: 800, marginRight: 8 }}>{r.status}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{r.action}</span>
                <span style={{ float: 'right', color: 'var(--text-dim)' }}>{r.timestamp?.slice(0, 19)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="card" style={{ background: '#030408' }}>
          <div className="card-header"><div className="card-title">📋 PromptLink Activity Log</div></div>
          <div className="card-body" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {logs.length === 0 && <div style={{ color: 'var(--text-dim)' }}>// Awaiting events...</div>}
            {logs.map((l, i) => (
              <div key={i} style={{
                color: l.type === 'success' ? '#4ade80' : l.type === 'warn' ? '#fb923c' : l.type === 'system' ? '#38bdf8' : '#94a3b8',
                marginBottom: 4,
              }}>
                <span style={{ color: '#333', marginRight: 8 }}>[{l.ts}]</span>{l.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
