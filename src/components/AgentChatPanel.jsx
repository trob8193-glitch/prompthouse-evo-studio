/**
 * AgentChatPanel Component
 * Real-time chat interface with OpenAI Evo Agent
 * 
 * Phase 1: Agent Integration
 * Features:
 * - Send messages to agent
 * - Stream responses with code interpreter
 * - View conversation history
 * - Reset conversation
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bot, RefreshCw, Send, AlertCircle, ShieldCheck } from 'lucide-react';

function bridgeUrl(path) {
  const configured = import.meta.env.VITE_PROMPTBRIDGE_URL;
  const base = configured || 'http://127.0.0.1:3001';
  return `${base}${path}`;
}

export function AgentChatPanel() {
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
  const messagesEndRef = useRef(null);

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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
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
      };

      setMessages((prev) => [...prev, assistantMessage]);

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
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl rounded-xl border border-[rgba(168,85,247,0.25)] shadow-[0_18px_60px_rgba(0,0,0,0.28)] overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-[rgba(255,255,255,0.05)] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot size={24} className="text-[var(--accent-color,#a855f7)]" />
            <div>
              <h2 className="text-lg font-black tracking-tight text-white m-0 leading-tight">Evo Agent</h2>
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg border backdrop-blur-sm ${
                msg.role === 'user'
                  ? 'bg-purple-900/40 border-purple-500/30 text-purple-50 rounded-br-none'
                  : msg.isError
                    ? 'bg-red-900/40 border-red-500/30 text-red-100 rounded-bl-none flex flex-col gap-2'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-200 rounded-bl-none'
              }`}
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
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-[rgba(255,255,255,0.05)] p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your architecture..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#020617] border border-slate-800 text-slate-200 rounded-xl focus:outline-none focus:border-[var(--accent-color,#a855f7)] disabled:opacity-50 text-sm shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-[var(--accent-color,#a855f7)] hover:opacity-90 text-white rounded-xl font-black tracking-widest text-xs uppercase transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            <span className="hidden sm:inline">{loading ? '...' : 'Send'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgentChatPanel;
