import React, { useState } from 'react';
import { Grid, Gamepad2, Palette, Sparkles, RefreshCcw, Download, Eye, Zap } from 'lucide-react';
import { Card, Button } from '../components/primitives.jsx';
import { Log } from '../core/autonomy/SovereignLogger.js';
import { callBridgeEngine } from '../engine.js';

export default function EvoPixelatorDashboard() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [bitDepth, setBitDepth] = useState('8-bit');
  const [palette, setPalette] = useState('cyberpunk');

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setResult(null);
    Log.info(`[EvoPixelator] Quantizing space for: ${prompt}`);

    try {
      const response = await callBridgeEngine(
        `PIXELATE: [PROMPT: ${prompt}] [DEPTH: ${bitDepth}] [PALETTE: ${palette}]`,
        "You are Evo-Pixelator. Respond with pixel-art generation manifest."
      );
      
      setTimeout(() => {
        setResult({
          url: '',
          manifest: response
        });
        setGenerating(false);
      }, 1500);
    } catch (e) {
      Log.error(`[EvoPixelator] Error: ${e.message}`);
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-12">
      <header className="relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#00ff88] opacity-10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-4 text-white drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">
          <Gamepad2 color="#00ff88" size={36} className="drop-shadow-[0_0_10px_#00ff88]" /> 
          Singularity Pixelator
        </h1>
        <p className="text-[#00ff88] font-bold text-xs tracking-[0.2em] uppercase ml-12">Autonomous Asset Quantization Engine</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        <div className="xl:col-span-4 space-y-8">
          <Card className="p-8 border border-[#00ff88]/20 bg-[#050508]/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,136,0.05)]">
            <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-6 flex items-center gap-3">
              <Sparkles size={18} color="#00ff88" /> Sprite Prompt
            </h3>
            <textarea 
              className="w-full bg-[#0a0a10] border border-[#00ff88]/30 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all !min-h-[120px] mb-6 !font-mono" 
              placeholder="e.g. Hero character idle animation sprite sheet..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[10px] font-black text-[#b4b4c4] uppercase tracking-widest mb-3 block">Bit Depth Constraints</label>
                <div className="flex gap-2">
                  {['8-bit', '16-bit', '32-bit'].map(b => (
                    <button 
                      key={b} 
                      onClick={() => setBitDepth(b)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${bitDepth === b ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'bg-[#0a0a10] border-white/10 text-[#737385] hover:border-white/20'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-[#b4b4c4] uppercase tracking-widest mb-3 flex items-center gap-2"><Palette size={12} color="#00ff88"/> Color Palette</label>
                <select 
                  className="w-full bg-[#0a0a10] border border-[#00ff88]/30 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#00ff88] transition-all !font-mono" 
                  value={palette} onChange={e => setPalette(e.target.value)}
                >
                  <option value="cyberpunk">Neon / Singularity</option>
                  <option value="gameboy">Retro Handheld</option>
                  <option value="c64">Commodore 64</option>
                  <option value="pico8">PICO-8 Quantum</option>
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating || !prompt} className="w-full !bg-gradient-to-r !from-[#00ff88] !to-[#00f0ff] !text-black flex justify-center items-center gap-3 !border-none shadow-[0_0_20px_rgba(0,255,136,0.4)] hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] font-black">
              {generating ? <RefreshCcw className="animate-spin" size={18} /> : <Grid size={18} />}
              {generating ? 'QUANTIZING...' : 'GENERATE PIXELS'}
            </Button>
          </Card>
        </div>

        <Card className="xl:col-span-8 bg-[#020205] p-0 overflow-hidden min-h-[500px] flex flex-col relative border border-[#00ff88]/20 shadow-[0_0_30px_rgba(0,255,136,0.05)]" style={{ backgroundImage: 'linear-gradient(45deg, #050508 25%, transparent 25%, transparent 75%, #050508 75%, #050508), linear-gradient(45deg, #050508 25%, transparent 25%, transparent 75%, #050508 75%, #050508)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
          <div className="p-4 border-b border-[#00ff88]/20 bg-[#050508]/80 backdrop-blur-md flex justify-between items-center z-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#00ff88]"><Eye size={14} /> Viewport Engine</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {generating && (
              <div className="absolute inset-0 bg-[#020205]/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                <div className="relative">
                  <Grid className="animate-spin mb-6 relative z-10" color="#00ff88" size={56} />
                  <div className="absolute inset-0 bg-[#00ff88] blur-[30px] opacity-40 animate-pulse" />
                </div>
                <div className="font-bold text-xs tracking-[0.3em] uppercase text-[#00ff88] animate-pulse">Rendering pixels...</div>
              </div>
            )}
            
            {result ? (
              <div className="flex flex-col items-center relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00ff88] blur-[50px] opacity-20" />
                  <img src={result.url} alt="Pixel Art" style={{ imageRendering: 'pixelated' }} className="relative z-10 min-w-[200px] min-h-[200px] bg-black/50 border border-[#00ff88]/40 shadow-[0_0_30px_rgba(0,255,136,0.1)] rounded-lg" />
                </div>
                <div className="mt-8 flex gap-4">
                  <Button variant="ghost" className="!text-[#b4b4c4] hover:!text-white !border border-white/10 hover:!border-white/20 flex items-center gap-2 text-xs"><Download size={14}/> PNG</Button>
                  <Button className="!bg-[#00ff88]/20 !text-[#00ff88] !border !border-[#00ff88]/50 hover:!bg-[#00ff88]/40 shadow-[0_0_15px_rgba(0,255,136,0.2)] flex items-center gap-2 text-xs"><Download size={14}/> SPRITE SHEET</Button>
                </div>
              </div>
            ) : (
              !generating && <div className="text-[#4a4a5e] font-bold text-xs uppercase tracking-[0.2em] flex flex-col items-center gap-4">
                <Grid size={48} className="opacity-20" color="#00ff88" />
                [ QUANTIZER IDLE ]
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
