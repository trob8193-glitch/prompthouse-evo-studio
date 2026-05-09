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
      {agents.map((agent, i) => {
        const botImage = agent.name === 'DeadHunter' ? '/bots/vector_wolf.png' : 
                         agent.name === 'TruthAuditor' ? '/bots/cipher_lynx.png' : 
                         '/bots/ledger.png';
        return (
          <div key={i} className="flex items-center space-x-1.5 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">
            <img 
              src={botImage} 
              alt={agent.name} 
              className={`w-4 h-4 rounded-full ${agent.status === 'VOTING' ? 'ring-1 ring-purple-500 animate-pulse' : ''}`}
            />
            <span className={`text-[10px] font-mono ${agent.status === 'VOTING' ? 'text-purple-300' : 'text-gray-400'}`}>
              {agent.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
