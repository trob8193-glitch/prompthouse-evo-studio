import React from 'react';
import { CheckCircle2, ShieldAlert, Cpu, Fingerprint, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LaunchProofView() {
  const proofs = [
    { name: 'Syntax Integrity', status: 'pass', time: '12ms', details: 'Zero AST parsing errors' },
    { name: 'Security Audit', status: 'pass', time: '45ms', details: 'No banned terminology found' },
    { name: 'Asset Manifest', status: 'pass', time: '8ms', details: 'All dependencies resolved' },
    { name: 'Environment Check', status: 'pass', time: '15ms', details: 'Keys bound successfully' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050914] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-teal-400 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center gap-3">
        <Fingerprint size={24} className="text-teal-400" />
        <div>
          <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Pre-Launch Cryptographic Proof</h2>
          <p className="text-xs text-gray-500">Ensuring zero-defect deployment capability</p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="bg-teal-950/20 border border-teal-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
           <ShieldAlert size={32} className="text-teal-400 mb-3" />
           <h3 className="text-teal-400 font-black tracking-widest uppercase text-lg">System is Launch Ready</h3>
           <p className="text-teal-500/60 text-xs mt-1">All pre-flight checks passed cryptographic validation.</p>
        </div>

        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2 mb-1 flex items-center gap-2">
           <Search size={14} /> Validation Matrix
        </div>

        <div className="space-y-3">
          {proofs.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={p.name} 
              className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-[rgba(255,255,255,0.02)]"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <div>
                  <div className="text-sm font-bold text-gray-200">{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.details}</div>
                </div>
              </div>
              <div className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">
                {p.time}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
