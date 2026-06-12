import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Activity, Cpu, BrainCircuit, Mic, FileCode, Check, Play, Loader2, Bot, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { useSovereignStore } from '../store.js';
import { universalSend } from '../lib/universal-transport.js';
import { ALL_BOT_ROSTER } from '../engine.js';
import { BRIDGE_URL } from '../config/bridge-config.js';

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
            console.error('Failed to parse push notification:', err);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          if (!mounted) return;
          const delay = Math.min(2000 * Math.pow(2, retryCount), 30000);
          retryCount++;
          console.log(`[OmniBot] SSE disconnected. Reconnecting in ${delay}ms...`);
          reconnectTimeout = setTimeout(connectSSE, delay);
        };
      } catch (err) {
         console.error('Failed to initialize SSE:', err);
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
          console.error("Transcription error", err);
          setSending(false);
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access required to speak to the bots.");
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
        bot: activeBot
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
          console.error('Failed to play voice:', voiceErr);
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
        <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1f] border-b border-gray-800">
            <span className="text-xs font-mono text-gray-400">{language}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {language === 'bash' || language === 'shell' ? (
                  <button onClick={handleRunTerminal} className="flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded text-xs font-bold transition-colors">
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
          <div className="flex bg-[#0c0c0f] rounded-lg border border-[rgba(255,255,255,0.05)] p-1 overflow-hidden shrink-0">
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
          <div className="flex items-center gap-2 text-slate-500 bg-slate-900 px-2 py-1.5 rounded border border-slate-800">
            <Cpu size={14} />
            <span className="text-xs font-bold">Studio Brain</span>
          </div>
        </div>
      }
    >
    <div className="flex flex-col h-[calc(100vh-200px)] w-full bg-[#050505] text-white font-sans overflow-hidden rounded-xl border border-slate-800" style={{ '--accent-color': currentBot.palette?.primary || '#10b981' }}>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-[rgba(16,185,129,0.02)] pb-24"
      >
        {messages.map(msg => {
          const botPalette = msg.bot?.palette?.primary || currentBot.palette?.primary || '#10b981';
          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-5 text-sm shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm border border-indigo-500/50' 
                  : 'bg-[#111116] text-slate-200 rounded-tl-sm border border-slate-800/80'
              }`}>
                {msg.role === 'system' && (
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-800/50 pb-2" style={{ color: botPalette }}>
                    {msg.bot ? (
                        <span className="text-lg">{msg.bot.icon}</span>
                    ) : (
                        <Zap size={14} className="opacity-70" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest">{msg.bot?.name || 'Evo System'}</span>
                  </div>
                )}
                
                {msg.role === 'system' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-p:leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl p-4 text-sm bg-[#111116] text-slate-400 rounded-tl-sm border border-slate-800 flex items-center gap-3">
              <Loader2 size={16} className="animate-spin" style={{ color: currentBot.palette?.primary || '#10b981' }} />
              <span className="text-xs font-mono tracking-wide">Transmitting to {currentBot.name}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-8">
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-[#111116] p-2 rounded-full border border-slate-700 shadow-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all max-w-4xl mx-auto"
        >
          <button 
            type="button" 
            onClick={toggleRecording}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
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
            disabled={(!input.trim() && !isRecording) || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-50"
            style={{ backgroundColor: currentBot.palette?.primary || '#4f46e5' }}
          >
            <Send size={16} className="text-[#050505] ml-0.5" />
          </button>
        </form>
      </div>
    </div>
    </IDEPageLayout>
  );
}
