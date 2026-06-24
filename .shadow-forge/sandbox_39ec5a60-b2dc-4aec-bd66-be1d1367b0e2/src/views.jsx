import React, { useState, useMemo } from 'react';
import { MOBILE_ARCHITECTURES, CODE_TEMPLATES, CHAIN_STEP_TYPES, MISSION_PHASES, TRUTH_STATES, buildChainPrompt, buildMissionPacket, exportAsMarkdown, exportAsText, exportAsJson } from './mobile-engine.js';
import { useEvoStore, useSovereignStore } from './store.js';
import { Card, Button, Panel, StateView, StatusBadge } from './components/primitives.jsx';
import { UniversalBridge } from './core/interop/UniversalBridge.js';

function copyText(t) { navigator.clipboard.writeText(t); }

// ── CODE FORGE ──────────────────────────────────────────────
export function CodeForgeView() {
  const addNotification = useSovereignStore(s => s.addNotification);
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
    <div className="module-container border-t-2 border-t-cyan-500">
      <div className="module-header flex-col items-start gap-1">
        <div className="module-title text-cyan-500">🏗️ Code Forge</div>
        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Generate 100% executable Flutter & React Native code.</div>
      </div>

      <div className="module-content p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-5 space-y-8">
            <div className="bg-black/40 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Generator Configuration</h3>
              <div className="space-y-6">
                <div className="field">
                  <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Target Template</label>
                  <select className="field-select" value={lang} onChange={e => setLang(e.target.value)}>
                    {GENERATORS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">{GENERATORS.find(g => g.id === lang)?.desc}</p>
                </div>
                {['flutter_feature','rn_component','zustand_store'].includes(lang) && (
                  <div className="field">
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Feature / Model Identity</label>
                    <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" ghostInput="Auth" value={feature} onChange={e => setFeature(e.target.value)} />
                  </div>
                )}
                {['flutter_pubspec','api_service','flutter_router'].includes(lang) && (
                  <div className="field">
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">App / Service Namespace</label>
                    <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" ghostInput="MyApp" value={appName} onChange={e => setAppName(e.target.value)} />
                  </div>
                )}
                {lang === 'flutter_feature' && (
                  <div className="field">
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Architecture Paradigm</label>
                    <select className="field-select" value={arch} onChange={e => setArch(e.target.value)}>
                      {Object.values(MOBILE_ARCHITECTURES).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                    </select>
                  </div>
                )}
                {lang === 'api_service' && (
                  <div className="field">
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Core API Endpoint</label>
                    <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" ghostInput="https://api.example.com/v1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <Button className="flex-1" onClick={() => { copyText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                    {copied ? '✅ COPIED TO CLIPBOARD' : '📋 CLONE SOURCE CODE'}
                  </Button>
                  <Button variant="secondary" onClick={async () => {
                    const bridge = new UniversalBridge();
                    const res = await bridge.dispatch('codeforge', 'save', { filename: `${feature || 'Feature'}.dart`, content: code });
                    if (res.success) addNotification({ msg: `Saved to: ${res.path}`, type: 'success' });
                    else addNotification({ msg: `Save failed: ${res.error}`, type: 'error' });
                  }}>💾 SAVE TO PROJECT</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-500/5 border-emerald-500/20 p-8 rounded-2xl">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Evo Studio Truth State</h3>
              <ul className="space-y-3">
                {['No Ghost-Shells — all code is executable','Production-grade architectural patterns','Logic integrity verified via physical audit','Verified via autonomous evolution loops'].map((r,i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="xl:col-span-7 flex-col gap-4 p-0 overflow-hidden bg-black/40 rounded-2xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <div className="p-8 border-b shadow-[0_0_15px_rgba(0,240,255,0.05)] flex justify-between items-center glass-extreme border-neon-glow/20">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Master-Grade Output</h3>
              <StatusBadge status="verified" label="100% EXECUTABLE" />
            </div>
            <div className="flex-1 p-8">
              <div className="prompt-block max-h-[600px]! bg-transparent! border-none! p-0!">{code}</div>
            </div>
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
    <div className="module-container border-t-2 border-t-indigo-500">
      <div className="module-header flex-col items-start gap-1">
        <div className="module-title text-indigo-500">📱 Mobile Architect</div>
        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Choose your architecture paradigm. Get the full scaffold and CLI logic.</div>
      </div>

      <div className="module-content p-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(MOBILE_ARCHITECTURES).map(a => (
            <motion.div 
              key={a.id} 
              whileHover={{ y: -5 }}
              onClick={() => setSelected(a.id)}
              className={`cursor-pointer p-8 rounded-[32px] border-2 transition-all duration-300 ${
                selected === a.id 
                  ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                  : 'glass-extreme border-neon-glow/50 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:border-cyan-500/30'
              }`}
            >
              <div className="text-4xl mb-6">{a.icon}</div>
              <h3 className={`text-xl font-black mb-2 ${selected === a.id ? 'text-white' : 'text-slate-400'}`}>{a.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{a.desc}</p>
              <div className="flex-wrap gap-2">
                {a.layers.map(l => <span key={l} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded text-slate-400">{l}/</span>)}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-5">
            <div className="h-full flex-col gap-4 p-10 bg-black/40 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-2xl">
              <h3 className="text-xl font-black text-white mb-8">Architectural Specs</h3>
              <div className="space-y-8 flex-1">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Technology Stack</span>
                  <p className="font-mono text-sm text-neon-cyan leading-relaxed bg-indigo-500/5 p-4 rounded-3xl border-indigo-500/10">{arch.stack}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Logic Flow</span>
                  <div className="flex-wrap gap-3">
                    {arch.layers.map((l, i) => (
                      <React.Fragment key={l}>
                        <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-2xl text-xs font-bold text-slate-300 border-cyan-500/30">{l}</span>
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
            </div>
          </div>
          <div className="xl:col-span-7 bg-black/40 p-0 overflow-hidden rounded-2xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex-col gap-4">
             <div className="p-8 border-b shadow-[0_0_15px_rgba(0,240,255,0.05)] glass-extreme border-neon-glow/20">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Paradigm Definition Prompt</h3>
            </div>
            <div className="p-8 flex-1">
              <div className="prompt-block bg-transparent! border-none! p-0! max-h-[400px]!">{archPrompt}</div>
            </div>
          </div>
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
    <div className="module-container border-t-2 border-t-fuchsia-500">
      <div className="module-header flex-col items-start gap-1">
        <div className="w-full flex justify-between items-center">
          <div>
            <div className="module-title text-fuchsia-500">🚀 Mission Control</div>
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Intake → Synthesis → Route → Execution → Verification</div>
          </div>
          <div className="flex-col items-end gap-2">
            <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">Master Workflow Progress</span>
            <div className="flex gap-1.5">
              {MISSION_PHASES.map((_, i) => (
                <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${i <= phase ? 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-black/40 backdrop-blur-md border-white/5'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="module-content p-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-2 glass-extreme rounded-[32px] border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]/50 backdrop-blur-xl">
          {MISSION_PHASES.map((p, i) => (
            <button 
              key={p.id} 
              onClick={() => setPhase(i)} 
              className={`flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-300 ${
                i === phase 
                  ? 'bg-fuchsia-500 text-white shadow-xl shadow-fuchsia-500/20' 
                  : i < phase 
                    ? 'text-emerald-400 hover:bg-black/40 backdrop-blur-md border-white/5/50' 
                    : 'text-slate-500 hover:bg-black/40 backdrop-blur-md border-white/5/30'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-5">
            <div className="p-10 h-full flex-col gap-4 bg-black/40 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-2xl">
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
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Primary Mission Objective</label>
                    <textarea className="field-textarea min-h-[120px]!" ghostInput="Define the end-state reality..." value={mission.objective} onChange={e => setMission(m => ({ ...m, objective: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Executive Owner</label>
                    <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={mission.owner} onChange={e => setMission(m => ({ ...m, owner: e.target.value }))} />
                  </div>
                </>)}
                
                {phase === 1 && (
                  <div className="field">
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Known Truths & Inputs</label>
                    <div className="space-y-3">
                      {(mission.known || ['']).map((v, i) => (
                        <div key={i} className="flex gap-3">
                          <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" ghostInput="Verified fact..." value={v} onChange={e => updateArr('known', i, e.target.value)} />
                          {i === mission.known.length - 1 && <Button className="px-4" variant="secondary" onClick={() => addRow('known')}>+</Button>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {phase === 6 && (<>
                  <div className="field">
                    <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Executive Recommendation</label>
                    <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={mission.recommended} onChange={e => setMission(m => ({ ...m, recommended: e.target.value }))} ghostInput="Final gate instructions..." />
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
            </div>
          </div>

          <div className="xl:col-span-7 bg-black/40 p-0 overflow-hidden rounded-2xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex-col gap-4">
            <div className="p-8 border-b shadow-[0_0_15px_rgba(0,240,255,0.05)] glass-extreme border-neon-glow/20 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Mission Packet Snapshot</h3>
              <StatusBadge status="pending" label="Evo Studio Draft" />
            </div>
            <div className="p-8 flex-1">
              <div className="prompt-block bg-transparent! border-none! p-0! max-h-[500px]!">{packet}</div>
            </div>
          </div>
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
    <div className="module-container border-t-2 border-t-amber-500">
      <div className="module-header flex-col items-start gap-1">
        <div className="w-full flex justify-between items-center">
          <div>
            <div className="module-title text-amber-500">🔗 Prompt Chain Builder</div>
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Wire multiple prompts into a sequential execution pipeline.</div>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => { copyText(chain); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✅ COPIED!' : '📋 COPY CHAIN'}</Button>
            <Button variant="secondary" onClick={() => exportAsMarkdown('PH_EVO_PROMPT_CHAIN', chain)}>⬇️ EXPORT</Button>
          </div>
        </div>
      </div>

      <div className="module-content p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="flex-col gap-4 space-y-6">
            {/* Step type picker */}
            <div className="bg-black/40 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] p-6 rounded-2xl">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Add Step</h3>
              <div className="flex-wrap gap-2">
                {CHAIN_STEP_TYPES.map(t => (
                  <button key={t.id} className="px-4 py-2 rounded-2xl text-xs font-bold transition-all border" onClick={() => addStep(t.id)} style={{ borderColor: t.color + '44', color: t.color, backgroundColor: t.color + '10' }}>{t.icon} {t.label}</button>
                ))}
              </div>
            </div>
            {/* Steps */}
            {steps.map((step, i) => {
              const type = CHAIN_STEP_TYPES.find(t => t.id === step.type);
              return (
                <div key={step.id} className="glass-extreme border-neon-glow/40 rounded-2xl border" style={{ borderColor: (type?.color || '#fff') + '33' }}>
                  <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: (type?.color || '#fff') + '22', backgroundColor: (type?.color || '#fff') + '0a' }}>
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{type?.icon}</span>
                      <select className="field-select w-auto! py-1! text-xs!" value={step.type} onChange={e => updateType(step.id, e.target.value)}>
                        {CHAIN_STEP_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-black/40 px-2 py-1 rounded">Step {i + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {i > 0 && <button className="text-slate-400 hover:text-white px-2" onClick={() => moveUp(i)}>↑</button>}
                      <button className="text-rose-400 hover:text-rose-300 px-2 font-bold" onClick={() => removeStep(step.id)}>✕</button>
                    </div>
                  </div>
                  <div className="p-4">
                    <textarea className="field-textarea min-h-[80px]!" ghostInput={`${type?.label} instructions...`} value={step.content} onChange={e => updateStep(step.id, e.target.value)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-black/40 rounded-2xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex-col gap-4 overflow-hidden">
            <div className="p-6 border-b shadow-[0_0_15px_rgba(0,240,255,0.05)] glass-extreme border-neon-glow/20">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Chain Preview</h3>
            </div>
            <div className="p-6 flex-1">
              <div className="prompt-block bg-transparent! border-none! p-0! max-h-[600px]!">{chain || 'Add steps to build your chain...'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EXPORT LAB ───────────────────────────────────────────────
export function ExportLabView() {
  const addNotification = useSovereignStore(s => s.addNotification);
  const { vault, history } = useEvoStore();
  const [format, setFormat] = useState('md');
  const [selected, setSelected] = useState([]);
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const exportSelected = () => {
    const items = vault.filter(v => selected.includes(v.id));
    if (!items.length) return addNotification({ msg: 'Select at least one vault item.', type: 'error' });
    const content = items.map(item => `## ${item.task}\nDomain: ${item.domain} | Strictness: ${item.strictness} | Score: ${item.score}%\n\n### System Prompt\n${item.prompts?.systemPrompt || ''}\n\n### Execution Prompt\n${item.prompts?.executionPrompt || ''}\n\n### Release Gate\n${item.prompts?.releaseGatePrompt || ''}\n\n---`).join('\n\n');
    if (format === 'md') exportAsMarkdown('PH_Evo_Vault_Export', content);
    else if (format === 'txt') exportAsText('PH_Evo_Vault_Export', content);
    else exportAsJson('PH_Evo_Vault_Export', items);
  };

  return (
    <div className="module-container border-t-2 border-t-emerald-500">
      <div className="module-header flex-col items-start gap-1">
        <div className="w-full flex justify-between items-center">
          <div>
            <div className="module-title text-emerald-500">📤 Export Lab</div>
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">Export prompt stacks, session history, and mission packets in any format.</div>
          </div>
        </div>
      </div>

      <div className="module-content p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-black/40 rounded-2xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex-col gap-4 overflow-hidden">
            <div className="p-6 border-b shadow-[0_0_15px_rgba(0,240,255,0.05)] glass-extreme border-neon-glow/20">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Select Vault Items</h3>
            </div>
            <div className="p-6 flex-col gap-4 space-y-2">
              {vault.length === 0 ? (
                <div className="flex-col gap-4 items-center justify-center p-12 text-slate-500">
                  <div className="text-4xl mb-4">🗄️</div>
                  <div className="text-sm font-bold text-white mb-2">Vault is empty</div>
                  <div className="text-xs">Save prompts from the Builder first.</div>
                </div>
              ) : vault.map(item => (
                <label key={item.id} className="flex items-center gap-4 p-4 shadow-[0_0_15px_rgba(0,240,255,0.05)]/50 glass-extreme hover:bg-black/40 backdrop-blur-md border-white/5/50 rounded-3xl cursor-pointer transition-all">
                  <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} className="w-5 h-5 accent-emerald-500 bg-black/40 backdrop-blur-md border-cyan-500/30 rounded" />
                  <div>
                    <div className="text-sm font-bold text-white">{item.task?.slice(0, 60)}{item.task?.length > 60 ? '...' : ''}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{item.domain} · {item.score}% · {item.saved}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-black/40 rounded-2xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex-col gap-4 overflow-hidden">
            <div className="p-6 border-b shadow-[0_0_15px_rgba(0,240,255,0.05)] glass-extreme border-neon-glow/20">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Export Options</h3>
            </div>
            <div className="p-6 flex-col gap-4 space-y-6">
              <div className="field">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Format</label>
                <div className="flex gap-2">
                  {['md','txt','json'].map(f => (
                    <button key={f} className={`flex-1 py-3 rounded-3xl text-xs font-bold transition-all border ${format === f ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'glass-extreme border-neon-glow border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] text-slate-400 hover:bg-black/40 backdrop-blur-md border-white/5'}`} onClick={() => setFormat(f)}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-slate-400 p-4 glass-extreme border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-3xl leading-relaxed">
                {format === 'md' && '📝 Markdown — Full prompt stacks with headers. Best for Notion, GitHub, docs.'}
                {format === 'txt' && '📄 Plain text — Stripped format. Best for pasting into OpenAI/Claude.'}
                {format === 'json' && '🔧 JSON — Structured data with all metadata. Best for API integration.'}
              </div>

              <Button className="w-full py-4" onClick={exportSelected}>⬇️ EXPORT {selected.length > 0 ? `${selected.length} ITEMS` : 'SELECTED'}</Button>
              
              <div className="border-t border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] pt-6 mt-2 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Quick Exports</h4>
                <Button variant="secondary" className="w-full" onClick={() => { const c = history.map(h => `${h.time} | ${h.domain} | ${h.score}% | ${h.task}`).join('\n'); exportAsText('PH_Evo_Session_History', c); }}>📜 EXPORT SESSION HISTORY</Button>
                <Button variant="secondary" className="w-full" onClick={() => exportAsJson('PH_Evo_Full_Vault', vault)}>🗄️ EXPORT FULL VAULT (JSON)</Button>
                <Button variant="secondary" className="w-full" onClick={() => { const agent = { name: 'PromptHouse Evo Studio', model: 'gpt-4o', instructions: 'You are PH Evo Studio Operator. See attached knowledge files for full instructions.' }; exportAsJson('PH_Evo_Agent_Config', agent); }}>🤖 EXPORT AGENT CONFIG</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
