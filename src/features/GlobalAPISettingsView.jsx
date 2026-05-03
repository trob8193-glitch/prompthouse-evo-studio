import React, { useState, useEffect } from 'react';
import { Key, Shield, Globe, Code, Copy, Check, Info } from 'lucide-react';

export const GlobalAPISettingsView = () => {
  const [keys, setKeys] = useState({
    openai: '',
    anthropic: '',
    gemini: '',
  });
  const [phEvoKey, setPhEvoKey] = useState('ph_evo_master_' + Math.random().toString(36).substring(7));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load existing keys from bridge or local storage
    fetch('http://localhost:3001/status')
      .then(res => res.json())
      .then(data => {
        if (data.config?.keys) {
          setKeys(data.config.keys);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/config/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys }),
      });
      if (res.ok) {
        alert('API Keys updated successfully. Bridge is now using your individual credentials.');
      }
    } catch (e) {
      alert('Failed to connect to PromptBridge. Ensure server is running on :3001');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sdkSnippet = `// PH EVO STUDIO — EXTERNAL API HANDSHAKE
const PH_EVO_ENDPOINT = "http://localhost:3001/chat";
const PH_EVO_KEY = "${phEvoKey}";

async function askEvo(prompt) {
  const res = await fetch(PH_EVO_ENDPOINT, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-PH-EVO-KEY": PH_EVO_KEY 
    },
    body: JSON.stringify({ 
      messages: [{ role: "user", content: prompt }],
      systemPrompt: "You are being called via the External PH Evo API. Act as the Master Studio brain."
    })
  });
  return await res.json();
}`;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
            <Key size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Individual API Keys</h2>
            <p className="text-slate-400 text-sm">Configure your personal credentials for AI providers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">OpenAI API Key (GPT-4o/5.5)</label>
            <input 
              type="password" 
              value={keys.openai}
              onChange={(e) => setKeys({...keys, openai: e.target.value})}
              placeholder="sk-..."
              className="w-full bg-black/50 border border-slate-800 rounded-xl p-4 text-sm text-indigo-300 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Anthropic API Key (Claude)</label>
            <input 
              type="password" 
              value={keys.anthropic}
              onChange={(e) => setKeys({...keys, anthropic: e.target.value})}
              placeholder="sk-ant-..."
              className="w-full bg-black/50 border border-slate-800 rounded-xl p-4 text-sm text-rose-300 focus:border-rose-500 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
        >
          Save & Internalize Credentials
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">External API Access</h3>
              <p className="text-slate-500 text-xs mt-1">Connect other studios and projects to PH Evo.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Your PH Evo API Key</p>
                <code className="text-sm text-emerald-400 font-mono">{phEvoKey}</code>
              </div>
              <button 
                onClick={() => copyToClipboard(phEvoKey)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
              >
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
            <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <Info size={16} className="text-indigo-400 mt-1 flex-shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Use this key to authorize requests from your other apps to your local PH Evo Bridge server.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl">
              <Code size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Integration Snippet</h3>
          </div>
          <div className="relative group">
            <pre className="bg-black/80 p-6 rounded-2xl text-[10px] font-mono text-indigo-300/80 overflow-x-auto max-h-[180px]">
              {sdkSnippet}
            </pre>
            <button 
              onClick={() => copyToClipboard(sdkSnippet)}
              className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
