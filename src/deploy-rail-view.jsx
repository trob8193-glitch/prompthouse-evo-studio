/**
 * PromptHouse Evo Studio — DeployRail View
 * Owner: Blueprint Orca | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { runDeployRail } from './deploy-rail.js';
import { addProofReceipt } from './prompt-base.js';

export function DeployRailView() {
  const [status, setStatus] = useState('idle'); // idle | deploying | blocked | success
  const [log, setLog] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [config, setConfig] = useState({ provider: 'vercel', dryRun: true, ownerApproved: false });

  const startDeploy = useCallback(async () => {
    setStatus('deploying');
    setLog(['[SYSTEM] Initializing DeployRail...']);
    
    try {
      const res = await runDeployRail('local_session', config);
      setLog(res.log);
      setReceipt(res.receipt);
      if (res.blocked) {
        setStatus('blocked');
      } else {
        setStatus('success');
      }
    } catch (e) {
      setLog(prev => [...prev, `[ERROR] ${e.message}`]);
      setStatus('error');
    }
  }, [config]);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">🛤️ DeployRail</div>
          <div className="page-subtitle">Sovereign deployment pipeline. Test → Build → Secret Check → Preview → Production.</div>
        </div>
        <div className={`badge ${config.dryRun ? 'badge-dim' : 'badge-gold'}`}>
          {config.dryRun ? 'DRY-RUN MODE' : 'LIVE PRODUCTION'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        <div className="flex-col gap-16">
          <div className="card">
            <div className="card-header"><div className="card-title">Deploy Config</div></div>
            <div className="card-body flex-col">
              <div className="field">
                <label className="field-label">Provider</label>
                <select className="field-select" value={config.provider} onChange={e => setConfig(c => ({...c, provider: e.target.value}))}>
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="firebase">Firebase</option>
                  <option value="aws">AWS Amplify</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Mode</label>
                <div className="flex-row gap-8">
                  <button 
                    className={`btn btn-sm ${config.dryRun ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setConfig(c => ({...c, dryRun: true}))}
                  >
                    Dry-Run
                  </button>
                  <button 
                    className={`btn btn-sm ${!config.dryRun ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => setConfig(c => ({...c, dryRun: false}))}
                  >
                    Live
                  </button>
                </div>
              </div>
              {config.dryRun ? (
                <div style={{ fontSize: 11, color: 'var(--text-dim)', padding: 8, background: 'var(--bg-void)', borderRadius: 4 }}>
                  💡 Dry-run simulates all gates without making network requests.
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#f87171', padding: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171', borderRadius: 4 }}>
                  ⚠️ Live production requires provider tokens in .env and manual owner approval.
                </div>
              )}
              <button 
                className="btn btn-primary" 
                style={{ marginTop: 12 }}
                onClick={startDeploy}
                disabled={status === 'deploying'}
              >
                {status === 'deploying' ? '🚀 Deploying...' : '🚀 Start Deploy Rail'}
              </button>
            </div>
          </div>
          
          {receipt && (
            <div className="card">
              <div className="card-header"><div className="card-title">Deploy Receipt</div></div>
              <div className="card-body" style={{ fontSize: 11 }}>
                <div className="flex-between"><span>ID:</span> <span style={{ fontFamily: 'var(--font-mono)' }}>{receipt.id?.slice(0, 8)}</span></div>
                <div className="flex-between"><span>Stage:</span> <span className="badge badge-violet">{receipt.stage}</span></div>
                <div className="flex-between"><span>Status:</span> <span style={{ color: receipt.status === 'blocked' ? '#f87171' : '#4ade80' }}>{receipt.status}</span></div>
                <div className="flex-between"><span>Approval:</span> <span>{receipt.approvalRequired ? 'REQUIRED' : 'GRANTED'}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ background: '#030408', border: '1px solid #333' }}>
          <div className="card-header" style={{ borderBottom: '1px solid #222' }}>
            <div className="card-title" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4ade80' }}>Deploy Log Output</div>
          </div>
          <div className="card-body" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94a3b8', height: 400, overflowY: 'auto' }}>
            {log.length === 0 && <div style={{ color: '#444' }}>// Awaiting deployment...</div>}
            {log.map((line, i) => (
              <div key={i} style={{ marginBottom: 4, color: line.includes('PASS') ? '#4ade80' : line.includes('BLOCKED') ? '#f87171' : 'inherit' }}>
                {line}
              </div>
            ))}
            {status === 'deploying' && <div className="pulse">|</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
