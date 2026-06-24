import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Shield, Zap, DollarSign, Brain, Network } from 'lucide-react';

// Shared node styling for the editor graph.
const nodeStyle = {
  background: '#121214',
  color: '#fff',
  border: '1px solid #3f3f46',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
};

const initialNodes = [
  {
    id: 'user',
    type: 'input',
    data: { label: <div className="flex items-center gap-2"><Database className="w-5 h-5 text-neon-cyan"/> User Input Prompt</div> },
    position: { x: 50, y: 200 },
    style: nodeStyle
  },
  {
    id: 'firewall',
    data: { label: <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400"/> Cost Firewall</div> },
    position: { x: 300, y: 200 },
    style: nodeStyle
  },
  {
    id: 'intelligence',
    data: { label: <div className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400"/> Intelligence Core (LLM)</div> },
    position: { x: 550, y: 200 },
    style: { ...nodeStyle, border: '1px solid #a855f7' }
  },
  {
    id: 'swarm',
    data: { label: <div className="flex items-center gap-2"><Network className="w-5 h-5 text-yellow-400"/> Hive Mind P2P Swarm</div> },
    position: { x: 550, y: 50 },
    style: nodeStyle
  },
  {
    id: 'orchestrator',
    data: { label: <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-orange-400"/> SaaS Orchestrator</div> },
    position: { x: 800, y: 200 },
    style: nodeStyle
  },
  {
    id: 'stripe',
    type: 'output',
    data: { label: <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400"/> Stripe Monetization Gate</div> },
    position: { x: 1050, y: 200 },
    style: { ...nodeStyle, border: '1px solid #22c55e' }
  }
];

const initialEdges = [
  { id: 'e1', source: 'user', target: 'firewall', animated: true, style: { stroke: '#fff' } },
  { id: 'e2', source: 'firewall', target: 'intelligence', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
  { id: 'e3', source: 'intelligence', target: 'swarm', animated: true, style: { stroke: '#eab308' }, label: 'Fallback Bounties' },
  { id: 'e4', source: 'intelligence', target: 'orchestrator', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
  { id: 'e5', source: 'orchestrator', target: 'stripe', animated: true, style: { stroke: '#f97316', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } }
];

export default function VisualPhysicsEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex flex-col gap-4 gap-4 h-full bg-[#09090b]">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-3xl font-black text-white">Visual Physics Editor</h1>
        <p className="text-gray-400 mt-2">Node graph for configured studio execution paths and provider-gated rails.</p>
      </div>
      
      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          theme="dark"
        >
          <Controls className="bg-gray-800 border-gray-700 fill-white" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.id === 'intelligence') return '#a855f7';
              if (n.id === 'stripe') return '#22c55e';
              return '#3f3f46';
            }}
            maskColor="rgba(0,0,0,0.8)"
            className="bg-black border-gray-800"
          />
          <Background variant="dots" gap={24} size={1} color="#3f3f46" />
        </ReactFlow>
      </div>
    </div>
  );
}
