import React, { useState } from 'react';
import { Play, Code, Box, Smartphone, Monitor } from 'lucide-react';

export function ForgeRenderConsoleView() {
  const [activeTab, setActiveTab] = useState('preview');
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [isCompiling, setIsCompiling] = useState(false);

  const triggerCompile = () => {
    setIsCompiling(true);
    setTimeout(() => setIsCompiling(false), 2000);
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#090b14] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
      
      {/* Header / Tabs */}
      <div className="flex items-center justify-between bg-black/60 border-b border-[rgba(255,255,255,0.05)] px-4 py-3 backdrop-blur-md">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'preview' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Play size={16} /> Preview
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'code' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Code size={16} /> Code Gen
          </button>
        </div>

        {activeTab === 'preview' && (
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
            <button 
              onClick={() => setDeviceMode('mobile')}
              className={`p-2 rounded-md transition-colors ${deviceMode === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Smartphone size={14} />
            </button>
            <button 
              onClick={() => setDeviceMode('desktop')}
              className={`p-2 rounded-md transition-colors ${deviceMode === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Monitor size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-black/40 flex items-center justify-center overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {isCompiling ? (
          <div className="z-10 flex flex-col items-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
              <Box size={24} className="absolute inset-0 m-auto text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-wider">Compiling Virtual DOM</h3>
            <p className="text-xs text-cyan-500 mt-2 font-mono uppercase">Applying AST transformations...</p>
          </div>
        ) : (
          <div className="z-10 text-center flex flex-col items-center">
            {activeTab === 'preview' ? (
              <div className={`transition-all duration-500 ${deviceMode === 'mobile' ? 'w-[320px] h-[568px] border-8 border-gray-800 rounded-3xl' : 'w-full h-full p-8'}`}>
                <div className="w-full h-full bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-64 bg-cyan-500/10 blur-[100px] rounded-full"></div>
                   <Box size={48} className="text-blue-500/50 mb-4" />
                   <h3 className="text-gray-300 font-bold mb-2">Dynamic Render Surface</h3>
                   <p className="text-gray-500 text-xs px-12 text-center">Trigger a build from the Autonomous Forge to render real components here.</p>
                   <button onClick={triggerCompile} className="mt-6 px-6 py-2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                     Test Compilation
                   </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full p-4 text-left font-mono text-sm overflow-auto custom-scrollbar">
                <div className="text-gray-500 mb-2">// Generated React Component Source</div>
                <div className="text-purple-400">import <span className="text-gray-300">React</span> from <span className="text-green-400">'react'</span>;</div>
                <div className="text-purple-400 mt-2">export default function <span className="text-blue-400">GeneratedApp</span>() {'{'}</div>
                <div className="text-gray-300 pl-4 mt-1">return (</div>
                <div className="text-gray-500 pl-8 mt-1">&lt;div className="app-root"&gt;</div>
                <div className="text-gray-500 pl-12 mt-1">{`/* AST Nodes will populate here */`}</div>
                <div className="text-gray-500 pl-8 mt-1">&lt;/div&gt;</div>
                <div className="text-gray-300 pl-4 mt-1">);</div>
                <div className="text-purple-400 mt-1">{'}'}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
