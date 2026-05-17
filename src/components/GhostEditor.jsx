import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { Button, Card, StatusBadge } from './primitives.jsx';
import { Sparkles, FileCode, Check, RefreshCw, X } from 'lucide-react';

const BRIDGE_URL = 'http://127.0.0.1:3001';

export function GhostEditor() {
  const { activeFile, addNotification, logToLedger } = useSovereignStore();
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
        addNotification(`Merged Sovereign Optimization into ${activeFile}`, 'success');
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

  return (
    <Card className="flex-1 bg-[#0d1117] relative p-0 font-mono text-sm overflow-hidden h-full flex flex-col border-none">
      {/* Ghost Toolbar */}
      <div className="flex items-center justify-between p-4 bg-black/40 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-indigo-400" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[200px]">
            {activeFile || 'No file selected'}
          </span>
          {loading && <RefreshCw size={12} className="animate-spin text-slate-500" />}
        </div>
        
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
            variant="primary" 
            onClick={handleMerge}
            disabled={!isGhostActive || loading}
            className="text-[10px] gap-2"
          >
            <Check size={14} /> Merge
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto p-6 bg-[rgba(2,6,23,0.5)]">
        {/* Original Code Layer */}
        <pre className={`text-slate-600 transition-opacity duration-500 ${isGhostActive ? 'opacity-30' : 'opacity-100'}`}>
          <code>{originalCode}</code>
        </pre>

        {/* Holographic Ghost Layer */}
        {isGhostActive && !loading && (
          <pre className="absolute top-6 left-6 text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-in fade-in slide-in-from-top-1 duration-500 pointer-events-none">
            <code>{ghostCode}</code>
          </pre>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw size={32} className="animate-spin text-indigo-500" />
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Generating Sovereign Reality...</span>
            </div>
          </div>
        )}
      </div>

      {/* Mini Info Bar */}
      <div className="p-2 px-4 bg-black/60 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
        <span>Active File: {activeFile}</span>
        <span className="flex items-center gap-4">
<<<<<<< HEAD
          <span>Overlay ratio: {originalCode && ghostCode ? `${(ghostCode.length / Math.max(1, originalCode.length)).toFixed(2)}x` : '—'}</span>
          <span>Chars delta: {originalCode && ghostCode ? `${ghostCode.length - originalCode.length}` : '—'}</span>
=======
          <span>Density: 1.4x</span>
          <span>Entropy: Stable</span>
>>>>>>> main
        </span>
      </div>
    </Card>
  );
}
