import React, { useState, useEffect } from 'react';

/**
 * EVOGENAGE — LIVING EXPLORER (THE MANOR)
 * ═══════════════════════════════════════════════════════════════
 * A unique interface where bots and users coexist in the filesystem.
 * Files are Rooms. Bots are Residents.
 */

const FileRoom = ({ name, type, residents }) => (
  <div className="p-4 border border-slate-700 bg-slate-900 rounded-lg hover:border-gold transition-all">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-bold text-slate-300">{name}</span>
      <span className="text-xs text-slate-500 uppercase">{type}</span>
    </div>
    <div className="flex gap-2 min-h-[40px]">
      {residents.map(bot => (
        <div key={bot.id} className="w-8 h-8 rounded-full bg-gold border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-900 font-bold" title={`${bot.name} is ${bot.action}`}>
          {bot.id[0].toUpperCase()}
        </div>
      ))}
    </div>
  </div>
);

export const LivingExplorer = () => {
  const [rooms, setRooms] = useState([
    { name: 'src/core/foundry', type: 'corridor', residents: [{ id: 'panther', name: 'Panther-Dev', action: 'Healing code' }] },
    { name: 'evogenage/apps/api', type: 'corridor', residents: [{ id: 'diffuser', name: 'Evo-Diffuser', action: 'Denoising' }] },
    { name: 'SOVEREIGN_MANIFEST.md', type: 'room', residents: [{ id: 'lion', name: 'Evo-Lion', action: 'Signing Truth' }] }
  ]);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <h1 className="text-2xl font-black mb-6 text-gold uppercase tracking-tighter">The Sovereign Manor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <FileRoom key={room.name} {...room} />
        ))}
      </div>
      <div className="mt-8 p-4 bg-gold/10 border border-gold/30 rounded-lg">
        <p className="text-xs text-gold/80 italic">"The bots are currently in their rooms. The Manor is stable."</p>
      </div>
    </div>
  );
};
