import React, { useState, useRef } from 'react';

export function FloatingCanvasLayout({ children, bgPattern = 'bg-grid-scan' }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    // Only pan if clicking on the background, not on interactive elements
    if (e.target === containerRef.current) {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const newZoom = Math.min(Math.max(0.2, zoom - e.deltaY * 0.01), 3);
      setZoom(newZoom);
    } else {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  return (
    <div 
      className={`w-full h-full overflow-hidden relative ${bgPattern} bg-black`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-50 glass-extreme px-4 py-2 rounded-3xl flex items-center gap-4 text-white text-xs font-mono">
        <span>X: {Math.round(pan.x)}</span>
        <span>Y: {Math.round(pan.y)}</span>
        <span>Z: {Math.round(zoom * 100)}%</span>
      </div>

      <div 
        className="absolute inset-0 origin-center transition-transform duration-75"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {children}
      </div>
    </div>
  );
}

export function CanvasNode({ x, y, children, width = 300, title = 'Node' }) {
  return (
    <div 
      className="absolute glass-extreme rounded-2xl border-neon-glow overflow-hidden shadow-2xl"
      style={{ left: x, top: y, width }}
    >
      <div className="bg-black/50 p-2 text-xs font-mono text-cyan-400 border-b border-white/10 uppercase tracking-widest text-center cursor-move">
        {title}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
