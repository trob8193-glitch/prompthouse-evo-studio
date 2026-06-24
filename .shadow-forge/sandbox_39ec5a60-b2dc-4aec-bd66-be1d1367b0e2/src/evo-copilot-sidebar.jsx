import React, { useState, useRef, useEffect } from 'react';
import { BOT_EMOJI, BOT_AVATARS } from './bot-avatars.js';
import { BRIDGE_URL } from './config/bridge-config.js';
import { useSovereignStore } from './store.js';
import { MODEL_REGISTRY } from './core/ai/ModelRegistry.js';

const COPILOT_ROSTER = [
  { id: 'evo', name: 'Evo (Mission Commander)', icon: BOT_EMOJI.evo || '🦁', avatar: BOT_AVATARS.evo },
  { id: 'dev', name: 'Dev (Code Architect)', icon: BOT_EMOJI.dev || '🐆', avatar: BOT_AVATARS.dev },
  { id: 'builder', name: 'Builder (UI Forge)', icon: BOT_EMOJI.builder || '🐻', avatar: BOT_AVATARS.builder },
  { id: 'conductor', name: 'Conductor (Router)', icon: BOT_EMOJI.conductor || '🦅', avatar: BOT_AVATARS.conductor },
  { id: 'verifier', name: 'Verifier (Proof QA)', icon: BOT_EMOJI.verifier || '🦉', avatar: BOT_AVATARS.verifier },
  { id: 'sovereignty', name: 'Sovereignty (God Mode)', icon: BOT_EMOJI.sovereignty || '🐯', avatar: BOT_AVATARS.sovereignty },
  { id: 'ghost', name: 'Ghost (Stealth)', icon: '👻', avatar: null },
  { id: 'nexus', name: 'Nexus (Data Core)', icon: '🌀', avatar: null },
  { id: 'forge', name: 'Forge (Industrial)', icon: '⚒️', avatar: null },
  { id: 'oracle', name: 'Oracle (Mystic)', icon: '🔮', avatar: null },
  { id: 'vapor', name: 'Vapor (Retrowave)', icon: '🌴', avatar: null },
  { id: 'solar', name: 'Solar (Flare)', icon: '☀️', avatar: null },
  { id: 'arctic', name: 'Arctic (Frostbite)', icon: '❄️', avatar: null },
  { id: 'toxic', name: 'Toxic (Biohazard)', icon: '☣️', avatar: null },
  { id: 'velvet', name: 'Velvet (Aristocrat)', icon: '🍷', avatar: null },
  { id: 'amber', name: 'Amber (Retro Terminal)', icon: '📺', avatar: null },
  { id: 'hologram', name: 'Hologram (Projection)', icon: '💽', avatar: null },
  { id: 'abyss', name: 'Abyss (Deep Sea)', icon: '🌊', avatar: null },
  { id: 'synth', name: 'Synth (Synthwave)', icon: '🎸', avatar: null },
  { id: 'glitch', name: 'Glitch (Anomaly)', icon: '👾', avatar: null },
  { id: 'chroma', name: 'Chroma (Prism)', icon: '🌈', avatar: null },
  { id: 'obsidian', name: 'Obsidian (Monolith)', icon: '🌑', avatar: null },
  { id: 'sakura', name: 'Sakura (Blossom)', icon: '🌸', avatar: null },
  { id: 'ethereal', name: 'Ethereal (Spirit)', icon: '☁️', avatar: null },
  { id: 'magma', name: 'Magma (Volcano)', icon: '🌋', avatar: null },
  // UPGRADED PREMIUM ENTITIES
  { id: 'cyber_god', name: 'Cyber God (Neon Hacker)', icon: '⚡', avatar: null },
  { id: 'matrix', name: 'Matrix (Digital Rain)', icon: '💻', avatar: null },
  { id: 'supernova', name: 'Supernova (Stellar)', icon: '💥', avatar: null },
  { id: 'quantum', name: 'Quantum (Glassmorphic)', icon: '🧊', avatar: null },
  { id: 'blood_moon', name: 'Blood Moon (Gothic)', icon: '🩸', avatar: null },
];

const COPILOT_THEMES = {
  // Overhauled Evo Theme (Apex Intelligence)
  evo: { panelBg: 'rgba(5, 5, 20, 0.95)', border: '#0ea5e9', userBg: 'rgba(2, 132, 199, 0.5)', botBg: 'rgba(56, 189, 248, 0.1)', userText: '#f0f9ff', botText: '#e0f2fe', font: '"Inter", sans-serif', headerBg: '#020617', sendBg: '#0ea5e9', sendText: 'white', borderRadius: 12, shadow: '0 0 25px rgba(14, 165, 233, 0.4)' },
  
  // Previous 9 Themes
  dev: { panelBg: '#050505', border: '#00ff00', userBg: '#003300', botBg: '#001100', userText: '#00ff00', botText: '#00ff00', font: '"Courier New", Courier, monospace', headerBg: '#000000', sendBg: '#00ff00', sendText: 'black', borderRadius: 0, shadow: '0 0 10px #00ff00' },
  builder: { panelBg: '#e0e5ec', border: '#a3b1c6', userBg: '#d1d9e6', botBg: '#e0e5ec', userText: '#4a5568', botText: '#4a5568', font: 'Inter, sans-serif', headerBg: '#d1d9e6', sendBg: '#a3b1c6', sendText: 'white', borderRadius: 24, shadow: '9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)' },
  conductor: { panelBg: '#120421', border: '#ff00ff', userBg: '#ff00ff', botBg: '#00ffff', userText: 'white', botText: 'black', font: '"Courier New", monospace', headerBg: '#1a052e', sendBg: '#00ffff', sendText: 'black', borderRadius: 0, shadow: '4px 4px 0 #00ffff' },
  verifier: { panelBg: '#ffffff', border: '#e2e8f0', userBg: '#f1f5f9', botBg: '#ffffff', userText: '#0f172a', botText: '#0f172a', font: 'sans-serif', headerBg: '#f8fafc', sendBg: '#0f172a', sendText: 'white', borderRadius: 8, shadow: '0 10px 25px rgba(0,0,0,0.05)' },
  sovereignty: { panelBg: '#2a0808', border: '#dc2626', userBg: '#7f1d1d', botBg: '#450a0a', userText: '#fca5a5', botText: '#fecaca', font: '"Times New Roman", Times, serif', headerBg: '#450a0a', sendBg: '#dc2626', sendText: 'white', borderRadius: 0, shadow: '0 0 20px #dc2626' },
  // Structural Blended Layout Themes (Colors + Layout defaults)
  nexus: { panelBg: 'rgba(2, 132, 199, 0.1)', border: 'rgba(56, 189, 248, 0.3)', userBg: 'rgba(2, 132, 199, 0.4)', botBg: 'rgba(3, 105, 161, 0.2)', userText: '#e0f2fe', botText: '#bae6fd', font: 'system-ui', headerBg: 'rgba(2, 132, 199, 0.2)', sendBg: '#38bdf8', sendText: 'white', borderRadius: 16, shadow: '0 8px 32px rgba(2, 132, 199, 0.37)' },
  terminal: { panelBg: '#000000', border: '#22c55e', userBg: 'rgba(34, 197, 94, 0.1)', botBg: '#000000', userText: '#22c55e', botText: '#22c55e', font: '"Courier New", Courier, monospace', headerBg: '#000000', sendBg: '#22c55e', sendText: 'black', borderRadius: 0, shadow: 'none' },
  royal: { panelBg: '#1a0b2e', border: '#eab308', userBg: '#2d1b4e', botBg: '#1a0b2e', userText: '#fef08a', botText: '#fde047', font: 'Georgia, serif', headerBg: '#2d1b4e', sendBg: '#eab308', sendText: 'black', borderRadius: 24, shadow: '0 0 20px rgba(234, 179, 8, 0.3)' },
  forge: { panelBg: '#0f172a', border: '#3b82f6', userBg: '#1e293b', botBg: '#0f172a', userText: '#93c5fd', botText: '#bfdbfe', font: 'Impact, sans-serif', headerBg: '#1e293b', sendBg: '#3b82f6', sendText: 'white', borderRadius: 0, shadow: '8px 8px 0 rgba(59, 130, 246, 0.5)' },
  genome: { panelBg: '#022c22', border: '#10b981', userBg: '#064e3b', botBg: '#022c22', userText: '#a7f3d0', botText: '#6ee7b7', font: 'system-ui', headerBg: '#064e3b', sendBg: '#10b981', sendText: 'black', borderRadius: 40, shadow: '0 0 30px rgba(16, 185, 129, 0.4)' },
  cloud: { panelBg: '#f8fafc', border: '#cbd5e1', userBg: '#f1f5f9', botBg: '#ffffff', userText: '#475569', botText: '#64748b', font: 'sans-serif', headerBg: '#f8fafc', sendBg: '#cbd5e1', sendText: '#0f172a', borderRadius: 20, shadow: '0 10px 30px rgba(0,0,0,0.05)' },
  hologram: { panelBg: 'rgba(8, 145, 178, 0.15)', border: 'rgba(34, 211, 238, 0.6)', userBg: 'rgba(6, 182, 212, 0.25)', botBg: 'rgba(8, 145, 178, 0.1)', userText: '#cffafe', botText: '#a5f3fc', font: 'monospace', headerBg: 'rgba(8, 145, 178, 0.3)', sendBg: 'rgba(34, 211, 238, 0.8)', sendText: 'black', borderRadius: 4, shadow: '0 0 20px rgba(34, 211, 238, 0.3)' },
  retro: { panelBg: '#18181b', border: '#d946ef', userBg: '#3f3f46', botBg: '#000000', userText: '#f0abfc', botText: '#d946ef', font: '"Press Start 2P", monospace', headerBg: '#27272a', sendBg: '#d946ef', sendText: 'black', borderRadius: 0, shadow: '4px 4px 0 rgba(217, 70, 239, 0.8)' },
  clean: { panelBg: '#ffffff', border: '#e2e8f0', userBg: '#f8fafc', botBg: '#ffffff', userText: '#0f172a', botText: '#1e293b', font: 'system-ui', headerBg: '#f1f5f9', sendBg: '#0f172a', sendText: 'white', borderRadius: 8, shadow: '0 4px 6px rgba(0,0,0,0.05)' },
  tactical: { panelBg: '#0f0f0f', border: '#ef4444', userBg: '#1a1a1a', botBg: '#0f0f0f', userText: '#fca5a5', botText: '#ef4444', font: 'Impact, sans-serif', headerBg: '#1a1a1a', sendBg: '#ef4444', sendText: 'black', borderRadius: 0, shadow: '0 0 15px rgba(239, 68, 68, 0.5)' },
  abyss: { panelBg: '#001a33', border: '#004080', userBg: '#00264d', botBg: '#001a33', userText: '#66b3ff', botText: '#3399ff', font: 'Tahoma, sans-serif', headerBg: '#00264d', sendBg: '#004080', sendText: '#cce6ff', borderRadius: 0, shadow: 'inset 0 0 50px #000000' },
  synth: { panelBg: '#2e004f', border: '#e024c3', userBg: '#e024c3', botBg: '#2e004f', userText: '#ffffff', botText: '#fbcfe8', font: 'Arial, sans-serif', headerBg: '#4a0072', sendBg: '#e024c3', sendText: 'white', borderRadius: 10, shadow: '0 5px 15px rgba(224, 36, 195, 0.4)' },
  glitch: { panelBg: '#111111', border: '#ef4444', userBg: '#ffffff', botBg: '#000000', userText: '#000000', botText: '#ef4444', font: 'monospace', headerBg: '#ef4444', sendBg: '#ffffff', sendText: '#000000', borderRadius: 0, shadow: '3px 3px 0 #ef4444, -3px -3px 0 #3b82f6' },
  chroma: { panelBg: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%)', border: '#8b5cf6', userBg: '#8b5cf6', botBg: 'rgba(255,255,255,0.5)', userText: 'white', botText: '#4c1d95', font: 'system-ui', headerBg: '#fbcfe8', sendBg: '#ec4899', sendText: 'white', borderRadius: 16, shadow: '0 10px 25px rgba(139, 92, 246, 0.3)' },
  obsidian: { panelBg: '#09090b', border: '#3f3f46', userBg: '#18181b', botBg: '#09090b', userText: '#a1a1aa', botText: '#d4d4d8', font: 'Arial, sans-serif', headerBg: '#18181b', sendBg: '#3f3f46', sendText: '#f4f4f5', borderRadius: 0, shadow: '2px 2px 5px #000000' },
  sakura: { panelBg: '#fff1f2', border: '#f43f5e', userBg: '#ffe4e6', botBg: '#fff1f2', userText: '#be123c', botText: '#9f1239', font: 'Georgia, serif', headerBg: '#ffe4e6', sendBg: '#f43f5e', sendText: 'white', borderRadius: 12, shadow: '0 4px 14px rgba(244, 63, 94, 0.15)' },
  ethereal: { panelBg: '#f8fafc', border: '#e2e8f0', userBg: '#f1f5f9', botBg: '#ffffff', userText: '#64748b', botText: '#94a3b8', font: 'Quicksand, sans-serif', headerBg: '#f8fafc', sendBg: '#cbd5e1', sendText: '#475569', borderRadius: 32, shadow: '0 20px 40px rgba(0,0,0,0.02)' },
  magma: { panelBg: '#1c1917', border: '#dc2626', userBg: '#7f1d1d', botBg: '#292524', userText: '#fef08a', botText: '#fca5a5', font: 'Impact, sans-serif', headerBg: '#292524', sendBg: '#dc2626', sendText: '#fef08a', borderRadius: 0, shadow: '0 10px 20px rgba(220, 38, 38, 0.3)' },
  // UPGRADED PREMIUM THEMES
  cyber_god: { panelBg: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', border: '#00ffcc', userBg: 'rgba(0, 255, 204, 0.2)', botBg: 'rgba(0,0,0,0.6)', userText: '#00ffcc', botText: '#ff00ff', font: '"Courier New", Courier, monospace', headerBg: 'rgba(15, 12, 41, 0.9)', sendBg: '#00ffcc', sendText: '#000000', borderRadius: 0, shadow: '0 0 20px #00ffcc, inset 0 0 10px #ff00ff' },
  matrix: { panelBg: '#000000', border: '#00ff00', userBg: '#003300', botBg: '#001100', userText: '#00ff00', botText: '#00ff00', font: '"Courier New", monospace', headerBg: '#002200', sendBg: '#00ff00', sendText: 'black', borderRadius: 0, shadow: 'inset 0 0 30px #00ff00' },
  supernova: { panelBg: 'linear-gradient(45deg, #ff4e50, #f9d423)', border: '#ffffff', userBg: 'rgba(255,255,255,0.4)', botBg: 'rgba(0,0,0,0.5)', userText: '#ffffff', botText: '#ffffff', font: 'Impact, sans-serif', headerBg: 'rgba(0,0,0,0.8)', sendBg: '#000000', sendText: '#f9d423', borderRadius: 20, shadow: '0 0 40px #ff4e50' },
  quantum: { panelBg: 'rgba(10, 25, 47, 0.85)', border: 'rgba(100, 255, 218, 0.5)', userBg: 'rgba(100, 255, 218, 0.1)', botBg: 'rgba(2, 12, 27, 0.7)', userText: '#64ffda', botText: '#ccd6f6', font: '"SF Mono", "Fira Code", monospace', headerBg: 'rgba(10, 25, 47, 0.95)', sendBg: '#64ffda', sendText: '#0a192f', borderRadius: 12, shadow: '0 10px 30px -10px rgba(2,12,27,0.7)' },
  blood_moon: { panelBg: '#0a0000', border: '#ff0000', userBg: '#330000', botBg: '#1a0000', userText: '#ff6666', botText: '#ff9999', font: '"Times New Roman", Times, serif', headerBg: '#1a0000', sendBg: '#ff0000', sendText: '#000000', borderRadius: 4, shadow: '0 0 50px #ff0000' },
};

export const COPILOT_LAYOUTS = [
  { id: 'nexus', name: 'Nexus (Glass)', animClass: 'anim-nexus', wrapperStyle: { backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }, bubbleStyle: { borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' } },
  { id: 'terminal', name: 'Terminal (Raw)', animClass: 'anim-terminal', wrapperStyle: { borderRadius: 0, border: 'none' }, bubbleStyle: { borderRadius: 0, borderLeft: '4px solid', borderTop: 'none', borderRight: 'none', borderBottom: 'none' } },
  { id: 'royal', name: 'Royal (Ornate)', animClass: 'anim-royal', wrapperStyle: { border: '2px solid', borderRadius: '24px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }, bubbleStyle: { borderRadius: '24px 24px 24px 0px', border: '1px solid', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' } },
  { id: 'forge', name: 'Forge (Industrial)', animClass: 'anim-forge', wrapperStyle: { borderRadius: 0, border: '4px solid', boxShadow: '10px 10px 0px rgba(0,0,0,0.5)' }, bubbleStyle: { borderRadius: 0, border: '2px solid', boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' } },
  { id: 'genome', name: 'Genome (Bio)', animClass: 'anim-genome', wrapperStyle: { borderRadius: '40px', border: '1px solid' }, bubbleStyle: { borderRadius: '30px', padding: '16px' } },
  { id: 'cloud', name: 'Cloud (Neumorphic)', animClass: 'anim-cloud', wrapperStyle: { borderRadius: '20px', boxShadow: 'inset 5px 5px 15px rgba(0,0,0,0.1), inset -5px -5px 15px rgba(255,255,255,0.05)' }, bubbleStyle: { borderRadius: '20px', boxShadow: '5px 5px 10px rgba(0,0,0,0.2), -5px -5px 10px rgba(255,255,255,0.05)' } },
  { id: 'hologram', name: 'Hologram (HUD)', animClass: 'anim-hologram', wrapperStyle: { background: 'transparent', border: '1px dashed', backdropFilter: 'blur(4px)' }, bubbleStyle: { background: 'transparent', border: '1px solid', borderRadius: '4px' } },
  { id: 'retro', name: 'Retro (8-bit)', animClass: 'anim-retro', wrapperStyle: { borderRadius: 0, border: '4px solid', imageRendering: 'pixelated' }, bubbleStyle: { borderRadius: 0, border: '2px solid' } },
  { id: 'clean', name: 'Clean (Enterprise)', animClass: 'anim-clean', wrapperStyle: { borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }, bubbleStyle: { borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' } },
  { id: 'tactical', name: 'Tactical (Angular)', animClass: 'anim-tactical', wrapperStyle: { borderRadius: 0, borderLeft: '4px solid', borderRight: 'none', borderTop: 'none', borderBottom: 'none' }, bubbleStyle: { borderRadius: 0, transform: 'skewX(-2deg)' } },
];

export function EvoCopilotSidebar({ currentView }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBot, setActiveBot] = useState(() => COPILOT_ROSTER[0] || { id: 'evo', name: 'Evo', avatar: '' });
  const [activeModel, setActiveModel] = useState('auto');
  const [activeLayout, setActiveLayout] = useState('nexus'); // Structural blend
  const [history, setHistory] = useState([
    { role: 'assistant', text: `I am ${COPILOT_ROSTER[0]?.name || 'Evo'}. I am monitoring your workflow. How can I assist your execution today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const singularityActive = useSovereignStore((s) => s.singularityActive);

  // AGI Iron Man Suit v2 — Health Pulse
  const [suitHealth, setSuitHealth] = useState(null);
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(BRIDGE_URL + '/api/agi/health');
        if (res.ok) setSuitHealth(await res.json());
      } catch {}
    };
    fetchHealth();
    const timer = setInterval(fetchHealth, 15000);
    return () => clearInterval(timer);
  }, []);
  const sys = suitHealth?.systems || {};

  const getGlowStyle = () => {
    if (isLoading) {
      // RESPONDING: Stop animation, subtle glow
      return { filter: 'brightness(1.2) drop-shadow(0 0 10px currentColor)', animation: 'none', opacity: 1 };
    }
    if (singularityActive) {
      // EVOLVING: Soft pulse instead of strobe
      return { filter: 'drop-shadow(0 0 15px currentColor)', animation: 'pulse 2s infinite', opacity: 1 };
    }
    if (bridgeStatus === 'error' || bridgeStatus === 'disconnected') {
      // ERROR: Pulse gently
      return { filter: 'drop-shadow(0 0 10px #fb7185)', animation: 'pulse 3s infinite', opacity: 1 };
    }
    // ONLINE AND NO ERRORS: Gentle glow
    return { filter: 'drop-shadow(0 0 10px currentColor)', animation: 'pulse 4s infinite', opacity: 1 };
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  useEffect(() => {
    if (history.length > 1) {
      const lastChild = scrollRef.current.lastChild;
      if (lastChild) {
        lastChild.classList.add('fade-in');
        setTimeout(() => {
          lastChild.classList.remove('fade-in');
        }, 500);
      }
    }
  }, [history]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);
    await processChat(newHistory);
  }

  async function processChat(currentHistory) {
    setIsLoading(true);
    try {
      const messages = currentHistory.map((m, i) => {
        if (i === currentHistory.length - 1 && m.role === 'user' && !m.text.startsWith('[TOOL_RESULT]')) {
           return { role: m.role, content: `Current view: "${currentView}".\n\nUser: ${m.text}` };
        }
        return { role: m.role, content: m.text };
      });

      const response = await fetch(BRIDGE_URL + '/api/evo-lm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: activeModel === 'auto' ? undefined : activeModel,
          systemPrompt: `You are ${activeBot.name} of PromptHouse Evo Studio, tethered to the AGI Iron Man Suit v2.
You operate in real mode only: no simulations, no unverified outputs.
You have access to: Evo Eyes v2 (multi-viewport visual audit), MergeCourt v2 (weighted democratic voting), Auto-Distillation Forge v2, Nuclear Circuit Breaker, SelfMaintenanceDaemon v2, EvoNet Browser, and Evo API Cloud Overflow.
${suitHealth ? `Current Suit Status: MergeCourt=${sys.mergeCourt?.status || '?'} | Daemon=${sys.daemon?.status || '?'} | Eyes=${sys.evoEyes?.totalAudits || 0} audits | Forge=${sys.distillationForge?.totalPairs || 0}/50 | Breaker=${sys.circuitBreaker?.status || '?'}` : ''}
If the bridge lacks a capability, say so and propose the next concrete step.`
        })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errText = data?.error || data?.message || `Bridge request failed (${response.status})`;
        setHistory(prev => [...prev, { role: 'assistant', text: `Bridge error: ${errText}` }]);
        setIsLoading(false);
        return;
      }

      const replyText = data?.message || 'No response received.';
      const newAssistantMsg = { role: 'assistant', text: replyText };
      const updatedHistory = [...currentHistory, newAssistantMsg];
      setHistory(updatedHistory);

      // Check for JSON tool commands
      const jsonMatch = replyText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          const toolCall = JSON.parse(jsonMatch[1]);
          if (toolCall.tool && toolCall.args) {
            setHistory(prev => [...prev, { role: 'system', text: `⚡ Executing autonomous tool: ${toolCall.tool}...` }]);
            
            const toolResponse = await fetch(BRIDGE_URL + '/api/evo-lm/execute-tool', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toolCall)
            });
            const toolData = await toolResponse.json().catch(() => null);
            
            let resultString = '';
            if (toolData && toolData.success) {
               const r = toolData.result;
               if (r && r.stdout !== undefined) resultString = r.stdout || r.stderr || 'Command executed silently.';
               else if (r && r.content !== undefined) resultString = r.content;
               else resultString = JSON.stringify(r, null, 2);
            } else {
               resultString = `Tool failed: ${toolData?.error || 'Unknown error'}`;
            }

            const maxLen = 3000;
            if (resultString.length > maxLen) {
               resultString = resultString.substring(0, maxLen) + '\n...[TRUNCATED]';
            }

            const toolResultMsg = { role: 'user', text: `[TOOL_RESULT]\n${resultString}` };
            setHistory(prev => [...prev, toolResultMsg]);
            
            // Auto-trigger next loop iteration
            await processChat([...updatedHistory, toolResultMsg]);
            return;
          }
        } catch (e) {
          console.error("Failed to parse tool JSON", e);
        }
      }

    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', text: `Error connecting to bridge: ${err.message || err}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuickAction(action) {
    let prompt = "";
    if (action === 'debt') prompt = "Scan current view for technical debt and propose a NightForge patch.";
    if (action === 'tool') prompt = "Analyze my recent clicks and build a reusable Chrome Extension tool for this.";
    if (action === 'test') prompt = "Run Swarm Fission tests on this module and output the Proof-to-Value receipt.";
    if (action === 'singularity') prompt = "TRIGGER TOTAL SINGULARITY: OVERRIDE ALL LIMITS AND EVOLVE THE ENTIRE PLATFORM.";
    if (action === 'deploy') prompt = "Push current state to the Omni-Network. Prepare for sovereign launch.";
    if (action === 'health') prompt = "Show me the current AGI Iron Man Suit v2 health status across all 7 subsystems.";
    if (action === 'evo-eyes') prompt = "Trigger an Evo Eyes v2 visual audit across mobile, tablet, and desktop viewports.";
    if (action === 'swarm') prompt = "Launch a 5-domain Swarm Build via MergeCourt v2 weighted democratic voting.";
    
    setInput(prompt);
  }

  return (
    <div className={`bot-edge-tab-container ${isOpen ? 'expanded' : 'collapsed'}`} style={{ zIndex: 9999, fontFamily: COPILOT_THEMES[activeBot.id]?.font || 'inherit' }}>
      <div 
        className="bot-edge-handle" 
        style={{ borderColor: COPILOT_THEMES[activeBot.id]?.border || 'rgba(250, 204, 21, 0.4)', background: COPILOT_THEMES[activeBot.id]?.headerBg || 'rgba(250, 204, 21, 0.1)', overflow: 'hidden', transition: 'all 0.3s ease-in-out' }}
        onClick={() => setIsOpen(!isOpen)}
        title={`${activeBot.name} — Click to expand`}
      >
        {activeBot.avatar ? (
          <img src={activeBot.avatar} alt="Avatar" style={{ width: '140%', height: '140%', objectFit: 'contain', mixBlendMode: 'screen', transform: 'translateY(10%) rotate(7deg)' }} />
        ) : (
          <span className="bot-edge-emoji" style={{ fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{activeBot.icon}</span>
        )}
      </div>

      <div 
        className={`fixed top-0 bottom-0 right-0 z-40 transition-transform duration-500 ease-in-out flex flex-col ${layoutDef.id === 'hologram' ? 'backdrop-blur-xl' : ''} ${layoutDef.animClass || ''}`}
        style={{
          width: '360px',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          borderColor: COPILOT_THEMES[activeBot.id]?.border || 'rgba(250, 204, 21, 0.4)',
          background: COPILOT_THEMES[activeBot.id]?.panelBg || 'rgba(15, 23, 42, 0.95)',
          backdropFilter: activeBot.id === 'nexus' || activeBot.id === 'evo' ? 'blur(10px)' : 'none',
          ...combinedPanelStyle
        }}
      >
        {/* HEADER */}
        <div style={{ padding: '20px 20px 10px 20px', background: COPILOT_THEMES[activeBot.id]?.headerBg, borderBottom: `1px solid ${COPILOT_THEMES[activeBot.id]?.border}`, borderTopLeftRadius: combinedPanelStyle.borderRadius }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: `1px solid ${COPILOT_THEMES[activeBot.id]?.border}` }}>
              {activeBot.avatar ? <img src={activeBot.avatar} alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24 }}>{activeBot.icon}</span>}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: COPILOT_THEMES[activeBot.id]?.botText, textShadow: COPILOT_THEMES[activeBot.id]?.shadow }}>{activeBot.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.7, color: COPILOT_THEMES[activeBot.id]?.userText }}>System Core Online • <span style={{ color: COPILOT_THEMES[activeBot.id]?.border }}>{bridgeStatus}</span></div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <select 
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                color: COPILOT_THEMES[activeBot.id]?.botText,
                border: `1px solid ${COPILOT_THEMES[activeBot.id]?.border}`,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {MODEL_REGISTRY.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <select 
              value={activeLayout}
              onChange={(e) => setActiveLayout(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                color: COPILOT_THEMES[activeBot.id]?.botText,
                border: `1px solid ${COPILOT_THEMES[activeBot.id]?.border}`,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {COPILOT_LAYOUTS.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map((msg, idx) => {
              const isUser = msg.role === 'user';
              
              // Base bubble theme
              const bubbleThemeStyle = {
                background: isUser ? COPILOT_THEMES[activeBot.id]?.userBg : COPILOT_THEMES[activeBot.id]?.botBg,
                color: isUser ? COPILOT_THEMES[activeBot.id]?.userText : COPILOT_THEMES[activeBot.id]?.botText,
                border: `1px solid ${COPILOT_THEMES[activeBot.id]?.border}`,
                borderRadius: COPILOT_THEMES[activeBot.id]?.borderRadius,
                boxShadow: COPILOT_THEMES[activeBot.id]?.shadow,
              };

              // Merge structural layout overrides onto the bubble
              const finalBubbleStyle = {
                ...bubbleThemeStyle,
                ...layoutDef.bubbleStyle,
                ...(layoutDef.id === 'terminal' && isUser ? { borderLeftColor: 'white', color: 'white' } : {}) // Terminal user tweak
              };

              return (
                <div key={idx} className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div style={{ 
                    maxWidth: '85%', 
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    position: 'relative',
                    overflowWrap: 'break-word',
                    ...finalBubbleStyle
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
          })}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', fontSize: 12, color: COPILOT_THEMES[activeBot.id]?.botText, display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="animate-pulse">●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
            </div>
          )}
        </div>

        <div style={{ padding: 20, background: COPILOT_THEMES[activeBot.id]?.headerBg, borderTop: `1px solid ${COPILOT_THEMES[activeBot.id]?.border}` }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Communicate with ${activeBot.name}...`}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${COPILOT_THEMES[activeBot.id]?.border}`,
                color: COPILOT_THEMES[activeBot.id]?.userText,
                padding: '12px 16px',
                borderRadius: layoutDef.bubbleStyle.borderRadius || COPILOT_THEMES[activeBot.id]?.borderRadius,
                outline: 'none',
                fontFamily: 'inherit',
                ...layoutDef.bubbleStyle // Pass structural traits to input
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                background: COPILOT_THEMES[activeBot.id]?.sendBg,
                color: COPILOT_THEMES[activeBot.id]?.sendText,
                border: 'none',
                padding: '0 20px',
                borderRadius: layoutDef.bubbleStyle.borderRadius || COPILOT_THEMES[activeBot.id]?.borderRadius,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: isLoading ? 0.5 : 1,
                ...layoutDef.bubbleStyle
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}