import React, { useState } from 'react';
import { Database, Activity, Settings, Cpu, HardDrive, ShieldAlert, SlidersHorizontal, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ComponentLibrary() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Database size={18} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Memory Bank</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] hover:bg-black/60 transition-colors group cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={14} className="text-red-500 hover:text-red-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><HardDrive size={16} /></div>
            <span className="text-sm font-bold text-gray-200">Context Vault</span>
          </div>
          <div className="text-2xl font-mono font-bold text-white mb-1">1.2 GB</div>
          <p className="text-xs text-gray-500">Vectorized mission history</p>
        </div>

        <div className="bg-black/40 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] hover:bg-black/60 transition-colors group cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={14} className="text-red-500 hover:text-red-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Activity size={16} /></div>
            <span className="text-sm font-bold text-gray-200">Event Bus</span>
          </div>
          <div className="text-2xl font-mono font-bold text-white mb-1">8,402</div>
          <p className="text-xs text-gray-500">Events tracked this session</p>
        </div>
      </div>
    </div>
  );
}

export function SystemSettings() {
  const [settings, setSettings] = useState({
    autoHeal: true,
    dreamState: true,
    strictMode: true,
    telemetry: false
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex flex-col gap-4 mt-8">
      <div className="flex items-center gap-3 mb-2">
        <SlidersHorizontal size={18} className="text-orange-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Core Preferences</h3>
      </div>
      
      <div className="space-y-3">
        <div 
          onClick={() => toggle('autoHeal')}
          className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-[rgba(255,255,255,0.05)] cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${settings.autoHeal ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
              <ShieldAlert size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-200">Autonomous Healing</div>
              <div className="text-xs text-gray-500 mt-1">Allow swarm to patch syntax errors dynamically</div>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.autoHeal ? 'bg-emerald-500' : 'bg-gray-700'}`}>
            <motion.div animate={{ x: settings.autoHeal ? 16 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-md" />
          </div>
        </div>

        <div 
          onClick={() => toggle('dreamState')}
          className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-[rgba(255,255,255,0.05)] cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${settings.dreamState ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
              <Cpu size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-200">Background Evolution</div>
              <div className="text-xs text-gray-500 mt-1">Dream State parsing and vector indexing</div>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.dreamState ? 'bg-purple-500' : 'bg-gray-700'}`}>
            <motion.div animate={{ x: settings.dreamState ? 16 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudioComplementViews() {
  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-gray-500 to-slate-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-gray-400" />
          <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Complements</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <ComponentLibrary />
        <SystemSettings />
      </div>
    </div>
  );
}
