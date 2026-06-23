import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cpu, Dna, LayoutTemplate, Palette, Zap, CheckCircle2, Cable, Building2, Route, Lightbulb, Bot, BrainCircuit, Box, Atom, Rocket, Puzzle, Code2, Globe } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { AutonomousThemeEngine } from '../core/engines/AutonomousThemeEngine.js';

const PROTOTYPES = [
  { id: 'alpha', name: 'Alpha (Cyberpunk)', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500' },
  { id: 'beta', name: 'Beta (Ethereal)', color: 'text-neon-cyan', bg: 'bg-indigo-500/10', border: 'border-indigo-500' },
  { id: 'gamma', name: 'Gamma (Synthwave)', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500' },
  { id: 'delta', name: 'Delta (Bio-Organic)', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
  { id: 'epsilon', name: 'Epsilon (Steampunk)', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500' },
  { id: 'zeta', name: 'Zeta (Brutalist)', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500' },
  { id: 'eta', name: 'Eta (Holographic)', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500' },
  { id: 'theta', name: 'Theta (Cosmic)', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500' },
  { id: 'iota', name: 'Iota (Zen)', color: 'text-stone-400', bg: 'bg-stone-500/10', border: 'border-stone-500' },
  { id: 'kappa', name: 'Kappa (8-bit)', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500' },
  { id: 'lambda', name: 'Lambda (Void)', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500' },
  { id: 'mu', name: 'Mu (Vaporwave)', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500' },
  { id: 'nu', name: 'Nu (Glitch)', color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500' },
  { id: 'xi', name: 'Xi (Minimal)', color: 'text-neutral-400', bg: 'bg-neutral-500/10', border: 'border-neutral-500' },
  { id: 'omicron', name: 'Omicron (Overdrive)', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
  { id: 'pi', name: 'Pi (Mathematical)', color: 'text-neon-cyan', bg: 'bg-blue-500/10', border: 'border-blue-500' },
  { id: 'rho', name: 'Rho (Radiant)', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500' },
  { id: 'sigma', name: 'Sigma (Sovereign)', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500' },
  { id: 'tau', name: 'Tau (Temporal)', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500' },
  { id: 'upsilon', name: 'Upsilon (Utility)', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500' },
  { id: 'phi', name: 'Phi (Phantom)', color: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-300' },
  { id: 'chi', name: 'Chi (Chromatic)', color: 'text-fuchsia-300', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-300' },
  { id: 'psi', name: 'Psi (Psionic)', color: 'text-indigo-300', bg: 'bg-indigo-400/10', border: 'border-indigo-300' },
  { id: 'omega', name: 'Omega (Singularity)', color: 'text-white', bg: 'bg-white/10', border: 'border-white' },
  { id: 'nexus', name: 'Nexus (Glass)', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500' },
  { id: 'terminal', name: 'Terminal (Raw)', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500' },
  { id: 'royal', name: 'Royal (Ornate)', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
  { id: 'forge', name: 'Forge (Industrial)', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
  { id: 'genome', name: 'Genome (Bio)', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
  { id: 'cloud', name: 'Cloud (Neumorphic)', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-300' },
  { id: 'hologram', name: 'Hologram (HUD)', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-300' },
  { id: 'retro', name: 'Retro (8-bit)', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500' },
  { id: 'clean', name: 'Clean (Enterprise)', color: 'text-slate-400', bg: 'bg-slate-600/10', border: 'border-slate-400' },
  { id: 'tactical', name: 'Tactical (Combat)', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' }
];

const USER_PERSONAS = [
  { id: 'dev_ops', name: 'DevOps Architect', icon: Cpu, affinities: { alpha: 0.3, beta: 0.1, gamma: 0.1, delta: 0.1, epsilon: 0.1, zeta: 0.1, eta: 0.1, theta: 0.05, iota: 0.0, kappa: 0.05 } },
  { id: 'ui_ux', name: 'UI/UX Visionary', icon: Palette, affinities: { alpha: 0.05, beta: 0.4, gamma: 0.1, delta: 0.1, epsilon: 0.05, zeta: 0.05, eta: 0.1, theta: 0.05, iota: 0.1, kappa: 0.0 } },
  { id: 'data_sci', name: 'Data Scientist', icon: Dna, affinities: { alpha: 0.1, beta: 0.1, gamma: 0.05, delta: 0.3, epsilon: 0.05, zeta: 0.1, eta: 0.1, theta: 0.1, iota: 0.1, kappa: 0.0 } },
  { id: 'retro', name: 'Arcade Hacker', icon: Zap, affinities: { alpha: 0.1, beta: 0.05, gamma: 0.3, delta: 0.05, epsilon: 0.1, zeta: 0.05, eta: 0.05, theta: 0.05, iota: 0.0, kappa: 0.25 } }
];

// Helper to pick a weighted random prototype ID based on user affinities
const pickWeighted = (affinities) => {
  const rand = Math.random();
  let cumulative = 0;
  for (const [id, weight] of Object.entries(affinities)) {
    cumulative += weight;
    if (rand <= cumulative) return id;
  }
  return 'alpha'; // fallback
};

export default function ThemeSynthesizer({ onBack }) {
  const [selections, setSelections] = useState({
    layout: 'alpha',
    ui: 'gamma',
    bots: 'delta',
    wiring: 'epsilon',
    building: 'zeta',
    routing: 'eta',
    inventing: 'theta',
    agent: 'iota',
    brain: 'kappa',
    module: 'alpha',
    react: 'beta',
    vite: 'gamma',
    extension: 'delta',
    ide: 'epsilon',
    browser: 'zeta',
    theme_rearranging: 'eta',
    scrollbar: 'theta',
    toolbar: 'iota',
    feature: 'kappa',
    scope: 'lambda',
    daemon: 'mu',
    core: 'nu',
    pipeline: 'xi',
    llm: 'omicron',
    app: 'pi',
    theme_color_matching: 'rho',
    glow_matching: 'sigma',
    animated_matching: 'tau',
    generating: 'upsilon'
  });

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [showHybrid, setShowHybrid] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [isAwaitingLLM, setIsAwaitingLLM] = useState(false);
  const [activePersona, setActivePersona] = useState(USER_PERSONAS[0]);

  const setGlobalTheme = useSovereignStore((s) => s.setGlobalTheme);
  const dynamicEvolutions = useSovereignStore((s) => s.dynamicEvolutions);
  const addDynamicEvolution = useSovereignStore((s) => s.addDynamicEvolution);

  // Blend static prototypes with AI generated prototypes
  const blendedPrototypes = [
    ...PROTOTYPES,
    ...dynamicEvolutions.map(theme => ({
      id: theme.name,
      name: `AI: ${theme.name}`,
      color: 'text-white',
      bg: 'bg-indigo-900/50',
      border: 'border-indigo-500'
    }))
  ];

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(p => {
          if (isAwaitingLLM && p >= 90) return 90; // Stall at 90% while waiting for Omni-Brain
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsTraining(false);
              setGlobalTheme({ ...selections });
            }, isAutonomous ? 200 : 500);
            return 100;
          }
          return p + (isAutonomous ? 2 : 2);
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isTraining, isAutonomous, isAwaitingLLM, selections, setGlobalTheme]);

  useEffect(() => {
    let timeout;
    if (!isTraining && isAutonomous) {
      // Every 6 seconds, globally mutate the studio again
      timeout = setTimeout(async () => {
        setIsTraining(true);
        setIsAwaitingLLM(true);
        setTrainingProgress(0);

        const prev = dynamicEvolutions.length > 0 ? JSON.stringify(dynamicEvolutions[dynamicEvolutions.length - 1]) : '';
        const result = await AutonomousThemeEngine.evolveTheme(prev);

        const randomState = {
          layout: pickWeighted(activePersona.affinities),
          ui: pickWeighted(activePersona.affinities),
          bots: pickWeighted(activePersona.affinities),
          wiring: pickWeighted(activePersona.affinities),
          building: pickWeighted(activePersona.affinities),
          routing: pickWeighted(activePersona.affinities),
          inventing: pickWeighted(activePersona.affinities),
          agent: pickWeighted(activePersona.affinities),
          brain: pickWeighted(activePersona.affinities),
          module: pickWeighted(activePersona.affinities),
          react: pickWeighted(activePersona.affinities),
          vite: pickWeighted(activePersona.affinities),
          extension: pickWeighted(activePersona.affinities),
          ide: pickWeighted(activePersona.affinities),
          browser: pickWeighted(activePersona.affinities),
          theme_rearranging: pickWeighted(activePersona.affinities),
          scrollbar: pickWeighted(activePersona.affinities),
          toolbar: pickWeighted(activePersona.affinities),
          feature: pickWeighted(activePersona.affinities),
          scope: pickWeighted(activePersona.affinities),
          daemon: pickWeighted(activePersona.affinities),
          core: pickWeighted(activePersona.affinities),
          pipeline: pickWeighted(activePersona.affinities),
          llm: pickWeighted(activePersona.affinities),
          app: pickWeighted(activePersona.affinities),
          theme_color_matching: pickWeighted(activePersona.affinities),
          glow_matching: pickWeighted(activePersona.affinities),
          animated_matching: pickWeighted(activePersona.affinities),
          generating: pickWeighted(activePersona.affinities)
        };

        if (result.success) {
          addDynamicEvolution(result.theme, result.css);
          // Strongly tether the AI generated theme to primary visual layers
          randomState.layout = result.theme.name;
          randomState.ui = result.theme.name;
        }

        setSelections(randomState);
        setIsAwaitingLLM(false);
      }, 6000);
    }
    return () => clearTimeout(timeout);
  }, [isTraining, isAutonomous, activePersona, dynamicEvolutions, addDynamicEvolution]);

  const handleSynthesize = () => {
    setIsAutonomous(false);
    setIsTraining(true);
    setTrainingProgress(0);
  };

  const handleAutonomous = async () => {
    setIsAutonomous(true);
    setIsTraining(true);
    setIsAwaitingLLM(true);
    setTrainingProgress(0);

    const prev = dynamicEvolutions.length > 0 ? JSON.stringify(dynamicEvolutions[dynamicEvolutions.length - 1]) : '';
    const result = await AutonomousThemeEngine.evolveTheme(prev);

    const randomState = {
          layout: pickWeighted(activePersona.affinities),
          ui: pickWeighted(activePersona.affinities),
          bots: pickWeighted(activePersona.affinities),
          wiring: pickWeighted(activePersona.affinities),
          building: pickWeighted(activePersona.affinities),
          routing: pickWeighted(activePersona.affinities),
          inventing: pickWeighted(activePersona.affinities),
          agent: pickWeighted(activePersona.affinities),
          brain: pickWeighted(activePersona.affinities),
          module: pickWeighted(activePersona.affinities),
          react: pickWeighted(activePersona.affinities),
          vite: pickWeighted(activePersona.affinities),
          extension: pickWeighted(activePersona.affinities),
          ide: pickWeighted(activePersona.affinities),
          browser: pickWeighted(activePersona.affinities)
    };

    if (result.success) {
      addDynamicEvolution(result.theme, result.css);
      randomState.layout = result.theme.name;
      randomState.ui = result.theme.name;
    }
    setSelections(randomState);
    setIsAwaitingLLM(false);
  };

  // We no longer render local HybridStudio. We are the Live Studio !now

  return (
    <div className="min-h-screen bg-[#050508] text-white p-10 flex-col gap-4 font-mono relative overflow-hidden">
      
      {isTraining && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex-col gap-4 items-center justify-center">
          <Dna className="w-24 h-24 text-magenta-500 animate-spin mb-8" style={{ animationDuration: '3s' }} />
          <h2 className="text-3xl font-black tracking-widest mb-4">TRAINING PIPELINE ACTIVE</h2>
          <p className="text-gray-400 mb-8">Extracting & Blending Paradigm Features...</p>
          <div className="w-96 h-4 bg-gray-900 rounded-full overflow-hidden border-gray-700">
            <div className="h-full bg-linear-to-r from-cyan-500 via-magenta-500 to-emerald-500 transition-all duration-75" style={{ width: `${trainingProgress}%` }}></div>
          </div>
          <div className="mt-4 text-xs font-bold text-gray-500">{trainingProgress}% COMPLETE</div>
          {isAutonomous && (
            <div className="mt-8 text-emerald-400 font-black animate-pulse tracking-widest text-xl">
              {isAwaitingLLM ? "CONSULTING OMNI-BRAIN FOR AUTONOMOUS MUTATION..." : "AUTONOMOUS MUTATION IN PROGRESS"}
            </div>
          )}
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full flex-col gap-4 h-full z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-600 mb-2 tracking-tight flex items-center gap-3">
              <Cpu className="text-purple-500" /> Evo Pipeline: Theme Synthesizer
            </h1>
            <p className="text-gray-400">Select parameters to extract and blend into a custom hybrid studio.</p>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-3xl transition-all"
          >
            <ArrowLeft size={18} /> Back to Explorer
          </button>
        </div>

        {/* USER PERSONA INJECTION */}
        <div className="bg-[#0a0a0f] border-gray-800 rounded-2xl p-6 mb-8 flex-col gap-4 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
           <h3 className="text-xl font-bold flex items-center gap-2 border-b border-gray-800 pb-4 mb-4 text-gray-300">
             1. Inject Target User Persona <span className="text-sm font-normal text-gray-500 ml-4">(Drives Evolution Probabilities)</span>
           </h3>
           <div className="grid grid-cols-4 gap-4">
             {USER_PERSONAS.map(p => {
               const Icon = p.icon;
               const isActive = activePersona.id === p.id;
               return (
                 <button 
                   key={p.id}
                   onClick={() => setActivePersona(p)}
                   className={`p-4 rounded-3xl flex items-center gap-3 transition-all border-2 ${isActive ? 'bg-blue-900/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-gray-900/50 border-transparent hover:bg-gray-800 text-gray-400'}`}
                 >
                   <Icon className={isActive ? 'text-neon-cyan' : 'text-gray-500'} />
                   <span className="font-bold text-sm">{p.name}</span>
                 </button>
               );
             })}
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {[
            { id: 'layout', label: 'Layout', icon: LayoutTemplate, color: 'text-neon-cyan' },
            { id: 'ui', label: 'Palette & UI', icon: Palette, color: 'text-pink-400' },
            { id: 'bots', label: 'Bot Aesthetic', icon: Zap, color: 'text-yellow-400' },
            { id: 'wiring', label: 'Wiring', icon: Cable, color: 'text-emerald-400' },
            { id: 'building', label: 'Building', icon: Building2, color: 'text-orange-400' },
            { id: 'routing', label: 'Routing', icon: Route, color: 'text-purple-400' },
            { id: 'inventing', label: 'Inventing', icon: Lightbulb, color: 'text-cyan-400' },
            { id: 'agent', label: 'Agent', icon: Bot, color: 'text-rose-400' },
            { id: 'brain', label: 'Brain', icon: BrainCircuit, color: 'text-fuchsia-400' },
            { id: 'module', label: 'Module', icon: Box, color: 'text-neon-cyan' },
            { id: 'react', label: 'React', icon: Atom, color: 'text-sky-400' },
            { id: 'vite', label: 'Vite', icon: Rocket, color: 'text-yellow-500' },
            { id: 'extension', label: 'Extension', icon: Puzzle, color: 'text-teal-400' },
            { id: 'ide', label: 'IDE', icon: Code2, color: 'text-blue-500' },
            { id: 'browser', label: 'Browser', icon: Globe, color: 'text-indigo-500' },
          ].map(dim => (
            <div key={dim.id} className="bg-[#0a0a0f] border-gray-800 rounded-3xl p-4 flex-col gap-4 h-[320px]">
              <h3 className="text-xs font-bold flex items-center gap-2 border-b border-gray-800 pb-2 mb-3 text-gray-300 uppercase tracking-widest">
                <dim.icon className={dim.color} size={14} /> {dim.label}
              </h3>
              <div className="flex-col gap-1.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {blendedPrototypes.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setSelections(s => ({...s, [dim.id]: p.id}))}
                    className={`p-2 rounded-2xl text-left transition-all flex items-center justify-between border ${selections[dim.id] === p.id ? `${p.bg} ${p.border} ${p.color}` : 'border-transparent bg-gray-900/50 hover:bg-gray-800 text-gray-500'}`}
                  >
                    <span className="font-bold text-[11px] uppercase tracking-wider">{p.name.split(' ')[0]}</span>
                    {selections[dim.id] === p.id && <CheckCircle2 size={12} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 mt-auto">
          <button 
            onClick={handleSynthesize}
            className="group relative px-10 py-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-black tracking-widest text-lg transition-all hover:scale-105 overflow-hidden border-gray-600"
          >
            MANUAL SYNTHESIS
          </button>

          <button 
            onClick={handleAutonomous}
            className="group relative px-12 py-5 bg-linear-to-r from-emerald-600 to-teal-500 rounded-2xl font-black tracking-widest text-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <div className="relative z-10 flex items-center gap-3">
               <Cpu className="animate-pulse" /> START AUTONOMOUS EVOLUTION
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
