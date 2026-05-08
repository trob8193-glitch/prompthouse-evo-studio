import React, { useState } from 'react';
import { History, GitCommit, GitBranch, Rewind } from 'lucide-react';

export function TimeSlipLedger() {
  const [isOpen, setIsOpen] = useState(false);

  const mockCommits = [
    { id: 'a338fed', msg: 'upgrade Chrome Extension', time: '1 min ago', status: 'verified' },
    { id: '63bdcf2', msg: 'implement SaaS Generator', time: '4 mins ago', status: 'verified' },
    { id: 'aa14895', msg: 'initial sovereign block', time: '1 hr ago', status: 'sealed' },
  ];

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)',
          background: '#1e293b', border: '1px solid #334155', borderRight: 'none',
          padding: '12px 8px', borderRadius: '8px 0 0 8px', cursor: 'pointer',
          color: '#94a3b8', zIndex: 40, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
        <History size={16} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 280,
      background: '#0f172a', borderLeft: '1px solid #1e293b',
      zIndex: 40, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
          <History size={16} color="#6366f1" /> TIME-SLIP LEDGER
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          &times;
        </button>
      </div>

      <div style={{ padding: 16, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mockCommits.map((commit, idx) => (
          <div key={commit.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {idx !== mockCommits.length - 1 && <div style={{ position: 'absolute', left: 7, top: 20, bottom: -16, width: 2, background: '#1e293b' }} />}
            
            <div style={{ 
              width: 16, height: 16, borderRadius: '50%', background: '#0f172a', border: '2px solid #6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, marginTop: 2,
            }} />
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>{commit.msg}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#64748b' }}>
                <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{commit.id}</span>
                <span>•</span>
                <span>{commit.time}</span>
              </div>
              <button style={{
                marginTop: 8, background: '#1e293b', border: '1px solid #334155', borderRadius: 4,
                padding: '4px 8px', fontSize: 10, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
              }}>
                <Rewind size={10} /> Revert to {commit.id}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
