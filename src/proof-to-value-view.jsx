/**
 * PromptHouse Evo Studio — Proof-to-Value Deck Full View
 * Owner: Ledger | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getAllValueEntries, recordValueEvent, computeValueSummary, recordTestPassReceipt } from './proof-to-value.js';
import { getAllReceipts } from './prompt-base.js';
import { GATE_DEFINITIONS } from './models.js';

const METRIC_CARDS = [
  { key: 'timeSavedHours', label: 'Hours Saved', unit: 'hrs', icon: '⏱️', color: '#4ade80' },
  { key: 'stepsRemoved', label: 'Steps Removed', unit: 'steps', icon: '🪜', color: '#38bdf8' },
  { key: 'testsPassed', label: 'Tests Passed', unit: 'tests', icon: '✅', color: '#f5c842' },
  { key: 'estimatedCostSaved', label: 'Cost Saved', unit: 'USD', icon: '💵', color: '#a78bfa' },
  { key: 'totalVerifiedReceipts', label: 'Verified Receipts', unit: 'receipts', icon: '🛡️', color: '#fb923c' },
  { key: 'verifiedEntries', label: 'Verified Events', unit: 'events', icon: '📋', color: '#f87171' },
];

export function ProofToValueView() {
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [recordForm, setRecordForm] = useState({ missionId: 'local_session', action: '', timeSavedMinutes: 0, stepsRemoved: 0, testsPassed: 0, estimatedCostSaved: 0, evidenceUri: '' });
  const [activeTab, setActiveTab] = useState('dashboard');

  const refresh = useCallback(async () => {
    setSummary(computeValueSummary());
    setEntries(getAllValueEntries().slice(0, 30));
    setReceipts(getAllReceipts().slice(0, 30));

    try {
      const res = await fetch('http://localhost:3001/api/proof-receipts/test-report');
      if (res.ok) {
        const data = await res.json();
        if (data.passed > 0 && data.truthState === 'verified') {
          // Record value event for the test run if not already recorded (id check simplified for prototype)
          recordTestPassReceipt('automated_build', data.passed, 30000 * data.passed);
          setSummary(computeValueSummary());
          setEntries(getAllValueEntries().slice(0, 30));
        }
      }
    } catch (e) {
      console.warn('Proof Deck Bridge offline');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const record = useCallback(() => {
    if (!recordForm.action.trim()) return;
    recordValueEvent(recordForm.missionId, {
      action: recordForm.action,
      timeSavedMinutes: Number(recordForm.timeSavedMinutes) || 0,
      stepsRemoved: Number(recordForm.stepsRemoved) || 0,
      testsPassed: Number(recordForm.testsPassed) || 0,
      estimatedCostSaved: Number(recordForm.estimatedCostSaved) || 0,
      evidenceType: recordForm.evidenceUri ? 'manual_log' : 'log',
      evidenceUri: recordForm.evidenceUri || null,
    });
    refresh();
    setRecordForm(f => ({ ...f, action: '', evidenceUri: '' }));
  }, [recordForm, refresh]);

  const TABS = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'record', label: '➕ Record Event' },
    { id: 'entries', label: `📋 Entries (${entries.length})` },
    { id: 'receipts', label: `🛡️ Receipts (${receipts.length})` },
  ];

  const statusColor = { verified: '#4ade80', built: '#38bdf8', inferred: '#f5c842', blocked: '#f87171', broken: '#f87171' };

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">🧪 Proof-to-Value Deck</div>
          <div className="page-subtitle">Only verified events with proof receipts count. No fake numbers.</div>
        </div>
        <button className="btn btn-sm btn-secondary" onClick={refresh}>↻ Refresh</button>
      </div>

      <div className="tabs-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}
      </div>

      {activeTab === 'dashboard' && summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {METRIC_CARDS.map(m => (
              <div key={m.key} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: m.color }}>{summary[m.key] ?? 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{m.unit}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 22 }}>{summary.truthState === 'verified' ? '✅' : '⚠️'}</span>
              <div>
                <div style={{ fontWeight: 800, color: summary.truthState === 'verified' ? '#4ade80' : '#f5c842' }}>
                  Truth State: {summary.truthState?.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{summary.disclaimer}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'record' && (
        <div className="card">
          <div className="card-header"><div className="card-title">➕ Record Value Event</div></div>
          <div className="card-body flex-col">
            <div className="field"><label className="field-label">Action / Description</label>
              <input className="field-input" placeholder="e.g. Automated test run saved manual regression..." value={recordForm.action} onChange={e => setRecordForm(f => ({ ...f, action: e.target.value }))} />
            </div>
            <div className="grid-2">
              <div className="field"><label className="field-label">Time Saved (minutes)</label>
                <input className="field-input" type="number" min={0} value={recordForm.timeSavedMinutes} onChange={e => setRecordForm(f => ({ ...f, timeSavedMinutes: e.target.value }))} />
              </div>
              <div className="field"><label className="field-label">Steps Removed</label>
                <input className="field-input" type="number" min={0} value={recordForm.stepsRemoved} onChange={e => setRecordForm(f => ({ ...f, stepsRemoved: e.target.value }))} />
              </div>
              <div className="field"><label className="field-label">Tests Passed</label>
                <input className="field-input" type="number" min={0} value={recordForm.testsPassed} onChange={e => setRecordForm(f => ({ ...f, testsPassed: e.target.value }))} />
              </div>
              <div className="field"><label className="field-label">Cost Saved (USD)</label>
                <input className="field-input" type="number" min={0} step={0.01} value={recordForm.estimatedCostSaved} onChange={e => setRecordForm(f => ({ ...f, estimatedCostSaved: e.target.value }))} />
              </div>
            </div>
            <div className="field"><label className="field-label">Evidence URI (leave blank = inferred, add URI = verified)</label>
              <input className="field-input" placeholder="e.g. vitest:run:42_tests or https://..." value={recordForm.evidenceUri} onChange={e => setRecordForm(f => ({ ...f, evidenceUri: e.target.value }))} />
            </div>
            <button className="btn btn-primary" onClick={record} disabled={!recordForm.action.trim()}>📋 Record Event</button>
          </div>
        </div>
      )}

      {activeTab === 'entries' && (
        <div className="card">
          <div className="card-header"><div className="card-title">📋 Value Entries</div></div>
          <div className="card-body">
            {entries.length === 0 ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No entries yet</div></div>
            : entries.map(e => (
              <div key={e.id} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${statusColor[e.truthState] || '#444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{e.action}</span>
                  <span style={{ fontSize: 10, color: statusColor[e.truthState], fontWeight: 800 }}>{e.truthState}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  ⏱️ {e.timeSavedMinutes}min · 🪜 {e.stepsRemoved} steps · ✅ {e.testsPassed} tests · 💵 ${e.estimatedCostSaved}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="card">
          <div className="card-header"><div className="card-title">🛡️ Proof Receipts</div></div>
          <div className="card-body">
            {receipts.length === 0 ? <div className="empty-state"><div className="empty-icon">🛡️</div><div className="empty-title">No receipts yet</div></div>
            : receipts.map(r => (
              <div key={r.id} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 6, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[r.status] || '#fff' }}>{r.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{r.action}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{r.timestamp?.slice(0,19)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
