import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Activity, Cpu, BrainCircuit, Mic, FileCode, Check, Play, Loader2, Bot, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { useSovereignStore } from '../store.js';
import { universalSend } from '../lib/universal-transport.js';
import { ALL_BOT_ROSTER } from '../engine.js';
import { BRIDGE_URL } from '../config/bridge-config.js';
import AutonomousAgentRoster from '../components/AutonomousAgentRoster.jsx';

function bridgeUrl(path) {
  const configured = import.meta.env.VITE_PROMPTBRIDGE_URL;
  const base = configured || BRIDGE_URL;
  return `${base}${path}`;
}

export default function OmniBotRemote() {
  const [selectedBot, setSelectedBot] = useState('evo');
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: 'OmniBot Link Established. I am connected directly to your primary Studio LLM via Sovereign Uplink. What shall we build or learn today?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);

  const scrollRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const activeFile = useSovereignStore((s) => s.activeFile);
  const fileContent = useSovereignStore((s) => s.fileContent);
  const addTerminalLogs = useSovereignStore((s) => s.addTerminalLogs);
  const addNotification = useSovereignStore((s) => s.addNotification);

  const currentBot = ALL_BOT_ROSTER.find(b => b.id === selectedBot) || ALL_BOT_ROSTER[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let eventSource = null;
    let reconnectTimeout = null;
    let retryCount = 0;
    let mounted = true;

    const connectSSE = async () => {
      try {
        if (!mounted) return;

        eventSource = new EventSource(`${bridgeUrl('/api/remote-stream')}`);
        
        eventSource.onopen = () => {
          retryCount = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, { 
              id: Date.now(), 
              role: 'system', 
              text: `[STUDIO PUSH NOTIFICATION]\n${data.message}` 
            }]);
          } catch (err) {
            void('Failed to parse push notification:', err);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          if (!mounted) return;
          const delay = Math.min(2000 * Math.pow(2, retryCount), 30000);
          retryCount++;
          void(`[OmniBot] SSE disconnected. Reconnecting in ${delay}ms...`);
          reconnectTimeout = setTimeout(connectSSE, delay);
        };
      } catch (err) {
         void('Failed to initialize SSE:', err);
      }
    };

    connectSSE();

    return () => {
      mounted = false;
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

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
        setSending(true);
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
            await handleSend(null, data.text, true);
          }
        } catch (err) {
          void("Transcription error", err);
          setSending(false);
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      void("Microphone access denied:", err);
      addNotification({ msg: "Microphone access required to speak to the bots.", type: 'error' });
    }
  };

  const handleSend = async (e, textOverride = null, isVoiceMode = false) => {
    if (e) e.preventDefault();
    const userMsg = (textOverride || input).trim();
    if (!userMsg || sending) return;

    setInput('');
    setUsedVoice(isVoiceMode);
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
    setSending(true);

    let fullPrompt = userMsg;
    if (activeFile && fileContent) {
        fullPrompt = `[CONTEXT: Viewing file ${activeFile}]\n\`\`\`javascript\n${fileContent}\n\`\`\`\n\nUser Request: ${userMsg}`;
    }

    try {
      let targetBotId = selectedBot;
      const match = userMsg.match(/@(\w+)/);
      if (match) {
          const mentionedId = match[1].toLowerCase();
          if (ALL_BOT_ROSTER.some(b => b.id === mentionedId)) {
              targetBotId = mentionedId;
              setSelectedBot(mentionedId);
          }
      }
      const activeBot = ALL_BOT_ROSTER.find(b => b.id === targetBotId) || ALL_BOT_ROSTER[0];

      const payloadMessages = messages.map(m => ({ role: m.role, content: m.text }));
      payloadMessages.push({ role: 'user', content: fullPrompt });

      const botSystemPrompt = `You are ${activeBot.name}, a ${activeBot.species}. Role: ${activeBot.role}. Signature: ${activeBot.signature}.\nOutput clean markdown. Use \`\`\`language blocks for code.`;

      const result = await universalSend(payloadMessages, botSystemPrompt, {
        model: targetBotId === 'evo' ? 'evo-llm-swarm' : 'gpt-4.1-mini',
        provider: 'evo'
      });

      const responseText = result.message || 'No response from brain.';
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'system', 
        text: responseText,
        bot: activeBot,
        pluginIntercept: result.pluginIntercept,
        handledBy: result.handledBy
      }]);

      if (isVoiceMode || usedVoice) {
        try {
          const voiceRes = await fetch(bridgeUrl('/api/agent/voice'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: responseText, voice: activeBot.voice || 'onyx' })
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

      setSending(false);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: `[Uplink Error] Connection degraded. Cannot reach Studio. ${err.message}` }]);
      setSending(false);
    }
  };

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
      return (
        <div className="relative group my-4 rounded-3xl overflow-hidden border-gray-800 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1f] border-b border-gray-800">
            <span className="text-xs font-mono text-gray-400">{language}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {language === 'bash' || language === 'shell' ? (
                  <button onClick={handleRunTerminal} className="flex items-center px-3 py-1 bg-blue-500/10 text-neon-cyan hover:bg-blue-500/20 rounded text-xs font-bold transition-colors">
                      <Play className="w-3 h-3 mr-1" /> Run in Terminal
                  </button>
              ) : (
                  <button onClick={handleApply} className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-bold transition-colors">
                      {applied ? <Check className="w-3 h-3 mr-1" /> : <FileCode className="w-3 h-3 mr-1" />}
                      {applied ? 'Applied!' : 'Apply to File'}
                  </button>
              )}
            </div>
          </div>
          <pre className="m-0 overflow-x-auto bg-[#0d0d12] p-4 text-[13px] leading-6 text-slate-200" {...props}>
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      );
    }
    return <code className="bg-gray-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
  };

  return (
    <IDEPageLayout
      title="OmniBot Remote"
      description="Active Tether — Studio Brain uplink interface."
      icon={BrainCircuit}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0c0c0f] rounded-2xl border-[rgba(255,255,255,0.05)] p-1 overflow-hidden shrink-0">
            <select 
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
              className="bg-transparent text-white text-xs px-2 py-1 outline-none cursor-pointer font-medium appearance-none"
              style={{ color: currentBot.palette?.primary || '#fff' }}
            >
              {ALL_BOT_ROSTER.map(b => (
                <option key={b.id} value={b.id} className="bg-gray-900 text-white">
                  {b.icon} {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-slate-500 glass-extreme px-2 py-1.5 rounded border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <Cpu size={14} />
            <span className="text-xs font-bold">Studio Brain</span>
          </div>
        </div>
      }
    >
    <div className="app-wrapper flex-col gap-4 h-[calc(100vh-200px)] w-full bg-[#050505] text-white font-sans overflow-hidden rounded-3xl border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]" style={{ '--accent-color': currentBot.palette?.primary || '#10b981' }}>
      
      <main className="flex-col h-full relative" style={{ flex: 1, overflow: 'hidden' }}>
        <AutonomousAgentRoster />
        
        {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-linear-to-b from-transparent to-[rgba(16,185,129,0.02)] pb-24"
      >
        {messages.map(m => {
          const botPalette = m.bot?.palette?.primary || currentBot.palette?.primary || '#10b981';
          return (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`card max-w-[85%] rounded-2xl p-5 text-sm shadow-xl ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm border-indigo-500/50' 
                  : 'bg-[#111116] text-slate-200 rounded-tl-sm border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]/80'
              }`}>
                {m.role === 'system' && (
                  <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]/50 pb-2" style={{ color: botPalette }}>
                    {m.pluginIntercept && (
                      <div className="flex items-center gap-1.5 mr-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-black tracking-wider rounded border-indigo-500/30">
                        <Zap size={10} className="text-neon-cyan" />
                        Plugin Handled: {m.handledBy}
                      </div>
                    )}
                    {m.bot ? (
                        <span className="text-lg">{m.bot.icon}</span>
                    ) : (
                        <Zap size={14} className="opacity-70" />
                    )}
                    <div className="flex-col gap-4 ml-1">
                      <span className="text-[10px] font-black uppercase tracking-widest">{m.bot?.name || 'Evo System'}</span>
                      {m.bot?.generatingTheme && (
                        <span className="text-[8px] uppercase tracking-widest text-neon-cyan font-bold opacity-80">
                          {m.bot.generatingTheme} • {m.bot.generatingPlan}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {m.role === 'system' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-p:leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap">{m.text}</div>
                )}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl p-4 text-sm bg-[#111116] text-slate-400 rounded-tl-sm border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex items-center gap-3">
              <Loader2 size={16} className="animate-spin" style={{ color: currentBot.palette?.primary || '#10b981' }} />
              <span className="text-xs font-mono tracking-wide">Transmitting to {currentBot.name}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-[#050505] via-[#050505] to-transparent pt-8">
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-[#111116] p-2 rounded-full border-cyan-500/30 shadow-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all max-w-4xl mx-auto"
        >
          <button 
            type="button" 
            onClick={toggleRecording}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-black/40 backdrop-blur-md border-white/5/50 text-slate-400 hover:text-white hover:bg-black/40 backdrop-blur-md border-white/5'}`}
          >
            <Mic size={18} />
          </button>
          
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Teach the Studio Brain..."}
            disabled={isRecording || sending}
            className="flex-1 bg-transparent text-sm px-4 text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
          />
          
          <button 
            type="submit"
            disabled={(!input?.trim() && !isRecording) || sending}
            className="btn btn-primary w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-50"
            style={{ backgroundColor: currentBot.palette?.primary || '#4f46e5' }}
          >
            <Send size={16} className="text-[#050505] ml-0.5" />
          </button>
        </form>
      </div>
      
      </main>
    </div>
    </IDEPageLayout>
  );
}
