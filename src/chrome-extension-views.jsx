import React, { useMemo, useState } from 'react';
import { writeToLocalDisk, downloadFile } from './autonomous-builder.js';
import { BRIDGE_URL } from './config/bridge-config.js';
import { DEFAULT_EXTENSION, buildChromeExtensionFiles } from './features/chrome-extension/builder.js';
import { Puzzle, Save, Download, Copy, Settings, Chrome, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';

export function ChromeExtensionView() {
  const [config, setConfig] = useState(DEFAULT_EXTENSION);
  const [selectedFile, setSelectedFile] = useState('manifest.json');
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const extension = useMemo(() => buildChromeExtensionFiles(config), [config]);
  const files = Object.keys(extension.files);

  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  const writeExtension = async () => {
    setStatus('Writing extension to generated_apps...');
    setIsSuccess(false);
    try {
      const result = await writeToLocalDisk(extension);
      setStatus(result.message || `Wrote generated_apps/${extension.name}`);
      setIsSuccess(true);
    } catch (error) {
      setStatus(error.message);
      setIsSuccess(false);
    }
  };

  const downloadCurrent = () => {
    downloadFile(selectedFile, extension.files[selectedFile]);
  };

  return (
    <div className="flex flex-col gap-6 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-1 flex items-center gap-2">
            <Puzzle size={28} className="text-cyan-400" /> Chrome Extension Builder
          </div>
          <div className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest">
            Manifest V3 extension shell for autonomous page capture and local bridge routing
          </div>
        </div>
        <div className="bg-pink-500/20 text-pink-400 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)] flex items-center gap-2">
          <CheckCircle size={14} /> S+++++ ONLY
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
        
        {/* Left Column - Settings & Actions */}
        <div className="flex flex-col gap-6">
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Settings size={14} className="text-cyan-500" /> Extension Configuration
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Folder Name</label>
                <input 
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono" 
                  value={config.name} 
                  onChange={(event) => update('name', event.target.value)} 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Extension Title</label>
                <input 
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-100 placeholder:text-indigo-900/50 focus:outline-none focus:border-indigo-500/50 transition-colors font-bold" 
                  value={config.title} 
                  onChange={(event) => update('title', event.target.value)} 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-slate-500/50 transition-colors resize-y min-h-[80px]" 
                  value={config.description} 
                  onChange={(event) => update('description', event.target.value)} 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Local Bridge URL</label>
                <input 
                  className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-purple-100 placeholder:text-purple-900/50 focus:outline-none focus:border-purple-500/50 transition-colors font-mono" 
                  value={config.bridgeUrl} 
                  onChange={(event) => update('bridgeUrl', event.target.value)} 
                />
              </div>
              
              <div className="flex flex-col gap-3 mt-2">
                <button 
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 text-xs"
                  onClick={writeExtension}
                >
                  <Save size={16} /> Write Extension to Disk
                </button>
                <button 
                  className="bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 transition-all shadow-[0_0_15px_rgba(217,70,239,0.1)] rounded-xl py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 active:scale-95"
                  onClick={() => navigator.clipboard.writeText(`generated_apps/${extension.name}`)}
                >
                  <Copy size={16} /> Copy Load Path
                </button>
              </div>

              {status && (
                <div className={`mt-2 p-3 rounded-xl text-xs font-bold flex items-start gap-2 border ${
                  isSuccess 
                    ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {isSuccess ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
                  <span className="break-all">{status}</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Chrome size={14} className="text-orange-500" /> Chrome Load Steps
              </div>
            </div>
            <div className="p-6">
              <div className="bg-black/50 border border-white/5 rounded-2xl p-5 text-xs text-slate-300 font-mono leading-relaxed">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click <span className="text-cyan-400 font-bold">Write Extension to Disk</span></li>
                  <li>Open <span className="text-yellow-400 font-bold bg-yellow-500/10 px-1 py-0.5 rounded">chrome://extensions</span></li>
                  <li>Enable <span className="text-white font-bold">Developer mode</span> (top right)</li>
                  <li>Click <span className="text-white font-bold">Load unpacked</span></li>
                  <li>Select <span className="text-indigo-300 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">generated_apps/{extension.name}</span></li>
                  <li>Pin the extension in your toolbar</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - File Viewer */}
        <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden h-full min-h-[600px]">
          <div className="bg-white/5 border-b border-white/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-1">
                <FileCode size={14} className="text-green-500" /> Generated Source
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {files.length} files for Manifest V3
              </div>
            </div>
            <button 
              className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)] rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 active:scale-95"
              onClick={downloadCurrent}
            >
              <Download size={14} /> Download Selected
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[200px_1fr] h-full min-h-0">
            {/* File List */}
            <div className="border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto max-h-[200px] md:max-h-none">
              {files.map((file) => (
                <button 
                  key={file} 
                  className={`text-left px-4 py-3 rounded-xl transition-all font-mono text-[11px] font-bold truncate ${
                    selectedFile === file 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                      : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-slate-200'
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  {file}
                </button>
              ))}
            </div>
            
            {/* File Content */}
            <div className="bg-[#0a0a0f] p-6 overflow-y-auto custom-scrollbar h-[500px] md:h-auto">
              <pre className="text-[11px] text-indigo-200/80 font-mono leading-relaxed whitespace-pre-wrap">
                {extension.files[selectedFile]}
              </pre>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

