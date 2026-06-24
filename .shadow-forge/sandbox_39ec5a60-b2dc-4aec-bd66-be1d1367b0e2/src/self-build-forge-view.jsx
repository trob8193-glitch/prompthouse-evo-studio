import React, { useState } from 'react';

export function SelfBuildForgeView() {
  const [mission, setMission] = useState('');
  const [status, setStatus] = useState('IDLE');

  const build = () => {
    if (!mission.trim()) return;
    setStatus('BUILDING');
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 2000);
  };

  return (
    <div className="p-6 bg-[#181818] border-[#333] rounded-md m-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Autonomous Forge</h2>
        <span className="px-3 py-1 bg-[#333] text-xs font-mono rounded text-[#00ffcc]">
          STATUS: {status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-mono">APP MISSION</label>
          <textarea 
            className="w-full bg-[#111] border-[#444] rounded p-3 text-white focus:outline-none focus:border-[#00ffcc] font-mono text-sm h-32 resize-none"
            placeholder="Describe the application you want to build autonomously..."
            value={mission}
            onChange={e => setMission(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2 font-mono">PLATFORM</label>
            <select className="w-full bg-[#222] border-[#444] rounded p-2 text-white outline-none">
              <option>React / Node.js</option>
              <option>Flutter / Dart</option>
              <option>Vanilla JS</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-[#333]">
          <button 
            onClick={build}
            disabled={status === 'BUILDING'}
            className="w-full bg-[#00ffcc] text-black font-bold py-3 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'BUILDING' ? 'EVOLVING...' : 'FORGE APPLICATION'}
          </button>
        </div>
      </div>
    </div>
  );
}
