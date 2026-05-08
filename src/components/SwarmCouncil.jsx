import React, { useState, useEffect } from 'react';

export function SwarmCouncil() {
  const [agents, setAgents] = useState([
    { name: 'DeadHunter', status: 'IDLE' },
    { name: 'TruthAuditor', status: 'IDLE' },
    { name: 'MaturityScore', status: 'IDLE' }
  ]);

  useEffect(() => {
    // Simulate real-time voting / deliberation
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.7 ? 'VOTING' : 'IDLE'
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-black border border-gray-800 rounded px-3 py-1">
      <span className="text-xs text-gray-400 mr-2 font-mono">COUNCIL:</span>
      {agents.map((agent, i) => (
        <div key={i} className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${agent.status === 'VOTING' ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}`}></div>
          <span className={`text-[10px] font-mono ${agent.status === 'VOTING' ? 'text-purple-300' : 'text-gray-500'}`}>
            {agent.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
