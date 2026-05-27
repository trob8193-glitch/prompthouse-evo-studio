import React, { useState } from 'react';
import { LayoutTemplate, Layers, Cpu, Code2, Download, CheckCircle, RefreshCcw, Maximize } from 'lucide-react';
import { Card, Button, StatusBadge } from '../components/primitives.jsx';
import { callBridgeEngine } from '../engine.js';
import { Log } from '../core/autonomy/SovereignLogger.js';

export default function EvoLayoutDashboard() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [framework, setFramework] = useState('react-tailwind');

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setResult(null);
    Log.info(`[EvoLayout] Structuring wireframe for: ${prompt}`);

    try {
      const response = await callBridgeEngine(
        `GENERATE_LAYOUT: [PROMPT: ${prompt}] [FRAMEWORK: ${framework}]`,
        "You are Evo-Layout. Return a JSON structure representing UI wireframe."
      );
      
      setTimeout(() => {
        setResult({
          code: `// Generated Layout: ${prompt}\n\nexport default function Layout() {\n  return (\n    <div className="grid grid-cols-12 min-h-screen">\n      <aside className="col-span-2 bg-slate-900 border-r border-slate-800" />\n      <main className="col-span-10 bg-black flex flex-col">\n        <header className="h-16 border-b border-slate-800" />\n        <div className="flex-1 p-8" />\n      </main>\n    </div>\n  );\n}`,
          manifest: response
        });
        setGenerating(false);
      }, 2000);
    } catch (e) {
      Log.error(`[EvoLayout] Error: ${e.message}`);
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-4 text-[var(--text-primary)]">
          <LayoutTemplate style={{ color: 'var(--accent-color)' }} size={36} /> Evo Layout
        </h1>
        <p className="text-[var(--text-secondary)] font-mono text-sm tracking-widest uppercase">Generative Wireframing & Structural UI Blueprints</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <Card className="p-8">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><Layers size={18} style={{ color: 'var(--accent-color)' }} /> Layout Prompt</h3>
            <textarea 
              className="field-textarea !min-h-[150px] mb-6" 
              placeholder="e.g. A SaaS dashboard with a left sidebar, top nav, and a 3-column masonry grid for cards..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <div className="space-y-6 mb-8">
              <div className="field">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2"><Cpu size={12}/> Target Engine</label>
                <select className="field-select" value={framework} onChange={e => setFramework(e.target.value)}>
                  <option value="react-tailwind">React + Tailwind</option>
                  <option value="flutter">Flutter</option>
                  <option value="swiftui">SwiftUI</option>
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating || !prompt} className="w-full !bg-[var(--accent-color)] !text-white flex justify-center items-center gap-2">
              {generating ? <RefreshCcw className="animate-spin" size={18} /> : <LayoutTemplate size={18} />}
              {generating ? 'BUILDING WIREFRAME...' : 'GENERATE LAYOUT'}
            </Button>
          </Card>
        </div>

        <Card className="xl:col-span-8 bg-black/40 p-0 overflow-hidden min-h-[500px] flex flex-col relative border border-slate-800">
          <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center z-10">
            <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2"><Code2 size={14} /> Structural Blueprint</h3>
            {result && <StatusBadge status="verified" label="SCAFFOLD READY" />}
          </div>
          
          <div className="flex-1 flex flex-col p-0 relative">
            {generating && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                <LayoutTemplate className="animate-pulse mb-4" style={{ color: 'var(--accent-color)' }} size={48} />
                <div className="font-mono text-sm tracking-widest uppercase" style={{ color: 'var(--accent-color)' }}>Calculating Dimensions...</div>
              </div>
            )}
            
            {result ? (
              <div className="flex-1 flex flex-col">
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between">
                  <span className="text-[10px] font-mono text-slate-500">component.jsx</span>
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-white"><Maximize size={14}/></button>
                  </div>
                </div>
                <div className="prompt-block !bg-transparent !border-none !p-6 !m-0 !max-h-full">
                  {result.code}
                </div>
                <div className="p-6 border-t border-slate-800 flex justify-end gap-4 bg-slate-900/30">
                  <Button variant="secondary" className="flex items-center gap-2"><Download size={14}/> EXPORT COMPONENT</Button>
                  <Button className="!bg-indigo-500">SEND TO CODE FORGE</Button>
                </div>
              </div>
            ) : (
              !generating && <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono text-xs uppercase tracking-widest flex-col gap-4">
                <Layers size={32} className="opacity-20" /> No Blueprint Active
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
