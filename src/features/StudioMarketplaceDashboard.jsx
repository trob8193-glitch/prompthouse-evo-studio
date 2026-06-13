import React, { useState, useEffect } from 'react';
import { Download, Package, Box, Search, ExternalLink, Zap, Terminal, Code2, CheckCircle2 } from 'lucide-react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';

export default function StudioMarketplaceDashboard() {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, ide, ai, raw
  const [tethering, setTethering] = useState(null);
  const [tethered, setTethered] = useState(new Set());

  useEffect(() => {
    safeFetchBridge('/api/marketplace/catalog')
      .then(res => {
        if (!res.ok) throw new Error(res.error || 'Failed to fetch catalog');
        setCatalog(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleTether = async (ext) => {
    setTethering(ext.id);
    
    try {
      const res = await safeFetchBridge(`/api/marketplace/install/${ext.id || ext.extensionId}`);
      if (!res.ok) throw new Error(res.error || 'Failed to install extension');
      
      setTethered(prev => {
        const next = new Set(prev);
        next.add(ext.id || ext.extensionId);
        return next;
      });
    } catch (e) {
      console.error(e);
      alert('Failed to tether: ' + e.message);
    } finally {
      setTethering(null);
    }
  };

  const tabs = ['all', 'ide', 'ai', 'raw'];

  const headerActions = (
    <div className="flex gap-2">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${
            activeTab === tab 
              ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <IDEPageLayout 
        title="Omni-Marketplace"
        subtitle="Universal format distribution hub"
        icon={Box}
      >
        <div className="flex items-center justify-center h-full text-[#00f0ff] animate-pulse">
          <Zap className="mr-3" /> Initializing Omni-Marketplace...
        </div>
      </IDEPageLayout>
    );
  }

  if (error) {
    return (
      <IDEPageLayout 
        title="Omni-Marketplace"
        subtitle="Universal format distribution hub"
        icon={Box}
      >
        <div className="p-8 text-red-400 bg-red-900/20 rounded-xl border border-red-500/30">
          <h2 className="text-xl font-bold mb-2">Marketplace Tether Failed</h2>
          <p>{error}</p>
        </div>
      </IDEPageLayout>
    );
  }

  const exts = catalog?.catalog?.extensions || [];
  
  const filteredExts = exts.filter(ext => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ide' && (ext.formats.includes('open-vsx') || ext.formats.includes('jetbrains'))) return true;
    if (activeTab === 'ai' && (ext.formats.includes('antigravity') || ext.formats.includes('ollama') || ext.formats.includes('codex'))) return true;
    if (activeTab === 'raw') return true;
    return false;
  });

  return (
    <IDEPageLayout 
      title="Omni-Marketplace"
      subtitle="Tethering Antigravity, JetBrains, VS Code, Ollama, and Codex"
      icon={Box}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-20 p-2">
        {filteredExts.map(ext => {
          const isTethering = tethering === ext.id;
          const isTethered = tethered.has(ext.id);

          return (
            <div key={ext.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 relative group hover:border-[#00f0ff]/50 transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{ext.name}</h3>
                  <span className="text-xs font-mono text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-1 rounded">v{ext.version}</span>
                </div>
                <Box className="text-slate-500 group-hover:text-[#8a2be2] transition-colors" size={28} />
              </div>
              
              <p className="text-slate-400 text-sm leading-relaxed flex-1">
                {ext.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {ext.formats.map(fmt => (
                  <span key={fmt} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-slate-800 border border-slate-600 text-slate-300">
                    {fmt}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">ID: {ext.id}</span>
                <button 
                  onClick={() => !isTethered && !isTethering && handleTether(ext)}
                  disabled={isTethering || isTethered}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all ${
                    isTethered 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                      : isTethering
                        ? 'bg-indigo-500/20 text-indigo-400 animate-pulse border border-indigo-500/50'
                        : 'text-[#00f0ff] hover:text-white bg-[#00f0ff]/10 hover:bg-[#00f0ff]/30 border border-transparent'
                  }`}
                >
                  {isTethered ? (
                    <><CheckCircle2 size={16} /> Tethered</>
                  ) : isTethering ? (
                    <><Zap size={16} className="animate-spin" /> Tethering...</>
                  ) : (
                    <><Download size={16} /> Tether</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </IDEPageLayout>
  );
}
