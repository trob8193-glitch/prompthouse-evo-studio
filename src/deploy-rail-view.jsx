/**
 * PromptHouse Evo Studio — DeployRail View
 * Owner: Blueprint Orca | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { runDeployRail } from './deploy-rail.js';
import { addProofReceipt } from './prompt-base.js';
import { Rocket, Settings2, Activity, Terminal, CheckCircle2, XCircle, ShieldAlert, AlertTriangle, Fingerprint, Cloud, Layers } from 'lucide-react';

export function DeployRailView() {
  const [status, setStatus] = useState('idle'); // idle | deploying | blocked | success | error
  const [log, setLog] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [config, setConfig] = useState({ provider: 'vercel', liveRun: true, ownerApproved: false });

  const startDeploy = useCallback(async () => {
    setStatus('deploying');
    setLog(['[SYSTEM] Initializing DeployRail...']);
    
    try {
      const res = await runDeployRail('local_session', config);
      setLog(res.log);
      setReceipt(res.receipt);
      if (res.blocked) {
        setStatus('blocked');
      } else {
        setStatus('success');
      }
    } catch (e) {
      setLog(prev => [...prev, `[ERROR] ${e.message}`]);
      setStatus('error');
    }
  }, [config]);

  const PROVIDER_ICONS = {
    vercel: <Cloud size={16} />,
    netlify: <Layers size={16} />,
    firebase: <Activity size={16} />,
    aws: <Terminal size={16} />
  };

  return (
    <div className="flex flex-col gap-6 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4 shrink-0">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-1 flex items-center gap-2">
            <Rocket size={28} className="text-cyan-400" /> DeployRail
          </div>
          <div className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest">
            Evo Studio deployment pipeline. Test → Build → Secret Check → Preview → Production.
          </div>
        </div>
        <div className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="animate-pulse" /> LIVE-RUN MODE
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 min-h-0">
        
        {/* Left Column - Config & Receipt */}
        <div className="flex flex-col gap-6">
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={14} className="text-indigo-400" /> Deploy Config
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Provider</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50 transition-colors font-bold appearance-none cursor-pointer" 
                    value={config.provider} 
                    onChange={e => setConfig(c => ({...c, provider: e.target.value}))}
                  >
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                    <option value="firebase">Firebase</option>
                    <option value="aws">AWS Amplify</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500/50">
                    {PROVIDER_ICONS[config.provider] || <Cloud size={16} />}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Mode</label>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-[11px] text-yellow-400 font-bold flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" /> Live-run execution is always enabled.
                </div>
              </div>
              
              <label className="flex items-start gap-3 mt-2 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    className="appearance-none w-4 h-4 rounded border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-500 transition-colors cursor-pointer"
                    checked={config.ownerApproved}
                    onChange={e => setConfig(c => ({ ...c, ownerApproved: e.target.checked }))}
                  />
                  {config.ownerApproved && <CheckCircle2 size={12} className="absolute text-black pointer-events-none" />}
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors leading-tight font-bold">
                  Owner approval granted for this live-run attempt
                </span>
              </label>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-[10px] text-red-400 font-bold flex items-start gap-2 leading-relaxed">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> 
                Live production requires provider tokens in .env and owner approval.
              </div>
              
              <button 
                className={`mt-2 py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                  status === 'deploying'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
                onClick={startDeploy}
                disabled={status === 'deploying'}
              >
                {status === 'deploying' ? <><Activity size={16} className="animate-spin" /> Deploying...</> : <><Rocket size={16} /> Start Deploy Rail</>}
              </button>
            </div>
          </div>
          
          {receipt && (
            <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white/5 border-b border-white/5 p-5">
                <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint size={14} className="text-green-500" /> Deploy Receipt
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="bg-[#0a0a0f] border border-white/5 rounded-xl p-4 flex flex-col gap-3 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">ID:</span> 
                    <span className="text-cyan-400 font-bold">{receipt.id?.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Stage:</span> 
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-black uppercase tracking-widest text-[9px]">{receipt.stage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Status:</span> 
                    <span className={`font-black uppercase tracking-widest flex items-center gap-1 ${
                      receipt.status === 'blocked' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {receipt.status === 'blocked' ? <XCircle size={12} /> : <CheckCircle2 size={12} />} {receipt.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Approval:</span> 
                    <span className={`font-bold ${receipt.approvalRequired ? 'text-orange-400' : 'text-green-400'}`}>
                      {receipt.approvalRequired ? 'REQUIRED' : 'GRANTED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Terminal Log */}
        <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_30px_rgba(0,240,255,0.05)] bg-[#030408] border-2 border-white/5 backdrop-blur-xl flex flex-col overflow-hidden h-full min-h-[500px] relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between relative z-10">
            <div className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Terminal size={14} /> Deploy Log Output
            </div>
            
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 font-mono text-[11px] leading-relaxed relative z-10">
            {log.length === 0 ? (
              <div className="text-slate-600 italic h-full flex items-center justify-center">// Awaiting deployment...</div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {log.map((line, i) => (
                  <div key={i} className={`break-words ${
                    line.includes('PASS') ? 'text-green-400 font-bold' : 
                    line.includes('BLOCKED') ? 'text-red-400 font-bold' : 
                    line.includes('[SYSTEM]') ? 'text-cyan-400 font-bold' :
                    line.includes('[ERROR]') ? 'text-red-400 font-black' :
                    'text-slate-300'
                  }`}>
                    {line}
                  </div>
                ))}
                {status === 'deploying' && <div className="text-cyan-500 animate-pulse font-black mt-2">_</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

