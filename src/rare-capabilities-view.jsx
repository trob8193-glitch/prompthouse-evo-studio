import React, { useMemo, useState } from 'react';
import { RARE_CAPABILITIES, buildRareArtifact } from './rare-capabilities-engine.js';

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

  const selected = RARE_CAPABILITIES.find((capability) => capability.id === selectedId) || RARE_CAPABILITIES[0];
  const artifact = useMemo(() => buildRareArtifact(selectedId, mission), [selectedId, mission]);
  const moduleArtifacts = useMemo(
    () => RARE_CAPABILITIES.map((capability) => buildRareArtifact(capability.id, mission)),
    [mission],
  );
  const averageScore = Math.round(moduleArtifacts.reduce((sum, item) => sum + item.score, 0) / moduleArtifacts.length);
  const readyCount = moduleArtifacts.filter((item) => item.truthState === 'verified-ready').length;

  return (
    <div className="rare-os-view flex-col animate-in">
      <div className="flex-between rare-os-titlebar">
        <div>
          <div className="page-title">Rare Capability OS</div>
          <div className="page-subtitle">Ten installed PromptHouse layers for proof, canon, permissions, extensions, marketplace packets, and receipt-backed memory.</div>
        </div>
        <div className="rare-os-status-row">
          <span className="badge badge-pink">S+++++ dark lock</span>
          <span className="badge badge-cyan">{RARE_CAPABILITIES.length} installed</span>
          <span className={`badge ${badgeForTruth(artifact.truthState)}`}>{artifact.truthState}</span>
        </div>
      </div>

      <div className="grid-3">
        <div className="card omnipotent-panel rare-metric-card">
          <div className="rare-metric-value">{RARE_CAPABILITIES.length}</div>
          <div className="rare-metric-label">Modules Installed</div>
          <div className="rare-metric-detail">Proof, audit, canon, firewall, market, court, rebuild, score, extension, memory.</div>
        </div>
        <div className="card omnipotent-panel rare-metric-card">
          <div className="rare-metric-value">{averageScore}</div>
          <div className="rare-metric-label">Average Truth Score</div>
          <div className="rare-metric-detail">{readyCount} verified-ready layers on the current mission text.</div>
        </div>
        <div className="card omnipotent-panel rare-metric-card">
          <div className="rare-metric-value">{artifact.risk.toUpperCase()}</div>
          <div className="rare-metric-label">Current Risk Gate</div>
          <div className="rare-metric-detail">External writes, secrets, deploys, payments, and destructive actions stay blocked without proof.</div>
        </div>
      </div>

      <div className="grid-builder rare-os-workbench">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Mission Kernel</div>
            <div className="card-desc">All ten modules regenerate from this mission and keep a no-fake-completion boundary.</div>
          </div>
          <div className="card-body flex-col">
            <label className="field">
              <span className="field-label">Mission</span>
              <textarea
                className="field-textarea rare-mission-input"
                value={mission}
                onChange={(event) => setMission(event.target.value)}
              />
            </label>

            <div className="field-label">Installed Modules</div>
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

        <div className="card omnipotent-panel rare-artifact-panel" style={{ '--rare-accent': selected.accent }}>
          <div className="card-header">
            <div className="flex-between gap-12">
              <div>
                <div className="card-title">
                  <span className="rare-selected-icon">{selected.icon}</span>
                  {selected.title}
                </div>
                <div className="card-desc">{selected.promise}</div>
              </div>
              <div className="rare-score-ring" style={{ '--score-percent': `${artifact.score}%` }} aria-label={`Truth score ${artifact.score}`}>
                <span>{artifact.score}</span>
              </div>
            </div>
          </div>

          <div className="card-body flex-col">
            <div className="rare-badge-row">
              <span className={`badge ${badgeForTruth(artifact.truthState)}`}>{artifact.truthState}</span>
              <span className={`badge ${badgeForRisk(artifact.risk)}`}>{artifact.risk} risk</span>
              <span className="badge badge-cyan">{artifact.primaryLabel}</span>
            </div>

            <div className="rare-summary">
              <div className="field-label">Why It Is Rare</div>
              <p>{selected.rare}</p>
            </div>

            <div className="rare-summary">
              <div className="field-label">Generated Result</div>
              <p>{artifact.summary}</p>
            </div>

            <div className="prompt-block rare-artifact-block">
              <div className="prompt-block-header">
                <span className="prompt-block-label">{artifact.primaryLabel}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyArtifact(artifact.primary, artifact.primaryLabel, setCopied)}
                >
                  {copied === artifact.primaryLabel ? 'Copied' : 'Copy'}
                </button>
              </div>
              {artifact.primary}
            </div>

            <div className="rare-proof-grid">
              <div>
                <div className="field-label">Proof Gates</div>
                <div className="rare-chip-list">
                  {artifact.gates.map((gate) => (
                    <span key={gate} className="rare-proof-chip">{gate}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="field-label">Receipts</div>
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
              className={`card rare-installed-card ${selectedId === item.id ? 'active' : ''}`}
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
