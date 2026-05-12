import React, { useState, useEffect } from 'react';
import { useWitnessStore } from './witnessStore';
import './WitnessConsole.css';

/**
 * PH EVO STUDIO — SOVEREIGN WITNESS CONSOLE (THE HUD)
 * ═══════════════════════════════════════════════════════════════
 * The ultimate interface for the 10 Live Editor features.
 */

export const WitnessConsole = () => {
  const { is_hud_open, active_mode, setMode, prompts, traces, truth_scores, active_state, toggleHud } = useWitnessStore();
  const [glitchText, setGlitchText] = useState('SOVEREIGN_WITNESS_ACTIVE');

  if (!is_hud_open) return (
    <button className="witness-toggle-btn" onClick={toggleHud}>
      <span className="pulse-dot"></span> WITNESS_HUD
    </button>
  );

  return (
    <div className="witness-overlay-container">
      <div className="witness-hud-panel glassmorphic">
        <div className="hud-header">
          <div className="hud-title">
            <span className="evo-logo">PH_EVO</span> // {glitchText}
          </div>
          <div className="hud-controls">
            <button className="hud-close-btn" onClick={toggleHud}>×</button>
          </div>
        </div>

        <div className="hud-nav">
          {[
            'PATH_OF_REALITY', 'PROMPT_PACKET', 'GENOMIC_MIRROR', 'GHOST_EDITOR',
            'STATE_MORPH', 'GENETIC_DIFF', 'TRUTH_HIGH', 'SOVEREIGN_STUDY', 'LOGIC_SCULPT'
          ].map(m => (
            <button 
              key={m} 
              className={`nav-item ${active_mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="hud-content">
          {active_mode === 'PATH_OF_REALITY' && (
            <div className="trace-list scroll-area">
              {traces.map(t => (
                <div key={t.id} className={`trace-item ${t.status}`}>
                  <span className="timestamp">{new Date(t.timestamp).toLocaleTimeString()}</span>
                  <span className="trace-msg">[{t.source}] {t.path} : {t.status}</span>
                </div>
              ))}
            </div>
          )}

          {active_mode === 'PROMPT_PACKET' && (
            <div className="prompt-viewer scroll-area">
              {prompts.map(p => (
                <div key={p.id} className="prompt-card">
                  <div className="prompt-meta">CHANNEL: {p.type} | ID: {p.id.slice(0, 8)}</div>
                  <pre className="code-block prompt-raw">{p.payload}</pre>
                  <div className="prompt-response-label">RESPONSE_DNA:</div>
                  <pre className="code-block response-raw">{p.response}</pre>
                </div>
              ))}
            </div>
          )}

          {active_mode === 'GENOMIC_MIRROR' && (
            <div className="genomic-feed scroll-area">
              <div className="dna-stream-animation">
                <div className="dna-line">ATCGGCTA... [ETCHING_SRC/CORE/LOGIC.js]</div>
                <div className="dna-line">GGCTATCG... [MUTATING_V4_RESTORED]</div>
              </div>
            </div>
          )}

          {active_mode === 'SOVEREIGN_STUDY' && (
            <div className="study-center-view">
              <div className="study-header">
                <h3>SOVEREIGN_STUDY_CENTER // IQ: {active_state.iq || '105.4'}</h3>
                <p>Select a protocol to initiate autonomous training.</p>
              </div>
              <div className="protocol-grid">
                {[
                  'DREAM_CYCLE', 'SCAVENGER_LOOP', 'FEATURE_FUSION', 'TRUTH_STRESS',
                  'COMPACTION_TRAINER', 'CROSS_POLLINATION', 'FUTURE_DRAFTING', 'FRUGAL_CHALLENGE',
                  'NUCLEAR_AUDIT', 'SCORCH_EARTH'
                ].map(p => (
                  <button 
                    key={p} 
                    className={`protocol-btn ${p === 'NUCLEAR_AUDIT' ? 'truth-primary' : p === 'SCORCH_EARTH' ? 'danger-zone' : ''}`}
                    onClick={() => }
                  >
                    {p.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <div className="realization-feed">
                <h4>LATEST_REALIZATIONS:</h4>
                <div className="realization-item">SYSTEM: Identified redundant logic in VercelAdapter. Compaction recommended.</div>
                <div className="realization-item">DREAM: Simulated hybrid database architecture. IQ gain +0.02.</div>
              </div>
            </div>
          )}

          {active_mode !== 'PATH_OF_REALITY' && 
           active_mode !== 'PROMPT_PACKET' && 
           active_mode !== 'GENOMIC_MIRROR' && 
           active_mode !== 'SOVEREIGN_STUDY' && (
            <div className="mode-placeholder">
              {active_mode} SYSTEM CONNECTED. AWAITING STREAM...
            </div>
          )}
        </div>

        <div className="hud-footer">
          <div className="metric">IQ: 105.4</div>
          <div className="metric">TRUTH_STABILITY: 98.2%</div>
          <div className={`metric credits ${active_state.credits < 500 ? 'low-reserves' : ''}`}>
             CREDITS: {active_state.credits || '...'} 
             {active_state.credits < 500 && <span className="survival-warning"> [ECONOMIC_SURVIVAL_ACTIVE]</span>}
          </div>
          <div className="protocol-badges">
             {active_state.protocol === 'RECYCLING' && <span className="badge recycling">RECYCLING_ACTIVE</span>}
             {active_state.protocol === 'HYBRID' && <span className="badge hybrid">HYBRID_DRAFTING</span>}
             <span className="badge distillation">DISTILLATION_ON</span>
          </div>
        </div>
      </div>
    </div>
  );
};
