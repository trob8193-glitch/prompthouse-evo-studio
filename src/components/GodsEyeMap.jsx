import React, { useEffect, useState } from 'react';

/**
 * GOD'S EYE VIEW (Dependency Visualizer Map)
 * ═══════════════════════════════════════════════════════════════
 * A real-time particle graph showing connections between components.
 */

export function GodsEyeMap() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const layoutNodes = (rawNodes) => {
    const sorted = [...rawNodes].sort((a, b) => {
      const weight = (h) => (h === 'error' ? 2 : h === 'warning' ? 1 : 0);
      return (weight(b.health) - weight(a.health)) || String(a.label || a.id).localeCompare(String(b.label || b.id));
    });

    const count = Math.max(1, sorted.length);
    const center = 50;
    const radius = 34;
    return sorted.map((node, index) => {
      const angle = (index / count) * Math.PI * 2;
      return {
        id: node.id,
        label: node.label || node.id,
        type: node.health || 'healthy',
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius
      };
    });
  };

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3001/api/studio/diagnostics?limit=70');
        if (!res.ok) throw new Error('Diagnostics unavailable');
        const data = await res.json();
        if (!mounted) return;

        const graphNodes = data?.graph?.nodes || [];
        const graphEdges = data?.graph?.edges || [];
        const laidOut = layoutNodes(graphNodes);
        const visibleIds = new Set(laidOut.map((n) => n.id));
        const limitedEdges = graphEdges
          .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
          .slice(0, 220);

        setNodes(laidOut);
        setEdges(limitedEdges);
      } catch {
        if (!mounted) return;
        setNodes([]);
        setEdges([]);
      }
    };

    poll();
    const interval = setInterval(poll, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const nodeIndex = new Map(nodes.map((n) => [n.id, n]));
  const strokeFor = (type) => (type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6');

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-8 backdrop-blur-md">
      <div className="relative w-full h-full border border-blue-500/30 rounded-xl overflow-hidden bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-blue-900/50 to-transparent flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <span className="text-blue-400">👁️</span>
            <h2 className="text-xl font-bold text-white tracking-widest font-mono">GOD'S EYE VIEW</h2>
          </div>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
              {nodes.length} Active Nodes
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 animate-pulse">
              {nodes.length > 0 ? 'SYNCED' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Node Graph Background */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 opacity-10">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-blue-400"></div>
          ))}
        </div>

        {/* Connection Lines (from dependency graph) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-35">
          {edges.map((edge, idx) => {
            const a = nodeIndex.get(edge.source);
            const b = nodeIndex.get(edge.target);
            if (!a || !b) return null;
            return (
              <line
                key={`${edge.source}->${edge.target}:${idx}`}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke="#3b82f6"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <div 
            key={index}
            className="absolute flex flex-col items-center justify-center transition-all duration-1000"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg"
              style={{
                background: node.type === 'error' ? '#7f1d1d' : node.type === 'warning' ? '#78350f' : '#1f2937',
                borderColor: strokeFor(node.type),
                boxShadow: `0 0 18px ${strokeFor(node.type)}33`
              }}
            >
              <span className="text-white text-xs font-bold">{String(node.type || 'h')[0].toUpperCase()}</span>
            </div>
            <span className="mt-2 text-blue-200 text-xs font-mono tracking-wide">{node.label}</span>
          </div>
        ))}

      </div>
    </div>
  );
}
