import React, { useState } from 'react';
import { Aperture, Sparkles, Sliders, Image as ImageIcon, Download, CheckCircle, RefreshCcw, Zap } from 'lucide-react';
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
      const res = await fetch((globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001'))))))) + '/api/diffuser/generate', {
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
      <header className="relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#8a2be2] opacity-10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-4 text-white drop-shadow-[0_0_15px_rgba(138,43,226,0.4)]">
          <Aperture color="#8a2be2" size={36} className="drop-shadow-[0_0_10px_#8a2be2]" /> 
          Singularity Diffuser
        </h1>
        <p className="text-[#8a2be2] font-bold text-xs tracking-[0.2em] uppercase ml-12">Latent UI Architecture & High-Fidelity Synthesis</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        <div className="xl:col-span-5 space-y-8">
          <Card className="p-8 border border-[#8a2be2]/20 bg-[#050508]/80 backdrop-blur-xl shadow-[0_0_30px_rgba(138,43,226,0.05)]">
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6 flex items-center gap-3">
              <Sparkles size={18} color="#8a2be2" /> Latent Prompt
            </h3>
            <textarea 
              className="w-full bg-[#0a0a10] border border-[#8a2be2]/30 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2] transition-all !min-h-[150px] mb-6" 
              placeholder="e.g. A sleek glassmorphism dashboard, deep space void, glowing cyan accents, dynamic 4k render..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[10px] font-black text-[#b4b4c4] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={12} color="#8a2be2" /> Generative Matrix
                </label>
                <select 
                  value={engine} 
                  onChange={e => setEngine(e.target.value)}
                  className="w-full bg-[#0a0a10] border border-[#8a2be2]/30 rounded-lg p-3 text-sm font-bold text-white focus:outline-none focus:border-[#8a2be2] transition-all"
                >
                  <option value="dalle">DALL-E 3 (Cloud API - High Fidelity)</option>
                  <option value="stablediffusion">Stable Diffusion (Local Offline - High Control)</option>
                </select>
              </div>

              {engine === 'stablediffusion' && (
                <div className="bg-[#050508] p-5 rounded-lg border border-white/5 space-y-5">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black text-[#b4b4c4] uppercase tracking-widest flex items-center gap-2"><Sliders size={12} color="#8a2be2"/> Denoising Steps</label>
                      <span className="text-[#8a2be2] font-mono text-xs">{steps}</span>
                    </div>
                    <input type="range" min="10" max="150" value={steps} onChange={e => setSteps(Number(e.target.value))} className="w-full accent-[#8a2be2]" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black text-[#b4b4c4] uppercase tracking-widest flex items-center gap-2"><Sliders size={12} color="#8a2be2"/> CFG Scale</label>
                      <span className="text-[#8a2be2] font-mono text-xs">{cfg}</span>
                    </div>
                    <input type="range" min="1" max="20" step="0.5" value={cfg} onChange={e => setCfg(Number(e.target.value))} className="w-full accent-[#8a2be2]" />
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleGenerate} disabled={generating || !prompt} className="w-full !bg-gradient-to-r !from-[#8a2be2] !to-[#00f0ff] !text-white flex justify-center items-center gap-3 !border-none shadow-[0_0_20px_rgba(138,43,226,0.4)] hover:shadow-[0_0_30px_rgba(138,43,226,0.6)] font-black uppercase tracking-widest">
              {generating ? <RefreshCcw className="animate-spin" size={18} /> : <Aperture size={18} />}
              {generating ? 'DIFFUSING LATENT SPACE...' : 'ENGAGE DIFFUSER'}
            </Button>
          </Card>
        </div>

        <Card className="xl:col-span-7 bg-[#020205]/90 p-0 overflow-hidden min-h-[500px] flex flex-col relative border border-[#8a2be2]/20 shadow-[0_0_30px_rgba(138,43,226,0.05)] backdrop-blur-2xl">
          <div className="p-5 border-b border-[#8a2be2]/20 bg-[#050508]/60 flex justify-between items-center z-10 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-[#8a2be2] uppercase tracking-widest flex items-center gap-3"><ImageIcon size={14} /> Output Canvas</h3>
            {imageResult && <span className="text-[10px] font-black text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(0,255,136,0.2)]"><CheckCircle size={10} /> RENDERED</span>}
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {generating && (
              <div className="absolute inset-0 bg-[#020205]/80 flex flex-col items-center justify-center z-20 backdrop-blur-md">
                <div className="relative">
                  <Aperture className="animate-spin mb-6 relative z-10" color="#8a2be2" size={56} />
                  <div className="absolute inset-0 bg-[#8a2be2] blur-[30px] opacity-40 animate-pulse" />
                </div>
                <div className="font-bold text-xs tracking-[0.3em] uppercase text-[#8a2be2] animate-pulse">Refining Chaos into Truth...</div>
              </div>
            )}
            
            {imageResult ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative group p-4">
                <div className="relative w-full max-h-[600px] flex justify-center items-center">
                  <div className="absolute inset-0 bg-[#8a2be2] blur-[50px] opacity-20" />
                  <img src={imageResult.url} alt="Generated UI" className="relative z-10 max-w-full max-h-full object-contain rounded-xl shadow-[0_0_40px_rgba(138,43,226,0.3)] border border-[#8a2be2]/40" />
                </div>
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button variant="ghost" className="flex items-center gap-2 backdrop-blur-xl bg-[#050508]/80 border border-[#8a2be2]/50 text-[#8a2be2] hover:bg-[#8a2be2]/20 shadow-[0_0_20px_rgba(138,43,226,0.3)]"><Download size={14}/> EXPORT ASSET</Button>
                </div>
              </div>
            ) : (
              !generating && <div className="text-[#4a4a5e] font-bold text-xs uppercase tracking-[0.2em] flex flex-col items-center gap-6">
                <ImageIcon size={48} className="opacity-10" color="#8a2be2" />
                [ DIFFUSER IDLE ]
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
