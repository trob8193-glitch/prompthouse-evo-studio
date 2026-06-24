import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { Button, Card, StatusBadge } from './primitives.jsx';
import { Sparkles, FileCode, Check, RefreshCw, X } from 'lucide-react';
import { IDEPageLayout } from './layouts/IDEPageLayout.jsx';
import { BRIDGE_URL } from '../config/bridge-config.js';

export function GhostEditor() {
  const { activeFile, addNotification, logToLedger, globalTheme } = useSovereignStore();
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [originalCode, setOriginalCode] = useState('// Select a file to begin...');
  const [ghostCode, setGhostCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeFile) {
      loadOptimization();
    }
  }, [activeFile]);

  const loadOptimization = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'GhostEditor',
          action: 'get',
          payload: { filePath: activeFile }
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalCode(data.result.originalCode);
        setGhostCode(data.result.ghostCode);
        setIsGhostActive(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      addNotification(`Failed to load ghost layer: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    try {
      fetch(`${BRIDGE_URL}/api/feedback-adaptation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: activeFile, originalCode, proposedCode: ghostCode, action: 'merge' })
      }).catch(console.error);

      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'GhostEditor',
          action: 'merge',
          payload: { filePath: activeFile, code: ghostCode }
        }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification(`Merged Evo Studio Optimization into ${activeFile}`, 'success');
        setOriginalCode(ghostCode);
        setIsGhostActive(false);
        logToLedger('ghost_editor', 'merge_success', null, 'VERIFIED', 50);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      addNotification(`Merge failed: ${err.message}`, 'error');
    }
  };

  const handleReject = () => {
    fetch(`${BRIDGE_URL}/api/feedback-adaptation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: activeFile, originalCode, proposedCode: ghostCode, action: 'reject' })
    }).catch(console.error);

    setIsGhostActive(false);
    addNotification('Rejected optimization proposal.', 'error');
  };

  return (
    <IDEPageLayout
      title="Ghost Editor"
      description="Autonomous overlay editor and holographic diffs"
      noPadding={true}
      actions={
        <div className="flex items-center gap-2">
          {isGhostActive && (
            <StatusBadge status="executing" label="GHOST LAYER ACTIVE" />
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsGhostActive(!isGhostActive)}
            className="text-[10px]"
          >
            {isGhostActive ? 'Hide Overlay' : 'Show Ghost'}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleReject}
            disabled={!isGhostActive || loading}
            className="text-[10px] gap-2 text-red-400 hover:text-red-300"
          >
            <X size={14} /> Reject
          </Button>
          <Button 
            size="sm" 
            variant="primary" 
            onClick={handleMerge}
            disabled={!isGhostActive || loading}
            className="text-[10px] gap-2 hover:bg-green-500 transition-colors duration-300"
          >
            <Check size={14} /> Merge
          </Button>
        </div>
      }
    >
      <div className="flex-1 bg-[#0d1117] relative p-0 font-mono text-sm overflow-hidden h-full flex-col gap-4 border-none">
        <div className="flex items-center justify-between p-2 bg-black/40 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] z-20">
          <div className="flex items-center gap-3 px-2">
            <Sparkles size={14} className="text-neon-cyan rotate-180 hover:rotate-0 transition-transform duration-300 ease-in-out animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[400px]">
              {activeFile || 'No file selected'}
            </span>
            {loading && <RefreshCw size={12} className="animate-spin text-slate-500" />}
          </div>
        </div>

        <div className={`ghost-editor-container relative flex-1 overflow-auto p-6 bg-[rgba(2,6,23,0.5)] transition-all ease-in-out duration-500 hover:scale-[1.02] hover:shadow-lg hover:bg-opacity-70 ${globalTheme?.building === 'zeta' ? 'border-8 border-white rounded-none' : globalTheme?.building === 'gamma' ? 'border-l-8 border-fuchsia-500 rounded-sm' : globalTheme?.building === 'epsilon' ? 'border-4 border-amber-900 border-double' : globalTheme?.building === 'theta' ? 'border-none rounded-[50px] shadow-[inset_0_0_50px_rgba(200,0,255,0.2)]' : 'border-4 border-indigo-300/50 rounded-2xl'}`}>
          <pre className={`text-slate-600 transition-opacity duration-500 ${isGhostActive ? 'opacity-30' : 'opacity-100'}`}>
            <code>{originalCode}</code>
          </pre>

        {isGhostActive && !loading && (
          <pre className="absolute top-6 left-6 text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-in fade-in slide-in-from-top-1 duration-500 pointer-events-none">
            <code>{ghostCode}</code>
          </pre>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 transform transition-transform duration-500 ease-out animate-bounce">
            <div className="flex-col items-center gap-4">
              <RefreshCw size={32} className="animate-spin text-indigo-500" />
              <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">Generating Evo Studio Reality...</span>
            </div>
          </div>
        )}
      </div>

        <div className="p-2 px-4 bg-black/60 border-t border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          <span>Active File: {activeFile}</span>
          <span className="flex items-center gap-4">
            <span>Overlay ratio: {originalCode && ghostCode ? `${(ghostCode.length / Math.max(1, originalCode.length)).toFixed(2)}x` : '—'}</span>
            <span>Chars delta: {originalCode && ghostCode ? `${ghostCode.length - originalCode.length}` : '—'}</span>
            <span className="text-green-400">
              Timestamp: <span className="hidden md:inline">{new Date().toLocaleTimeString()}</span><span className="md:hidden animate-pulse">Live</span>
            </span>
          </span>
        </div>
      </div>
    </IDEPageLayout>
  );
}