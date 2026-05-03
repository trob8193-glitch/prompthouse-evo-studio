import React, { useState, useMemo } from 'react';
import { MOBILE_ARCHITECTURES, CODE_TEMPLATES, CHAIN_STEP_TYPES, MISSION_PHASES, TRUTH_STATES, buildChainPrompt, buildMissionPacket, exportAsMarkdown, exportAsText, exportAsJson } from './mobile-engine.js';
import { useEvoStore } from './store.js';

function copyText(t) { navigator.clipboard.writeText(t); }

// ── CODE FORGE ──────────────────────────────────────────────
export function CodeForgeView() {
  const [lang, setLang] = useState('flutter_feature');
  const [feature, setFeature] = useState('Auth');
  const [appName, setAppName] = useState('MyApp');
  const [arch, setArch] = useState('clean_riverpod');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com/v1');
  const [features, setFeatures] = useState('home, auth, dashboard');
  const [copied, setCopied] = useState(false);

  const GENERATORS = [
    { id: 'flutter_feature', label: '🏗️ Flutter Feature Module', desc: 'Domain + Data + Application + Presentation layers' },
    { id: 'flutter_pubspec', label: '📦 Flutter pubspec.yaml', desc: 'Full deps: Riverpod/BLoC, GoRouter, Dio, Hive, Freezed' },
    { id: 'flutter_router', label: '🗺️ Go Router Setup', desc: 'All routes wired from feature list' },
    { id: 'api_service', label: '🌐 API Service (Retrofit+Dio)', desc: 'Full REST client with interceptors' },
    { id: 'rn_component', label: '⚛️ React Native Screen', desc: 'Production-ready screen with Zustand hook' },
    { id: 'zustand_store', label: '🐻 Zustand Store (TypeScript)', desc: 'Typed store with AsyncStorage persistence' },
  ];

  const code = useMemo(() => {
    try {
      switch (lang) {
        case 'flutter_feature': return CODE_TEMPLATES.flutter_feature(feature || 'Home', arch);
        case 'flutter_pubspec': return CODE_TEMPLATES.flutter_pubspec(appName || 'my_app', arch);
        case 'flutter_router': return CODE_TEMPLATES.flutter_router(features);
        case 'api_service': return CODE_TEMPLATES.api_service(appName || 'Main', baseUrl);
        case 'rn_component': return CODE_TEMPLATES.rn_component(feature || 'Home');
        case 'zustand_store': return CODE_TEMPLATES.zustand_store(feature || 'Home');
        default: return '';
      }
    } catch (e) { return `// Error: ${e.message}`; }
  }, [lang, feature, appName, arch, baseUrl, features]);

  return (
    <div className="flex-col">
      <div><div className="page-title">💻 Code Forge</div><div className="page-subtitle">Generate 100% executable Flutter & React Native code. No stubs. No fake logic.</div></div>
      <div className="grid-builder">
        <div className="flex-col">
          <div className="card">
            <div className="card-header"><div className="card-title">Generator Config</div></div>
            <div className="card-body flex-col">
              <div className="field"><label className="field-label">Template</label>
                <select className="field-select" value={lang} onChange={e => setLang(e.target.value)}>
                  {GENERATORS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{GENERATORS.find(g => g.id === lang)?.desc}</div>
              </div>
              {['flutter_feature','rn_component','zustand_store'].includes(lang) && (
                <div className="field"><label className="field-label">Feature / Model Name</label>
                  <input className="field-input" placeholder="Auth" value={feature} onChange={e => setFeature(e.target.value)} />
                </div>
              )}
              {['flutter_pubspec','api_service','flutter_router'].includes(lang) && (
                <div className="field"><label className="field-label">App / Service Name</label>
                  <input className="field-input" placeholder="MyApp" value={appName} onChange={e => setAppName(e.target.value)} />
                </div>
              )}
              {lang === 'flutter_feature' && (
                <div className="field"><label className="field-label">Architecture</label>
                  <select className="field-select" value={arch} onChange={e => setArch(e.target.value)}>
                    {Object.values(MOBILE_ARCHITECTURES).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </select>
                </div>
              )}
              {lang === 'api_service' && (
                <div className="field"><label className="field-label">Base URL</label>
                  <input className="field-input" placeholder="https://api.example.com/v1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
                </div>
              )}
              {lang === 'flutter_router' && (
                <div className="field"><label className="field-label">Features (comma-separated)</label>
                  <input className="field-input" placeholder="home, auth, dashboard" value={features} onChange={e => setFeatures(e.target.value)} />
                </div>
              )}
              <div className="flex-row gap-8" style={{ marginTop: 4 }}>
                <button className="btn btn-primary" onClick={() => { copyText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✅ Copied!' : '📋 Copy Code'}</button>
                <button className="btn btn-secondary" onClick={() => exportAsText(`${lang}_${feature || appName}`, code)}>⬇️ Download</button>
              </div>
            </div>
          </div>
          <div className="card" style={{ background: 'var(--bg-void)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <div className="card-body">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 8 }}>⚡ Truth State</div>
              {['No placeholders — all code is executable','Real patterns: Riverpod/BLoC/Zustand','Replace TODO comments with actual logic','Run flutter analyze to verify 0 errors'].map((r,i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>• {r}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ minHeight: 500 }}>
          <div className="card-header">
            <div className="flex-between">
              <div className="card-title">Generated Code</div>
              <span className="badge badge-green">100% Executable</span>
            </div>
          </div>
          <div className="card-body">
            <div className="prompt-block" style={{ maxHeight: 520, fontSize: 11 }}>{code}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MOBILE ARCHITECT ─────────────────────────────────────────
export function MobileArchView() {
  const [selected, setSelected] = useState('clean_riverpod');
  const arch = MOBILE_ARCHITECTURES[selected];
  const [copied, setCopied] = useState('');

  const archPrompt = `FLUTTER APP ARCHITECTURE — ${arch.name.toUpperCase()}

Stack: ${arch.stack}
Pattern: ${arch.layers.join(' → ')}
${arch.desc}

Feature folder structure:
lib/features/<feature>/
${arch.layers.map(l => `  ${l}/`).join('\n')}

CLI commands to scaffold:
node vscode-extension/cli/ph-evo.js generate-app <app_name> ./generated/<app_name>
node vscode-extension/cli/ph-evo.js scaffold <feature_name>

Run after scaffold:
flutter pub get
flutter analyze
flutter test`;

  return (
    <div className="flex-col">
      <div><div className="page-title">📐 Mobile Architect</div><div className="page-subtitle">Choose your architecture pattern. Get the full scaffold, stack, and CLI commands.</div></div>
      <div className="grid-3" style={{ marginBottom: 16 }}>
        {Object.values(MOBILE_ARCHITECTURES).map(a => (
          <div key={a.id} className={`pack-card ${selected === a.id ? 'selected' : ''}`} onClick={() => setSelected(a.id)} style={{ borderColor: selected === a.id ? a.color : undefined }}>
            <div className="pack-icon">{a.icon}</div>
            <div className="pack-name" style={{ color: a.color }}>{a.name}</div>
            <div className="pack-role">{a.desc}</div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {a.layers.map(l => <span key={l} className="pack-chip">{l}/</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="grid-builder">
        <div className="card">
          <div className="card-header"><div className="card-title" style={{ color: arch.color }}>{arch.icon} {arch.name}</div></div>
          <div className="card-body flex-col">
            <div><span className="field-label">Stack</span><div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{arch.stack}</div></div>
            <div><span className="field-label">Layers</span><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>{arch.layers.map(l => <span key={l} className="badge badge-dim">{l}/</span>)}</div></div>
            <button className="btn btn-primary" onClick={() => { copyText(archPrompt); setCopied('arch'); setTimeout(() => setCopied(''), 1500); }}>{copied === 'arch' ? '✅ Copied!' : '📋 Copy Architecture Prompt'}</button>
            <button className="btn btn-secondary" onClick={() => exportAsMarkdown(`${arch.name}_Architecture`, archPrompt)}>⬇️ Export as Markdown</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Architecture Prompt</div></div>
          <div className="card-body"><div className="prompt-block" style={{ maxHeight: 340 }}>{archPrompt}</div></div>
        </div>
      </div>
    </div>
  );
}

// ── MISSION CONTROL ──────────────────────────────────────────
export function MissionControlView() {
  const [phase, setPhase] = useState(0);
  const [mission, setMission] = useState({ objective: '', owner: '🦁 Evo', known: [''], inferred: [''], blocked: [''], boundary: '', recommended: '' });
  const [copied, setCopied] = useState(false);
  const packet = useMemo(() => buildMissionPacket(mission), [mission]);
  const completed = phase;
  const total = MISSION_PHASES.length;

  const updateArr = (key, i, val) => setMission(m => { const a = [...(m[key] || [''])]; a[i] = val; return { ...m, [key]: a }; });
  const addRow = (key) => setMission(m => ({ ...m, [key]: [...(m[key] || ['']), ''] }));

  return (
    <div className="flex-col">
      <div className="flex-between">
        <div><div className="page-title">🎯 Mission Control</div><div className="page-subtitle">Intake → Canon → Route → Build → Verify → Boundary → Deliver</div></div>
        <span className="badge badge-gold">{completed}/{total} phases</span>
      </div>
      {/* Phase bar */}
      <div style={{ display: 'flex', gap: 4 }}>
        {MISSION_PHASES.map((p, i) => (
          <button key={p.id} onClick={() => setPhase(i)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1px solid ${i <= phase ? 'var(--accent-gold)' : 'var(--border-dim)'}`, background: i === phase ? 'var(--accent-gold-dim)' : i < phase ? 'rgba(74,222,128,0.08)' : 'transparent', cursor: 'pointer', fontSize: 10, color: i <= phase ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
            {p.icon}<br/>{p.label}
          </button>
        ))}
      </div>
      <div className="grid-builder">
        <div className="card">
          <div className="card-header">
            <div className="card-title">{MISSION_PHASES[phase].icon} {MISSION_PHASES[phase].label}</div>
            <div className="card-desc">{MISSION_PHASES[phase].desc}</div>
          </div>
          <div className="card-body flex-col">
            {phase === 0 && (<>
              <div className="field"><label className="field-label">Mission Objective</label><textarea className="field-textarea" placeholder="Build onboarding flow with email auth, profile setup, and push notifications." value={mission.objective} onChange={e => setMission(m => ({ ...m, objective: e.target.value }))} /></div>
              <div className="field"><label className="field-label">Owner</label><input className="field-input" value={mission.owner} onChange={e => setMission(m => ({ ...m, owner: e.target.value }))} /></div>
            </>)}
            {phase === 1 && (<>
              <div className="field"><label className="field-label">Known facts</label>{(mission.known || ['']).map((v, i) => <div key={i} className="flex-row gap-8" style={{ marginBottom: 6 }}><input className="field-input" placeholder="Known fact..." value={v} onChange={e => updateArr('known', i, e.target.value)} /><button className="btn btn-ghost btn-sm" onClick={() => addRow('known')}>+</button></div>)}</div>
            </>)}
            {phase === 2 && (<>
              <div className="field"><label className="field-label">Inferred assumptions</label>{(mission.inferred || ['']).map((v, i) => <div key={i} className="flex-row gap-8" style={{ marginBottom: 6 }}><input className="field-input" placeholder="Inferred..." value={v} onChange={e => updateArr('inferred', i, e.target.value)} /><button className="btn btn-ghost btn-sm" onClick={() => addRow('inferred')}>+</button></div>)}</div>
            </>)}
            {phase === 3 && (<>
              <div className="field"><label className="field-label">Build target (what gets generated)</label><textarea className="field-textarea" placeholder="Feature module, screen, store, or prompt stack..." value={mission.buildTarget || ''} onChange={e => setMission(m => ({ ...m, buildTarget: e.target.value }))} /></div>
            </>)}
            {phase === 4 && (<>
              <div className="field"><label className="field-label">Verification checklist</label>
                {['flutter analyze — 0 issues', 'flutter test — all pass', 'No placeholders remaining', 'UI smoke test passed'].map((c, i) => (
                  <label key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent-green)' }} /> {c}
                  </label>
                ))}
              </div>
            </>)}
            {phase === 5 && (<>
              <div className="field"><label className="field-label">Blocked items</label>{(mission.blocked || ['']).map((v, i) => <div key={i} className="flex-row gap-8" style={{ marginBottom: 6 }}><input className="field-input" placeholder="Blocked by..." value={v} onChange={e => updateArr('blocked', i, e.target.value)} /><button className="btn btn-ghost btn-sm" onClick={() => addRow('blocked')}>+</button></div>)}</div>
              <div className="field"><label className="field-label">Boundary statement</label><textarea className="field-textarea" value={mission.boundary} onChange={e => setMission(m => ({ ...m, boundary: e.target.value }))} placeholder="No real-world billing, deployments, or production mutations without confirmation." /></div>
            </>)}
            {phase === 6 && (<>
              <div className="field"><label className="field-label">Recommended next step</label><input className="field-input" value={mission.recommended} onChange={e => setMission(m => ({ ...m, recommended: e.target.value }))} placeholder="Run ph-evo gate --web before web release." /></div>
              <div className="flex-row gap-8">
                <button className="btn btn-primary" onClick={() => { copyText(packet); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✅ Copied!' : '📋 Copy Packet'}</button>
                <button className="btn btn-secondary" onClick={() => exportAsMarkdown('PH_EVO_MISSION_PACKET', packet)}>⬇️ Export</button>
              </div>
            </>)}
            {phase < total - 1 && <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setPhase(p => Math.min(p + 1, total - 1))}>Next Phase →</button>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">📋 Mission Packet Preview</div></div>
          <div className="card-body"><div className="prompt-block" style={{ maxHeight: 440 }}>{packet}</div></div>
        </div>
      </div>
    </div>
  );
}

// ── PROMPT CHAIN BUILDER ─────────────────────────────────────
export function ChainBuilderView() {
  const [steps, setSteps] = useState([
    { id: 1, type: 'system', content: '' },
    { id: 2, type: 'execute', content: '' },
    { id: 3, type: 'gate', content: '' },
  ]);
  const [copied, setCopied] = useState(false);
  const chain = useMemo(() => buildChainPrompt(steps), [steps]);

  const addStep = (type) => setSteps(s => [...s, { id: Date.now(), type, content: '' }]);
  const removeStep = (id) => setSteps(s => s.filter(x => x.id !== id));
  const updateStep = (id, content) => setSteps(s => s.map(x => x.id === id ? { ...x, content } : x));
  const updateType = (id, type) => setSteps(s => s.map(x => x.id === id ? { ...x, type } : x));
  const moveUp = (i) => { const s = [...steps]; if (i > 0) { [s[i-1], s[i]] = [s[i], s[i-1]]; setSteps(s); } };

  return (
    <div className="flex-col">
      <div className="flex-between">
        <div><div className="page-title">🔗 Prompt Chain Builder</div><div className="page-subtitle">Wire multiple prompts into a sequential execution pipeline.</div></div>
        <div className="flex-row gap-8">
          <button className="btn btn-primary" onClick={() => { copyText(chain); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✅ Copied!' : '📋 Copy Chain'}</button>
          <button className="btn btn-secondary" onClick={() => exportAsMarkdown('PH_EVO_PROMPT_CHAIN', chain)}>⬇️ Export</button>
        </div>
      </div>
      <div className="grid-builder">
        <div className="flex-col">
          {/* Step type picker */}
          <div className="card">
            <div className="card-header"><div className="card-title">Add Step</div></div>
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CHAIN_STEP_TYPES.map(t => (
                <button key={t.id} className="btn btn-secondary btn-sm" onClick={() => addStep(t.id)} style={{ borderColor: t.color + '44', color: t.color }}>{t.icon} {t.label}</button>
              ))}
            </div>
          </div>
          {/* Steps */}
          {steps.map((step, i) => {
            const type = CHAIN_STEP_TYPES.find(t => t.id === step.type);
            return (
              <div key={step.id} className="card" style={{ borderColor: (type?.color || '#fff') + '33' }}>
                <div className="card-header">
                  <div className="flex-between">
                    <div className="flex-row gap-8">
                      <span style={{ fontSize: 18 }}>{type?.icon}</span>
                      <select className="field-select" style={{ width: 'auto', padding: '4px 8px' }} value={step.type} onChange={e => updateType(step.id, e.target.value)}>
                        {CHAIN_STEP_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                      <span className="badge badge-dim">Step {i + 1}</span>
                    </div>
                    <div className="flex-row gap-8">
                      {i > 0 && <button className="btn btn-ghost btn-sm" onClick={() => moveUp(i)}>↑</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => removeStep(step.id)}>✕</button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <textarea className="field-textarea" placeholder={`${type?.label} instructions...`} value={step.content} onChange={e => updateStep(step.id, e.target.value)} style={{ minHeight: 80 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Chain Preview</div></div>
          <div className="card-body"><div className="prompt-block" style={{ maxHeight: 520 }}>{chain || 'Add steps to build your chain...'}</div></div>
        </div>
      </div>
    </div>
  );
}

// ── EXPORT LAB ───────────────────────────────────────────────
export function ExportLabView() {
  const { vault, history } = useEvoStore();
  const [format, setFormat] = useState('md');
  const [selected, setSelected] = useState([]);
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const exportSelected = () => {
    const items = vault.filter(v => selected.includes(v.id));
    if (!items.length) return alert('Select at least one vault item.');
    const content = items.map(item => `## ${item.task}\nDomain: ${item.domain} | Strictness: ${item.strictness} | Score: ${item.score}%\n\n### System Prompt\n${item.prompts?.systemPrompt || ''}\n\n### Execution Prompt\n${item.prompts?.executionPrompt || ''}\n\n### Release Gate\n${item.prompts?.releaseGatePrompt || ''}\n\n---`).join('\n\n');
    if (format === 'md') exportAsMarkdown('PH_Evo_Vault_Export', content);
    else if (format === 'txt') exportAsText('PH_Evo_Vault_Export', content);
    else exportAsJson('PH_Evo_Vault_Export', items);
  };

  return (
    <div className="flex-col">
      <div><div className="page-title">📤 Export Lab</div><div className="page-subtitle">Export prompt stacks, session history, and mission packets in any format.</div></div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Select Vault Items</div></div>
          <div className="card-body flex-col">
            {vault.length === 0 ? <div className="empty-state"><div className="empty-icon">🗄️</div><div className="empty-title">Vault is empty</div><div className="empty-sub">Save prompts from the Builder first.</div></div> : vault.map(item => (
              <label key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} style={{ accentColor: 'var(--accent-gold)', width: 16, height: 16 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.task?.slice(0, 60)}{item.task?.length > 60 ? '...' : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.domain} · {item.score}% · {item.saved}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Export Options</div></div>
          <div className="card-body flex-col">
            <div className="field"><label className="field-label">Format</label>
              <div className="tabs-bar">
                {['md','txt','json'].map(f => <button key={f} className={`tab-btn ${format === f ? 'active' : ''}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 8 }}>
              {format === 'md' && '📝 Markdown — Full prompt stacks with headers. Best for Notion, GitHub, docs.'}
              {format === 'txt' && '📄 Plain text — Stripped format. Best for pasting into OpenAI/Claude.'}
              {format === 'json' && '🔧 JSON — Structured data with all metadata. Best for API integration.'}
            </div>
            <button className="btn btn-primary" onClick={exportSelected}>⬇️ Export {selected.length > 0 ? `${selected.length} Items` : 'Selected'}</button>
            <div className="section-divider" />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Quick Exports</div>
            <button className="btn btn-secondary" onClick={() => { const c = history.map(h => `${h.time} | ${h.domain} | ${h.score}% | ${h.task}`).join('\n'); exportAsText('PH_Evo_Session_History', c); }}>📜 Export Session History</button>
            <button className="btn btn-secondary" onClick={() => exportAsJson('PH_Evo_Full_Vault', vault)}>🗄️ Export Full Vault (JSON)</button>
            <button className="btn btn-secondary" onClick={() => { const agent = { name: 'PromptHouse Evo Studio', model: 'gpt-4o', instructions: 'You are PH Evo Studio Operator. See attached knowledge files for full instructions.' }; exportAsJson('PH_Evo_Agent_Config', agent); }}>🤖 Export Agent Config</button>
          </div>
        </div>
      </div>
    </div>
  );
}
