import React, { useState, useEffect } from 'react';

export default function LocalIntelligenceView() {
  const [ollamaStatus, setOllamaStatus] = useState('Checking...');
  const [models, setModels] = useState([]);
  const [vramUsage, setVramUsage] = useState(45); // simulated percent

  useEffect(() => {
    fetch('http://127.0.0.1:11434/api/tags')
      .then(res => res.json())
      .then(data => {
        setOllamaStatus('ONLINE');
        setModels(data.models || []);
      })
      .catch(() => setOllamaStatus('OFFLINE'));
      
    // Simulate VRAM fluctuation
    const int = setInterval(() => {
      setVramUsage(prev => Math.min(95, Math.max(10, prev + (Math.random() * 10 - 5))));
    }, 3000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-6 glass-extreme border-neon-glow min-h-full font-sans text-white">
      <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-widest text-[#00ffcc] uppercase">Sovereign Local Core</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">100% OFF-GRID INTELLIGENCE NODE</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-col gap-4 items-end">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Hardware Daemon</span>
            <span className={`text-xs font-bold ${ollamaStatus === 'ONLINE' ? 'text-[#00ffcc]' : 'text-red-500'}`}>
              {ollamaStatus}
            </span>
          </div>
          <div className={`w-3 h-3 rounded-full ${ollamaStatus === 'ONLINE' ? 'bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]' : 'bg-red-500'}`}></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111] p-5 rounded-md border-[#333]">
          <h3 className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-4">Active Model</h3>
          <div className="text-xl font-bold text-white mb-1">
            {models.length > 0 ? models[0].name : 'Waiting for pull...'}
          </div>
          <div className="text-[10px] text-[#00ffcc] uppercase tracking-wider">Ollama Inference Engine</div>
        </div>

        <div className="bg-[#111] p-5 rounded-md border-[#333]">
          <h3 className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-4">System VRAM Allocation</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-[#222] rounded overflow-hidden">
              <div 
                className={`h-full ${vramUsage > 85 ? 'bg-red-500' : 'bg-[#00ffcc]'} transition-all duration-500`} 
                style={{ width: `${vramUsage}%` }}
              ></div>
            </div>
            <div className="text-lg font-mono text-white">{vramUsage.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-[#111] p-5 rounded-md border-[#333]">
          <h3 className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-4">Semantic Vector DB</h3>
          <div className="text-xl font-bold text-white mb-1">Active</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">nomic-embed-text // Cosine Dist</div>
        </div>
      </div>

      <div className="bg-[#111] rounded-md border-[#333] overflow-hidden">
        <div className="bg-[#1a1a1a] px-4 py-3 border-b border-[#333]">
          <h3 className="text-xs text-gray-300 font-mono uppercase tracking-widest">Sandbox Execution Firewall</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center text-sm p-3 glass-extreme rounded border-[#222]">
            <div className="flex items-center gap-3">
              <span className="text-[#00ffcc]">✅ GRANTED</span>
              <span className="font-mono text-gray-300">npm install</span>
            </div>
            <span className="text-xs text-gray-500">Auto-Sandbox (Trust Once)</span>
          </div>
          <div className="flex justify-between items-center text-sm p-3 glass-extreme rounded border-[#222]">
            <div className="flex items-center gap-3">
              <span className="text-red-500">🛑 BLOCKED</span>
              <span className="font-mono text-gray-300">rm -rf /</span>
            </div>
            <span className="text-xs text-gray-500">Banned Pattern Match</span>
          </div>
        </div>
      </div>
    </div>
  );
}
