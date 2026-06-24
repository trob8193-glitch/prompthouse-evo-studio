import React, { useState } from 'react';
import LocalIntelligenceView from '../features/LocalIntelligenceView.jsx';

/**
 * PH EVO STUDIO — APP SHELL
 * Main layout wrapper for the studio.
 */
export default function AppShell({ children }) {
  const [activeTab, setActiveTab] = useState('workspace');

  return (
    <div className="app-shell flex h-screen w-full bg-[#121212] text-white font-sans overflow-hidden">
      <aside className="w-64 border-r border-[#333] flex-col gap-4 p-4 space-y-4">
        <h1 className="text-xl font-bold tracking-widest text-[#00ffcc]">EVO STUDIO</h1>
        <nav className="flex-col gap-4 space-y-2 text-sm text-gray-400">
          <button onClick={() => setActiveTab('workspace')} className={`text-left hover:text-white transition-colors ${activeTab === 'workspace' ? 'text-white' : ''}`}>Workspace</button>
          <button onClick={() => setActiveTab('local-intel')} className={`text-left hover:text-[#00ffcc] transition-colors ${activeTab === 'local-intel' ? 'text-[#00ffcc]' : ''}`}>Local Intelligence</button>
          <button onClick={() => setActiveTab('omni')} className={`text-left hover:text-white transition-colors ${activeTab === 'omni' ? 'text-white' : ''}`}>Omni-Tether</button>
          <button onClick={() => setActiveTab('forge')} className={`text-left hover:text-white transition-colors ${activeTab === 'forge' ? 'text-white' : ''}`}>Forge</button>
          <button onClick={() => setActiveTab('ledger')} className={`text-left hover:text-white transition-colors ${activeTab === 'ledger' ? 'text-white' : ''}`}>Value Ledger</button>
        </nav>
      </aside>
      <main className="flex-1 flex-col gap-4 relative overflow-y-auto">
        {activeTab === 'local-intel' ? <LocalIntelligenceView /> : children}
      </main>
    </div>
  );
}
