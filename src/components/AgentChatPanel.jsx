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
      setThreadId(null);
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">🤖 Evo Agent</h2>
            <p className="text-sm text-slate-400">
              {threadId ? `Thread: ${threadId.substring(0, 8)}...` : 'Initializing...'}
            </p>
          </div>
          <button
            onClick={resetConversation}
            className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.isError
                    ? 'bg-red-900 text-red-100 rounded-bl-none'
                    : 'bg-slate-700 text-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              {msg.metadata && (
                <div className="mt-2 pt-2 border-t border-opacity-30 border-white">
                  <p className="text-xs opacity-75">
                    {JSON.stringify(msg.metadata, null, 2)}
                  </p>
                </div>
              )}
              <p className="text-xs mt-1 opacity-60">
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
      <form onSubmit={sendMessage} className="border-t border-slate-700 p-4 bg-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about your project..."
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgentChatPanel;
