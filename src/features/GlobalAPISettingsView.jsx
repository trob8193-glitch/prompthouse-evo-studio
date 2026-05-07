import React, { useState, useEffect } from 'react';
import { Settings, Key, Save, TestTube, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — GLOBAL API SETTINGS (ENTERPRISE GRADE)
 * Real React component to configure API keys and bridge connection.
 */

export function GlobalAPISettingsView() {
  const apiConfig = useSovereignStore((s) => s.apiConfig);
  const updateApiConfig = useSovereignStore((s) => s.updateApiConfig);
  const saveApiKeys = useSovereignStore((s) => s.saveApiKeys);
  const apiConfigSaving = useSovereignStore((s) => s.apiConfigSaving);
  const fetchBridgeStatus = useSovereignStore((s) => s.fetchBridgeStatus);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const bridgeData = useSovereignStore((s) => s.bridgeData);
  const addNotification = useSovereignStore((s) => s.addNotification);

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const ok = await saveApiKeys();
    if (ok) { setSaved(true); addNotification('API keys updated successfully.', 'success'); setTimeout(() => setSaved(false), 3000); }
    else { addNotification('Failed to save API keys.', 'error'); }
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    const data = await fetchBridgeStatus();
    setTesting(false);
    setTestResult(data ? { ok: true, version: data.version, uptime: data.uptime } : { ok: false });
  };

  const fieldStyle = { width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none' };
  const labelStyle = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', margin: 0 }}>Settings & API</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Configure your API keys, model, and bridge connection.</p>
      </div>

      {/* API Keys Card */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Key size={16} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>API Keys</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>OpenAI API Key</label>
          <input type="password" value={apiConfig.openaiKey} onChange={(e) => updateApiConfig({ openaiKey: e.target.value })} placeholder="sk-proj-..." style={fieldStyle}
            onFocus={(e) => e.target.style.borderColor = '#4f46e580'} onBlur={(e) => e.target.style.borderColor = '#1e293b'} />
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Your key is sent to the local bridge server only — never to external services directly.</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Model</label>
          <select value={apiConfig.model} onChange={(e) => updateApiConfig({ model: e.target.value })} style={{ ...fieldStyle, cursor: 'pointer' }}>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={apiConfigSaving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none', background: saved ? '#22c55e' : '#4f46e5', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'background 0.3s' }}>
            {apiConfigSaving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {apiConfigSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Keys'}
          </button>
        </div>
      </div>

      {/* Bridge Connection Card */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Shield size={16} color="#8b5cf6" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Bridge Connection</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Bridge URL</label>
          <input value={apiConfig.bridgeUrl} onChange={(e) => updateApiConfig({ bridgeUrl: e.target.value })} style={fieldStyle} />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={handleTest} disabled={testing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            {testing ? <Loader2 size={14} className="animate-spin" /> : <TestTube size={14} />}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: testResult.ok ? '#22c55e' : '#ef4444' }}>
              {testResult.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {testResult.ok ? `Connected — ${testResult.version}` : 'Connection failed'}
            </div>
          )}
        </div>
      </div>

      {/* Bridge Info */}
      {bridgeData && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Bridge Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Status', bridgeData.status],
              ['Mode', bridgeData.mode],
              ['Version', bridgeData.version],
              ['Connected', new Date(bridgeData.connected_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalAPISettingsView;
