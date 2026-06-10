import React, { useState } from 'react';
import { Aperture, Sparkles, Sliders, Image as ImageIcon, Download, CheckCircle, RefreshCcw } from 'lucide-react';
import { Card, Button } from '../components/primitives.jsx';
import { callBridgeEngine } from '../engine.js';
import { Log } from '../core/autonomy/SovereignLogger.js';

export default function EvoDiffuserDashboard() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [steps, setSteps] = useState(30);
  const [cfg, setCfg] = useState(7);
  const [engine, setEngine] = useState('dalle');

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setImageResult(null);
    Log.info(`[EvoDiffuser] Generating Latent Architecture via ${engine.toUpperCase()}: ${prompt}`);
    
    try {
      const res = await fetch((globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001') + '/api/diffuser/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, steps, cfg, engine })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error during generation');
      }

      setImageResult({
        url: data.url,
        manifest: data
      });
    } catch (e) {
      Log.error(`[EvoDiffuser] Generation failed: ${e.message}`);
      alert(`Generation failed: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-4 text-[var(--text-primary)]">
          <Aperture style={{ color: 'var(--accent-color)' }} size={36} /> Evo Diffuser
        </h1>
        <p className="text-[var(--text-secondary)] font-mono text-sm tracking-widest uppercase">Latent UI Architecture & High-Fidelity Asset Generation</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-5 space-y-8">
          <Card className="p-8">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><Sparkles size={18} /> Latent Prompt</h3>
            <textarea 
              className="field-textarea !min-h-[150px] mb-6" 
              placeholder="e.g. A sleek glassmorphism dashboard, dark theme, glowing indigo accents, highly detailed, 4k..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <div className="space-y-6 mb-8">
              <div className="field">
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Generative Engine</label>
                </div>
                <select 
                  value={engine} 
                  onChange={e => setEngine(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-sm font-bold text-white focus:outline-none focus:border-[var(--accent-color)]"
                >
                  <option value="dalle">DALL-E 3 (Cloud API - High Fidelity)</option>
                  <option value="stablediffusion">Stable Diffusion / Automatic1111 (Local Offline - High Control)</option>
                </select>
              </div>

              {engine === 'stablediffusion' && (
                <>
                  <div className="field">
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Denoising Steps ({steps})</label>
                    </div>
                    <input type="range" min="10" max="150" value={steps} onChange={e => setSteps(Number(e.target.value))} className="w-full accent-yellow-400" />
                  </div>
                  <div className="field">
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CFG Scale ({cfg})</label>
                    </div>
                    <input type="range" min="1" max="20" step="0.5" value={cfg} onChange={e => setCfg(Number(e.target.value))} className="w-full accent-yellow-400" />
                  </div>
                </>
              )}
            </div>

            <Button onClick={handleGenerate} disabled={generating || !prompt} className="w-full !bg-[var(--accent-color)] !text-white flex justify-center items-center gap-2">
              {generating ? <RefreshCcw className="animate-spin" size={18} /> : <Aperture size={18} />}
              {generating ? 'DIFFUSING LATENT SPACE...' : 'GENERATE ARCHITECTURE'}
            </Button>
          </Card>
        </div>

        <Card className="xl:col-span-7 bg-black/40 p-0 overflow-hidden min-h-[500px] flex flex-col relative border border-slate-800">
          <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center z-10">
            <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Output Canvas</h3>
            {imageResult && <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10} /> RENDERED</span>}
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {generating && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                <Aperture className="animate-spin mb-4" style={{ color: 'var(--accent-color)' }} size={48} />
                <div className="font-mono text-sm tracking-widest uppercase" style={{ color: 'var(--accent-color)' }}>Refining Chaos into Truth...</div>
              </div>
            )}
            
            {imageResult ? (
              <div className="w-full h-full flex flex-col items-center relative group">
                <img src={imageResult.url} alt="Generated UI" className="w-full h-full object-cover rounded-xl shadow-2xl border border-slate-700" />
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" className="flex items-center gap-2 backdrop-blur-md bg-black/50 border-slate-600"><Download size={14}/> EXPORT ASSET</Button>
                </div>
              </div>
            ) : (
              !generating && <div className="text-slate-600 font-mono text-xs uppercase tracking-widest flex flex-col items-center gap-4"><ImageIcon size={32} className="opacity-20" /> Waiting for prompt...</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
