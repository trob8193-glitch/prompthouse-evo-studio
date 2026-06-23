import React from 'react';

export function RadialHUDLayout({ centerNode, orbitNodes = [], radius = 250 }) {
  const count = orbitNodes.length;

  return (
    <div className="w-full h-full flex items-center justify-center relative bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black overflow-hidden">
      
      {/* Crosshairs & Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
        <div className="w-px h-full bg-cyan-500"></div>
        <div className="h-px w-full bg-cyan-500 absolute"></div>
        <div className="absolute border-cyan-500 rounded-full" style={{ width: radius * 2, height: radius * 2 }}></div>
        <div className="absolute border-dashed border-cyan-500 rounded-full animate-spin-slow" style={{ width: radius * 3, height: radius * 3, animationDuration: '20s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Center Node */}
        <div className="relative z-20 flex items-center justify-center">
          {centerNode}
        </div>

        {/* Orbiting Nodes */}
        {orbitNodes.map((node, index) => {
          const angle = (index / count) * 2 * Math.PI - Math.PI / 2; // Start from top (-90deg)
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div 
              key={index}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            >
              {/* Connector line could go here with SVG if needed, but absolute pos is enough for now */}
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
