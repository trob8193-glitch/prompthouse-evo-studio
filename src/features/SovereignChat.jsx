import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Terminal, Loader2 } from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — AI CHAT (ENTERPRISE GRADE)
 * Real-time chat via OpenAI through PromptBridge backend.
 */

export default function SovereignChat() {
  const messages = useSovereignStore((s) => s.chatMessages);
  const loading = useSovereignStore((s) => s.chatLoading);
  const sendMessage = useSovereignStore((s) => s.sendChatMessage);
  const clearChat = useSovereignStore((s) => s.clearChat);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const bubbleStyle = (role) => {
    if (role === 'user') return { background: '#4f46e5', color: '#fff', borderBottomRightRadius: 4 };
    if (role === 'system') return { background: '#111827', border: '1px solid #1e293b', color: '#64748b', borderBottomLeftRadius: 4, fontStyle: 'italic' };
    return { background: '#111827', border: '1px solid #1e293b', color: '#cbd5e1', borderBottomLeftRadius: 4 };
  };

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 900, margin: '0 auto', background: '#0c1222', borderRadius: 16, border: '1px solid #1e293b', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99,102,241,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Terminal size={16} color="#818cf8" />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sovereign Chat</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: bridgeStatus === 'connected' ? '#22c55e14' : '#ef444414', color: bridgeStatus === 'connected' ? '#22c55e' : '#ef4444', textTransform: 'uppercase' }}>
            {bridgeStatus === 'connected' ? 'API Connected' : 'API Offline'}
          </span>
        </div>
        <button onClick={clearChat} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #1e293b', color: '#64748b', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
          <Trash2 size={12} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: msg.role === 'user' ? '#818cf8' : '#64748b' }}>
                {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'PH Evo AI'}
              </span>
              {msg.truthState && <span style={{ fontSize: 8, fontWeight: 800, color: msg.truthState === 'VERIFIED' ? '#22c55e' : '#f59e0b', background: msg.truthState === 'VERIFIED' ? '#22c55e14' : '#f59e0b14', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{msg.truthState}</span>}
              <span style={{ fontSize: 9, color: '#334155' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 14, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...bubbleStyle(msg.role) }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <Loader2 size={14} color="#6366f1" className="animate-spin" />
            <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>PH Evo is thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: 16, borderTop: '1px solid #1e293b', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={bridgeStatus === 'connected' ? 'Ask anything or start a mission...' : 'Start bridge server first (npm run bridge)...'}
            rows={1} style={{ flex: 1, resize: 'none', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 16px', color: '#e2e8f0', fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', lineHeight: 1.5, minHeight: 44, maxHeight: 120, overflow: 'auto' }}
            onFocus={(e) => e.target.style.borderColor = '#4f46e580'} onBlur={(e) => e.target.style.borderColor = '#1e293b'}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            style={{ width: 44, height: 44, borderRadius: 10, border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', background: loading || !input.trim() ? '#1e293b' : '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
