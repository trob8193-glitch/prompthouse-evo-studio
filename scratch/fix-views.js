import fs from 'node:fs';

const path = 'src/views.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `import React, { useState, useMemo } from 'react';
import { MOBILE_ARCHITECTURES, CODE_TEMPLATES, CHAIN_STEP_TYPES, MISSION_PHASES, TRUTH_STATES, buildChainPrompt, buildMissionPacket, exportAsMarkdown, exportAsText, exportAsJson } from './mobile-engine.js';
import { useEvoStore } from './store.js';
import { Card, Button, Panel, StateView, StatusBadge } from './components/primitives.jsx';
import { UniversalBridge } from './core/interop/UniversalBridge.js';
                  const res = await bridge.dispatch('codeforge', 'save', { filename: \`\${feature || 'Feature'}.dart\`, content: code });`;

const replacement = `import React, { useState, useMemo } from 'react';
import { MOBILE_ARCHITECTURES, CODE_TEMPLATES, CHAIN_STEP_TYPES, MISSION_PHASES, TRUTH_STATES, buildChainPrompt, buildMissionPacket, exportAsMarkdown, exportAsText, exportAsJson } from './mobile-engine.js';
import { useEvoStore } from './store.js';
import { Card, Button, Panel, StateView, StatusBadge } from './components/primitives.jsx';
import { UniversalBridge } from './core/interop/UniversalBridge.js';

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
    } catch (e) { return \`// Error: \${e.message}\`; }
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
                  <input className="field-input" ghostInput="Auth" value={feature} onChange={e => setFeature(e.target.value)} />
                </div>
              )}
              {['flutter_pubspec','api_service','flutter_router'].includes(lang) && (
                <div className="field">
                  <label className="field-label">App / Service Namespace</label>
                  <input className="field-input" ghostInput="MyApp" value={appName} onChange={e => setAppName(e.target.value)} />
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
                  <input className="field-input" ghostInput="https://api.example.com/v1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <Button className="flex-1" onClick={() => { copyText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  {copied ? '✅ COPIED TO CLIPBOARD' : '📋 CLONE SOURCE CODE'}
                </Button>
                <Button variant="secondary" onClick={async () => {
                  const bridge = new UniversalBridge();
                  const res = await bridge.dispatch('codeforge', 'save', { filename: \`\${feature || 'Feature'}.dart\`, content: code });`;

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully restored CodeForgeView in views.jsx!');
} else {
  console.error('Target imports/codeforge block not found in views.jsx!');
}
