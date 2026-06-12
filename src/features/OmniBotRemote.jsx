import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Activity, Cpu, BrainCircuit } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

export default function OmniBotRemote() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: 'OmniBot Link Established. I am connected directly to your primary Studio LLM via Sovereign Uplink. What shall we build or learn today?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Connect to the Studio's Push Notification Tunnel
    import('../config/bridge-config.js').then(({ BRIDGE_URL }) => {
      const eventSource = new EventSource(`${BRIDGE_URL}/api/remote-stream`);
      
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

      return () => {
        eventSource.close();
      };
    });
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
    setSending(true);

    try {
      // Chat dynamically with the Studio QuadBrain
      const result = await safeFetchBridge('/api/agent/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMsg,
          botId: 'evo' // Target the primary Evo bot persona
        })
      });

      if (result.ok) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'system', 
          text: result.data?.response || result.data?.message || 'No response from brain.'
        }]);
        setSending(false);
      } else {
        throw new Error(result.error || 'Uplink failed');
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: `[Uplink Error] Connection degraded. Cannot reach Studio. ${err.message}` }]);
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#050505] text-white font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a0a0c] z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BrainCircuit className="text-indigo-500" size={24} />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black" />
          </div>
          <div>
            <h1 className="text-sm font-black italic tracking-wider text-white">OMNIBOT REMOTE</h1>
            <p className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 uppercase">
              <Activity size={10} /> Active Tether
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
          <Cpu size={12} />
          <span className="text-[10px] font-bold">Studio Brain</span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-indigo-900/5 pb-24"
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm border border-indigo-500/50' 
                : 'bg-[#111116] text-slate-200 rounded-tl-sm border border-slate-800'
            }`}>
              {msg.role === 'system' && (
                <div className="flex items-center gap-1.5 mb-2 text-indigo-400 border-b border-slate-800/50 pb-2">
                  <Zap size={12} className="fill-indigo-500/20" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Evo System</span>
                </div>
              )}
              <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl p-4 text-sm bg-[#111116] text-slate-400 rounded-tl-sm border border-slate-800 flex items-center gap-2">
              <Activity size={14} className="animate-pulse text-indigo-500" />
              <span className="text-xs font-mono">Transmitting to TriBrain...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-8">
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-[#111116] p-1.5 rounded-full border border-slate-700 shadow-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
        >
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Teach the Studio Brain..."
            className="flex-1 bg-transparent text-sm px-4 text-white outline-none placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={16} className="text-white ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
