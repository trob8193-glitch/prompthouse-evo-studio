import React from 'react';
import { Hexagon, Database, Lock, Globe } from 'lucide-react';

export default function HexaGridPangram() {
  const nodes = [
    { id: 1, title: 'Sector Alpha', icon: Database, color: '#ff0055' },
    { id: 2, title: 'Omega Node', icon: Hexagon, color: '#00f0ff' },
    { id: 3, title: 'Firewall', icon: Lock, color: '#facc15' },
    { id: 4, title: 'Omni-Net', icon: Globe, color: '#8b5cf6' },
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#050508] rounded-3xl border border-[#8b5cf6]/20 overflow-hidden p-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 h-full">
        {nodes.map(node => {
          const Icon = node.icon;
          return (
            <div key={node.id} className="relative group flex flex flex-col gap-4 items-center justify-center">
              <div 
                className="w-32 h-32 flex flex flex-col gap-4 items-center justify-center backdrop-blur-md transition-all duration-500 hover:scale-110 z-10 cursor-pointer"
                style={{ 
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  backgroundColor: `${node.color}15`,
                  border: `2px solid ${node.color}50`, // Note: clip-path hides borders, we use shadow via drop-shadow on parent instead
                }}
              >
                <Icon size={32} color={node.color} className="mb-2 drop-shadow-[0_0_8px_currentColor]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">{node.title}</span>
              </div>
              <div 
                className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" 
                style={{ filter: `drop-shadow(0 0 20px ${node.color})` }}
              >
                 {/* Hack to show glow on clip-path elements */}
                <div className="w-32 h-32 mx-auto" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', backgroundColor: node.color }} />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 px-6 py-2 rounded-full border border-white/10 backdrop-blur-xl">
        <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
        <span className="text-xs font-bold text-white uppercase tracking-widest">Topology Synchronized</span>
      </div>
    </div>
  );
}
