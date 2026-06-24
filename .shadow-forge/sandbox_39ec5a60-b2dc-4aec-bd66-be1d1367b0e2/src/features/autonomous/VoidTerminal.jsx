import React, { useState, useEffect } from 'react';

export default function VoidTerminal() {
  const [lines, setLines] = useState([
    'INITIATING VOID SEQUENCE...',
    'CONNECTING TO SECURE SUBNET: [OK]',
    'BYPASSING PROTOCOL FIREWALLS: [OK]',
    'WAITING FOR DIRECTIVE...'
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLines(prev => [...prev, `> BACKGROUND DAEMON PING: ${Math.random().toString(36).substring(7).toUpperCase()}`]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-[#020204] font-mono p-8 flex-col gap-4 relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] z-50 opacity-20"></div>
      
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-xs text-dim uppercase tracking-widest">/dev/void_tty0</div>
      </div>

      <div className="flex-1 overflow-y-auto flex-col gap-2 relative z-10">
        {lines.map((line, i) => (
          <div key={i} className="text-sm">
            <span className="text-green-500 mr-2">root@omnibridge:~$</span>
            <span className="text-gray-300">{line}</span>
          </div>
        ))}
        
        <div className="mt-2 flex items-center text-sm">
           <span className="text-green-500 mr-2">root@omnibridge:~$</span>
           <span className="w-2 h-4 bg-white animate-pulse inline-block"></span>
        </div>
      </div>
    </div>
  );
}
