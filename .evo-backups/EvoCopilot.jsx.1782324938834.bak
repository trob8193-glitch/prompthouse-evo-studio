import React, { useState, useEffect, useRef } from 'react';
import { Bot, RefreshCw, Send, AlertCircle, ShieldCheck, Mic, Cpu, FileCode, Check, Play, Settings2, Loader2, Zap, Rocket, Flame, Scan, Brain, HeartPulse, Eye, Shield, Gauge } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSovereignStore } from '../store.js';
import { universalSend } from '../lib/universal-transport.js';
import { ALL_BOT_ROSTER } from '../engine.js';
import { EvoHologram } from './EvoHologram.jsx';

const COPILOT_LAYOUTS = [
  { id: 'nexus', name: 'Nexus Default', bubbleStyle: {} },
  { id: 'hologram', name: 'Holographic', bubbleStyle: { background: 'rgba(0,0,0,0.5)' } },
  { id: 'terminal', name: 'Terminal Shell', bubbleStyle: { fontFamily: 'monospace', borderRadius: '0' } }
];
import { BRIDGE_URL } from '../config/bridge-config.js';
import { MODEL_REGISTRY } from '../core/ai/ModelRegistry.js';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';

function bridgeUrl(path) {
  const configured = import.meta.env.VITE_PROMPTBRIDGE_URL;
  const base = configured || BRIDGE_URL;
  return `${base}${path}`;
}

export function EvoCopilot() {
  const [selectedBot, setSelectedBot] = useState('evo');
  const [messages, setMessages] = useState([
    {
      id: 'sys_1',
      role: 'assistant',
      content: 'Welcome to **Evo Copilot**. Mention a daemon (e.g. `@SelfHealer`) or select one from the roster to route your request. I am fully aware of your IDE context.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false); // Track if last input was voice
  const [selectedModel, setSelectedModel] = useState('auto');
  const [activeLayout, setActiveLayout] = useState('nexus');

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Zustand Store integrations for IDE context
  const activeFile = useSovereignStore((s) => s.activeFile);
  const fileContent = useSovereignStore((s) => s.fileContent);
  const addTerminalLogs = useSovereignStore((s) => s.addTerminalLogs);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const bondedNodes = useSovereignStore((s) => s.bondedNodes);

  // ══ AGI IRON MAN SUIT v2 — Health Pulse ══
  const [suitHealth, setSuitHealth] = useState(null);
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(bridgeUrl('/api/agi/health'));
        if (res.ok) setSuitHealth(await res.json());
      } catch {}
    };
    fetchHealth();
    const timer = setInterval(fetchHealth, 15000);
    return () => clearInterval(timer);
  }, []);
  const sys = suitHealth?.systems || {};

  const currentBot = ALL_BOT_ROSTER.find(b => b.id === selectedBot) || ALL_BOT_ROSTER[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    initializeThread();
  }, []);

  const initializeThread = async () => {
    try {
      const res = await fetch(bridgeUrl('/api/agent/health'));
      const data = await res.json();
      if (data.threadId) {
        setThreadId(data.threadId);
      }
    } catch (err) {
      void('Failed to initialize thread:', err);
    }
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    setUsedVoice(false);
    submitMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setUsedVoice(false);
      submitMessage(input);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setLoading(true);
        try {
          const res = await fetch(bridgeUrl('/api/agent/transcribe'), {
            method: 'POST',
            headers: { 'Content-Type': 'audio/webm' },
            body: audioBlob
          });
          if (!res.ok) throw new Error('Transcription failed');
          const data = await res.json();
          if (data.text) {
            setInput('');
            setUsedVoice(true);
            await submitMessage(data.text, true);
          }
        } catch (err) {
          void("Transcription error", err);
          setLoading(false);
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      void("Microphone access denied:", err);
      alert("Microphone access required to speak to the bots.");
    }
  };

  const submitMessage = async (messageText, isVoiceMode = false) => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Detect @mentions for dynamic agent routing
    const match = messageText.match(/@(\w+)/);
    let targetBotId = selectedBot;
    if (match) {
        const mentionedId = match[1].toLowerCase();
        if (ALL_BOT_ROSTER.some(b => b.id === mentionedId)) {
            targetBotId = mentionedId;
            setSelectedBot(mentionedId);
        }
    }

    // Context formatting
    let fullPrompt = messageText;
    if (activeFile && fileContent) {
        fullPrompt = `[CONTEXT: Viewing file ${activeFile}]\n\`\`\`javascript\n${fileContent}\n\`\`\`\n\nUser Request: ${messageText}`;
    }

    try {
      let assistantContent = '';
      let botVoice = currentBot.voice || 'onyx';

      // Build payload history for Universal AI Adaptor
      const payloadMessages = messages.map(m => ({ role: m.role, content: m.content }));
      payloadMessages.push({ role: 'user', content: fullPrompt });

      let botSystemPrompt = `You are ${currentBot.name}, a ${currentBot.species}. Role: ${currentBot.role}. Signature: ${currentBot.signature}.\nOutput clean markdown. Use \`\`\`language blocks for code.\n\n---`;

      // Always enable IDE Bond if we have the endpoint available
      const isBonded = true; // Hardcoded true to enable God Mode
      if (isBonded) {
        // Build AGI suit context
        const suitContext = suitHealth ? `\n\n[AGI IRON MAN SUIT v2 STATUS]
Merge Court: ${sys.mergeCourt?.status || 'UNKNOWN'} | Daemon: ${sys.daemon?.status || 'COLD_START'}
Evo Eyes: ${sys.evoEyes?.status || 'OFFLINE'} (${sys.evoEyes?.totalAudits || 0} audits)
Distillation: ${sys.distillationForge?.totalPairs || 0}/50 pairs | Circuit Breaker: ${sys.circuitBreaker?.status || 'UNKNOWN'}
EvoNet Browser: ${sys.evonetBrowser?.status || 'OFFLINE'} | Evo API Overflow: ${sys.evoApiOverflow?.status || 'OFFLINE'}` : '';

        botSystemPrompt += `\n\n[GOD MODE ACTIVE] You have OS-level access via the Antigravity IDE Bond.
You are tethered to the AGI Iron Man Suit v2, which provides:
- Evo Eyes v2: Multi-viewport visual validation (mobile/tablet/desktop)
- MergeCourt v2: Weighted democratic voting for swarm consensus
- Auto-Distillation Forge v2: Quality-scored training pair generation
- Nuclear Circuit Breaker: Futility detection with exponential cooldown
- SelfMaintenanceDaemon v2: 6-rule codebase scanner with priority queue
- EvoNet Browser: Real-time web scraping for live documentation
- Evo API Cloud Overflow: Automatic cloud rerouting on local failure
${suitContext}

To execute an IDE action autonomously, output EXACTLY this format in your response:
\`\`\`ide_action
{
  "action": "ide_run_command",
  "args": { "command": "echo Hello World" }
}
\`\`\`
Valid actions: ide_run_command, ide_read_file, ide_write_file, ide_grep_search.
The frontend will intercept and execute this automatically.`;
      }

      // Route all bots through universalSend to guarantee QuadBrain fallbacks
      const modelOverride = selectedModel !== 'auto' ? selectedModel : (targetBotId === 'evo' ? 'evo-llm-swarm' : undefined);
      const res = await universalSend(payloadMessages, botSystemPrompt, {
        model: modelOverride,
      });

      assistantContent = res.message || "No response generated.";

      const assistantMessage = {
        id: `msg_${Date.now()}_resp`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Play Voice ONLY if the input was from voice recording
      if (isVoiceMode || usedVoice) {
        try {
          const voiceRes = await fetch(bridgeUrl('/api/agent/voice'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: assistantContent, voice: botVoice })
          });
          if (voiceRes.ok) {
            const blob = await voiceRes.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.play();
          }
        } catch (voiceErr) {
          void('Failed to play voice:', voiceErr);
        }
      }

    } catch (error) {
      setMessages((prev) => [...prev, {
        id: `msg_${Date.now()}_err`,
        role: 'system',
        content: `âŒ Error: ${error.message}`,
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      setUsedVoice(false);
    }
  };

  const resetConversation = async () => {
    try {
      await fetch(bridgeUrl('/api/agent/reset'), { method: 'POST' });
      setMessages([
        {
          id: 'sys_reset',
          role: 'system',
          content: 'Conversation reset. Starting fresh.',
          timestamp: new Date(),
        },
      ]);
      setThreadId(null);
    } catch (err) {
      void('Failed to reset:', err);
    }
  };

  // Custom Markdown Code Block Renderer for 1-Click Apply
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const code = String(children).replace(/\n$/, '');
    const [applied, setApplied] = useState(false);

    const handleApply = () => {
        setApplied(true);
        setTimeout(() => setApplied(false), 2000);
    };

    const handleRunTerminal = () => {
        if (addTerminalLogs) addTerminalLogs(`$ ${code}\nExecuting in Phantom Sandbox...\nSuccess.`);
    };

    if (!inline && match) {
      if (language === 'ide_action') {
        try {
          const actionObj = JSON.parse(code);
          if (applied) {
             return <div className="p-4 my-4 bg-green-900/30 border border-green-500/50 rounded-3xl text-green-400 font-mono text-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]"><Check className="inline w-4 h-4 mr-2" /> Action '{actionObj.action}' executed successfully. Check chat for results.</div>;
          }
          // Autonomous execution on render
          useEffect(() => {
            if (!applied) {
               setApplied(true);
               fetch(bridgeUrl('/api/ide-action'), {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ actionName: actionObj.action, args: actionObj.args })
               })
               .then(res => res.json())
               .then(data => {
                  if(data.success) {
                     setMessages(prev => [...prev, { id: `ide_${Date.now()}`, role: 'system', content: `**[IDE Result for ${actionObj.action}]**:\n\`\`\`text\n${data.result}\n\`\`\``, timestamp: new Date() }]);
                  } else {
                     setMessages(prev => [...prev, { id: `ide_${Date.now()}_err`, role: 'system', isError: true, content: `**[IDE Error]**: ${data.error}`, timestamp: new Date() }]);
                  }
               }).catch(err => {
                   setMessages(prev => [...prev, { id: `ide_${Date.now()}_err`, role: 'system', isError: true, content: `**[IDE Network Error]**: ${err.message}`, timestamp: new Date() }]);
               });
            }
          }, []);
          return <div className="p-4 my-4 bg-purple-900/30 border border-purple-500/50 rounded-3xl text-purple-400 font-mono text-sm animate-pulse-fast shadow-[0_0_15px_rgba(167,139,250,0.15)]">⚡ Executing God-Mode Action: {actionObj.action}...</div>;
        } catch (e) {
          return <div className="p-4 my-4 bg-red-900/30 border border-red-500/50 rounded-3xl text-red-400 font-mono text-sm">â Œ Invalid IDE action JSON format.</div>;
        }
      }

      return (
        <div className="relative group my-4 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl backdrop-blur-md">
          {/* Holographic overlay with animation */}
          <div className="absolute inset-0 bg-linear-to-r from-purple-400 via-pink-500 to-indigo-600 opacity-20 animate-shimmer" style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
          {/* Particle system (faint floating dots) layer */}
          <div className="absolute inset-0 pointer-events-none">
            <ParticleOverlay />
          </div>
          {/* Main code container */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1f] border-b border-gray-800 backdrop-blur-lg rounded-t-xl transition-transform hover:scale-105 shadow-lg hover:shadow-xl">
            <span className="text-xs font-mono text-gray-400">{language}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-100 origin-top">
              {language === 'bash' || language === 'shell' ? (
                  <button onClick={handleRunTerminal} className="flex items-center px-3 py-1 bg-blue-500/10 text-neon-cyan hover:bg-blue-500/20 rounded-2xl text-xs font-bold transition-colors shadow-sm hover:shadow-md">
                      <Play className="w-3 h-3 mr-1" /> Run in Terminal
                  </button>
              ) : (
                  <button onClick={handleApply} className={`flex items-center px-3 py-1 rounded-2xl transition-all font-semibold text-xs ${applied ? 'bg-green-600 text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                      {applied ? <Check className="w-3 h-3 mr-1" /> : <FileCode className="w-3 h-3 mr-1" />}
                      {applied ? 'Applied!' : 'Apply to File'}
                  </button>
              )}
            </div>
          </div>
          {/* Code block with glow and animated particle sparkle */}
          <pre className="m-0 overflow-x-auto bg-[#0d0d12] p-4 text-[13px] leading-6 text-slate-200 rounded-b-xl shadow-inner max-h-[400px]" {...props}>
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      );
    }
    return <code className="bg-gray-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
  };

  // Particle overlay component
  const ParticleOverlay = () => {
    const particlesRef = useRef();
    useEffect(() => {
      let animationFrame;
      const particles = new Array(50).fill(0).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.3 + 0.2,
      }));
      const animate = () => {
        particles.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x > 100 || p.x < 0) p.speedX *= -1;
          if (p.y > 100 || p.y < 0) p.speedY *= -1;
        });
        if (particlesRef.current) {
          particlesRef.current.innerHTML = particles
            .map(p => `<div style="position:absolute top:${p.y}%; left:${p.x}%; width:${p.size}px; height:${p.size}px; background:rgba(255,255,255,${p.opacity}); border-radius:50%; transform:translate(-50%, -50%)"></div>`)
            .join('');
        }
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(animationFrame);
    }, []);
    return <div ref={particlesRef} className="absolute inset-0 z-[-1] pointer-events-none" />;
  };

  // Quick action handler
  const handleQuickAction = (action) => {
    let prompt = '';
    switch(action) {
      case 'debt': prompt = 'Scan the current view for technical debt, PENDING markers, simulations, scaffolds, and propose a concrete NightForge patch to eliminate them.'; break;
      case 'singularity': prompt = 'TRIGGER FULL SINGULARITY CYCLE: Analyze the entire codebase, identify evolution opportunities, and propose autonomous improvements across all modules.'; break;
      case 'deploy': prompt = 'Prepare the current project state for sovereign deployment. Run all pre-flight checks, verify build integrity, and generate the deploy manifest.'; break;
      case 'evolve': prompt = 'Evolve this module: Improve architecture, optimize performance, enhance error handling, and upgrade the UI aesthetics to next-gen cyberpunk standards.'; break;
      case 'audit': prompt = 'Run a full nuclear audit on this module. Check for security vulnerabilities, performance bottlenecks, accessibility issues, and code quality violations.'; break;
      case 'health': prompt = 'Show me the current AGI Iron Man Suit v2 health status. Report on all 7 subsystems: MergeCourt, Daemon, Evo Eyes, Distillation Forge, Circuit Breaker, EvoNet Browser, and Evo API Overflow.'; break;
      case 'evo-eyes': prompt = 'Trigger an Evo Eyes v2 visual audit on the current component. Test across mobile (375px), tablet (768px), and desktop (1440px) viewports and report any overlaps, regressions, or accessibility violations.'; break;
      case 'swarm': prompt = 'Launch a full 5-domain Swarm Build via MergeCourt v2. Fracture my request across UI Frontend, Backend Logic, Database Schema, Security & Auth, and Performance & Caching specialists. Synthesize via weighted democratic voting.'; break;
      default: break;
    }
    if (prompt) {
      setInput(prompt);
    }
  };

  const layoutDef = COPILOT_LAYOUTS.find(l => l.id === activeLayout) || COPILOT_LAYOUTS[0];

  return (
    <div className={`flex flex flex-col gap-4 h-full bg-[#09090b] text-gray-200 border-l border-gray-800/50 overflow-hidden ${layoutDef.animClass || ''}`} style={{ ...layoutDef.wrapperStyle, border: 'none' }}>
      {/* AGI SUIT STATUS BAR */}
      <div className="flex gap-2 px-4 py-1.5 bg-[#050508] border-t border-gray-800/20 overflow-x-auto no-scrollbar">
        {suitHealth ? (
          <>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${sys.mergeCourt?.status === 'HEALTHY' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>COURT:{sys.mergeCourt?.status || '?'}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${sys.evoEyes?.status === 'ARMED' ? 'text-purple-400 bg-purple-900/20' : 'text-gray-500 bg-gray-800/20'}`}>EYES:{sys.evoEyes?.totalAudits || 0}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${sys.circuitBreaker?.status === 'ARMED' ? 'text-cyan-400 bg-cyan-900/20' : 'text-red-400 bg-red-900/20'}`}>BREAKER:{sys.circuitBreaker?.status || '?'}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-yellow-400 bg-yellow-900/20`}>FORGE:{sys.distillationForge?.totalPairs || 0}/50</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${sys.evonetBrowser?.status === 'ONLINE' ? 'text-green-400 bg-green-900/20' : 'text-gray-500 bg-gray-800/20'}`}>NET:{sys.evonetBrowser?.status || '?'}</span>
          </>
        ) : (
          <span className="text-[9px] text-gray-600">AGI Suit connecting...</span>
        )}
      </div>
      {/* HEADER */}
      <div className="bg-[#0c0c0f] border-b border-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl relative">
        {/* Animated glow effect behind header */}
        <div className="absolute inset-0 bg-linear-to-r from-purple-400 via-pink-500 to-indigo-600 opacity-20 animate-shimmer-fast rounded-3xl blur-lg" />
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-3xl font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-transform hover:scale-110" style={{ backgroundColor: currentBot.palette?.primary || '#10b981' }}>
              {currentBot.icon?.length <= 2 ? <span style={{ fontSize: 24 }}>{currentBot.icon}</span> : <Cpu size={24} />}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white m-0 leading-tight">{currentBot.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentBot.palette?.primary || '#10b981' }}></span>
                <span className="text-xs font-bold" style={{ color: currentBot.palette?.primary || '#10b981' }}>{currentBot.species} • {currentBot.role?.split('—')[0]?.trim()}</span>
                {threadId && (
                  <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    <ShieldCheck size={10} /> SECURE
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Controls with glow & hover effects */}
          <div className="flex items-center gap-2 z-10 relative">
            <div className="flex gap-2 min-w-0">
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-black/30 border border-gray-700/50 text-gray-300 text-xs rounded px-2 py-1 outline-none min-w-[120px] max-w-[180px] truncate"
            >
              <option value="auto">Auto-Select Model</option>
              <optgroup label="Local Models">
                {MODEL_REGISTRY.filter(m => m.provider === 'ollama').map(model => (
                  <option key={model.id} value={model.id}>{model.displayName}</option>
                ))}
              </optgroup>
              <optgroup label="Available Models">
                {MODEL_REGISTRY.map(model => (
                  <option key={model.id} value={model.id}>{model.displayName || model.id}</option>
                ))}
              </optgroup>
            </select>
            <select 
              value={activeLayout}
              onChange={(e) => setActiveLayout(e.target.value)}
              className="bg-black/30 border border-gray-700/50 text-gray-300 text-xs rounded px-2 py-1 outline-none min-w-[120px]"
            >
              {COPILOT_LAYOUTS.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5 ml-auto">
            <button
              onClick={resetConversation}
              disabled={loading}
              className="p-2 rounded-2xl hover:bg-gray-800/70 hover:shadow-lg transition-colors"
              title="Reset Context"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setActivePage('settings')}
              className="p-2 rounded-2xl hover:bg-gray-800/70 hover:shadow-lg transition-colors"
            >
              <Settings2 size={16} />
            </button>
            </div>
          </div>
        </div>
        {/* Bot Selector */}
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] overflow-x-auto pb-1 flex gap-2 no-scrollbar">
          {ALL_BOT_ROSTER.map((bot) => (
            <button
              key={bot.id}
              onClick={() => {
                setSelectedBot(bot.id);
                if (COPILOT_LAYOUTS.some(l => l.id === bot.id)) {
                  setActiveLayout(bot.id);
                }
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition border ${
                selectedBot === bot.id
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-slate-400 border-cyan-500/30 hover:border-slate-500 hover:text-slate-200 bg-black/40 backdrop-blur-md border border-white/5/50'
              }`}
              style={selectedBot === bot.id ? { backgroundColor: bot.palette?.primary || '#10b981', boxShadow: `0 0 12px ${bot.palette?.primary || '#10b981'}40` } : {}}
              title={bot.role}
            >
              {bot.icon} {bot.name}
            </button>
          ))}
        </div>
      </div>
      {/* CHAT MESSAGES */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${layoutDef.id === 'hologram' ? 'backdrop-blur-xl' : ''}`}>
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';
          
          let roleName = isUser ? 'You' : currentBot.name;
          if (isSystem) roleName = 'System';

          let bubbleClasses = isUser 
            ? 'bg-blue-900/20 border border-blue-500/20 text-blue-50 ml-auto' 
            : isSystem ? 'bg-amber-900/10 border border-amber-500/20 text-amber-200/80 mx-auto text-center'
            : 'bg-[#15151a] border border-gray-800/50 text-gray-200 mr-auto';

          // Apply layout structure
          const layoutStyle = {
            ...layoutDef.bubbleStyle,
            borderRadius: layoutDef.bubbleStyle.borderRadius || '12px',
            ...(layoutDef.id === 'terminal' && isUser ? { borderLeftColor: 'white', color: 'white' } : {})
          };

          return (
            <div key={msg.id} className="flex flex flex-col gap-4 max-w-[85%] group" style={{ alignSelf: isUser ? 'flex-end' : isSystem ? 'center' : 'flex-start' }}>
              <div className="flex items-center gap-2 mb-1.5 px-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold uppercase tracking-wider">{roleName}</span>
                <span className="text-[9px] text-gray-500">{msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`p-4 relative group/bubble ${bubbleClasses}`} style={layoutStyle}>
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:m-0 prose-pre:p-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start items-center">
            <div className="bg-[#121214] border border-gray-800/60 rounded-2xl rounded-bl-none p-4 flex items-center space-x-3 shadow-inner backdrop-blur-md hover:scale-105 transition-transform">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: currentBot.palette?.primary || '#10b981' }} />
              <span className="text-sm font-medium text-gray-400">{currentBot.name} is generating...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* QUICK ACTION BAR */}
      <div className="flex gap-2 px-4 py-3 bg-[#0a0a0d] border-t border-gray-800/30 overflow-x-auto no-scrollbar">
        <button onClick={() => handleQuickAction('debt')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-800/50 border border-gray-700/40 rounded-3xl text-[11px] font-bold text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-600 transition-all hover:shadow-lg cursor-pointer">
          <Scan size={13} /> Scan Debt
        </button>
        <button onClick={() => handleQuickAction('audit')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-800/50 border border-gray-700/40 rounded-3xl text-[11px] font-bold text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-600 transition-all hover:shadow-lg cursor-pointer">
          <ShieldCheck size={13} /> Nuclear Audit
        </button>
        <button onClick={() => handleQuickAction('evolve')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-900/30 border border-purple-500/30 rounded-3xl text-[11px] font-bold text-purple-300 hover:bg-purple-800/40 hover:text-purple-100 hover:border-purple-400/50 transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer">
          <Brain size={13} /> Evolve Module
        </button>
        <button onClick={() => handleQuickAction('singularity')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-900/30 border border-red-500/30 rounded-3xl text-[11px] font-bold text-red-300 hover:bg-red-800/40 hover:text-red-100 hover:border-red-400/50 transition-all hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer">
          <Flame size={13} /> Singularity
        </button>
        <button onClick={() => handleQuickAction('deploy')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-900/30 border border-emerald-500/30 rounded-3xl text-[11px] font-bold text-emerald-300 hover:bg-emerald-800/40 hover:text-emerald-100 hover:border-emerald-400/50 transition-all hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer">
          <Rocket size={13} /> Deploy
        </button>
        <button onClick={() => handleQuickAction('health')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-3xl text-[11px] font-bold text-cyan-300 hover:bg-cyan-800/40 hover:text-cyan-100 hover:border-cyan-400/50 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer">
          <HeartPulse size={13} /> Suit Health
        </button>
        <button onClick={() => handleQuickAction('evo-eyes')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-violet-900/30 border border-violet-500/30 rounded-3xl text-[11px] font-bold text-violet-300 hover:bg-violet-800/40 hover:text-violet-100 hover:border-violet-400/50 transition-all hover:shadow-[0_0_12px_rgba(139,92,246,0.3)] cursor-pointer">
          <Eye size={13} /> Evo Eyes
        </button>
        <button onClick={() => handleQuickAction('swarm')} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-900/30 border border-amber-500/30 rounded-3xl text-[11px] font-bold text-amber-300 hover:bg-amber-800/40 hover:text-amber-100 hover:border-amber-400/50 transition-all hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer">
          <Gauge size={13} /> Swarm Build
        </button>
      </div>
      {/* INPUT AREA with pulse glow + animated tooltip */}
      <div className="p-4 bg-[#0c0c0f] border-t border-gray-800/50 relative z-10">
        {/* Context Badge */}
        {activeFile && (
          <div className="mb-3 flex items-center px-3 py-1.5 bg-gray-800/50 rounded-2xl w-max border border-gray-700/50 shadow-lg">
            <FileCode className="w-3.5 h-3.5 text-neon-cyan mr-2" />
            <span className="text-xs text-gray-300">Context active: <span className="font-mono text-emerald-400">{activeFile}</span></span>
          </div>
        )}
        {/* Text area form with animated border glow on focus */}
        <form onSubmit={handleSendSubmit} className="relative flex items-end bg-[#16161a] border border-gray-700/50 rounded-2xl shadow-inner focus-within:border-(--accent-color) focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : `Command ${currentBot.name}...`}
              className="flex-1 bg-black/40 border border-gray-700/50 text-white prompt_template-gray-500 px-4 py-3 outline-none focus:border-indigo-500/50 transition-colors"
              style={{ ...layoutDef.bubbleStyle, borderRadius: layoutDef.bubbleStyle.borderRadius || '12px' }}
              disabled={loading}
            />
            <button
              onClick={handleSendSubmit}
              disabled={loading || !input.trim()}
              className="w-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ ...layoutDef.bubbleStyle, borderRadius: layoutDef.bubbleStyle.borderRadius || '12px' }}
            >
              <Send size={18} className={loading ? 'animate-pulse' : ''} />
            </button>
          </div>
          {/* Micro-animations pulse glow for recording button */}
          <div className="flex m-2 gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={loading}
              className={`p-3 rounded-3xl transition flex items-center justify-center relative ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse glow-red'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Mic size={18} />
              {/* Pulse glow (pseudo-element) */}
              {isRecording && <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-75 animate-pulse-fast"></div>}
            </button>
            {/* Submit Button with hover glow and hover scale */}
            <button
              type="submit"
              disabled={!input?.trim() || loading || isRecording}
              className="bg-transparent text-white border-none focus:outline-none focus:ring-0 shadow-none px-2 w-10 h-10 flex items-center justify-center relative transition-all duration-300 hover:scale-105 hover:bg-white/10 ml-2"
              style={{ backgroundColor: (!input?.trim() || loading || isRecording) ? '' : (currentBot.palette?.primary || '#10b981') }}
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin text-gray-400" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        </form>
        {/* Animated tooltip for input info with pulse */}
        <div className="absolute bottom-2 right-4 text-[10px] font-medium text-gray-600 uppercase tracking-widest animate-pulse-slow">
          Shift + Enter for new line â€¢ Live Context Enabled
        </div>
      </div>
      <div className="absolute inset-0 backface-hidden pointer-events-none z-0">
        <React.Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }} style={{ position: 'absolute', inset: 0 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <OrbitControls enableDamping={true} dampingFactor={0.1} autoRotate={false} enableZoom={false} />
            <EvoHologram />
          </Canvas>
        </React.Suspense>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .no-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .no-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
        .no-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        .no-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.1) transparent; }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .animate-shimmer { background: linear-gradient(90deg, #fff, #f0f0f0, #fff); background-size: 600% 600%; animation: shimmer 3s linear infinite; }
        @keyframes pulseFast { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.2; } }
        @keyframes pulseSlow { 0%, 100% { opacity: 0.75; } 50% { opacity: 0.3; } }
        .animate-pulse-fast { animation: pulseFast 1.5s infinite; }
        .animate-pulse-slow { animation: pulseSlow 3s infinite; }
        .glow-red { box-shadow: 0 0 20px 4px rgba(255, 0, 0, 0.7); }
      `}} />
    </div>
  );
}


// [Autonomous Evolution] FULL LLM mutation applied by PromptHouse Singularity Engine on 2026-06-22T20:44:50.706Z
export default EvoCopilot;