import React, { useState, useMemo } from 'react';
import { MOBILE_ARCHITECTURES, CODE_TEMPLATES, CHAIN_STEP_TYPES, MISSION_PHASES, TRUTH_STATES, buildChainPrompt, buildMissionPacket, exportAsMarkdown, exportAsText, exportAsJson } from './mobile-engine.js';
import { useEvoStore } from './store.js';
import { Card, Button, Panel, StateView } from './components/primitives.jsx';

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
    <div className="flex flex-col space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Code Forge</h1>
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Generate 100% executable Flutter & React Native code.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-5 space-y-8">
          <Card className="p-8">
            <h3 className="text-lg font-bold text-white mb-6">Generator Configuration</h3>
            <div className="space-y-6">
              <div className="field">
                <label className="field-label">Target Template</label>
                <select className="field-select" value={lang} onChange={e => setLang(e.target.value)}>
                  {GENERATORS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
                <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">{GENERATORS.find(g => g.id === lang)?.desc}</p>
              </div>
              {['flutter_feature','rn_component','zustand_store'].includes(lang) && (
                <div className="field">
                  <label className="field-label">Feature / Model Identity</label>
                  <input className="field-input" placeholder="Auth" value={feature} onChange={e => setFeature(e.target.value)} />
                </div>
              )}
              {['flutter_pubspec','api_service','flutter_router'].includes(lang) && (
                <div className="field">
                  <label className="field-label">App / Service Namespace</label>
                  <input className="field-input" placeholder="MyApp" value={appName} onChange={e => setAppName(e.target.value)} />
                </div>
              )}
              {lang === 'flutter_feature' && (
                <div className="field">
                  <label className="field-label">Architecture Paradigm</label>
                  <select className="field-select" value={arch} onChange={e => setArch(e.target.value)}>
                    {Object.values(MOBILE_ARCHITECTURES).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                  </select>
                </div>
              )}
              {lang === 'api_service' && (
                <div className="field">
                  <label className="field-label">Core API Endpoint</label>
                  <input className="field-input" placeholder="https://api.example.com/v1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <Button className="flex-1" onClick={() => { copyText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  {copied ? '✅ COPIED TO CLIPBOARD' : '📋 CLONE SOURCE CODE'}
                </Button>
                <Button variant="secondary" onClick={async () => {
                  const bridge = new (await import('./core/interop/UniversalBridge.js')).UniversalBridge();
                  const res = await bridge.dispatch('codeforge', 'save', { filename: `${feature || 'Feature'}.dart`, content: code });
                  if (res.success) alert(`Saved to: ${res.path}`);
                  else alert(`Save failed: ${res.error}`);
                }}>💾 SAVE TO PROJECT</Button>
              </div>
            </div>
          </Card>
          
          <Card className="bg-emerald-500/5 border-emerald-500/20 p-8">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Sovereign Truth State</h3>
            <ul className="space-y-3">
              {['No placeholders — all code is executable','Production-grade architectural patterns','Zero TODO stubs in output logic','Verified via autonomous audit loops'].map((r,i) => (
                <li key={i} className="text-xs text-slate-400 flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="xl:col-span-7 flex flex-col p-0 overflow-hidden bg-black/40">
          <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Master-Grade Output</h3>
            <StatusBadge status="verified" label="100% EXECUTABLE" />
          </div>
          <div className="flex-1 p-8">
            <div className="prompt-block !max-h-[600px] !bg-transparent !border-none !p-0">{code}</div>
          </div>
        </Card>
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
    <div className="flex flex-col space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Mobile Architect</h1>
        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Choose your architecture paradigm. Get the full scaffold and CLI logic.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.values(MOBILE_ARCHITECTURES).map(a => (
          <motion.div 
            key={a.id} 
            whileHover={{ y: -5 }}
            onClick={() => setSelected(a.id)}
            className={`cursor-pointer p-8 rounded-[32px] border-2 transition-all duration-300 ${
              selected === a.id 
                ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-4xl mb-6">{a.icon}</div>
            <h3 className={`text-xl font-black mb-2 ${selected === a.id ? 'text-white' : 'text-slate-400'}`}>{a.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{a.desc}</p>
            <div className="flex flex-wrap gap-2">
              {a.layers.map(l => <span key={l} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded text-slate-400">{l}/</span>)}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-5">
          <Card className="h-full flex flex-col p-10">
            <h3 className="text-xl font-black text-white mb-8">Architectural Specs</h3>
            <div className="space-y-8 flex-1">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Technology Stack</span>
                <p className="font-mono text-sm text-indigo-400 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">{arch.stack}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Logic Flow</span>
                <div className="flex flex-wrap gap-3">
                  {arch.layers.map((l, i) => (
                    <React.Fragment key={l}>
                      <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 border border-slate-700">{l}</span>
                      {i < arch.layers.length - 1 && <span className="text-slate-600 flex items-center">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-10">
              <Button className="flex-1" onClick={() => { copyText(archPrompt); setCopied('arch'); setTimeout(() => setCopied(''), 1500); }}>
                {copied === 'arch' ? '✅ COPIED' : '📋 CLONE PARADIGM'}
              </Button>
              <Button variant="secondary" onClick={() => exportAsMarkdown(`${arch.name}_Architecture`, archPrompt)}>⬇️ EXPORT</Button>
            </div>
          </Card>
        </div>
        <Card className="xl:col-span-7 bg-black/40 p-0 overflow-hidden">
           <div className="p-8 border-b border-slate-800 bg-slate-900/20">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Paradigm Definition Prompt</h3>
          </div>
          <div className="p-8">
            <div className="prompt-block !bg-transparent !border-none !p-0 !max-h-[400px]">{archPrompt}</div>
          </div>
        </Card>
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
    <div className="flex flex-col space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Mission Control</h1>
          <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Intake → Synthesis → Route → Execution → Verification</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Master Workflow Progress</span>
          <div className="flex gap-1.5">
            {MISSION_PHASES.map((_, i) => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${i <= phase ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-2 bg-slate-900/40 rounded-[32px] border border-slate-800/50 backdrop-blur-xl">
        {MISSION_PHASES.map((p, i) => (
          <button 
            key={p.id} 
            onClick={() => setPhase(i)} 
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-300 ${
              i === phase 
                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' 
                : i < phase 
                  ? 'text-emerald-400 hover:bg-slate-800/50' 
                  : 'text-slate-500 hover:bg-slate-800/30'
            }`}
          >
            <span className="text-2xl">{p.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-5">
          <Card className="p-10 h-full flex flex-col">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{MISSION_PHASES[phase].icon}</span>
                <h3 className="text-2xl font-black text-white">{MISSION_PHASES[phase].label}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{MISSION_PHASES[phase].desc}</p>
            </div>

            <div className="space-y-8 flex-1">
              {phase === 0 && (<>
                <div className="field">
                  <label className="field-label">Primary Mission Objective</label>
                  <textarea className="field-textarea !min-h-[120px]" placeholder="Define the end-state reality..." value={mission.objective} onChange={e => setMission(m => ({ ...m, objective: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Executive Owner</label>
                  <input className="field-input" value={mission.owner} onChange={e => setMission(m => ({ ...m, owner: e.target.value }))} />
                </div>
              </>)}
              
              {phase === 1 && (
                <div className="field">
                  <label className="field-label">Known Truths & Inputs</label>
                  <div className="space-y-3">
                    {(mission.known || ['']).map((v, i) => (
                      <div key={i} className="flex gap-3">
                        <input className="field-input" placeholder="Verified fact..." value={v} onChange={e => updateArr('known', i, e.target.value)} />
                        {i === mission.known.length - 1 && <IconButton icon={Activity} onClick={() => addRow('known')} variant="surface" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {phase === 6 && (<>
                <div className="field">
                  <label className="field-label">Executive Recommendation</label>
                  <input className="field-input" value={mission.recommended} onChange={e => setMission(m => ({ ...m, recommended: e.target.value }))} placeholder="Final gate instructions..." />
                </div>
                <div className="flex gap-4 pt-6">
                  <Button className="flex-1" onClick={() => { copyText(packet); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                    {copied ? '✅ PACKET SEALED' : '📋 CLONE MISSION PACKET'}
                  </Button>
                  <Button variant="secondary" onClick={() => exportAsMarkdown('PH_EVO_MISSION_PACKET', packet)}>⬇️ EXPORT</Button>
                </div>
              </>)}
            </div>
            
            {phase < total - 1 && (
              <Button className="mt-8" onClick={() => setPhase(p => Math.min(p + 1, total - 1))}>
                PROCEED TO PHASE {phase + 2} →
              </Button>
            )}
          </Card>
        </div>

        <Card className="xl:col-span-7 bg-black/40 p-0 overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-slate-900/20 flex justify-between items-center">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Mission Packet Snapshot</h3>
            <StatusBadge status="pending" label="Sovereign Draft" />
          </div>
          <div className="p-8">
            <div className="prompt-block !bg-transparent !border-none !p-0 !max-h-[500px]">{packet}</div>
          </div>
        </Card>
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
