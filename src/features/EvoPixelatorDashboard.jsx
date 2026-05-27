import React, { useState } from 'react';
import { Grid, Gamepad2, Palette, Sparkles, RefreshCcw, Download, Eye } from 'lucide-react';
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
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-4 text-[var(--text-primary)]">
          <Gamepad2 style={{ color: 'var(--accent-color)' }} size={36} /> Evo Pixelator
        </h1>
        <p className="text-[var(--text-secondary)] font-mono text-sm tracking-widest uppercase">Retro Engine & Asset Quantization</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <Card className="p-8 border-fuchsia-500/20">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><Sparkles size={18} style={{ color: 'var(--accent-color)' }} /> Sprite Prompt</h3>
            <textarea 
              className="field-textarea !min-h-[120px] mb-6 !font-mono text-xs" 
              placeholder="e.g. Hero character idle animation sprite sheet..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <div className="space-y-6 mb-8">
              <div className="field">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Bit Depth Constraints</label>
                <div className="flex gap-2">
                  {['8-bit', '16-bit', '32-bit'].map(b => (
                    <button 
                      key={b} 
                      onClick={() => setBitDepth(b)}
                      className={`flex-1 py-2 px-3 rounded text-xs font-bold border transition-colors ${bitDepth === b ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2"><Palette size={12}/> Color Palette</label>
                <select className="field-select !font-mono text-xs" value={palette} onChange={e => setPalette(e.target.value)}>
                  <option value="cyberpunk">Cyberpunk Neon</option>
                  <option value="gameboy">GameBoy Classic</option>
                  <option value="c64">Commodore 64</option>
                  <option value="pico8">PICO-8</option>
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={generating || !prompt} className="w-full !bg-[var(--accent-color)] !text-white flex justify-center items-center gap-2 !rounded-none">
              {generating ? <RefreshCcw className="animate-spin" size={18} /> : <Grid size={18} />}
              {generating ? 'QUANTIZING...' : 'GENERATE PIXELS'}
            </Button>
          </Card>
        </div>

        <Card className="xl:col-span-8 bg-black/80 p-0 overflow-hidden min-h-[500px] flex flex-col relative border-2 border-slate-800 !rounded-none" style={{ backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center z-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--accent-color)' }}><Eye size={14} /> Viewport</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {generating && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                <Grid className="animate-spin mb-4" style={{ color: 'var(--accent-color)' }} size={48} />
                <div className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--accent-color)' }}>Rendering pixels...</div>
              </div>
            )}
            
            {result ? (
              <div className="flex flex-col items-center">
                <img src={result.url} alt="Pixel Art" style={{ imageRendering: 'pixelated' }} className="max-w-[400px] shadow-[0_0_50px_rgba(217,70,239,0.3)] border-4 border-slate-800" />
                <div className="mt-8 flex gap-4">
                  <Button variant="secondary" className="!rounded-none !font-mono text-xs !border-slate-700 flex items-center gap-2"><Download size={14}/> PNG</Button>
                  <Button variant="secondary" className="!rounded-none !font-mono text-xs !border-slate-700 flex items-center gap-2"><Download size={14}/> SPRITE SHEET</Button>
                </div>
              </div>
            ) : (
              !generating && <div className="text-slate-700 font-mono text-[10px] uppercase tracking-widest">[ SYSTEM IDLE ]</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
