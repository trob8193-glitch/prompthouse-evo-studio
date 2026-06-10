import React, { useState, useRef, useEffect } from 'react';
import { Bot, RefreshCw, Send, AlertCircle, ShieldCheck, Mic } from 'lucide-react';
import { ALL_BOT_ROSTER } from '../engine.js';

function bridgeUrl(path) {
  const configured = import.meta.env.VITE_PROMPTBRIDGE_URL;
  const base = configured || 'http://127.0.0.1:3001';
  return `${base}${path}`;
}

export function AgentChatPanel() {
  const [selectedBot, setSelectedBot] = useState('evo');
  const [messages, setMessages] = useState([
    {
      id: 'sys_1',
      role: 'system',
      content: 'EvoAgent ready. Ask me anything about your project.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const currentBot = ALL_BOT_ROSTER.find(b => b.id === selectedBot) || ALL_BOT_ROSTER[0];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize thread on mount
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
      console.error('Failed to initialize thread:', err);
    }
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    submitMessage(input);
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
            setInput(''); // Clear input box
            await submitMessage(data.text);
          }
        } catch (err) {
          console.error("Transcription error", err);
        } finally {
          setLoading(false);
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

  const submitMessage = async (messageText) => {
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

    try {
      const response = await fetch(bridgeUrl('/api/agent/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          threadId,
          botId: selectedBot
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        id: `msg_${Date.now()}_resp`,
        role: 'assistant',
        content: data.response || data.message || 'No response',
        timestamp: new Date(),
        metadata: data.metadata,
        botInfo: data.bot // Store the bot info to display unique icon/color
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Play Bot Voice
      try {
        const voiceRes = await fetch(bridgeUrl('/api/agent/voice'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: assistantMessage.content,
            voice: data.bot?.voice || currentBot.voice || 'onyx'
          })
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

      if (data.threadId) {
        setThreadId(data.threadId);
      }
    } catch (error) {
      const errorMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'system',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
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

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl rounded-xl border border-[rgba(168,85,247,0.25)] shadow-[0_18px_60px_rgba(0,0,0,0.28)] overflow-hidden" style={{ '--accent-color': currentBot.palette.primary }}>
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-[rgba(255,255,255,0.05)] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white shadow-lg" style={{ backgroundColor: currentBot.palette.primary }}>
              {currentBot.icon.length <= 2 ? currentBot.icon : <Bot size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white m-0 leading-tight">{currentBot.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-slate-400">
                  {threadId ? `Thread: ${threadId.substring(0, 8)}` : 'Initializing...'}
                </span>
                {threadId && (
                  <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    <ShieldCheck size={10} /> SECURE
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={resetConversation}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-black tracking-widest uppercase bg-[rgba(88,28,135,0.28)] border border-[rgba(216,180,254,0.35)] text-purple-200 hover:bg-[rgba(88,28,135,0.5)] rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Reset
          </button>
        </div>

        {/* Bot Selector */}
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] overflow-x-auto pb-2 flex gap-2 no-scrollbar">
          {ALL_BOT_ROSTER.map(bot => (
            <button
              key={bot.id}
              onClick={() => setSelectedBot(bot.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black tracking-wider transition border ${
                selectedBot === bot.id
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200 bg-slate-800/50'
              }`}
              style={selectedBot === bot.id ? { backgroundColor: bot.palette.primary } : {}}
              title={bot.role}
            >
              {bot.icon} {bot.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          const botColor = msg.botInfo?.palette?.primary || currentBot.palette.primary;
          const msgIcon = msg.botInfo?.icon || currentBot.icon;

          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {isAssistant && !msg.isError && (
                <div className="flex-shrink-0 w-8 h-8 mr-3 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md" style={{ backgroundColor: botColor }}>
                  {msgIcon.length <= 2 ? msgIcon : <Bot size={14} />}
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg border backdrop-blur-sm ${
                  msg.role === 'user'
                    ? 'bg-purple-900/40 border-purple-500/30 text-purple-50 rounded-br-none'
                    : msg.isError
                      ? 'bg-red-900/40 border-red-500/30 text-red-100 rounded-bl-none flex flex-col gap-2'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-200 rounded-bl-none'
                }`}
                style={isAssistant && !msg.isError ? { borderColor: `${botColor}40` } : {}}
              >
                {msg.isError && <AlertCircle size={16} className="text-red-400" />}
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                {msg.metadata && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-[10px] font-mono opacity-60">
                      {JSON.stringify(msg.metadata, null, 2)}
                    </p>
                  </div>
                )}
                <p className="text-[10px] mt-2 font-mono opacity-40 uppercase tracking-wider">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start items-center">
            <div className="flex-shrink-0 w-8 h-8 mr-3 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md" style={{ backgroundColor: currentBot.palette.primary }}>
              {currentBot.icon.length <= 2 ? currentBot.icon : <Bot size={14} />}
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: currentBot.palette.primary }} />
                <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: currentBot.palette.primary }} />
                <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: currentBot.palette.primary }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendSubmit} className="border-t border-[rgba(255,255,255,0.05)] p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${currentBot.name} about your architecture...`}
            disabled={loading || isRecording}
            className="flex-1 px-4 py-3 bg-[#020617] border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-[var(--accent-color)] disabled:opacity-50 text-sm shadow-inner transition-colors"
          />
          <button
            type="button"
            onClick={toggleRecording}
            disabled={loading}
            className={`px-4 py-3 rounded-xl transition flex items-center justify-center shadow-lg ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Mic size={16} />
          </button>
          <button
            type="submit"
            disabled={loading || !input.trim() || isRecording}
            className="px-5 py-3 hover:opacity-90 text-white rounded-xl font-black tracking-widest text-xs uppercase transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
            style={{ backgroundColor: currentBot.palette.primary }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            <span className="hidden sm:inline">{loading ? '...' : 'Send'}</span>
          </button>
        </div>
      </form>

      {/* Global CSS for no-scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

export default AgentChatPanel;
