import React, { useState, useEffect } from 'react';
import { Card, Button, StatusBadge } from '../components/primitives.jsx';
import { BrainCircuit, Image as ImageIcon, Send, RefreshCw, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSovereignStore } from '../store.js';

export function QuadBrainAppCockpit() {
  const [activeTab, setActiveTab] = useState('request');
  const [status, setStatus] = useState(null);
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [receipts, setReceipts] = useState([]);
  
  // Form State
  const [assetType, setAssetType] = useState('ui_wireframe');
  const [prompt, setPrompt] = useState('');
  const [engine, setEngine] = useState('evo_diffuser');
  
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiConfig = useSovereignStore(s => s.apiConfig);
  const addNotification = useSovereignStore(s => s.addNotification);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-studio-gateway-key': 'EVO_STUDIO_BYPASS' // Or context key
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, reqRes, assRes, recRes] = await Promise.all([
        fetch('http://127.0.0.1:3001/api/quadbrain/creative/status', { headers: getHeaders() }),
        fetch('http://127.0.0.1:3001/api/quadbrain/creative/requests', { headers: getHeaders() }),
        fetch('http://127.0.0.1:3001/api/quadbrain/creative/assets', { headers: getHeaders() }),
        fetch('http://127.0.0.1:3001/api/quadbrain/creative/receipts', { headers: getHeaders() })
      ]);
      
      if (statusRes.ok) setStatus((await statusRes.json()).status);
      if (reqRes.ok) setRequests((await reqRes.json()).requests);
      if (assRes.ok) setAssets((await assRes.json()).assets);
      if (recRes.ok) setReceipts((await recRes.json()).receipts);
      
    } catch (e) {
      console.error('Failed to fetch QuadBrain data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleRequestAsset = async () => {
    if (!prompt) return;
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/quadbrain/creative/requests', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: 'studio_owner',
          assetType,
          prompt,
          preferredEngine: engine,
          goal: 'Manual studio generation'
        })
      });
      if (res.ok) {
        addNotification('Creative Request queued successfully!', 'success');
        setPrompt('');
        fetchData();
        setActiveTab('queue');
      } else {
        addNotification('Failed to queue request.', 'error');
      }
    } catch (e) {
      addNotification('Bridge error: ' + e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (assetId, approve) => {
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/quadbrain/creative/assets/${approve ? 'approve' : 'reject'}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ assetId, userId: 'studio_owner' })
      });
      if (res.ok) {
        addNotification(`Asset ${approve ? 'Approved' : 'Rejected'}!`, 'success');
        fetchData();
      }
    } catch (e) {
      addNotification('Action failed', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030712] overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-indigo-900/30 bg-[#0a0f1d]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <BrainCircuit className="w-10 h-10 text-indigo-400" />
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">QuadBrain App Cockpit</h1>
              <p className="text-indigo-400 text-sm font-mono tracking-widest uppercase mt-1">Creative Layer v1 & Asset Production</p>
            </div>
          </div>
          <Button onClick={fetchData} className="bg-indigo-950 text-indigo-300 border border-indigo-800">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync Ledger
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex gap-6 mt-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Engine Status</span>
            <span className="text-sm font-mono text-emerald-400">{status ? status.truthLabel : 'OFFLINE'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Queue</span>
            <span className="text-sm font-mono text-white">{status?.queues?.requests || 0} Pending</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Ledger</span>
            <span className="text-sm font-mono text-white">{status?.queues?.receipts || 0} Receipts</span>
          </div>
        </div>

        {/* QuadBrain Health Panel */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          {[
            { id: 1, name: 'TetherEngine (Gemini)', status: 'ONLINE', color: 'emerald' },
            { id: 2, name: 'ChatGPT MCP', status: 'ONLINE', color: 'emerald' },
            { id: 3, name: 'IDE Agent', status: 'ONLINE', color: 'emerald' },
            { id: 4, name: 'Creative Generator', status: status ? 'ONLINE' : 'OFFLINE', color: status ? 'emerald' : 'slate' }
          ].map(brain => {
            const isOnline = brain.status === 'ONLINE';
            const bgClass = isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600';
            const textClass = isOnline ? 'text-emerald-400' : 'text-slate-400';
            return (
              <div key={brain.id} className="p-4 bg-[#030712] border border-indigo-900/30 rounded-xl flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${bgClass} ${isOnline ? 'animate-pulse' : ''}`} />
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brain 0{brain.id}</div>
                  <div className={`text-xs font-bold ${textClass}`}>{brain.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 border-r border-indigo-900/30 bg-[#0a0f1d] p-4 space-y-2">
          {[
            { id: 'request', label: 'New Request', icon: Send },
            { id: 'queue', label: 'Asset Queue', icon: Clock },
            { id: 'library', label: 'Review Library', icon: ImageIcon },
            { id: 'receipts', label: 'Proof Ledger', icon: FileText }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.id 
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                  : 'text-slate-400 hover:bg-indigo-950/50 hover:text-indigo-200'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Work Area */}
        <div className="flex-1 overflow-auto p-8 bg-[#030712]">
          
          {/* REQUEST TAB */}
          {activeTab === 'request' && (
            <div className="max-w-3xl">
              <Card className="p-8 bg-[#0a0f1d] border-indigo-900/40 shadow-xl">
                <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="text-indigo-400" /> Dispatch Creative Request
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Asset Type</label>
                    <select value={assetType} onChange={e=>setAssetType(e.target.value)} className="w-full bg-[#030712] border border-indigo-900 p-3 rounded text-white">
                      <option value="ui_wireframe">UI Wireframe</option>
                      <option value="platform_demo_banner">Platform Demo Banner</option>
                      <option value="logo">Application Logo</option>
                      <option value="icon">Iconography</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Creative Prompt</label>
                    <textarea 
                      value={prompt} onChange={e=>setPrompt(e.target.value)}
                      className="w-full bg-[#030712] border border-indigo-900 p-3 rounded text-white h-32 focus:border-indigo-500 focus:outline-none"
                      placeholder="Premium futuristic AI studio command cockpit..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Preferred Engine</label>
                    <select value={engine} onChange={e=>setEngine(e.target.value)} className="w-full bg-[#030712] border border-indigo-900 p-3 rounded text-white">
                      <option value="evo_diffuser">Evo Diffuser (Stable Diffusion Local)</option>
                      <option value="dalle3">DALL-E 3 (Cloud)</option>
                      <option value="quadbrain_auto">QuadBrain Auto-Select</option>
                    </select>
                  </div>
                  <Button onClick={handleRequestAsset} disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 font-black text-white uppercase tracking-widest">
                    {submitting ? 'Transmitting...' : 'Queue Asset for Generation'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* QUEUE TAB */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider">Active Generation Queue</h2>
              {requests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-slate-800 rounded bg-[#0a0f1d]">No active requests in queue.</div>
              ) : (
                requests.map(req => (
                  <Card key={req.requestId} className="p-4 bg-[#0a0f1d] border-indigo-900/30 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-1 rounded">{req.assetType}</span>
                        <StatusBadge status={req.status === 'completed' ? 'verified' : req.status === 'failed' ? 'rejected' : 'pending'} label={req.status} />
                      </div>
                      <p className="text-sm text-slate-300 font-medium truncate max-w-2xl">{req.prompt}</p>
                    </div>
                    <div className="text-xs text-slate-500 font-mono text-right">
                      <div>Engine: {req.preferredEngine}</div>
                      <div>ID: {req.requestId.slice(0,14)}...</div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* LIBRARY & APPROVAL TAB */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider">Asset Review Library</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {assets.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-500 border border-slate-800 rounded bg-[#0a0f1d]">No generated assets found.</div>
                ) : (
                  assets.map(asset => (
                    <Card key={asset.assetId} className="p-0 overflow-hidden bg-[#0a0f1d] border-indigo-900/30 flex flex-col">
                      <div className="h-48 bg-black flex items-center justify-center overflow-hidden border-b border-indigo-900/30 relative group">
                        {asset.url ? (
                          <img src={asset.url} alt={asset.assetType} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-slate-700" />
                        )}
                        <div className="absolute top-2 right-2">
                           <StatusBadge status={asset.approvalStatus === 'approved' ? 'verified' : asset.approvalStatus === 'rejected' ? 'rejected' : 'pending'} label={asset.approvalStatus.toUpperCase()} />
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{asset.assetType}</h3>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{asset.prompt}</p>
                        
                        <div className="mt-auto flex gap-2">
                          <Button onClick={() => handleApproval(asset.assetId, true)} disabled={asset.approvalStatus !== 'pending_review'} className="flex-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800">
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </Button>
                          <Button onClick={() => handleApproval(asset.assetId, false)} disabled={asset.approvalStatus !== 'pending_review'} className="flex-1 bg-red-950 text-red-400 hover:bg-red-900 border border-red-800">
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* RECEIPTS TAB */}
          {activeTab === 'receipts' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-wider">Proof Ledger</h2>
              {receipts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-slate-800 rounded bg-[#0a0f1d]">Ledger is empty.</div>
              ) : (
                receipts.slice().reverse().map(receipt => (
                  <div key={receipt.receiptId} className="flex gap-4 p-4 bg-[#0a0f1d] border-l-2 border-indigo-500 rounded shadow-sm mb-2">
                    <FileText className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-white">{receipt.message}</span>
                        <span className="text-xs text-slate-500 font-mono">{new Date(receipt.generatedAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono space-y-1">
                        <div>Action: <span className="text-indigo-300">{receipt.actionType}</span></div>
                        <div>Truth State: <span className="text-emerald-400">{receipt.truthState}</span></div>
                        <div>Receipt ID: {receipt.receiptId}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
