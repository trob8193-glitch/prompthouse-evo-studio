import React, { useState, useEffect } from 'react';

export function SwarmCouncil() {
  const [agents, setAgents] = useState([
    { name: 'DeadHunter', status: 'IDLE' },
    { name: 'TruthAuditor', status: 'IDLE' },
    { name: 'MaturityScore', status: 'IDLE' }
  ]);

  useEffect(() => {
<<<<<<< HEAD
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3001/api/studio/diagnostics?limit=40');
        if (!res.ok) throw new Error('Diagnostics unavailable');
        const diagnostics = await res.json();
        if (!mounted) return;

        const summary = diagnostics?.summary || {};
        const hasErrors = Number(summary.modules_error || 0) > 0;
        const hasWarnings = Number(summary.modules_warning || 0) > 0;
        const failingProbes = Number(summary.probes_failing || 0) > 0;

        setAgents([
          { name: 'DeadHunter', status: (hasErrors || failingProbes) ? 'HUNTING' : 'IDLE' },
          { name: 'TruthAuditor', status: (hasWarnings || hasErrors) ? 'AUDITING' : 'IDLE' },
          { name: 'MaturityScore', status: diagnostics?.success ? 'SYNCED' : 'IDLE' }
        ]);
      } catch {
        if (!mounted) return;
        setAgents([
          { name: 'DeadHunter', status: 'OFFLINE' },
          { name: 'TruthAuditor', status: 'OFFLINE' },
          { name: 'MaturityScore', status: 'OFFLINE' }
        ]);
      }
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => { mounted = false; clearInterval(interval); };
=======
    // Simulate real-time voting / deliberation
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.7 ? 'VOTING' : 'IDLE'
      })));
    }, 3000);
    return () => clearInterval(interval);
>>>>>>> main
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
