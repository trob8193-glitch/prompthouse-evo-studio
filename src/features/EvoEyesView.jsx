import React from 'react';
import { EvoEyes } from '../components/EvoEyes.jsx';

export function EvoEyesView() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Vision Processor</h2>
        <p className="text-slate-500 text-sm font-medium">Deep-layer architectural auditing and bonded node visualization.</p>
      </header>
      
      <EvoEyes mode="embedded" />
    </div>
  );
}
