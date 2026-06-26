import React, { useState } from 'react';
import { Rocket, Server, Globe, Lock, ShieldCheck, PlayCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeploymentCenterView() {
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState('idle');

  const triggerDeploy = () => {
    setDeploying(true);
    setStatus('building');
    setTimeout(() => setStatus('pushing'), 2000);
    setTimeout(() => {
      setDeploying(false);
      setStatus('live');
    }, 4000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Rocket size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Global Deployment</h2>
            <p className="text-xs text-gray-500">Vercel / AWS / Edge Network</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-black/50 border border-[rgba(255,255,255,0.1)] rounded-full">
           <div className={`w-2 h-2 rounded-full ${status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
           <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{status === 'live' ? 'Production Live' : 'Pending Diff'}</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="z-10 flex gap-8 items-center mb-12">
           <div className="flex flex-col items-center gap-2">
             <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
               <Server size={24} />
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Local Build</span>
           </div>
           
           <div className="w-24 h-0.5 bg-gray-800 relative">
             {deploying && (
               <motion.div 
                 initial={{ x: 0, opacity: 1 }}
                 animate={{ x: 96, opacity: 0 }}
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full blur-sm"
               />
             )}
           </div>

           <div className="flex flex-col items-center gap-2">
             <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
               <Globe size={24} />
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Edge CDN</span>
           </div>
        </div>

        <button 
          onClick={triggerDeploy}
          disabled={deploying}
          className={`z-10 flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${deploying ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/25'}`}
        >
          {deploying ? <Loader2 className="animate-spin" size={20} /> : <PlayCircle size={20} />}
          {deploying ? `Status: ${status.toUpperCase()}...` : 'Initialize Launch Sequence'}
        </button>

        {status === 'live' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 z-10 flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-4 py-2 rounded-lg border border-emerald-500/20">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Deployment Verified Secure</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
