import React, { useState, useEffect } from 'react';
import { Eye, Monitor, Smartphone, Tablet, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { BRIDGE_URL } from '../config/bridge-config.js';

export function EvoEyesView() {
  const [audits, setAudits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/api/agi/evo-eyes/audits`);
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits || []);
        if (data.audits?.length > 0 && !selected) setSelected(data.audits[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch Evo Eyes audits:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudits(); }, []);

  const vpIcon = (name) => {
    if (name === 'mobile') return <Smartphone size={14} />;
    if (name === 'tablet') return <Tablet size={14} />;
    return <Monitor size={14} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#050008] text-[#e0d0ff] font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-linear-to-r from-[#0a0015] to-[#150025]">
        <div className="flex items-center gap-3">
          <Eye className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" size={28} />
          <div>
            <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
              EVO EYES v2
            </h1>
            <div className="text-[10px] text-purple-400/60 uppercase tracking-widest">
              Multi-Viewport Visual Audit System
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/30 text-sm">
            <span className="font-bold text-purple-300">{audits.length}</span> Audits
          </div>
          <button onClick={fetchAudits} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 px-3 py-2 rounded-lg transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Audit List */}
        <div className="w-1/3 border-r border-purple-500/20 overflow-y-auto">
          {audits.length === 0 ? (
            <div className="p-8 text-center text-purple-400/40">
              <Eye size={48} className="mx-auto mb-4 opacity-30" />
              <div className="text-sm">No visual audits yet.</div>
              <div className="text-xs mt-1">Trigger a Swarm Build to generate audits.</div>
            </div>
          ) : audits.map((audit, i) => (
            <div
              key={i}
              onClick={() => setSelected(audit)}
              className={`p-3 border-b border-purple-500/10 cursor-pointer transition-all ${
                selected === audit ? 'bg-purple-500/20 border-l-2 border-l-purple-400' : 'hover:bg-purple-500/10'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${audit.verdict === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                  {audit.verdict === 'APPROVED' ? <CheckCircle size={12} className="inline mr-1" /> : <XCircle size={12} className="inline mr-1" />}
                  {audit.verdict}
                </span>
                <span className="text-[10px] text-purple-400/50">
                  {new Date(audit.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-[10px] text-purple-300/60 truncate">
                Hash: {audit.componentHash}
              </div>
              <div className="flex gap-2 mt-1">
                {audit.viewports?.map((vp, j) => (
                  <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 flex items-center gap-1">
                    {vpIcon(vp.viewport)} {vp.resolution}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Audit Detail */}
        <div className="flex-1 overflow-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-purple-400/30 flex-col gap-4">
              <Eye size={64} className="opacity-30" />
              <div className="text-sm tracking-widest uppercase">Select an audit</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-purple-300">
                  Audit: <span className="text-purple-100">{selected.componentHash}</span>
                </h2>
                <span className="text-xs text-purple-400/50">{selected.timestamp}</span>
              </div>

              {/* Viewport Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selected.viewports?.map((vp, i) => (
                  <div key={i} className="border border-purple-500/20 rounded-lg bg-[#0a0015] p-4">
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-purple-300">
                      {vpIcon(vp.viewport)}
                      <span className="uppercase">{vp.viewport}</span>
                      <span className="text-purple-400/50 text-xs ml-auto">{vp.resolution}</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-purple-400/70">Overlaps</span>
                        <span className={vp.overlaps > 0 ? 'text-red-400 font-bold' : 'text-green-400'}>
                          {vp.overlaps > 0 ? `${vp.overlaps} COLLISION(S)` : 'CLEAR'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400/70">Regression</span>
                        <span className={vp.regression ? 'text-yellow-400 font-bold' : 'text-green-400'}>
                          {vp.regression ? 'DETECTED' : 'STABLE'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400/70">A11y Issues</span>
                        <span className={vp.a11yViolations > 0 ? 'text-yellow-400' : 'text-green-400'}>
                          {vp.a11yViolations}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400/70">VLM Verdict</span>
                        <span className={`font-bold ${vp.vlmVerdict?.includes('APPROVED') ? 'text-green-400' : vp.vlmVerdict?.includes('REJECTION') ? 'text-red-400' : 'text-gray-500'}`}>
                          {vp.vlmVerdict?.includes('APPROVED') ? 'APPROVED' : vp.vlmVerdict?.includes('REJECTION') ? 'REJECTED' : 'SKIPPED'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prompt Context */}
              {selected.prompt && (
                <div className="border border-purple-500/20 rounded-lg bg-[#0a0015] p-4">
                  <div className="text-xs text-purple-400/60 uppercase tracking-widest mb-2">Agent Prompt Context</div>
                  <div className="text-sm text-purple-200">{selected.prompt}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
