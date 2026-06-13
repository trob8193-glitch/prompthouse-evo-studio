import React, { useState, useEffect } from 'react';
import { Settings, Key, Save, TestTube, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { getNightForgeSettings, updateNightForgeSettings } from '../nightforge.js';
import OwnerApprovalPanel from '../components/OwnerApprovalPanel.jsx';
import { OWNER_APPROVAL_SCOPES } from '../services/owner-approval-client.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';

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
  const [nfLoading, setNfLoading] = useState(false);
  const [nfSaving, setNfSaving] = useState(false);
  const [nfForce3, setNfForce3] = useState(false);
  const [deployApproval, setDeployApproval] = useState(null);

  // Personal IDE Keys State
  const [personalKeys, setPersonalKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyPayload, setNewKeyPayload] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);

  const fetchPersonalKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await safeFetchBridge('/api/auth/keys');
      if (res.ok) {
        setPersonalKeys(res.data?.keys || []);
      }
    } catch (e) {
      console.error('Failed to fetch personal keys:', e);
    }
    setLoadingKeys(false);
  };

  useEffect(() => {
    fetchPersonalKeys();
  }, [apiConfig.bridgeUrl]);

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      addNotification('Please enter a key description name.', 'error');
      return;
    }
    setGeneratingKey(true);
    try {
      const res = await safeFetchBridge('/api/auth/keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName })
      });
      if (res.ok) {
        setNewKeyPayload(res.data?.rawKey);
        setNewKeyName('');
        fetchPersonalKeys();
        addNotification('Personal Evo API key generated.', 'success');
      } else {
        addNotification('Failed to generate key.', 'error');
      }
    } catch (e) {
      addNotification(`Error: ${e.message}`, 'error');
    }
    setGeneratingKey(false);
  };

  const handleRevokeKey = async (id) => {
    if (!confirm('Are you sure you want to revoke this API key? This will immediately sever any external IDE tethers using it.')) return;
    try {
      const res = await safeFetchBridge(`/api/auth/keys/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        addNotification('API key revoked successfully.', 'success');
        fetchPersonalKeys();
      } else {
        addNotification('Failed to revoke API key.', 'error');
      }
    } catch (e) {
      addNotification(`Error: ${e.message}`, 'error');
    }
  };

  const handleSave = async () => {
    const ok = await saveApiKeys();
    if (ok) { setSaved(true); addNotification('API keys updated successfully.', 'success'); setTimeout(() => setSaved(false), 3000); }
    else { addNotification('Failed to save API keys.', 'error'); }
  };

  const runTruthProbe = useSovereignStore((s) => s.runTruthProbe);

  useEffect(() => {
    let mounted = true;
    setNfLoading(true);
    getNightForgeSettings()
      .then((payload) => {
        if (mounted) setNfForce3(Boolean(payload?.settings?.forceThreeProviderTeam));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setNfLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    const probeResults = await runTruthProbe();
    const statusData = await fetchBridgeStatus();
    setTesting(false);
    setTestResult({
      ok: !!statusData,
      version: statusData?.version,
      probes: probeResults
    });
  };


  const fieldStyle = { width: '100%', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none' };
  const labelStyle = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' };

  const handleNightforgeToggle = async () => {
    const nextValue = !nfForce3;
    setNfSaving(true);
    try {
      await updateNightForgeSettings({ forceThreeProviderTeam: nextValue });
      setNfForce3(nextValue);
      addNotification(
        nextValue
          ? 'NightForge strict 3-provider team mode enabled.'
          : 'NightForge strict 3-provider team mode disabled.',
        'success',
      );
    } catch (e) {
      addNotification(`Failed to update NightForge settings: ${e.message}`, 'error');
    }
    setNfSaving(false);
  };

  return (
    <IDEPageLayout
      title="Settings & API"
      description="Configure your API keys, model, and bridge connection."
      icon={Settings}
    >
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* API Keys Card */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Key size={16} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>API Keys</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>OpenAI API Key</label>
          <input type="password" value={apiConfig.openaiKey} onChange={(e) => updateApiConfig({ openaiKey: e.target.value })} ghostInput="sk-proj-..." style={fieldStyle}
            onFocus={(e) => e.target.style.borderColor = '#4f46e580'} onBlur={(e) => e.target.style.borderColor = '#1e293b'} />
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Your key is sent to the local bridge server only — never to external services directly.</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Vercel API Token (For Deployments)</label>
          <input type="password" value={apiConfig.vercelToken || ''} onChange={(e) => updateApiConfig({ vercelToken: e.target.value })} ghostInput="vA123..." style={fieldStyle}
            onFocus={(e) => e.target.style.borderColor = '#4f46e580'} onBlur={(e) => e.target.style.borderColor = '#1e293b'} />
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Used by the SaaS Orchestrator to autonomously deploy your generated apps.</div>
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

        {apiConfig.vercelToken && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1e293b' }}>
            <OwnerApprovalPanel
              scope={OWNER_APPROVAL_SCOPES.DEPLOY}
              title="Deploy Action Gate"
              description="Explicit owner approval is required to trigger external deployments using the Vercel token."
              riskLevel="high"
              onApprovalCreated={setDeployApproval}
              compact
            />
            {deployApproval && (
              <div style={{ marginTop: 12, fontSize: '11px', color: '#94a3b8', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                Approval envelope created. Provider action still requires explicit execution and credentials.
              </div>
            )}
          </div>
        )}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: testResult.ok ? '#22c55e' : '#ef4444' }}>
                {testResult.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {testResult.ok ? `Bridge Online — ${testResult.version}` : 'Bridge Offline'}
              </div>
              
              {testResult.probes && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                  {Object.entries(testResult.probes).map(([api, info]) => (
                    <div key={api} style={{ padding: '8px 12px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>{api}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: info.status === 'VERIFIED' ? '#22c55e' : info.status === 'MISSING' ? '#64748b' : '#ef4444' }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: info.status === 'VERIFIED' ? '#22c55e' : '#94a3b8' }}>{info.status}</span>
                      </div>
                      {info.error && <div style={{ fontSize: 8, color: '#ef4444', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.error}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Personal IDE Keys Card */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Key size={16} color="#ec4899" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Personal IDE Keys</span>
        </div>
        
        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
          Personal Evo API keys secure communication between external IDEs (like Cursor, Windsurf, VS Code, Zed) and this studio bridge server.
        </p>

        {/* Key Generation Form */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input 
            type="text" 
            placeholder="Key Name (e.g. Cursor-Laptop)" 
            value={newKeyName} 
            onChange={(e) => setNewKeyName(e.target.value)} 
            style={{ ...fieldStyle, flex: 1 }} 
          />
          <button 
            onClick={handleGenerateKey} 
            disabled={generatingKey}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#ec4899',
              color: 'white',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {generatingKey ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Generate Key
          </button>
        </div>

        {/* Display New Key Payload */}
        {newKeyPayload && (
          <div style={{ 
            background: 'rgba(236, 72, 153, 0.05)', 
            border: '1px solid rgba(236, 72, 153, 0.2)', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 20 
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', marginBottom: 4 }}>
              ⚠️ Copy Your API Key Now (Only Shown Once!)
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input 
                type="text" 
                readOnly 
                value={newKeyPayload} 
                onClick={(e) => e.target.select()}
                style={{ ...fieldStyle, fontFamily: 'monospace', fontSize: 11, background: '#020617', borderColor: '#ec4899' }} 
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(newKeyPayload);
                  addNotification('Copied API Key to clipboard.', 'success');
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #ec4899',
                  background: 'transparent',
                  color: '#ec4899',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Active Keys List */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Active Keys ({personalKeys.length})
          </div>
          
          {loadingKeys ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <Loader2 size={24} className="animate-spin" color="#64748b" />
            </div>
          ) : personalKeys.length === 0 ? (
            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: '16px 0', background: '#0f172a', borderRadius: 8, border: '1px dashed #1e293b' }}>
              No active personal API keys. Run "bond omni" or generate one above to secure your IDEs.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {personalKeys.map((key) => (
                <div key={key.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 14px', 
                  background: '#0f172a', 
                  border: '1px solid #1e293b', 
                  borderRadius: 8 
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{key.name}</div>
                    <div style={{ fontSize: 10, color: '#64748b', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span style={{ fontFamily: 'monospace' }}>Prefix: {key.key_prefix}...</span>
                      <span>•</span>
                      <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && (
                        <>
                          <span>•</span>
                          <span>Last Used: {new Date(key.last_used_at).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRevokeKey(key.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #ef4444',
                      background: 'rgba(239, 68, 68, 0.05)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: 10,
                      fontWeight: 700,
                      transition: 'all 0.2s'
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NightForge Team Mode */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Settings size={16} color="#22c55e" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>NightForge Team Mode</span>
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
          Strict mode forces NightForge to run all 3 providers together (`evo_lm`, `openai`, `gemini`) and blocks cycles unless keys and plan budget are valid.
        </p>
        <button
          onClick={handleNightforgeToggle}
          disabled={nfLoading || nfSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: nfForce3 ? '#14532d' : '#1e293b',
            color: nfForce3 ? '#86efac' : '#94a3b8',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {nfLoading || nfSaving ? <Loader2 size={14} className="animate-spin" /> : null}
          {nfForce3 ? 'Strict 3-Team Mode ON' : 'Strict 3-Team Mode OFF'}
        </button>
      </div>

      {/* Ollama Offline Engine Card */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 16, height: 16, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <span style={{ fontSize: 10, color: '#000', fontWeight: 900 }}>🦙</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Ollama (Offline AI Engine)</span>
        </div>
        
        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 20, lineHeight: 1.5 }}>
          Ollama allows you to run powerful AI models completely offline. If your Bridge or external APIs fail, the Universal Transport will automatically fallback to your local Ollama engine to keep your studio running.
        </p>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={async () => {
            try {
              const res = await fetch('http://localhost:11434/api/tags');
              if (res.ok) {
                const data = await res.json();
                const models = data.models.map(m => m.name).join(', ');
                alert(`✅ Ollama is Online!\n\nInstalled Models:\n${models || 'None yet. Run "ollama run llama3" in your terminal!'}`);
              } else {
                alert('⚠️ Ollama responded with an error.');
              }
            } catch (err) {
              alert('❌ Ollama is Offline or not installed.\n\nTo install, download from ollama.com or run:\ncurl -fsSL https://ollama.com/install.sh | sh');
            }
          }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            Test Ollama Connection
          </button>
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
    </IDEPageLayout>
  );
}

export default GlobalAPISettingsView;
