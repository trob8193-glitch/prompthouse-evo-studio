import React, { useMemo, useState, useEffect } from 'react';
import { RARE_CAPABILITIES, buildRareArtifact } from './rare-capabilities-engine.js';

import { Log } from './core/autonomy/SovereignLogger.js';
import { BRIDGE_URL } from './config/bridge-config.js';

const DEFAULT_MISSION = 'Build a trusted PromptHouse agent that turns a founder idea into proof-backed app, Chrome extension, workflow, test, and receipt artifacts.';

function badgeForRisk(risk) {
  if (risk === 'destructive' || risk === 'high') return 'badge-red';
  if (risk === 'medium') return 'badge-gold';
  return 'badge-green';
}

function badgeForTruth(state) {
  if (state === 'verified-ready') return 'badge-green';
  if (state === 'built-needs-proof') return 'badge-gold';
  return 'badge-red';
}

function copyArtifact(text, label, setCopied) {
  navigator.clipboard.writeText(text);
  setCopied(label);
  setTimeout(() => setCopied(''), 1400);
}

export function RareCapabilitiesView() {
  const [selectedId, setSelectedId] = useState(RARE_CAPABILITIES[0].id);
  const [mission, setMission] = useState(DEFAULT_MISSION);
  const [copied, setCopied] = useState('');
  const [artifactsData, setArtifactsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'RareCapabilities',
            action: 'get',
            payload: { mission }
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setArtifactsData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load rare capabilities data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [mission]);

  const selected = RARE_CAPABILITIES.find((capability) => capability.id === selectedId) || RARE_CAPABILITIES[0];
  
  const moduleArtifacts = artifactsData?.artifacts ? Object.values(artifactsData.artifacts) : RARE_CAPABILITIES.map(c => buildRareArtifact(c.id, mission));
  const artifact = artifactsData?.artifacts?.[selectedId] || buildRareArtifact(selectedId, mission);
  const averageScore = artifactsData?.averageScore || Math.round(moduleArtifacts.reduce((sum, item) => sum + item.score, 0) / moduleArtifacts.length);
  const readyCount = artifactsData?.readyCount || moduleArtifacts.filter((item) => item.truthState === 'verified-ready').length;

  return (
    <div className="rare-os-view flex flex-col gap-4 gap-4 animate-in">
      <div className="flex items-center justify-between rare-os-titlebar">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2">Rare Capability OS</div>
          <div className="text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8">Ten installed PromptHouse layers for proof, canon, permissions, extensions, marketplace packets, and receipt-backed memory.</div>
        </div>
        <div className="rare-os-status-row">
          <span className="badge badge-pink">S+++++ dark lock</span>
          <span className="badge badge-cyan">{RARE_CAPABILITIES.length} installed</span>
          <span className={`badge ${badgeForTruth(artifact.truthState)}`}>{artifact.truthState}</span>
        </div>
      </div>

      <div className="grid-3">
        <div className="glass-extreme omnipotent-panel rare-metric-glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="rare-metric-value">{RARE_CAPABILITIES.length}</div>
          <div className="rare-metric-label">Modules Installed</div>
          <div className="rare-metric-detail">Proof, audit, canon, firewall, market, court, rebuild, score, extension, memory.</div>
        </div>
        <div className="glass-extreme omnipotent-panel rare-metric-glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="rare-metric-value">{averageScore}</div>
          <div className="rare-metric-label">Average Truth Score</div>
          <div className="rare-metric-detail">{readyCount} verified-ready layers on the current mission text.</div>
        </div>
        <div className="glass-extreme omnipotent-panel rare-metric-glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="rare-metric-value">{artifact.risk.toUpperCase()}</div>
          <div className="rare-metric-label">Current Risk Gate</div>
          <div className="rare-metric-detail">External writes, secrets, deploys, payments, and destructive actions stay blocked without proof.</div>
        </div>
      </div>

      <div className="grid-builder rare-os-workbench">
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Mission Kernel</div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-desc">All ten modules regenerate from this mission and keep a proof-before-completion boundary.</div>
          </div>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body flex-col gap-4">
            <label className="field">
              <span className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Mission</span>
              <textarea
                className="field-textarea rare-mission-input"
                value={mission}
                onChange={(event) => setMission(event.target.value)}
              />
            </label>

            <div className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Installed Modules</div>
            <div className="rare-module-list">
              {RARE_CAPABILITIES.map((capability) => (
                <button
                  key={capability.id}
                  type="button"
                  className={`rare-module-button ${selectedId === capability.id ? 'active' : ''}`}
                  style={{ '--rare-accent': capability.accent }}
                  onClick={() => setSelectedId(capability.id)}
                >
                  <span className="rare-module-icon">{capability.icon}</span>
                  <span className="rare-module-copy">
                    <strong>{capability.short}</strong>
                    <span>{capability.promise}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl omnipotent-panel rare-artifact-panel" style={{ '--rare-accent': selected.accent }}>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
            <div className="flex items-center justify-between gap-12">
              <div>
                <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">
                  <span className="rare-selected-icon">{selected.icon}</span>
                  {selected.title}
                </div>
                <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-desc">{selected.promise}</div>
              </div>
              <div className="rare-score-ring" style={{ '--score-percent': `${artifact.score}%` }} aria-label={`Truth score ${artifact.score}`}>
                <span>{artifact.score}</span>
              </div>
            </div>
          </div>

          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body flex-col gap-4">
            <div className="rare-badge-row">
              <span className={`badge ${badgeForTruth(artifact.truthState)}`}>{artifact.truthState}</span>
              <span className={`badge ${badgeForRisk(artifact.risk)}`}>{artifact.risk} risk</span>
              <span className="badge badge-cyan">{artifact.primaryLabel}</span>
            </div>

            <div className="rare-summary">
              <div className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Why It Is Rare</div>
              <p>{selected.rare}</p>
            </div>

            <div className="rare-summary">
              <div className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Generated Result</div>
              <p>{artifact.summary}</p>
            </div>

            <div className="prompt-block rare-artifact-block">
              <div className="prompt-block-header">
                <span className="prompt-block-label">{artifact.primaryLabel}</span>
                <button
                  type="button"
                  className="glass-extreme shadow-[0_0_15px_rgba(217,70,239,0.1)] active:scale-95 text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-3xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95-sm"
                  onClick={() => copyArtifact(artifact.primary, artifact.primaryLabel, setCopied)}
                >
                  {copied === artifact.primaryLabel ? 'Copied' : 'Copy'}
                </button>
              </div>
              {artifact.primary}
            </div>

            <div className="rare-proof-grid">
              <div>
                <div className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Proof Gates</div>
                <div className="rare-chip-list">
                  {artifact.gates.map((gate) => (
                    <span key={gate} className="rare-proof-chip">{gate}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Receipts</div>
                <div className="rare-chip-list">
                  {artifact.receipts.map((receipt) => (
                    <span key={receipt} className="rare-receipt-chip">{receipt}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3 rare-installed-grid">
        {moduleArtifacts.map((item) => {
          const capability = RARE_CAPABILITIES.find((cap) => cap.id === item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`glass-extreme rare-installed-glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl ${selectedId === item.id ? 'active' : ''}`}
              style={{ '--rare-accent': capability.accent }}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="rare-installed-topline">
                <span className="rare-module-icon">{capability.icon}</span>
                <span className={`badge ${badgeForTruth(item.truthState)}`}>{item.score}</span>
              </span>
              <strong>{capability.title}</strong>
              <span>{item.summary}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
