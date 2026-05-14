import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Trash2, Terminal, Loader2, Wifi, Bluetooth, Globe, Cpu, Signal, ChevronDown, Settings } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { universalSend, probeAllTransports, syncOfflineQueue, getCustomEndpoints, addCustomEndpoint, removeCustomEndpoint } from '../lib/universal-transport.js';
import { isTrainingEnabled, setTrainingConsent, getTrainingStats, exportTrainingJSONL, pushTrainingToBridge } from '../lib/evo-training-collector.js';
import { BOT_ROSTER } from '../engine.js';

/**
 * PH EVO STUDIO — SOVEREIGN CHAT (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Full AI + Bot Chat with:
 *  - Universal Transport (Local Bridge → Evo LM → Custom IP/URL → WiFi → Bluetooth → Offline)
 *  - Bot persona switching (any of the 21 bots)
 *  - Training data capture toggle
 *  - Transport status indicators
 *  - Custom endpoint management
 *  - Offline queue sync
 */

const TRANSPORT_META = {
  local_bridge:     { icon: '🔌', label: 'Local Bridge',    color: '#4ade80' },
  evo_lm_ollama:    { icon: '🧠', label: 'Evo LM (Ollama)', color: '#f5c842' },
  evo_lm_bridge:    { icon: '🧠', label: 'Evo LM (Bridge)', color: '#f5c842' },
  custom_endpoint:  { icon: '🌐', label: 'Custom Endpoint', color: '#38bdf8' },
  wifi_lan:         { icon: '📶', label: 'WiFi LAN',        color: '#818cf8' },
  bluetooth:        { icon: '📡', label: 'Bluetooth',       color: '#a78bfa' },
  offline_queue:    { icon: '⏳', label: 'Queued Offline',  color: '#fb923c' },
};

function TransportBadge({ transport, model }) {
  const meta = TRANSPORT_META[transport] || { icon: '?', label: transport, color: '#64748b' };
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
      background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}33`,
    }}>
      {meta.icon} {meta.label}{model ? ` (${model})` : ''}
    </span>
  );
}

function AddEndpointModal({ onAdd, onClose }) {
  const [url, setUrl] = useState('http://');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [type, setType] = useState('url');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 24, width: 420, maxWidth: '90vw' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0', marginBottom: 16 }}>➕ Add Connection Endpoint</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 12 }}>
            <option value="url">Custom URL</option>
            <option value="ip">IP Address</option>
            <option value="wifi">WiFi (LAN)</option>
            <option value="evo">Evo LM Endpoint</option>
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)}
            ghostInput="http://192.168.1.x:3001"
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 12 }} />
          <input value={label} onChange={e => setLabel(e.target.value)}
            ghostInput="Label (e.g. Home Server)"
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 12 }} />
          <input value={apiKey} onChange={e => setApiKey(e.target.value)}
            ghostInput="API Key (optional)"
            type="password"
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => { onAdd({ url, label: label || url, type, apiKey: apiKey || undefined }); onClose(); }}
            style={{ flex: 1, background: '#4f46e5', border: 'none', borderRadius: 8, padding: '10px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
            Add Connection
          </button>
          <button onClick={onClose}
            style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#64748b', cursor: 'pointer', fontSize: 12 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SovereignChat() {
  const clearChat = useSovereignStore((s) => s.clearChat);
  const [messages, setMessages] = useState([
    { id: 'sys-1', role: 'system', content: 'Sovereign Chat Online. Select a bot or AI model, choose your connection, and start a mission.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBot, setActiveBot] = useState(null); // null = AI (no persona)
  const [transport, setTransport] = useState('auto'); // 'auto' | 'local_bridge' | 'evo_lm' | 'bluetooth' | specific url
  const [probeResults, setProbeResults] = useState({});
  const [probing, setProbing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [customEndpoints, setCustomEndpoints] = useState(getCustomEndpoints());
  const [trainingEnabled, setTrainingEnabled] = useState(isTrainingEnabled());
  const [trainingStats, setTrainingStats] = useState(null);
  const [lastTransport, setLastTransport] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const memoizedTransportMeta = useMemo(() => TRANSPORT_META, []);
  const memoizedEndpoints = useMemo(() => customEndpoints, [customEndpoints]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    probe();
    getTrainingStats().then(setTrainingStats).catch(() => {});
  }, []);

  const probe = useCallback(async () => {
    setProbing(true);
    try {
      const results = await probeAllTransports();
      setProbeResults(results);
    } finally {
      setProbing(false);
    }
  }, []);

  const buildSystemPrompt = useCallback(() => {
    const base = 'You are PH Evo Studio — a sovereign-grade AI development platform. Be precise, technical, and production-focused. No Ghost-Stubs, no Theatrical-Stubs.';
    if (!activeBot) return base;
    return `You are ${activeBot.name} (${activeBot.species}). Role: ${activeBot.role}. Signature: "${activeBot.signature}". Respond in character. ${base}`;
  }, [activeBot]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    if (text.startsWith('/gen ')) {
      const prompt = text.replace('/gen ', '');
      await EVOLUTION_BRIDGE.requestEvolution('Asset-Generation', `User Request: ${prompt}`);
      setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `✨ Generation Mission Dispatched: ${prompt}` }]);
      return;
    } else if (text.startsWith('/evolve ')) {
      const target = text.replace('/evolve ', '');
      await EVOLUTION_BRIDGE.requestEvolution(target, 'Manual user evolution trigger.');
      setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `🌀 Evolution Mission Started: ${target}` }]);
      return;
    }

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages
      .filter(m => m.role !== 'system')
      .concat(userMsg)
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
      .slice(-20); // last 20 turns for context

    try {
      const result = await universalSend(history, buildSystemPrompt(), {
        preferTransport: transport === 'bluetooth' ? 'bluetooth' : 'auto',
        customUrl: transport !== 'auto' && transport !== 'bluetooth' && transport !== 'evo_lm' ? transport : null,
        allowBluetooth: transport === 'bluetooth' || transport === 'auto',
        captureTraining: trainingEnabled,
      });

      setLastTransport(result.transport);
      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: result.message,
        transport: result.transport,
        model: result.model,
        bot: activeBot?.id,
        queued: result.queued || false,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);

      // Refresh training stats
      if (trainingEnabled) getTrainingStats().then(setTrainingStats).catch(() => {});
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, role: 'assistant',
        content: `⚠️ All transports failed: ${err.message}`,
        transport: 'error', timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSyncOffline = async () => {
    const result = await syncOfflineQueue({ captureTraining: trainingEnabled });
    setMessages(prev => [...prev, {
      id: `sync-${Date.now()}`, role: 'system',
      content: `📤 Offline sync: ${result.synced} sent, ${result.failed} failed of ${result.total} queued.`,
      timestamp: Date.now(),
    }]);
  };

  const handleExportTraining = async () => {
    await exportTrainingJSONL();
  };

  const handlePushTraining = async () => {
    try {
      const result = await pushTrainingToBridge();
      setMessages(prev => [...prev, {
        id: `push-${Date.now()}`, role: 'system',
        content: `🧠 Training push: ${result.pushed} examples sent to bridge for Evo LM training.`,
        timestamp: Date.now(),
      }]);
      getTrainingStats().then(setTrainingStats).catch(() => {});
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `perr-${Date.now()}`, role: 'system',
        content: `⚠️ Training push failed: ${err.message}`,
        timestamp: Date.now(),
      }]);
    }
  };

  const onlineTransports = Object.entries(probeResults).filter(([, v]) => v?.online).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 1000, margin: '0 auto', background: '#0c1222', borderRadius: 16, border: '1px solid #1e293b', overflow: 'hidden', position: 'relative' }}>

      {showAddEndpoint && (
        <AddEndpointModal
          onAdd={(ep) => { addCustomEndpoint(ep); setCustomEndpoints(getCustomEndpoints()); }}
          onClose={() => setShowAddEndpoint(false)}
        />
      )}

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', background: 'rgba(99,102,241,0.03)', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Row 1: Title + Transport status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Terminal size={15} color="#818cf8" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {activeBot ? `${activeBot.icon || '🤖'} ${activeBot.name}` : '🧠 Sovereign Chat'}
            </span>
            {lastTransport && <TransportBadge transport={lastTransport} />}
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: onlineTransports > 0 ? '#22c55e14' : '#ef444414', color: onlineTransports > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
              {probing ? '⏳ PROBING' : `${onlineTransports} ONLINE`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={probe} style={{ fontSize: 10, padding: '4px 8px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 6, color: '#64748b', cursor: 'pointer' }}>
              🔍 Probe
            </button>
            <button onClick={() => setShowSettings(s => !s)} style={{ fontSize: 10, padding: '4px 8px', background: showSettings ? '#4f46e520' : 'transparent', border: `1px solid ${showSettings ? '#4f46e5' : '#1e293b'}`, borderRadius: 6, color: showSettings ? '#818cf8' : '#64748b', cursor: 'pointer' }}>
              <Settings size={11} style={{ display: 'inline', marginRight: 3 }} />Settings
            </button>
            <button onClick={() => { clearChat(); setMessages([{ id: 'sys-1', role: 'system', content: 'Chat cleared.', timestamp: Date.now() }]); }}
              style={{ fontSize: 10, padding: '4px 8px', background: 'transparent', border: '1px solid #1e293b', borderRadius: 6, color: '#64748b', cursor: 'pointer' }}>
              <Trash2 size={11} style={{ display: 'inline' }} />
            </button>
          </div>
        </div>

        {/* Row 2: Bot selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <button
            onClick={() => setActiveBot(null)}
            style={{ flexShrink: 0, fontSize: 10, padding: '4px 10px', borderRadius: 20, border: `1px solid ${!activeBot ? '#4f46e5' : '#1e293b'}`, background: !activeBot ? '#4f46e520' : 'transparent', color: !activeBot ? '#818cf8' : '#64748b', cursor: 'pointer', fontWeight: !activeBot ? 800 : 400 }}>
            🧠 AI (Auto)
          </button>
          {BOT_ROSTER.slice(0, 12).map(bot => (
            <button key={bot.id}
              onClick={() => setActiveBot(activeBot?.id === bot.id ? null : bot)}
              style={{ flexShrink: 0, fontSize: 10, padding: '4px 10px', borderRadius: 20, border: `1px solid ${activeBot?.id === bot.id ? bot.palette.primary : '#1e293b'}`, background: activeBot?.id === bot.id ? `${bot.palette.primary}20` : 'transparent', color: activeBot?.id === bot.id ? bot.palette.primary : '#64748b', cursor: 'pointer', fontWeight: activeBot?.id === bot.id ? 800 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
              <img 
                src={`/bots/${bot.id}.png`} 
                alt={bot.name} 
                style={{ width: 14, height: 14, borderRadius: '50%' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {bot.icon} {bot.name}
            </button>
          ))}
        </div>

        {/* Row 3: Transport selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flexWrap: 'wrap' }}>
          {[
            { id: 'auto',          label: '⚡ Auto',         color: '#4ade80' },
            { id: 'local_bridge',  label: '🔌 Local',        color: probeResults.local_bridge?.online ? '#4ade80' : '#f87171' },
            { id: 'evo_lm',        label: '🧠 Evo LM',       color: '#f5c842' },
            { id: 'wifi_lan',      label: '📶 WiFi',         color: '#38bdf8' },
            { id: 'bluetooth',     label: '📡 Bluetooth',    color: '#a78bfa' },
            ...customEndpoints.map(ep => ({ id: ep.url, label: `🌐 ${ep.label || ep.url}`, color: '#fb923c' })),
          ].map(t => (
            <button key={t.id}
              onClick={() => setTransport(t.id)}
              style={{ flexShrink: 0, fontSize: 9, padding: '3px 8px', borderRadius: 12, border: `1px solid ${transport === t.id ? t.color : '#1e293b'}`, background: transport === t.id ? `${t.color}20` : 'transparent', color: transport === t.id ? t.color : '#475569', cursor: 'pointer', fontWeight: transport === t.id ? 800 : 400 }}>
              {t.label}
            </button>
          ))}
          <button onClick={() => setShowAddEndpoint(true)}
            style={{ flexShrink: 0, fontSize: 9, padding: '3px 8px', borderRadius: 12, border: '1px dashed #334155', background: 'transparent', color: '#475569', cursor: 'pointer' }}>
            + Add IP/URL
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{ background: '#0a1120', borderRadius: 10, padding: 14, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8' }}>Connection Endpoints</div>
            {customEndpoints.length === 0 && <div style={{ fontSize: 11, color: '#475569' }}>No custom endpoints added.</div>}
            {customEndpoints.map(ep => (
              <div key={ep.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111827', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{ep.label} — {ep.url}</span>
                <button onClick={() => { removeCustomEndpoint(ep.url); setCustomEndpoints(getCustomEndpoints()); }}
                  style={{ fontSize: 10, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', marginBottom: 8 }}>
                🧠 Evo LM Training
                {trainingStats && <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8 }}>{trainingStats.total} examples captured</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: '#94a3b8' }}>
                  <input type="checkbox" checked={trainingEnabled} onChange={e => { setTrainingConsent(e.target.checked); setTrainingEnabled(e.target.checked); }} />
                  Capture conversations as training data
                </label>
                <button onClick={handleExportTraining}
                  style={{ fontSize: 10, padding: '4px 10px', background: '#f5c84220', border: '1px solid #f5c842', borderRadius: 6, color: '#f5c842', cursor: 'pointer' }}>
                  ⬇️ Export JSONL
                </button>
                <button onClick={handlePushTraining}
                  style={{ fontSize: 10, padding: '4px 10px', background: '#4ade8020', border: '1px solid #4ade80', borderRadius: 6, color: '#4ade80', cursor: 'pointer' }}>
                  🚀 Push to Bridge
                </button>
              </div>
              {trainingStats && (
                <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
                  {Object.entries(trainingStats.bySource).map(([src, n]) => `${src}: ${n}`).join(' · ')}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', marginBottom: 8 }}>Transport Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(probeResults).map(([key, val]) => (
                  <div key={key} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 6, background: val?.online ? '#4ade8010' : '#f8717110', border: `1px solid ${val?.online ? '#4ade8030' : '#f8717130'}`, color: val?.online ? '#4ade80' : '#f87171' }}>
                    {val?.online ? '✅' : '❌'} {key.replace(/_/g, ' ')}
                    {val?.pending > 0 && <span style={{ color: '#fb923c', marginLeft: 4 }}>({val.pending} queued)</span>}
                  </div>
                ))}
              </div>
              {probeResults.offline_queue?.pending > 0 && (
                <button onClick={handleSyncOffline}
                  style={{ marginTop: 8, fontSize: 10, padding: '5px 12px', background: '#fb923c20', border: '1px solid #fb923c', borderRadius: 6, color: '#fb923c', cursor: 'pointer', width: '100%' }}>
                  📤 Sync {probeResults.offline_queue.pending} Queued Messages
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              {msg.role === 'assistant' && msg.bot && (
                <img 
                  src={`/bots/${msg.bot}.png`} 
                  alt={msg.bot} 
                  style={{ width: 14, height: 14, borderRadius: '50%' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: msg.role === 'user' ? '#818cf8' : '#64748b' }}>
                {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : (msg.bot ? BOT_ROSTER.find(b => b.id === msg.bot)?.name || 'Evo AI' : 'Evo AI')}
              </span>
              {msg.transport && <TransportBadge transport={msg.transport} model={msg.model} />}
              {msg.queued && <span style={{ fontSize: 9, color: '#fb923c', fontWeight: 700 }}>⏳ QUEUED</span>}
              <span style={{ fontSize: 9, color: '#334155' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 14, fontSize: 13, lineHeight: 1.6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              ...(msg.role === 'user'
                ? { background: '#4f46e5', color: '#fff', borderBottomRightRadius: 4 }
                : msg.role === 'system'
                  ? { background: '#111827', border: '1px solid #1e293b', color: '#64748b', fontStyle: 'italic', fontSize: 11 }
                  : { background: '#111827', border: '1px solid #1e293b', color: '#cbd5e1', borderBottomLeftRadius: 4 })
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Loader2 size={14} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
              {activeBot ? `${activeBot.name} is responding...` : 'Evo AI is thinking...'}
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: 14, borderTop: '1px solid #1e293b', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            ghostInput={activeBot ? `Message ${activeBot.name}...` : 'Ask AI or a bot, start a mission, send a command...'}
            rows={1}
            style={{ flex: 1, resize: 'none', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 16px', color: '#e2e8f0', fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', lineHeight: 1.5, minHeight: 44, maxHeight: 120, overflow: 'auto' }}
            onFocus={(e) => e.target.style.borderColor = '#4f46e580'}
            onBlur={(e) => e.target.style.borderColor = '#1e293b'}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ width: 44, height: 44, borderRadius: 10, border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', background: loading || !input.trim() ? '#1e293b' : '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={16} />
          </button>
        </div>
        <div style={{ fontSize: 9, color: '#334155', marginTop: 6, textAlign: 'right' }}>
          Transport: <span style={{ color: '#475569', fontWeight: 700 }}>{transport.toUpperCase()}</span>
          {trainingEnabled && <span style={{ marginLeft: 8, color: '#f5c84280' }}>· 🧠 Training ON</span>}
        </div>
      </div>
    </div>
  );
}
