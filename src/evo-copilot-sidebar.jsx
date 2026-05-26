import React, { useState, useRef, useEffect } from 'react';
import { BOT_EMOJI, BOT_AVATARS } from './bot-orb.jsx';

const COPILOT_ROSTER = [
  { id: 'evo', name: 'Evo (Mission Commander)', icon: BOT_EMOJI.evo || '🦁', avatar: BOT_AVATARS.evo },
  { id: 'dev', name: 'Dev (Code Architect)', icon: BOT_EMOJI.dev || '🐆', avatar: BOT_AVATARS.dev },
  { id: 'builder', name: 'Builder (UI Forge)', icon: BOT_EMOJI.builder || '🐻', avatar: BOT_AVATARS.builder },
  { id: 'conductor', name: 'Conductor (Router)', icon: BOT_EMOJI.conductor || '🦅', avatar: BOT_AVATARS.conductor },
  { id: 'verifier', name: 'Verifier (Proof QA)', icon: BOT_EMOJI.verifier || '🦉', avatar: BOT_AVATARS.verifier },
  { id: 'sovereignty', name: 'Sovereignty (God Mode)', icon: BOT_EMOJI.sovereignty || '🐯', avatar: BOT_AVATARS.sovereignty },
];

export function EvoCopilotSidebar({ currentView }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBot, setActiveBot] = useState(() => COPILOT_ROSTER[0] || { id: 'evo', name: 'Evo', avatar: '' });
  const [history, setHistory] = useState([
    { role: 'assistant', text: `I am ${COPILOT_ROSTER[0]?.name || 'Evo'}. I am monitoring your workflow. How can I assist your execution today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  async function handleSend() {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:3001/api/evo-lm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `Current view: "${currentView}".\n\nUser: ${input}` }
          ],
          systemPrompt: `You are ${activeBot.name} of PromptHouse Evo Studio. You operate in real mode only: no simulations, no unverified outputs. If the bridge lacks a capability, say so and propose the next concrete step.`
        })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errText = data?.error || data?.message || `Bridge request failed (${response.status})`;
        setHistory(prev => [...prev, { role: 'assistant', text: `Bridge error: ${errText}` }]);
        return;
      }

      setHistory(prev => [...prev, { role: 'assistant', text: data?.message || 'No response received.' }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', text: `Error connecting to bridge: ${err.message || err}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuickAction(action) {
    let prompt = "";
    if (action === 'debt') prompt = "Scan current view for technical debt and propose a NightForge patch.";
    if (action === 'tool') prompt = "Analyze my recent clicks and build a reusable Chrome Extension tool for this.";
    if (action === 'test') prompt = "Run Swarm Fission tests on this module and output the Proof-to-Value receipt.";
    
    setInput(prompt);
  }

  return (
    <div className={`bot-edge-tab-container ${isOpen ? 'expanded' : 'collapsed'}`} style={{ zIndex: 9999 }}>
      {/* Edge Toggle Handle */}
      <div 
        className="bot-edge-handle" 
        style={{ borderColor: 'rgba(250, 204, 21, 0.4)', background: 'rgba(250, 204, 21, 0.1)', overflow: 'hidden' }}
        onClick={() => setIsOpen(!isOpen)}
        title={`${activeBot.name} — Click to expand`}
      >
        {activeBot.avatar ? (
          <img src={activeBot.avatar} alt="Avatar" style={{ width: '140%', height: '140%', objectFit: 'contain', mixBlendMode: 'screen', transform: 'translateY(10%)' }} />
        ) : (
          <span className="bot-edge-emoji">{activeBot.icon}</span>
        )}
      </div>

      {/* Sidebar Panel (Edge Tab) */}
      <div 
        className="bot-edge-panel"
        style={{
          width: isOpen ? 360 : 0,
          padding: 0,
          height: '85vh',
          maxHeight: 800,
          display: 'flex',
          flexDirection: 'column',
          borderColor: 'rgba(250, 204, 21, 0.4)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'all'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: '#020617', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 64, height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 32, overflow: 'hidden' }}>
              {activeBot.avatar ? <img src={activeBot.avatar} alt="Avatar" className="bot-avatar-image" style={{ width: '140%', height: '140%', objectFit: 'contain', mixBlendMode: 'screen', transform: 'translateY(10%)' }} /> : activeBot.icon}
            </div>
            <div style={{ flex: 1 }}>
              <select 
                value={activeBot.id} 
                onChange={(e) => {
                  const bot = COPILOT_ROSTER.find(b => b.id === e.target.value);
                  setActiveBot(bot);
                  setHistory([{ role: 'assistant', text: `Switched to ${bot.name}. How can I assist you now?` }]);
                }}
                style={{ 
                  background: 'transparent', border: 'none', color: 'white', 
                  fontSize: 16, fontWeight: 900, cursor: 'pointer', outline: 'none', 
                  padding: 0, margin: 0, width: '100%' 
                }}
              >
                {COPILOT_ROSTER.map(bot => (
                  <option key={bot.id} value={bot.id} style={{ background: '#020617', color: 'white' }}>
                    {bot.name}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#6ee7b7', borderRadius: '50%' }}></span>
                Ambient Sync Active
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:20 }}>✕</button>
          </div>
        </div>

        {/* Context Scanner */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>Context Scanner</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', whiteSpace: 'normal' }}>Monitoring View: <strong style={{ color: '#facc15' }}>{currentView || 'Builder'}</strong></div>
        </div>

        {/* Chat History */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#312e81' : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              padding: '10px 14px',
              borderRadius: 12,
              borderBottomRightRadius: msg.role === 'user' ? 2 : 12,
              borderTopLeftRadius: msg.role === 'assistant' ? 2 : 12,
              maxWidth: '85%',
              color: '#f8fafc',
              fontSize: 13,
              lineHeight: 1.5,
              whiteSpace: 'normal'
            }}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', fontSize: 12, color: '#94a3b8', display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="animate-pulse">●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: 8, overflowX: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button onClick={() => handleQuickAction('debt')} style={{ whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer' }}>🛠️ Scan Debt</button>
          <button onClick={() => handleQuickAction('tool')} style={{ whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer' }}>🪄 Auto-Tool</button>
          <button onClick={() => handleQuickAction('test')} style={{ whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer' }}>⚡ Run Fission</button>
        </div>

        {/* Input Area */}
        <div style={{ padding: 20, background: '#020617', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px 4px 4px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              ghostInput="Command Evo..."
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: 13, outline: 'none' }}
            />
            <button 
              onClick={handleSend}
              style={{ background: '#facc15', color: 'black', border: 'none', width: 32, height: 32, borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontWeight: 900 }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
