import React, { useState, useEffect } from 'react';
import { Settings, Key, Save, TestTube, CheckCircle2, AlertCircle, Loader2, Shield, Trash2, Copy, Power, Database, EyeOff, Eye, Plus } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { getNightForgeSettings, updateNightForgeSettings } from '../nightforge.js';
import OwnerApprovalPanel from '../components/OwnerApprovalPanel.jsx';
import { OWNER_APPROVAL_SCOPES } from '../services/owner-approval-client.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';
import { Card } from '../components/primitives.jsx';

/**
 * PH EVO STUDIO — GLOBAL API SETTINGS (ENTERPRISE GRADE)
 * Upgraded to Professional Glassmorphic Hologram Architecture
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
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showVercelKey, setShowVercelKey] = useState(false);

  // Personal IDE Keys State
  const [personalKeys, setPersonalKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyPayload, setNewKeyPayload] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);

  // Evo.env Box State
  const [envContent, setEnvContent] = useState('');
  const [envLoading, setEnvLoading] = useState(false);
  const [envSaving, setEnvSaving] = useState(false);
  const [showEnvMask, setShowEnvMask] = useState(false); // Default to raw hacker mode

  const fetchEnvConfig = async () => {
    setEnvLoading(true);
    try {
      const res = await safeFetchBridge('/api/config/env');
      if (res.ok) {
        setEnvContent(res.data?.envContent || '');
      }
    } catch (e) {
      console.error('Failed to fetch env:', e);
    }
    setEnvLoading(false);
  };

  const handleSaveEnv = async () => {
    setEnvSaving(true);
    try {
      const res = await safeFetchBridge('/api/config/env', {
        method: 'POST',
        body: JSON.stringify({ envContent })
      });
      if (res.ok) {
        addNotification('Evo.env keys saved & injected into runtime!', 'success');
      } else {
        addNotification('Failed to save Evo.env: ' + res.error, 'error');
      }
    } catch (e) {
      addNotification('Error saving Evo.env: ' + e.message, 'error');
    }
    setEnvSaving(false);
  };

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
    fetchEnvConfig();
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
      addNotification('Error: ' + e.message, 'error');
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
      addNotification('Error: ' + e.message, 'error');
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
      title="Global Configuration"
      description="Manage API credentials, external provider integrations, and local bridging."
      icon={Settings}
      headerActions={
        <button 
          onClick={handleSave} 
          disabled={apiConfigSaving}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-3xl border transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-indigo-500 hover:bg-indigo-400 text-white border-transparent shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]'}`}
        >
          {apiConfigSaving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span className="font-bold text-sm tracking-wide">
            {apiConfigSaving ? 'Synchronizing...' : saved ? 'Synchronized' : 'Save Configurations'}
          </span>
        </button>
      }
    >
      <div className="mb-8">
        {/* Antigravity Squad Bond Matrix */}
        <Card className="p-8 bg-[#050508]/90 border-neon-cyan shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.1)_0%,rgba(0,0,0,0)_80%)] pointer-events-none" />
          <div className="flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-cyan-900/30 border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center justify-center animate-pulse">
              <Shield className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400 uppercase tracking-widest mb-2" style={{ textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>
                Antigravity Squad Bond: ACTIVE
              </h2>
              <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                Studio ↔ LLM ↔ API Keys ↔ Singularity Squad ↔ Antigravity
              </p>
              <div className="mt-4 flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-ping" />
                  API Keys Tethered
                </div>
                <div className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-ping" />
                  Universal Adaptor Synced
                </div>
                <div className="bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.8)] animate-ping" />
                  Singularity Squad Armed
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Left Column - Core Configurations */}
        <div className="space-y-8">
          
          {/* Provider API Keys */}
          <Card className="p-8 bg-[#050508]/80 border-white/5 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
            
            <div className="flex items-center gap-3 mb-8 relative">
              <div className="w-10 h-10 rounded-3xl bg-indigo-500/10 flex items-center justify-center border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <Key className="text-neon-cyan w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Provider API Keys</h2>
            </div>

            <div className="space-y-6 relative">
              {/* OpenAI Key */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>OpenAI Secret Key</span>
                  <span className="text-neon-cyan/60 text-[10px]">Local storage only</span>
                </label>
                <div className="relative">
                  <input 
                    type={showOpenAiKey ? "text" : "password"} 
                    value={apiConfig.openaiKey} 
                    onChange={(e) => updateApiConfig({ openaiKey: e.target.value })} 
                    className="w-full bg-[#0a0a0f] border-gray-800 rounded-3xl px-4 py-3 text-sm text-gray-200 font-mono outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all pr-12"
                    placeholder="sk-proj-..."
                  />
                  <button 
                    type="button"
                    onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan transition-colors"
                  >
                    {showOpenAiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Vercel Token */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>Vercel Deploy Token</span>
                  <span className="text-emerald-400/60 text-[10px]">For SaaS Orchestrator</span>
                </label>
                <div className="relative">
                  <input 
                    type={showVercelKey ? "text" : "password"} 
                    value={apiConfig.vercelToken || ''} 
                    onChange={(e) => updateApiConfig({ vercelToken: e.target.value })} 
                    className="w-full bg-[#0a0a0f] border-gray-800 rounded-3xl px-4 py-3 text-sm text-gray-200 font-mono outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all pr-12"
                    placeholder="vA123..."
                  />
                  <button 
                    type="button"
                    onClick={() => setShowVercelKey(!showVercelKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                  >
                    {showVercelKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Model Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Default Model Engine</label>
                <select 
                  value={apiConfig.model} 
                  onChange={(e) => updateApiConfig({ model: e.target.value })} 
                  className="w-full bg-[#0a0a0f] border-gray-800 rounded-3xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="gpt-4o">GPT-4 Omni (Recommended)</option>
                  <option value="gpt-4o-mini">GPT-4 Omni Mini (Fast)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
                </select>
              </div>

              {/* Vercel Gate */}
              {apiConfig.vercelToken && (
                <div className="mt-6 pt-6 border-t border-gray-800 animate-in fade-in">
                  <OwnerApprovalPanel
                    scope={OWNER_APPROVAL_SCOPES.DEPLOY}
                    title="Deploy Action Gate"
                    description="Explicit owner approval is required to trigger external deployments."
                    riskLevel="high"
                    onApprovalCreated={setDeployApproval}
                    compact
                  />
                  {deployApproval && (
                    <div className="mt-4 text-xs text-emerald-400 px-4 py-3 bg-emerald-500/10 rounded-3xl border-emerald-500/20 flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      Approval envelope created. Ready for autonomous execution.
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Evo.env Master Box */}
          <Card className="p-8 bg-[#050508]/80 border-emerald-500/10 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
            
            <div className="flex items-center justify-between mb-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-3xl bg-emerald-500/10 flex items-center justify-center border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Database className="text-emerald-400 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-emerald-400 tracking-tight">Evo.env Master Box</h2>
                  <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Absolute Reality Storage</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEnvMask(!showEnvMask)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                {showEnvMask ? <EyeOff size={12} /> : <Eye size={12} />}
                {showEnvMask ? 'Mask Active' : 'Raw Output'}
              </button>
            </div>

            <div className="relative">
              {envLoading ? (
                <div className="h-[300px] flex items-center justify-center bg-[#030305] rounded-3xl border border-gray-800">
                  <Loader2 className="animate-spin text-emerald-500" />
                </div>
              ) : (
                <textarea
                  value={envContent}
                  onChange={(e) => setEnvContent(e.target.value)}
                  spellCheck="false"
                  className={`w-full h-[300px] bg-[#030305] border border-gray-800 rounded-3xl p-5 text-sm font-mono leading-relaxed outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all custom-scrollbar ${showEnvMask ? 'text-transparent bg-clip-text' : 'text-emerald-300'}`}
                  style={showEnvMask ? { textShadow: '0 0 8px rgba(110, 231, 183, 0.5)' } : {}}
                  placeholder="# OMNI-OUTREACH LIVE CREDENTIALS\n\nSTRIPE_SECRET_KEY=sk_live_...\nSMTP_URL=smtps://user:pass@smtp.gmail.com\nTWITTER_API_KEY=...\nTARGET_INVESTOR_EMAILS=vc@fund.com"
                />
              )}
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle size={10} className="text-rose-500" />
                  Saves directly to disk. No Mocks.
                </span>
                <button
                  onClick={handleSaveEnv}
                  disabled={envSaving}
                  className="px-6 py-2.5 rounded-3xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center disabled:opacity-50"
                >
                  {envSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Power size={16} className="mr-2" />}
                  Inject to Runtime
                </button>
              </div>
            </div>
          </Card>

          {/* Bridge Connection */}
          <Card className="p-8 bg-[#050508]/80 border-white/5 shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
            
            <div className="flex items-center gap-3 mb-8 relative">
              <div className="w-10 h-10 rounded-3xl bg-purple-500/10 flex items-center justify-center border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <Shield className="text-purple-400 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Studio Bridge Server</h2>
            </div>

            <div className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">WebSocket Bridge URL</label>
                <div className="flex gap-3">
                  <input 
                    value={apiConfig.bridgeUrl} 
                    onChange={(e) => updateApiConfig({ bridgeUrl: e.target.value })} 
                    className="flex-1 bg-[#0a0a0f] border-gray-800 rounded-3xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono" 
                  />
                  <button 
                    onClick={handleTest} 
                    disabled={testing}
                    className="px-5 py-3 rounded-3xl border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold transition-all flex items-center justify-center min-w-[140px] disabled:opacity-50"
                  >
                    {testing ? <Loader2 size={16} className="animate-spin" /> : <TestTube size={16} className="mr-2" />}
                    {testing ? 'Probing...' : 'Run Probe'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className="bg-[#0a0a0f] border-gray-800 rounded-3xl p-5 animate-in fade-in slide-in-from-top-2">
                  <div className={`flex items-center gap-2 text-sm font-bold mb-4 ${testResult.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {testResult.ok ? `Secure Tether Established — ${testResult.version}` : 'Tether Disconnected'}
                  </div>
                  
                  {testResult.probes && (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(testResult.probes).map(([api, info]) => (
                        <div key={api} className="p-3 bg-gray-900/50 border-gray-800/50 rounded-2xl flex-col gap-4 justify-center">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{api}</div>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${info.status === 'VERIFIED' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : info.status === 'MISSING' ? 'bg-gray-600' : 'bg-rose-500'}`} />
                            <span className={`text-xs font-bold ${info.status === 'VERIFIED' ? 'text-emerald-400' : info.status === 'MISSING' ? 'text-gray-400' : 'text-rose-400'}`}>
                              {info.status}
                            </span>
                          </div>
                          {info.error && <div className="text-[10px] text-rose-400/80 mt-1 truncate">{info.error}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Secondary Configurations */}
        <div className="space-y-8">
          
          {/* Personal IDE Keys */}
          <Card className="p-8 bg-[#050508]/80 border-white/5 shadow-2xl relative overflow-hidden group hover:border-pink-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100" />
            
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-3xl bg-pink-500/10 flex items-center justify-center border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                <Key className="text-pink-400 w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Personal IDE Keys</h2>
            </div>
            
            <p className="text-sm text-gray-400 mb-6 relative">
              Generate keys to secure communication between external IDEs (Cursor, Windsurf, VS Code) and your local Studio.
            </p>

            <div className="flex gap-3 mb-6 relative">
              <input 
                type="text" 
                placeholder="Description (e.g. Cursor MacBook)" 
                value={newKeyName} 
                onChange={(e) => setNewKeyName(e.target.value)} 
                className="flex-1 bg-[#0a0a0f] border-gray-800 rounded-3xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all" 
              />
              <button 
                onClick={handleGenerateKey} 
                disabled={generatingKey}
                className="px-5 py-3 rounded-3xl bg-pink-500 hover:bg-pink-400 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] flex items-center justify-center disabled:opacity-50"
              >
                {generatingKey ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="mr-2" />}
                Create Key
              </button>
            </div>

            {newKeyPayload && (
              <div className="bg-pink-500/10 border-pink-500/20 rounded-3xl p-5 mb-6 relative">
                <div className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertCircle size={12} />
                  Copy this key now. It will not be shown again.
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    readOnly 
                    value={newKeyPayload} 
                    onClick={(e) => e.target.select()}
                    className="flex-1 bg-black border-pink-500/30 rounded-2xl px-4 py-2.5 text-sm font-mono text-pink-300 outline-none" 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(newKeyPayload);
                      addNotification('Key copied to clipboard.', 'success');
                    }}
                    className="px-4 py-2.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 font-bold rounded-2xl border-pink-500/30 transition-colors flex items-center"
                  >
                    <Copy size={14} className="mr-2" />
                    Copy
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Active Credentials</span>
                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{personalKeys.length}</span>
              </div>
              
              {loadingKeys ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-gray-600" /></div>
              ) : personalKeys.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8 bg-[#0a0a0f] rounded-3xl border-dashed border-gray-800">
                  No active keys found.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {personalKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-[#0a0a0f] border-gray-800 hover:border-gray-700 rounded-3xl transition-colors group/item">
                      <div>
                        <div className="text-sm font-bold text-gray-200">{key.name}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-mono flex items-center gap-2">
                          <span className="text-gray-400">{key.key_prefix}...</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-2 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-colors opacity-0 group-hover/item:opacity-100"
                        title="Revoke Key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Infrastructure Cards Row */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* NightForge Mode */}
            <Card className="p-6 bg-[#050508]/80 border-white/5 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors flex-col gap-4">
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="w-10 h-10 rounded-3xl bg-emerald-500/10 flex items-center justify-center border-emerald-500/20">
                  <Database className="text-emerald-400 w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-white">NightForge</h2>
              </div>
              <p className="text-[11px] text-gray-400 mb-6 flex-1">
                Forces execution across all 3 primary models (EvoLM, OpenAI, Gemini) to build consensus.
              </p>
              <button
                onClick={handleNightforgeToggle}
                disabled={nfLoading || nfSaving}
                className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center ${nfForce3 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
              >
                {nfLoading || nfSaving ? <Loader2 size={14} className="animate-spin" /> : nfForce3 ? 'Strict Mode Active' : 'Enable Strict Mode'}
              </button>
            </Card>

            {/* Ollama Engine */}
            <Card className="p-6 bg-[#050508]/80 border-white/5 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-colors flex-col gap-4">
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="w-10 h-10 rounded-3xl bg-white flex items-center justify-center shadow-lg">
                  <span className="text-xl">🦙</span>
                </div>
                <h2 className="text-lg font-bold text-white">Local Ollama</h2>
              </div>
              <p className="text-[11px] text-gray-400 mb-6 flex-1">
                Zero-latency offline engine. Replaces external APIs when disconnected or off-grid.
              </p>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('http://localhost:11434/api/tags');
                    if (res.ok) {
                      const data = await res.json();
                      addNotification(`✅ Local Engine !Online Models: ${data.models.map(m => m.name).join(', ') || 'None'}`, 'success');
                    }
                  } catch (err) {
                    addNotification('❌ Engine Offline. Start the local daemon.', 'error');
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 border-gray-700 text-white text-xs font-bold transition-all flex items-center justify-center"
              >
                <Power size={14} className="mr-2" />
                Ping Engine
              </button>
            </Card>
          </div>
          
        </div>
      </div>
    </IDEPageLayout>
  );
}

export default GlobalAPISettingsView;
