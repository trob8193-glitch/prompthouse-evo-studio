import React from 'react';

export function ProofToValueView() {
  const sampleProofs = [
    { id: 'proof_1', type: 'deploy', amount: 1500, claim: 'Deployed AI Engine to production' },
    { id: 'proof_2', type: 'feature', amount: 800, claim: 'Implemented neural bus' },
  ];

  const totalValue = sampleProofs.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 bg-[#181818] border-[#333] rounded-md m-4">
      <h2 className="text-xl font-bold text-white mb-4">Value Ledger</h2>
      
      <div className="bg-[#222] p-6 rounded-md border-[#444] mb-6 flex flex-col gap-4 gap-4 items-center">
        <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">Total Verified Value</div>
        <div className="text-5xl font-mono text-[#00ffcc]">${totalValue.toLocaleString()}</div>
      </div>

      <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Recent Proofs</h3>
      <div className="space-y-2">
        {sampleProofs.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-[#222] p-3 rounded border-[#333]">
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 bg-[#333] text-gray-300 rounded uppercase">{p.type}</span>
              <span className="text-sm text-gray-200">{p.claim}</span>
            </div>
            <div className="text-[#00ffcc] font-mono">+${p.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
