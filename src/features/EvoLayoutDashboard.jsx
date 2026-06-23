import React, { useState } from 'react';
import { LayoutTemplate, Layers, Cpu, Code2, Download, CheckCircle, RefreshCcw, Maximize, Zap } from 'lucide-react';
import { Card, Button, StatusBadge } from '../components/primitives.jsx';
import { callBridgeEngine } from '../engine.js';
import { Log } from '../core/autonomy/SovereignLogger.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

export default function EvoLayoutDashboard() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [framework, setFramework] = useState('react-tailwind');
  const [previewExpanded, setPreviewExpanded] = useState(false);

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
          code: `// Singularity Auto-Generated Layout: ${prompt}\n\nexport default function Layout() {\n  return (\n    <div className="grid grid-cols-12 min-h-screen bg-(--bg-void) text-white">\n      <aside className="col-span-2 bg-(--bg-surface) border-r border-(--border-dim) backdrop-blur-xl" />\n      <main className="col-span-10 flex-col gap-4 relative overflow-hidden">\n        <header className="h-16 border-b border-(--border-dim) bg-(--bg-surface-top) backdrop-blur-md z-10" />\n        <div className="flex-1 p-8 z-0">\n          {/* Content injects here */}\n        </div>\n      </main>\n    </div>\n  );\n}`,
          manifest: response
        });
        setGenerating(false);
      }, 2500);
    } catch (e) {
      Log.error(`[EvoLayout] Error: ${e.message}`);
      setGenerating(false);
    }
  };

  return (
    <IDEPageLayout
      title="Singularity Layout Engine"
      description="Autonomous Structural Blueprints"
      icon={LayoutTemplate}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        <div className="xl:col-span-4 space-y-8">
          <Card className="p-8 border-[#00f0ff]/20 bg-[#050508]/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,240,255,0.05)]">
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6 flex items-center gap-3">
              <Layers size={18} color="#00f0ff" /> Architectural Prompt
            </h3>
            <textarea 
              className="w-full bg-[#0a0a10] border-[#00f0ff]/30 rounded-3xl p-4 text-white text-sm focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all min-h-[150px]! mb-6" 
              placeholder="e.g. A SaaS dashboard with a deep-space glassmorphic sidebar, neon top nav, and a 3-column data grid..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[10px] font-black text-[#b4b4c4] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Cpu size={12} color="#00f0ff" /> Target Engine
                </label>
                <select 
                  className="w-full bg-[#0a0a10] border-[#00f0ff]/30 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-[#00f0ff] transition-all"
                  value={framework} onChange={e => setFramework(e.target.value)}
                >
                  <option value="react-tailwind">Singularity React (Vite)</option>
                  <option value="flutter">Flutter Neo</option>
                  <option value="swiftui">SwiftUI Quantum</option>
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating || !prompt} className="w-full bg-linear-to-r! from-[#00f0ff]! to-[#8a2be2]! text-white! flex justify-center items-center gap-3 border-none! shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]">
              {generating ? <RefreshCcw className="animate-spin" size={18} /> : <Zap size={18} />}
              {generating ? 'MANIFESTING BLUEPRINT...' : 'ENGAGE GENERATOR'}
            </Button>
          </Card>
        </div>

        <Card className={`${previewExpanded ? 'xl:col-span-12' : 'xl:col-span-8'} bg-[#020205]/90 p-0 overflow-hidden min-h-[500px] flex-col gap-4 relative border-[#00f0ff]/20 shadow-[0_0_30px_rgba(0,240,255,0.05)] backdrop-blur-2xl`}>
          <div className="p-5 border-b border-[#00f0ff]/20 bg-[#050508]/60 flex justify-between items-center z-10 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-[#00f0ff] uppercase tracking-widest flex items-center gap-3">
              <Code2 size={14} /> Structural Hologram
            </h3>
            {result && <StatusBadge status="executing" label="BLUEPRINT READY" />}
          </div>
          
          <div className="flex-1 flex-col gap-4 p-0 relative">
            {generating && (
              <div className="absolute inset-0 bg-[#020205]/80 flex-col gap-4 items-center justify-center z-20 backdrop-blur-md">
                <div className="relative">
                  <LayoutTemplate className="animate-pulse mb-6 relative z-10" color="#00f0ff" size={56} />
                  <div className="absolute inset-0 bg-[#00f0ff] blur-[30px] opacity-40 animate-pulse" />
                </div>
                <div className="font-bold text-xs tracking-[0.3em] uppercase text-[#00f0ff] animate-pulse">Calculating Dimensions...</div>
              </div>
            )}
            
            {result ? (
              <div className="flex-1 flex-col gap-4">
                <div className="p-4 bg-[#050508] border-b border-[#00f0ff]/20 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#b4b4c4] tracking-widest uppercase">Layout.jsx</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewExpanded((value) => !value)}
                      aria-pressed={previewExpanded}
                      className="text-[#737385] hover:text-[#00f0ff] transition-colors"
                    >
                      <Maximize size={16}/>
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-[#020205] p-6 overflow-auto font-mono text-sm text-[#00f0ff] leading-relaxed">
                  <pre className="drop-shadow-[0_0_5px_rgba(0,240,255,0.3)]">{result.code}</pre>
                </div>
                <div className="p-5 border-t border-[#00f0ff]/20 flex justify-end gap-4 bg-[#050508]/80 backdrop-blur-md">
                  <button variant="ghost" className="text-[#b4b4c4]! hover:text-white! flex items-center gap-2 text-[10px]" onClick={() => { if (result?.code) { navigator.clipboard.writeText(result.code); console.log('[EvoLayout] Code copied to clipboard'); } }}><Download size={14}/> EXPORT</button>
                  <button className="bg-[#00f0ff]/20! text-[#00f0ff]! border! border-[#00f0ff]/50! hover:bg-[#00f0ff]/40! shadow-[0_0_15px_rgba(0,240,255,0.2)]" onClick={() => { console.log('[EvoLayout] Deploying to Forge:', result?.code?.substring(0, 100)); }}>DEPLOY TO FORGE</button>
                </div>
              </div>
            ) : (
              !generating && <div className="absolute inset-0 items-center justify-center flex-col gap-6">
                <Layers size={48} color="#00f0ff" className="opacity-10" />
                <div className="text-[#4a4a5e] font-bold text-xs uppercase tracking-[0.2em]">Awaiting Architect Command</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </IDEPageLayout>
  );
}
