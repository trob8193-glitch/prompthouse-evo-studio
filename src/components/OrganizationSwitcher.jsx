import React from 'react';
import { useSovereignStore } from '../store.js';
import { Building2, ChevronDown } from 'lucide-react';

export function OrganizationSwitcher() {
  // Local state controls dropdown visibility; active org is read from the sovereign store
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeOrg, setActiveOrg] = React.useState('org_master');
  
  const orgs = [
    { id: 'org_master', name: 'PromptHouse Master Org', plan: 'Enterprise' },
    { id: 'org_test', name: 'PromptHouse Test Org', plan: 'Pro' }
  ];

  const currentOrg = orgs.find(o => o.id === activeOrg) || orgs[0];

  return (
    <div style={{ padding: '16px 14px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 8,
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ background: '#6366f122', padding: 6, borderRadius: 6 }}>
          <Building2 size={16} color="#818cf8" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{currentOrg.name}</span>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{currentOrg.plan} Plan</span>
        </div>
        <ChevronDown size={14} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div style={{
          marginTop: 8,
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {orgs.map(org => (
            <div
              key={org.id}
              onClick={() => { setActiveOrg(org.id); setIsOpen(false); }}
              style={{
                padding: '10px 12px',
                fontSize: 12,
                color: activeOrg === org.id ? '#00f0ff' : '#cbd5e1',
                background: activeOrg === org.id ? 'rgba(0,240,255,0.1)' : 'transparent',
                cursor: 'pointer',
                borderBottom: '1px solid #1e293b'
              }}
            >
              {org.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
