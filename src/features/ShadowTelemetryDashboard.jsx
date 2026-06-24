import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal as TerminalIcon, Activity, AlertTriangle, Bug, History, Brain, Layers, HeartPulse, Eye } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { BRIDGE_URL } from '../config/bridge-config.js';

export default function ShadowTelemetryDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [streamType, setStreamType] = useState('SHADOW_REJECTION');
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`${BRIDGE_URL}/api/witness/telemetry?type=${streamType}`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.success) {
            setEvents(data.logs || []);
            // Auto-select the first event if none is selected
            if (data.logs?.length > 0) {
              setSelectedEvent(prev => prev ? prev : data.logs[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch shadow telemetry:', err);
      }
    };

    fetchTelemetry();

    // Fetch AGI health data
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${BRIDGE_URL}/api/agi/health`);
        if (res.ok && active) {
          const data = await res.json();
          setHealthData(data);
        }
      } catch (e) {}
    };
    fetchHealth();

    const interval = setInterval(() => {
      if (isPolling) {
        fetchTelemetry();
        fetchHealth();
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isPolling, streamType]);

  const renderEventDetails = () => {
    if (!selectedEvent) {
      return (
        <div className="flex-1 flex items-center justify-center flex flex-col gap-4 gap-4 text-[#ff0000]/30">
          <ShieldAlert size={64} className="opacity-50" />
          <div className="tracking-widest uppercase font-bold">Select an event to view details</div>
        </div>
      );
    }

    if (streamType === 'INTENT_PROPOSAL') {
      const intent = selectedEvent.payload || selectedEvent;
      return (
        <div className="flex-1 flex flex flex-col gap-4 p-6 gap-6 overflow-auto">
          <div className="border border-[#ff0000]/30 bg-[#110000] p-4 rounded shadow-[0_0_15px_rgba(255,0,0,0.1)]">
            <h3 className="text-xl font-bold text-[#ff3333] flex items-center gap-2 mb-2">
              <Brain size={20}/>
              Intent: {intent.type}
            </h3>
            <div className="text-[#ff9999] text-sm mb-4">Target: {intent.target || intent.subjectKey}</div>
            <div className="text-[#ff0000] bg-[#220000] p-4 rounded border border-[#ff0000]/20 text-sm leading-relaxed">
              {intent.description || JSON.stringify(intent, null, 2)}
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => alert('Intent execution queued via Sovereign Bridge.')}
              className="bg-[#ff0000]/20 text-[#ff0000] border border-[#ff0000]/50 px-4 py-2 hover:bg-[#ff0000]/40 transition-colors uppercase tracking-widest text-xs font-bold rounded">
              Approve & Execute
            </button>
            <button 
              onClick={() => setSelectedEvent(null)}
              className="bg-transparent text-[#ff0000]/50 border border-[#ff0000]/20 px-4 py-2 hover:bg-[#ff0000]/10 transition-colors uppercase tracking-widest text-xs font-bold rounded">
              Dismiss Intent
            </button>
          </div>
        </div>
      );
    }

    if (streamType === 'SWARM_SYNTHESIS') {
      return (
        <div className="flex-1 flex flex flex-col gap-4">
          <div className="p-4 border-b border-[#ff0000]/30 bg-[#110000]">
            <div className="text-xs text-[#ff0000]/50 uppercase tracking-widest mb-1">User Prompt</div>
            <div className="text-[#ff9999] text-sm">{selectedEvent.prompt}</div>
          </div>
          <div className="flex-1 flex flex flex-col gap-4 md:flex-row overflow-hidden">
            <div className="flex-1 border-r border-[#ff0000]/30 flex flex flex-col gap-4 bg-[#050000]">
              <div className="p-2 border-b border-[#ff0000]/20 text-[10px] uppercase font-bold text-[#ff3333] flex items-center gap-2 bg-[#220000]">
                <Layers size={14} /> Merge Court Arbiter Resolution
              </div>
              <div className="flex-1 p-4 overflow-auto custom-scrollbar">
                <pre className="text-xs text-[#ff6666] whitespace-pre-wrap">{selectedEvent.synthesis}</pre>
              </div>
            </div>
            <div className="w-1/3 flex flex flex-col gap-4 bg-[#110000]">
               <div className="p-2 border-b border-[#ff0000]/20 text-[10px] uppercase font-bold text-[#ff0000]/70">
                 Swarm Branches
               </div>
               <div className="flex-1 p-4 overflow-auto custom-scrollbar text-xs text-[#ff0000]/60 space-y-4">
                 {selectedEvent.responses?.map((r, i) => (
                   <div key={i} className="border border-[#ff0000]/20 p-2 rounded bg-[#0a0000]">
                     <div className="font-bold text-[#ff9999] mb-1">{r.brainId.toUpperCase()}</div>
                     <div className="line-clamp-4">{r.content}</div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      );
    }

    if (streamType === 'HEALTH_PULSE' && healthData) {
      const sys = healthData.systems || {};
      return (
        <div className="flex-1 flex flex flex-col gap-4 p-6 gap-6 overflow-auto">
          <div className="border border-[#ff0000]/30 bg-[#110000] p-4 rounded shadow-[0_0_15px_rgba(255,0,0,0.1)]">
            <h3 className="text-xl font-bold text-[#ff3333] flex items-center gap-2 mb-4">
              <HeartPulse size={20}/>
              AGI Iron Man Suit v2 — Health Pulse
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(sys).map(([key, val]) => (
                <div key={key} className="bg-[#0a0000] border border-[#ff0000]/20 p-3 rounded">
                  <div className="text-xs text-[#ff0000]/60 uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className={`text-sm font-bold ${
                    val.status === 'HEALTHY' || val.status === 'OPERATIONAL' || val.status === 'ARMED' || val.status === 'ONLINE' ? 'text-green-400' :
                    val.status === 'DEGRADED' || val.status === 'TRIPPED' ? 'text-red-400' :
                    val.status === 'COLLECTING' || val.status === 'COLD_START' || val.status === 'STANDBY' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>{val.status}</div>
                  {val.totalPairs !== undefined && <div className="text-[10px] text-[#ff0000]/40 mt-1">Pairs: {val.totalPairs}/{val.threshold}</div>}
                  {val.totalAudits !== undefined && <div className="text-[10px] text-[#ff0000]/40 mt-1">Audits: {val.totalAudits}</div>}
                  {val.consecutiveFailures !== undefined && <div className="text-[10px] text-[#ff0000]/40 mt-1">Failures: {val.consecutiveFailures}</div>}
                  {val.cycleCount !== undefined && <div className="text-[10px] text-[#ff0000]/40 mt-1">Cycles: {val.cycleCount}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-[#ff0000]/30">Last updated: {healthData.timestamp}</div>
        </div>
      );
    }

    // Default: SHADOW_REJECTION
    return (
      <>
        <div className="p-4 border-b border-[#ff0000]/30 flex flex flex-col gap-4 gap-2">
          <div className="flex items-center gap-2 text-[#ff3333]">
            <Bug size={18} />
            <h2 className="text-lg font-bold truncate">{selectedEvent.file}</h2>
          </div>
          <div className="text-xs text-[#ff0000]/70 flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#ff9900]" />
            <span>Intercept ID: {selectedEvent.id}</span>
          </div>
        </div>

        <div className="flex-1 flex flex flex-col gap-4 md:flex-row overflow-hidden">
          {/* Rejected Code */}
          <div className="flex-1 flex flex flex-col gap-4 border-r border-[#ff0000]/30 md:border-b-0 border-b">
            <div className="p-2 border-b border-[#ff0000]/20 bg-[#110000] text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
              <span>Rejected Payload</span>
              <span className="text-[#ff0000]/50">Attempted Write</span>
            </div>
            <div className="flex-1 p-4 overflow-auto text-[13px] leading-relaxed relative group custom-scrollbar">
              <pre className="opacity-70 group-hover:opacity-100 transition-opacity">
                <code>{selectedEvent.code}</code>
              </pre>
            </div>
          </div>

          {/* Stack Trace / Feedback */}
          <div className="flex-1 flex flex flex-col gap-4 bg-[#1a0000]">
            <div className="p-2 border-b border-[#ff0000]/20 bg-[#220000] text-[10px] font-bold uppercase tracking-widest text-[#ff9900] flex items-center justify-between">
              <span className="flex items-center gap-2"><TerminalIcon size={12} /> Auto-Feedback Generated</span>
              <span className="bg-[#ff0000] text-black px-2 py-0.5 rounded shadow-[0_0_10px_#ff0000]">SENT TO AI</span>
            </div>
            <div className="flex-1 p-4 overflow-auto custom-scrollbar">
              <pre className="text-[12px] text-[#ff6666] leading-relaxed whitespace-pre-wrap wrap-break-word">
                {selectedEvent.stack || 'No stack trace available.'}
              </pre>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex flex-col gap-4 h-full w-full bg-[#050000] text-[#ff3333] font-mono border-t-2 border-[#ff0000]">
      {/* Header */}
      <div className="flex flex flex-col gap-4 bg-[#110000] border-b border-[#ff0000]/30 shadow-[0_0_20px_rgba(255,0,0,0.2)] z-10 relative">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-4">
            <ShieldAlert className="text-[#ff0000] drop-shadow-[0_0_10px_#ff0000] animate-pulse" size={28} />
            <div>
              <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-[#ff0000] to-[#ff6666] drop-shadow-[0_0_5px_#ff0000]">
                AGI COCKPIT TELEMETRY
              </h1>
              <div className="text-[10px] text-[#ff0000]/70 uppercase tracking-widest flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${isPolling ? 'bg-[#00ff00] drop-shadow-[0_0_5px_#00ff00]' : 'bg-[#ff0000] drop-shadow-[0_0_5px_#ff0000]'}`}></span>
                Live Stream {isPolling ? 'Active' : 'Paused'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#ff0000]/10 px-4 py-2 rounded-2xl border border-[#ff0000]/30 flex items-center gap-2 text-sm">
              <Activity size={16} className="text-[#ff0000]" />
              <span className="font-bold">{events.length}</span> Events
            </div>
            <button 
              onClick={() => setIsPolling(!isPolling)}
              className="bg-[#110000] hover:bg-[#330000] text-[#ff0000] border border-[#ff0000]/50 px-4 py-2 rounded-2xl transition-all shadow-[0_0_10px_rgba(255,0,0,0.1)] hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] text-xs uppercase font-bold tracking-wider"
            >
              {isPolling ? 'Pause Stream' : 'Resume Stream'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-4 pt-2">
          {['SHADOW_REJECTION', 'INTENT_PROPOSAL', 'SWARM_SYNTHESIS', 'HEALTH_PULSE'].map(t => (
            <button 
              key={t}
              onClick={() => { setStreamType(t); setSelectedEvent(null); setEvents([]); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-t border-x border-[#ff0000]/30 rounded-t-lg transition-colors ${
                streamType === t 
                  ? 'bg-[#0a0000] border-[#ff0000] text-[#ff3333]' 
                  : 'bg-[#110000] text-[#ff0000]/50 hover:bg-[#220000] border-transparent'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative bg-[#0a0000]">
        {/* Background Cyber Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
          <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ff0000 2px, #ff0000 4px)', backgroundSize: '100% 4px' }}></div>
        </div>

        {/* Left Column: Event Feed */}
        <div className="w-1/3 border-r border-[#ff0000]/30 bg-[#0a0000]/90 backdrop-blur-sm flex flex flex-col gap-4 z-10">
          <div className="p-3 border-b border-[#ff0000]/20 text-xs font-bold tracking-widest uppercase text-[#ff6666] flex items-center justify-between">
            <div className="flex items-center gap-2"><History size={14} /> Event Log</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex flex-col gap-4 gap-2 custom-scrollbar">
            {events.length === 0 ? (
              <div className="p-6 text-center text-[#ff0000]/40 text-sm">
                No events detected for this stream.
              </div>
            ) : (
              events.map((ev) => {
                const title = streamType === 'INTENT_PROPOSAL' 
                  ? (ev.payload?.type || ev.type) 
                  : streamType === 'SWARM_SYNTHESIS' 
                  ? 'Swarm Synthesis' 
                  : (ev.file?.split(/[/\\]/).pop() || 'Unknown File');
                  
                const desc = streamType === 'INTENT_PROPOSAL' 
                  ? ev.payload?.target 
                  : streamType === 'SWARM_SYNTHESIS' 
                  ? ev.prompt 
                  : (ev.error || 'Syntax Error');

                return (
                  <div 
                    key={ev.id} 
                    onClick={() => setSelectedEvent(ev)}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selectedEvent?.id === ev.id 
                        ? 'bg-[#ff0000]/20 border-[#ff0000] shadow-[inset_0_0_15px_rgba(255,0,0,0.2)]' 
                        : 'bg-[#110000] border-[#ff0000]/20 hover:border-[#ff0000]/50 hover:bg-[#ff0000]/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-bold truncate pr-2 text-[#ff9999]" title={title}>
                        {title}
                      </div>
                      <div className="text-[10px] text-[#ff0000]/60 whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#ff0000]/80 line-clamp-2 leading-relaxed">
                      {desc}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Event Details */}
        <div className="flex-1 flex flex flex-col gap-4 bg-[#050000]/95 z-10">
          {renderEventDetails()}
        </div>
      </div>
      
      {/* CSS for custom scrollbar in this view */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 0, 0, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 0, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
