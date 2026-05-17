import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Kanban, MessageSquare, TrendingUp, Users, ShieldCheck, ChevronRight } from 'lucide-react';

export const BotAutomationDeck = () => {
  const [phase, setPhase] = useState(1);
  const [syncing, setSyncing] = useState({ trello: false, slack: false });
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:3001/api/reports/kpi')
      .then(r => r.json())
      .then(setKpis);
  }, []);

  const handleSync = (provider) => {
    setSyncing(prev => ({ ...prev, [provider]: true }));
    setTimeout(() => {
      setSyncing(prev => ({ ...prev, [provider]: false }));
    }, 2000);
  };

  const PhaseIndicator = ({ num, label, active }) => (
    <div className={`flex flex-col items-center gap-2 ${active ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
        {num}
      </div>
      <span className="text-[10px] uppercase font-bold tracking-tighter">{label}</span>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="text-indigo-500" size={32} /> Max Bot Automation
          </h1>
          <p className="text-slate-400 mt-2">Phased rollout of autonomous studio workflows.</p>
        </div>
        <div className="flex gap-4 mb-1">
          <PhaseIndicator num={1} label="Tracking" active={phase >= 1} />
          <PhaseIndicator num={2} label="Client Comm" active={phase >= 2} />
          <PhaseIndicator num={3} label="KPI Reporting" active={phase >= 3} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integrations Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Users size={20} className="text-slate-400" /> Active Connectors
          </h2>
          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg"><Kanban className="text-blue-400" /></div>
                <div>
                  <h3 className="font-bold text-sm">Trello Automation</h3>
                  <p className="text-xs text-slate-500">Auto-sync project tasks & status</p>
                </div>
              </div>
              <button 
                onClick={() => handleSync('trello')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${syncing.trello ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              >
                {syncing.trello ? 'SYNCING...' : 'SYNC NOW'}
              </button>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg"><MessageSquare className="text-purple-400" /></div>
                <div>
                  <h3 className="font-bold text-sm">Slack Bridge</h3>
                  <p className="text-xs text-slate-500">Automated client updates & feedback</p>
                </div>
              </div>
              <button 
                onClick={() => handleSync('slack')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${syncing.slack ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
              >
                {syncing.slack ? 'SYNCING...' : 'SYNC NOW'}
              </button>
            </div>
          </div>
        </section>

        {/* KPI Reporting Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" /> Automated KPI Report
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <span className="text-[10px] text-indigo-300 uppercase font-bold">Time Saved</span>
              <p className="text-2xl font-bold font-mono mt-1">{kpis?.time_saved_hours || '0.0'}h</p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <span className="text-[10px] text-emerald-300 uppercase font-bold">Completion Rate</span>
              <p className="text-2xl font-bold font-mono mt-1">{kpis?.project_completion_rate || '0%'}</p>
            </div>
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl col-span-2">
              <span className="text-[10px] text-yellow-300 uppercase font-bold">Client Satisfaction</span>
              <p className="text-2xl font-bold font-mono mt-1">{kpis?.client_satisfaction || '0/5'}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Permissions Section */}
      <footer className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-indigo-400" size={24} />
          <div>
            <h3 className="font-bold text-sm">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-500">Only Team Leads can modify automation settings.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-indigo-400 text-xs font-bold hover:text-indigo-300 transition-colors">
          MANAGE PERMISSIONS <ChevronRight size={14} />
        </button>
      </footer>
    </div>
  );
};
