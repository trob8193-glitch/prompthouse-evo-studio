import React, { useState, useEffect, useRef } from 'react';
import { Bot, RefreshCw, Send, AlertCircle, ShieldCheck, Mic, Cpu, FileCode, Check, Play, Settings2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSovereignStore } from '../store.js';
import { universalSend } from '../lib/universal-transport.js';
import { ALL_BOT_ROSTER } from '../engine.js';
import { BRIDGE_URL } from '../config/bridge-config.js';

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

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Zustand Store integrations for IDE context
  const activeFile = useSovereignStore((s) => s.activeFile);
  const fileContent = useSovereignStore((s) => s.fileContent);
  const addTerminalLogs = useSovereignStore((s) => s.addTerminalLogs);
  const setActivePage = useSovereignStore((s) => s.setActivePage);

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
      console.warn('Failed to initialize thread:', err);
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
          console.error("Transcription error", err);
          setLoading(false);
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

      const botSystemPrompt = `You are ${currentBot.name}, a ${currentBot.species}. Role: ${currentBot.role}. Signature: ${currentBot.signature}.\nOutput clean markdown. Use \`\`\`language blocks for code.`;

      // Route all bots through universalSend to guarantee QuadBrain fallbacks
      const res = await universalSend(payloadMessages, botSystemPrompt, {
        model: targetBotId === 'evo' ? 'evo-llm-swarm' : 'gpt-4.1-mini',
        provider: 'evo'
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
          console.error('Failed to play voice:', voiceErr);
        }
      }

    } catch (error) {
      setMessages((prev) => [...prev, {
        id: `msg_${Date.now()}_err`,
        role: 'system',
        content: `❌ Error: ${error.message}`,
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
      console.error('Failed to reset:', err);
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
    <div className="flex flex-col h-full bg-[#09090b] text-gray-200 border-l border-gray-800/50" style={{ '--accent-color': currentBot.palette?.primary || '#10b981' }}>
      
      {/* HEADER */}
      <div className="bg-[#0c0c0f] border-b border-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]" style={{ backgroundColor: currentBot.palette?.primary || '#10b981' }}>
              {currentBot.icon?.length <= 2 ? currentBot.icon : <Cpu size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white m-0 leading-tight">Evo Copilot</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentBot.palette?.primary || '#10b981' }}></span>
                <span className="text-xs font-bold" style={{ color: currentBot.palette?.primary || '#10b981' }}>
                  {currentBot.name}
                </span>
                {threadId && (
                  <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    <ShieldCheck size={10} /> SECURE
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetConversation}
              disabled={loading}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              title="Reset Context"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setActivePage('settings')}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </div>

        {/* Bot Selector */}
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] overflow-x-auto pb-1 flex gap-2 no-scrollbar">
          {ALL_BOT_ROSTER.map(bot => (
            <button
              key={bot.id}
              onClick={() => setSelectedBot(bot.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition border ${
                selectedBot === bot.id
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200 bg-slate-800/50'
              }`}
              style={selectedBot === bot.id ? { backgroundColor: bot.palette?.primary || '#10b981' } : {}}
              title={bot.role}
            >
              {bot.icon} {bot.name}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          const botColor = currentBot.palette?.primary || '#10b981';

          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-[#1e1e24] border border-gray-700 text-white rounded-br-none' 
                  : msg.isError
                    ? 'bg-red-900/40 border border-red-500/30 text-red-100 rounded-bl-none'
                    : 'bg-[#121214] border border-gray-800/60 rounded-bl-none'
              }`}>
                {isAssistant && msg?.isError && (
                  <div className="flex items-center mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: botColor }}>
                    <Cpu className="w-3 h-3 mr-1.5" />
                    {currentBot.name}
                  </div>
                )}
                {msg.isError && <div className="flex items-center mb-2 text-red-400 font-bold"><AlertCircle size={14} className="mr-1"/> Error</div>}
                
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
          <div className="flex justify-start">
            <div className="bg-[#121214] border border-gray-800/60 rounded-2xl rounded-bl-none p-4 flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: currentBot.palette?.primary || '#10b981' }} />
              <span className="text-sm font-medium text-gray-400">
                {currentBot.name} is generating...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-[#0c0c0f] border-t border-gray-800/50">
        {/* Context Badge */}
        {activeFile && (
          <div className="mb-3 flex items-center px-3 py-1.5 bg-gray-800/50 rounded-lg w-max border border-gray-700/50">
            <FileCode className="w-3.5 h-3.5 text-blue-400 mr-2" />
            <span className="text-xs text-gray-300">Context active: <span className="font-mono text-emerald-400">{activeFile}</span></span>
          </div>
        )}

        <form onSubmit={handleSendSubmit} className="relative flex items-end bg-[#16161a] border border-gray-700/50 rounded-2xl shadow-inner focus-within:border-(--accent-color) focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${currentBot.name} or @mention a daemon...`}
            disabled={loading || isRecording}
            className="w-full max-h-48 min-h-[56px] bg-transparent text-gray-200 resize-none px-4 py-4 focus:outline-none disabled:opacity-50"
            rows={1}
          />
          
          <div className="flex m-2 gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={loading}
              className={`p-3 rounded-xl transition flex items-center justify-center ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Mic size={18} />
            </button>
            
            <button
              type="submit"
              disabled={!input?.trim() || loading || isRecording}
              className="bg-transparent text-white border-none focus:outline-none focus:ring-0 shadow-none px-2! rounded-none w-10! h-10! flex items-center justify-center transition-all duration-300 hover:bg-white/10 ml-2"
              style={{ backgroundColor: (!input?.trim() || loading || isRecording) ? '' : (currentBot.palette?.primary || '#10b981') }}
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin text-gray-400" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
            <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">Shift + Enter for new line • Live Context Enabled</span>
        </div>
      </div>

      {/* Global CSS for no-scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export default EvoCopilot;
