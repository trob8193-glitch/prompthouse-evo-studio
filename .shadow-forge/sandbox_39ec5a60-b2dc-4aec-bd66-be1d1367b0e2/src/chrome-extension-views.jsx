import React, { useMemo, useState } from 'react';
import { writeToLocalDisk, downloadFile } from './autonomous-builder.js';
import { BRIDGE_URL } from './config/bridge-config.js';

import { DEFAULT_EXTENSION, buildChromeExtensionFiles } from './features/chrome-extension/builder.js';

export function ChromeExtensionView() {
  const [config, setConfig] = useState(DEFAULT_EXTENSION);
  const [selectedFile, setSelectedFile] = useState('manifest.json');
  const [status, setStatus] = useState('');
  const extension = useMemo(() => buildChromeExtensionFiles(config), [config]);
  const files = Object.keys(extension.files);

  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  const writeExtension = async () => {
    setStatus('Writing extension to generated_apps...');
    try {
      const result = await writeToLocalDisk(extension);
      setStatus(result.message || `Wrote generated_apps/${extension.name}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const downloadCurrent = () => {
    downloadFile(selectedFile, extension.files[selectedFile]);
  };

  return (
    <div className="flex-col gap-4 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2">Chrome Extension Builder</div>
          <div className="text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8">Manifest V3 extension shell for autonomous page capture, side panel review, and local bridge routing.</div>
        </div>
        <span className="badge badge-pink">S+++++ ONLY</span>
      </div>

      <div className="grid-builder">
        <div className="flex-col gap-4">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl omnipotent-panel">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
              <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Extension Settings</div>
              <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-desc">Dark theme, animated glows, local-first capture. No external service is required.</div>
            </div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body flex-col gap-4">
              <div className="field">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Folder Name</label>
                <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={config.name} onChange={(event) => update('name', event.target.value)} />
              </div>
              <div className="field">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Extension Title</label>
                <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={config.title} onChange={(event) => update('title', event.target.value)} />
              </div>
              <div className="field">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Description</label>
                <textarea className="field-textarea" value={config.description} onChange={(event) => update('description', event.target.value)} />
              </div>
              <div className="field">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Local Bridge URL</label>
                <input className="w-full bg-black/50 border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={config.bridgeUrl} onChange={(event) => update('bridgeUrl', event.target.value)} />
              </div>
              <div className="flex-row gap-8">
                <button className="glass-extreme text-neon-cyan border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-cyan-500/10 hover:scale-[1.02] active:scale-95" onClick={writeExtension}>Write Extension to Disk</button>
                <button className="glass-extreme text-fuchsia-400 border-fuchsia-500/30 hover:border-fuchsia-400 transition-all shadow-[0_0_15px_rgba(217,70,239,0.1)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-fuchsia-500/10 hover:scale-[1.02] active:scale-95" onClick={() => navigator.clipboard.writeText(`generated_apps/${extension.name}`)}>Copy Load Path</button>
              </div>
              {status && <div className="prompt-block" style={{ minHeight: 'unset', maxHeight: 80 }}>{status}</div>}
            </div>
          </div>

          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
              <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Chrome Load Steps</div>
            </div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
              <div className="prompt-block">
{`1. Click "Write Extension to Disk".
2. Open chrome://extensions.
3. Enable Developer mode.
4. Click "Load unpacked".
5. Select generated_apps/${extension.name}.
6. Pin the extension and use Capture Page or Use Selection.`}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
            <div className="flex items-center justify-between">
              <div>
                <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Extension Files</div>
                <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-desc">{files.length} files generated for a real unpacked Chrome extension.</div>
              </div>
              <button className="glass-extreme shadow-[0_0_15px_rgba(217,70,239,0.1)] active:scale-95 text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95-sm" onClick={downloadCurrent}>Save Current File</button>
            </div>
          </div>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body" style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 16 }}>
            <div className="flex-col gap-4" style={{ gap: 5 }}>
              {files.map((file) => (
                <button key={file} className={`nav-item ${selectedFile === file ? 'active' : ''}`} onClick={() => setSelectedFile(file)}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{file}</span>
                </button>
              ))}
            </div>
            <div>
              <div className="prompt-block" style={{ maxHeight: 620, fontSize: 11 }}>
                {extension.files[selectedFile]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
