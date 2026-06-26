import React, { useState } from 'react';
import { Blocks, Layers, MonitorSmartphone, Rocket, Settings, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SaasBuilderView() {
  const [activeStep, setActiveStep] = useState(2);
  
  const steps = [
    { id: 1, title: 'Architecture Schema', icon: Layers },
    { id: 2, title: 'Interface Synthesis', icon: MonitorSmartphone },
    { id: 3, title: 'Monetization Hooks', icon: Blocks },
    { id: 4, title: 'Deploy Ready', icon: Rocket },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-rose-500 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
            <Blocks size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">SaaS App Factory</h2>
            <p className="text-xs text-gray-500">Autonomous Application Synthesis</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-colors">
          <Settings size={14} /> Factory Config
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Steps */}
        <div className="w-64 bg-black/60 border-r border-[rgba(255,255,255,0.05)] p-6 space-y-6">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Pipeline Stages</div>
          {steps.map((s, i) => (
            <div key={s.id} className="relative">
              {i !== steps.length - 1 && (
                <div className={`absolute left-4 top-10 bottom-[-24px] w-0.5 ${activeStep > s.id ? 'bg-rose-500' : 'bg-gray-800'}`}></div>
              )}
              <div 
                onClick={() => setActiveStep(s.id)}
                className={`flex items-center gap-4 cursor-pointer group`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10 ${activeStep > s.id ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : activeStep === s.id ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400' : 'bg-gray-800 border-2 border-gray-700 text-gray-500 group-hover:border-gray-600'}`}>
                  {activeStep > s.id ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
                </div>
                <div className={`text-sm font-bold transition-colors ${activeStep >= s.id ? 'text-gray-200' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  {s.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 bg-black/20 p-8 flex flex-col">
          <motion.div 
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 border border-[rgba(255,255,255,0.05)] rounded-xl bg-black/40 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-10"></div>
            
            {activeStep === 2 ? (
              <>
                <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative z-10">
                  <MonitorSmartphone size={40} className="text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 z-10">Interface Synthesis Active</h3>
                <p className="text-gray-400 text-sm max-w-md z-10 mb-8">
                  The omni-agent is currently translating the architecture schema into a dynamic, production-ready React component tree.
                </p>
                <div className="w-full max-w-md bg-black/60 rounded-full h-2 overflow-hidden border border-white/5 z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-linear-to-r from-orange-500 to-rose-500"
                  />
                </div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-3 z-10">65% - Building AST Nodes</div>
              </>
            ) : (
              <p className="text-gray-500 italic z-10">Select step 2 to view active synthesis.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
