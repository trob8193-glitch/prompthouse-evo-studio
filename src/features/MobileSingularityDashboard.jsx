import React, { useState } from 'react';
import { useSovereignStore } from '../store.js';
import { Button, Card, StatusBadge } from '../components/primitives.jsx';
import { Smartphone, Terminal, Cpu, Play, CheckCircle2, Zap } from 'lucide-react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { BRIDGE_URL } from '../config/bridge-config.js';

export default function MobileSingularityDashboard() {
  const { addNotification, logToLedger } = useSovereignStore();
  const [selectedApp, setSelectedApp] = useState('nexus_core');
  const [architecture, setArchitecture] = useState('expo_router');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState([]);

  // Portfolio apps fetched from holding_company_ledger.json
  const portfolioApps = [
    { id: 'nexus_core', name: 'Nexus Core Platform', type: 'SaaS Dashboard' },
    { id: 'phantom_wallet', name: 'Phantom Crypto Wallet', type: 'Fintech Web3' },
    { id: 'quantum_chat', name: 'Quantum Messaging', type: 'Social P2P' }
  ];

  const handleCompile = () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setCompileLogs(['[Mobile Singularity] Initiating Native Compilation Matrix...', `Architecture: ${architecture}`, `Target: ${selectedApp}`, 'Connecting to compiler stream...']);
    
    const eventSource = new EventSource(`${BRIDGE_URL}/api/mobile/compile-stream?appId=${encodeURIComponent(selectedApp)}&architecture=${encodeURIComponent(architecture)}`);

    eventSource.onmessage = (event) => {
      const data = event.data;
      if (data.startsWith('[PROCESS_EXIT]')) {
        eventSource.close();
        setIsCompiling(false);
        const exitCode = data.split('Code ')[1];
        if (exitCode === '0') {
          addNotification('Native App Successfully Compiled', 'success');
          logToLedger('mobile_singularity', 'compile_success', { app: selectedApp, arch: architecture }, 'VERIFIED', 100);
        } else {
          addNotification(`Compilation Failed (Exit Code ${exitCode})`, 'error');
        }
      } else {
        setCompileLogs(prev => [...prev, data]);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
      setIsCompiling(false);
      setCompileLogs(prev => [...prev, '[ERROR] Lost connection to Mobile Architect daemon.']);
      addNotification('Compilation stream disconnected.', 'error');
    };
  };

  return (
    <IDEPageLayout
      title="Mobile Singularity Hub"
      description="Autonomously compile your web-based SaaS platforms into fully native iOS and Android applications. Choose your target architecture and let the intelligence core do the rest."
    >
      <div className="flex-1 gap-8 h-full">
        {/* Left Column: Configuration */}
        <div className="w-1/3 flex flex-col gap-4 gap-6">
          <Card className="bg-[#121214] border-gray-800 p-6 flex flex-col gap-4 gap-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> Source Application
            </h2>
            <div className="flex flex-col gap-4 gap-2">
              {portfolioApps.map(app => (
                <div 
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                    selectedApp === app.id 
                      ? 'border-indigo-500 bg-indigo-900/20' 
                      : 'border-gray-800 bg-black/40 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-bold text-gray-200">{app.name}</h3>
                  <span className="text-xs text-gray-500">{app.type}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#121214] border-gray-800 p-6 flex flex-col gap-4 gap-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Target Architecture
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setArchitecture('expo_router')}
                className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
                  architecture === 'expo_router' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                React Native (Expo)
              </button>
              <button 
                onClick={() => setArchitecture('clean_riverpod')}
                className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
                  architecture === 'clean_riverpod' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Flutter (Riverpod)
              </button>
            </div>
          </Card>

          <Button 
            variant="primary" 
            onClick={handleCompile}
            disabled={isCompiling}
            className="w-full py-6 text-lg tracking-widest font-black uppercase shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
          >
            {isCompiling ? (
              <span className="flex items-center gap-2"><Zap className="w-5 h-5 animate-pulse" /> Synthesizing Native...</span>
            ) : (
              <span className="flex items-center gap-2"><Play className="w-5 h-5" /> Compile Application</span>
            )}
          </Button>
        </div>

        {/* Right Column: Terminal Execution */}
        <Card className="flex-1 bg-[#050505] border-gray-800 flex flex-col gap-4 gap-4 p-0 overflow-hidden font-mono text-sm relative">
          <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center gap-3">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Compiler Terminal</span>
            <div className="ml-auto flex gap-2">
              {isCompiling && <StatusBadge status="executing" label="COMPILING" />}
              {compileLogs.length > 4 && !isCompiling && <StatusBadge status="verified" label="BUILD SUCCESS" />}
            </div>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-3">
            {compileLogs.length === 0 ? (
              <span className="text-gray-600">Awaiting compilation directive...</span>
            ) : (
              compileLogs.map((log, i) => (
                <div key={i} className={`flex items-start gap-3 ${log.includes('Success') ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
                  {log.includes('Success') ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <span className="opacity-50">~</span>}
                  <span>{log}</span>
                </div>
              ))
            )}
            {isCompiling && (
              <div className="flex items-center gap-2 text-neon-cyan animate-pulse mt-4">
                <div className="w-2 h-4 bg-indigo-400"></div> Processing AST transformation...
              </div>
            )}
          </div>
          
          {/* Holographic grid overlay */}
          <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-5 pointer-events-none"></div>
        </Card>
      </div>
    </IDEPageLayout>
  );
}
