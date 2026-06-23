import React, { useState, useEffect } from 'react';
import { BRIDGE_URL } from '../config/bridge-config.js';
import { useSovereignStore } from '../store.js';

export function SwarmCouncil() {
  const [agents, setAgents] = useState([
    { name: 'DeadHunter', status: 'IDLE' },
    { name: 'TruthAuditor', status: 'IDLE' },
    { name: 'MaturityScore', status: 'IDLE' }
  ]);
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const agentTheme = globalTheme?.agent || 'alpha';

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch(BRIDGE_URL + '/api/studio/diagnostics?limit=40');
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
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-black border-gray-800 rounded px-3 py-1">
      <span className="text-xs text-gray-400 mr-2 font-mono">COUNCIL:</span>
      {agents.map((agent, i) => {
        const botImage = agent.name === 'DeadHunter' ? '/bots/vector_wolf.png' : 
                         agent.name === 'TruthAuditor' ? '/bots/cipher_lynx.png' : 
                         '/bots/ledger.png';
        return (
          <div key={i} className={`flex items-center space-x-1.5 px-2 py-0.5 border ${agentTheme === 'gamma' ? 'bg-[#2a0044] border-fuchsia-500 rounded-none' : agentTheme === 'zeta' ? 'bg-white border-black border-2 rounded-none' : agentTheme === 'theta' ? 'bg-transparent border-none' : 'bg-gray-900 border-gray-800 rounded-full'}`}>
            <img 
              src={botImage} 
              alt={agent.name} 
              className={`w-4 h-4 ${agentTheme === 'zeta' ? 'rounded-none border-black filter grayscale' : agentTheme === 'gamma' ? 'rounded-sm' : 'rounded-full'} ${agent.status === 'VOTING' || agent.status === 'HUNTING' ? 'ring-1 ring-purple-500 animate-pulse' : ''}`}
            />
            <span className={`text-[10px] font-mono ${agent.status === 'VOTING' || agent.status === 'HUNTING' ? 'text-purple-400 font-bold' : agentTheme === 'zeta' ? 'text-black font-black' : 'text-gray-400'}`}>
              {agent.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
