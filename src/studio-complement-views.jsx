import React from 'react';

export function ComponentLibrary() {
  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="bg-[#222] p-4 rounded border-[#333]">
        <h3 className="text-white mb-2">Memory Bank</h3>
        <p className="text-gray-400 text-sm">Stores context for the current session.</p>
      </div>
      <div className="bg-[#222] p-4 rounded border-[#333]">
        <h3 className="text-white mb-2">Neural Status</h3>
        <p className="text-gray-400 text-sm">Monitors Event Bus activity.</p>
      </div>
    </div>
  );
}

export function SystemSettings() {
  return (
    <div className="p-4 bg-[#111]">
      <h2 className="text-[#00ffcc] mb-4">Core Preferences</h2>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" defaultChecked className="accent-[#00ffcc]" />
          Enable Auto-Healing
        </label>
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" defaultChecked className="accent-[#00ffcc]" />
          Allow Background Evolution (Dream State)
        </label>
      </div>
    </div>
  );
}

export default function StudioComplementViews() {
  return (
    <div className="flex-col gap-4 h-full bg-[#181818] border-l border-[#333]">
      <div className="p-3 border-b border-[#333] bg-[#222]">
        <h2 className="text-gray-300 font-mono text-sm tracking-wider">COMPLEMENTS</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ComponentLibrary />
        <SystemSettings />
      </div>
    </div>
  );
}
