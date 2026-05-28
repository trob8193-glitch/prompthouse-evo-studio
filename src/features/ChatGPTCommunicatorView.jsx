import React, { useState, useEffect } from 'react';
import { Send, Terminal, Inbox, CheckCircle, Clock } from 'lucide-react';

export default function ChatGPTCommunicatorView() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('command');
  const [priority, setPriority] = useState('normal');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [pendingMessages, setPendingMessages] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  const fetchStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/local/outbox/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPendingMessages(data.messages || []);
        }
      }

      const appRes = await fetch('http://127.0.0.1:3001/local/approvals');
      if (appRes.ok) {
        const appData = await appRes.json();
        setPendingApprovals(appData.approvals || []);
      }
    } catch (e) {
      console.error("Failed to fetch outbox/approval status", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('http://127.0.0.1:3001/local/outbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type, priority })
      });
      if (res.ok) {
        setStatus('success');
        setMessage('');
        fetchStatus();
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (e) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleApprove = async (id, action) => {
    try {
      await fetch(`http://127.0.0.1:3001/local/approvals/${id}/${action}`, { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto h-full">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <div className="p-3 bg-indigo-900/40 border border-indigo-500/30 rounded-xl">
          <Terminal size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-200 tracking-tight">ChatGPT Comm-Link</h1>
          <p className="text-slate-400 text-sm mt-1">
            Dispatch autonomous commands, approvals, and context directly to the sovereign ChatGPT intelligence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Col: Composer */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20"></div>
            
            <div className="flex gap-4 mb-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Message Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="command">Execute Command</option>
                  <option value="approval">Governance Approval</option>
                  <option value="context">Provide Context</option>
                  <option value="handshake">System Handshake</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Priority Level</label>
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High / Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex-1 min-h-[250px]">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your command or message to ChatGPT here... (e.g., 'Run an audit on the Evo Studio frontend components')"
                className="w-full h-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={handleSend}
                disabled={status === 'sending' || !message.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${
                  status === 'success' ? 'bg-emerald-600 text-white shadow-emerald-900/50' :
                  status === 'error' ? 'bg-red-600 text-white shadow-red-900/50' :
                  'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {status === 'sending' ? (
                  <span className="flex items-center gap-2"><Clock size={16} className="animate-spin" /> Transmitting...</span>
                ) : status === 'success' ? (
                  <span className="flex items-center gap-2"><CheckCircle size={16} /> Dispatched</span>
                ) : (
                  <span className="flex items-center gap-2"><Send size={16} /> Push to ChatGPT</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Outbox & Approvals Status */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-[50%]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Inbox size={20} className="text-slate-400" />
                <h2 className="font-bold text-slate-200">Outbox Queue</h2>
              </div>
              <div className="bg-slate-800 text-indigo-400 text-xs font-bold px-2 py-1 rounded-md">
                {pendingMessages.length} Pending
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
              {pendingMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                  <CheckCircle size={32} className="opacity-20" />
                  <p className="text-sm text-center">Queue is empty. ChatGPT is caught up.</p>
                </div>
              ) : (
                pendingMessages.map(msg => (
                  <div key={msg.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        msg.priority === 'high' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                        'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {msg.type}
                      </span>
                      <span className="text-[10px] text-slate-600">Waiting</span>
                    </div>
                    <p className="text-slate-300 line-clamp-3 text-xs leading-relaxed">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-orange-900/30 rounded-2xl p-6 flex flex-col h-[50%]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <h2 className="font-bold text-slate-200">Pending Approvals</h2>
              </div>
              <div className="bg-orange-900/40 text-orange-400 border border-orange-500/30 text-xs font-bold px-2 py-1 rounded-md">
                {pendingApprovals.filter(a => a.status === 'pending').length} Actions
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
              {pendingApprovals.filter(a => a.status === 'pending').length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                  <CheckCircle size={32} className="opacity-20" />
                  <p className="text-sm text-center">No governed actions require approval.</p>
                </div>
              ) : (
                pendingApprovals.filter(a => a.status === 'pending').map(req => (
                  <div key={req.id} className="bg-slate-950 border border-orange-900/50 rounded-lg p-3 text-sm flex flex-col gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-orange-400 mb-1">{req.action}</div>
                      <code className="text-xs text-slate-300 bg-slate-900 px-1 py-0.5 rounded">{req.command || req.branch}</code>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(req.id, 'approve')} className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-bold py-1.5 rounded border border-emerald-500/30 transition-colors">Approve</button>
                      <button onClick={() => handleApprove(req.id, 'deny')} className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold py-1.5 rounded border border-red-500/30 transition-colors">Deny</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
