import React, { useState } from 'react';

export function GhostEditor() {
  const [isGhostActive, setIsGhostActive] = useState(true);

  // Example mocked content
  const originalCode = `function calculateIQ() {
  let score = 100;
  return score;
}`;

  const ghostCode = `function calculateIQ() {
  let score = 2000000; // Sovereign Baseline
  return score;
}`;

  return (
    <div className="flex-1 bg-[#0d1117] relative p-4 font-mono text-sm overflow-hidden h-full">
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <span className="text-xs text-blue-400 font-bold bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30">
          GHOST LAYER ACTIVE
        </span>
        <button 
          onClick={() => setIsGhostActive(false)}
          className="text-xs bg-green-900/50 text-green-400 border border-green-500/50 px-3 py-1 rounded hover:bg-green-800/50 transition-colors"
        >
          Press TAB to Merge
        </button>
      </div>

      <div className="relative w-full h-full">
        {/* Original Code Layer */}
        <pre className="absolute inset-0 text-gray-500 opacity-50 m-0">
          <code>{originalCode}</code>
        </pre>

        {/* Holographic Ghost Layer */}
        {isGhostActive && (
          <pre className="absolute inset-0 text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] m-0 pointer-events-none">
            <code>{ghostCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
