import React, { useState } from 'react';

export function AIViews() {
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Omni-Tether initialized. Neural bus active.' }
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'agent', text: 'Acknowledged. Processing via AI Engine...' }]);
    }, 500);
  };

  return (
    <div className="flex-col gap-4 h-full bg-[#181818] border-[#333] rounded-md m-4">
      <div className="p-3 border-b border-[#333] bg-[#222]">
        <h2 className="text-[#00ffcc] font-mono text-sm tracking-wider">OMNI-TETHER UPLINK</h2>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 px-3 rounded-md max-w-[80%] text-sm ${m.role === 'user' ? 'bg-[#00ffcc] text-black' : 'bg-[#333] text-gray-200'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-[#333] flex gap-2 bg-[#222]">
        <input 
          className="flex-1 bg-[#111] border-[#444] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ffcc]"
          placeholder="Command the studio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button 
          onClick={send}
          className="bg-[#00ffcc] text-black px-4 py-2 rounded text-sm font-bold hover:bg-white transition-colors"
        >
          EXECUTE
        </button>
      </div>
    </div>
  );
}

export function IntentAnalyzerView() { return <AIViews />; }
export function PromptDNAView() { return <AIViews />; }
export function TemplateLibraryView() { return <AIViews />; }
export function AutoRepairView() { return <AIViews />; }
export function LiveChatView() { return <AIViews />; }

