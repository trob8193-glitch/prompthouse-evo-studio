import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Shield, Zap, Activity } from 'lucide-react';
import { Log } from '../core/autonomy/SovereignLogger.js';
import { Engine } from '../engine.js';

/**
 * PH EVO STUDIO — SOVEREIGN CHAT (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * The master command interface for the studio. Features 
 * real-time mission orchestration, slash-command routing, 
 * and sentient agent resonance tracking.
 */

export default function SovereignChat() {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'SYSTEM', text: 'Sovereign Command Deck Online. Standing by for production mission.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const engine = new Engine();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'USER', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    Log.info(`💬 [SovereignChat] Dispatching mission: ${input}`);
    
    try {
      const response = await engine.execute({ id: userMsg.id, prompt: input });
      const botMsg = { 
        id: (Date.now() + 1).toString(), 
        sender: 'SOVEREIGN', 
        text: typeof response === 'string' ? response : 'Mission fulfilled. Check the Truth Ledger for artifacts.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      Log.error('💬 [SovereignChat] Mission failed', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-indigo-500/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-indigo-400" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Sovereign Command</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-bold text-slate-500 uppercase">Live Loop</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[8px] font-black uppercase tracking-tighter ${msg.sender === 'USER' ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {msg.sender}
                </span>
                <span className="text-[8px] text-slate-600">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.sender === 'USER' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-black/60">
        <div className="relative flex items-center">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Initialize production mission..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
