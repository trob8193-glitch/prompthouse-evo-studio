import React, { useState, useEffect } from 'react';
import { useWitnessStore } from './witnessStore';
import { RefreshCw, ShieldAlert, Activity, Heart, AlertTriangle, Zap, Cpu, Code } from 'lucide-react';
import './WitnessConsole.css';

/**
 * PH EVO STUDIO — SOVEREIGN WITNESS CONSOLE (THE HUD)
 * ═══════════════════════════════════════════════════════════════
 * The ultimate interface for the 10 Live Editor features.
 */

export const WitnessConsole = () => {
  const { 
    is_hud_open, active_mode, setMode, prompts, traces, truth_scores, 
    active_state, toggleHud, snapshotState, health_status, is_healing,
    runDoctorScan, triggerEvoDoctor, triggerEvoEngineer, triggerEvoUIEngineer
  } = useWitnessStore();
  const [glitchText, setGlitchText] = useState('SOVEREIGN_WITNESS_ACTIVE');
  const [studyRunning, setStudyRunning] = useState(false);
  const BRIDGE_URL = 'http://127.0.0.1:3001';

  const runStudyProtocol = async (protocol) => {
    if (studyRunning) return;
    setStudyRunning(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/api/study/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol }),
      });
      const data = await res.json();
      snapshotState({ ...active_state, protocol, lastStudy: data });
      setGlitchText(`STUDY_${protocol}_DONE`);
    } catch (e) {
      snapshotState({ ...active_state, protocol, lastStudy: { success: false, error: e.message } });
      setGlitchText(`STUDY_${protocol}_ERROR`);
    } finally {
      setStudyRunning(false);
    }
  };

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
            'PATH_OF_REALITY', 'PROMPT_PACKET', 'HEALTH_MATRIX', 'GENOMIC_MIRROR', 'GHOST_EDITOR',
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

          {active_mode === 'HEALTH_MATRIX' && (
            <div className="health-matrix-view scroll-area">
              <div className="matrix-header">
                <div className="status-hero">
                  <div className="sentient-avatar dolphin">🐬</div>
                  <div className="hero-text">
                    <h2>SYSTEM_HEALTH: {Math.round(health_status.score * 100)}%</h2>
                    <p>{health_status.driftCount} DISCOVERED_FAULTS</p>
                  </div>
                  <button 
                    className={`doctor-btn ${is_healing ? 'healing' : ''}`}
                    onClick={() => triggerEvoDoctor()}
                    disabled={is_healing}
                  >
                    {is_healing ? <RefreshCw className="spin" /> : <ShieldAlert />}
                    {is_healing ? 'HEALING_IN_PROGRESS...' : 'INITIATE_EVO_DOCTOR'}
                  </button>
                </div>
                
                <div className="engineer-actions">
                  <button className="action-pill engineer" onClick={() => triggerEvoEngineer()}>
                    <div className="sentient-avatar monkey">🐒</div> EVOLVE_ARCHITECTURE
                  </button>
                  <button className="action-pill ui-engineer" onClick={() => triggerEvoUIEngineer()}>
                    <div className="sentient-avatar octopus">🐙</div> REFINE_UI_ORGANS
                  </button>
                </div>
              </div>

              <div className="node-grid">
                {Object.keys(truth_scores).length === 0 ? (
                  <div className="no-nodes">NO_ACTIVE_NODES_IN_MEMORY. RUN_SCAN_TO_POPULATE.</div>
                ) : (
                  Object.entries(truth_scores).map(([path, report]) => (
                    <div key={path} className={`node-card ${report.severity === 'CRITICAL' ? 'unhealthy' : 'healthy'}`}>
                      <div className="node-icon">
                        {report.severity === 'CRITICAL' ? <AlertTriangle className="warning-symbol" /> : <Heart />}
                      </div>
                      <div className="node-info">
                        <div className="node-path">{path.split('/').pop()}</div>
                        <div className="node-status">{report.severity || 'ALIGNED'}</div>
                      </div>
                      {report.severity === 'CRITICAL' && <div className="red-warning-badge">! WARNING</div>}
                    </div>
                  ))
                )}
              </div>
              
              <button className="full-scan-btn" onClick={() => runDoctorScan()}>
                RUN_FULL_DIAGNOSTIC_SCAN
              </button>
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
                    onClick={() => runStudyProtocol(p)}
                    disabled={studyRunning}
                  >
                    {p.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <div className="realization-feed">
                <h4>LATEST_REALIZATIONS:</h4>
                {active_state?.lastStudy?.success === false ? (
                  <div className="realization-item">ERROR: {active_state.lastStudy.error || 'Study protocol failed.'}</div>
                ) : active_state?.lastStudy ? (
                  <div className="realization-item">LAST: {JSON.stringify(active_state.lastStudy).slice(0, 280)}</div>
                ) : (
                  <div className="realization-item">No study runs yet.</div>
                )}
              </div>
            </div>
          )}

          {active_mode !== 'PATH_OF_REALITY' && 
           active_mode !== 'PROMPT_PACKET' && 
           active_mode !== 'GENOMIC_MIRROR' && 
           active_mode !== 'SOVEREIGN_STUDY' && (
            <div className="mode-ghost">
              {active_mode} SYSTEM CONNECTED. AWAITING STREAM...
            </div>
          )}
        </div>

        <div className="hud-footer">
          <div className="metric">IQ: {active_state.iq || '105.4'}</div>
          <div className={`metric ${health_status.score < 0.8 ? 'danger-text' : ''}`}>
            TRUTH_STABILITY: {Math.round(health_status.score * 1000) / 10}%
          </div>
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
