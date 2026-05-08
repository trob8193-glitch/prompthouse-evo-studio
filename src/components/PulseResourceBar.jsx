import React, { useEffect, useState } from 'react';

export function PulseResourceBar() {
  const [cpu, setCpu] = useState(12);
  const [ram, setRam] = useState(45);
  const [tokens, setTokens] = useState(140);
  const [savings, setSavings] = useState({ tokens: 0, dollars: '0.0000' });

  useEffect(() => {
    // Fetch real metrics from the Sovereign Bridge
    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/metrics');
        if (res.ok) {
          const data = await res.json();
          if (data.firewall) {
            setSavings({
              tokens: data.firewall.savedTokens,
              dollars: data.firewall.savedDollars
            });
          }
        }
      } catch (err) {
        // Fallback or ignore if bridge offline
      }
    };

    const interval = setInterval(() => {
      setCpu(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      setRam(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));
      setTokens(prev => prev + Math.floor(Math.random() * 10));
      fetchMetrics();
    }, 2000);
    
    fetchMetrics();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 right-0 w-[450px] bg-gray-900 border-t border-l border-gray-800 p-2 flex space-x-4 z-40">
      <div className="flex-1">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
          <span>CPU</span>
          <span>{cpu.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${cpu}%` }}></div>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
          <span>MEM</span>
          <span>{ram.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
          <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${ram}%` }}></div>
        </div>
      </div>

      <div className="flex-1 border-l border-gray-700 pl-3">
        <div className="text-[10px] text-gray-400 mb-1 font-mono">TOKENS/S</div>
        <div className="text-xs text-green-400 font-mono font-bold animate-pulse">{tokens}</div>
      </div>

      <div className="flex-1 border-l border-gray-700 pl-3 bg-green-900/20 rounded">
        <div className="text-[10px] text-green-400 mb-1 font-mono flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SAVED
        </div>
        <div className="text-xs text-green-300 font-mono font-bold">${savings.dollars}</div>
      </div>
    </div>
  );
}
