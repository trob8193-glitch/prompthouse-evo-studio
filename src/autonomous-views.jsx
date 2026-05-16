// autonomous-views.jsx — Autonomous App Builder UI
// Bots build apps in real-time with animated collaboration pipeline

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BotCharacter, BotStageCharacter, EXPRESSIONS, MOTIONS } from './bot-characters.js';
import { BOT_ROSTER } from './engine.js';
import { APP_TYPES, generateApp, runBotPipeline, downloadAsZip, downloadFile, writeToLocalDisk } from './autonomous-builder.js';
import { BotBus } from './bot-orb.jsx';


// ═══════════════════════════════════════════════════════════
// AUTONOMOUS BUILDER VIEW
// ═══════════════════════════════════════════════════════════

export function AutonomousBuilderView() {
  const [mission, setMission] = useState('');
  const [appName, setAppName] = useState('');
  const [features, setFeatures] = useState('home, auth, dashboard, settings');
  const [appType, setAppType] = useState('flutter');
  const [building, setBuilding] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const timelineRef = useRef(null);

  const startBuild = useCallback(() => {
    if (!mission.trim()) return;
    setBuilding(true);
    setTimeline([]);
    setCurrentStep(-1);
    setResult(null);
    setSelectedFile(null);

    const name = appName.trim() || mission.split(' ').slice(0, 3).join('_').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const pipeline = runBotPipeline(mission, appType, name, features);

    // Animate timeline step by step
    pipeline.timeline.forEach((step, i) => {
      setTimeout(() => {
        setTimeline(prev => [...prev, step]);
        setCurrentStep(i);
        BotBus.emit({ action: step.action });

        if (timelineRef.current) {
          timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
        }

        // Last step — reveal result
        if (i === pipeline.timeline.length - 1) {
          setTimeout(() => {
            setResult(pipeline);
            setBuilding(false);
          }, 800);
        }
      }, (i + 1) * 1200);
    });
  }, [mission, appName, features, appType]);

  const activeBotId = timeline.length > 0 ? timeline[timeline.length - 1].bot : 'evo';
  const activeBot = BOT_ROSTER.find(b => b.id === activeBotId) || BOT_ROSTER[0];
  const activeStep = timeline.length > 0 ? timeline[timeline.length - 1] : null;

  const handleWriteToDisk = async () => {
    try {
      await writeToLocalDisk(result.app);
      alert(`Success! Wrote ${result.fileCount} files to generated_apps/${result.app.name}/`);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="flex-col">
      <div>
        <div className="page-title">🤖 Autonomous App Builder</div>
        <div className="page-subtitle">Tell the bots what to build. They design, code, audit, and deliver — end to end. Real code. Real files. No Theatrical-Stubs.</div>
      </div>

      {/* Mission Input */}
      <div className="card" style={{ border: '1px solid var(--accent-gold)', background: 'var(--bg-void)' }}>
        <div className="card-body flex-col">
          <div className="field">
            <label className="field-label">🎯 Mission — What are we building?</label>
            <textarea className="field-textarea" value={mission} onChange={e => setMission(e.target.value)}
              ghostInput="Build a task management app with auth, dashboard, task lists, and settings..."
              style={{ minHeight: 80 }} disabled={building} />
          </div>
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="field">
              <label className="field-label">App Name</label>
              <input className="field-input" value={appName} onChange={e => setAppName(e.target.value)}
                ghostInput="my_awesome_app" disabled={building} />
            </div>
            <div className="field">
              <label className="field-label">Features (comma separated)</label>
              <input className="field-input" value={features} onChange={e => setFeatures(e.target.value)}
                ghostInput="home, auth, dashboard, settings" disabled={building} />
            </div>
            <div className="field">
              <label className="field-label">Platform</label>
              <select className="field-select" value={appType} onChange={e => setAppType(e.target.value)} disabled={building}>
                {APP_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={startBuild} disabled={building || !mission.trim()}
            style={{ alignSelf: 'flex-end', minWidth: 200, fontSize: 14 }}>
            {building ? '🔄 Building...' : '🚀 Build App — Full Autonomous'}
          </button>
        </div>
      </div>

      {/* Build Timeline + Active Bot */}
      {timeline.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          {/* Active Bot Character */}
          <div className="card" style={{
            background: 'linear-gradient(180deg, #030508 0%, #0a0e1a 100%)',
            border: `1px solid ${activeBot.palette.accent}33`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 24, minHeight: 340,
          }}>
            <BotCharacter
              bot={activeBot}
              expression={activeStep?.expression || 'neutral'}
              motion={activeStep?.motion || 'idle'}
              isSpeaking={building && currentStep === timeline.length - 1}
              size="lg"
              showGlow={true}
              showExpression={true}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: activeBot.palette.accent }}>{activeBot.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2 }}>
                {activeStep?.action || 'READY'}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card" ref={timelineRef} style={{ maxHeight: 400, overflow: 'auto', padding: 0 }}>
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
                BUILD PIPELINE — {timeline.length} / 11 steps
              </div>
              {timeline.map((step, i) => {
                const bot = BOT_ROSTER.find(b => b.id === step.bot) || BOT_ROSTER[0];
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 12, marginBottom: 12, padding: '10px 12px',
                    background: i === currentStep ? `${bot.palette.primary}18` : 'transparent',
                    borderRadius: 10, border: `1px solid ${i === currentStep ? bot.palette.accent + '44' : 'transparent'}`,
                    animation: i === currentStep ? 'bubble-in 0.3s ease both' : 'none',
                  }}>
                    <div style={{ width: 36, height: 36, flexShrink: 0, overflow: 'hidden' }}>
                      <BotCharacter bot={bot} expression={step.expression} motion="idle" size="sm"
                        showGlow={false} showExpression={false} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: bot.palette.accent }}>{bot.name}</span>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                          {step.action}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.message}</div>
                    </div>
                    <div style={{ fontSize: 16, flexShrink: 0 }}>{i <= currentStep ? '✅' : '⏳'}</div>
                  </div>
                );
              })}
              {building && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', color: 'var(--text-muted)', fontSize: 11 }}>
                  <div className="bot-speaking-dots" style={{ color: activeBot.palette.accent }}><span /><span /><span /></div>
                  Processing...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Files */}
      {result && (
        <div className="card" style={{ border: '1px solid rgba(74,222,128,0.3)' }}>
          <div className="card-header">
            <div className="flex-between">
              <div>
                <div className="card-title">✅ Build Complete — {result.app.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                  {result.fileCount} files · {result.app.type} · {result.app.features.join(', ')}
                </div>
              </div>
              <div className="flex-row gap-8">
                <button className="btn btn-secondary" onClick={() => downloadAsZip(result.app)}>
                  📦 Download ZIP
                </button>
                <button className="btn btn-primary" onClick={handleWriteToDisk} style={{ background: 'var(--accent-green)' }}>
                  💾 Write to Local Disk
                </button>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
            {/* File tree */}
            <div style={{ borderRight: '1px solid var(--border-dim)', paddingRight: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                FILE TREE
              </div>
              {Object.keys(result.app.files).map(path => (
                <div key={path} onClick={() => setSelectedFile(path)}
                  style={{
                    padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                    fontFamily: 'var(--font-mono)', color: selectedFile === path ? 'var(--accent-green)' : 'var(--text-secondary)',
                    background: selectedFile === path ? 'rgba(74,222,128,0.08)' : 'transparent',
                    marginBottom: 2, transition: 'all 0.15s',
                  }}>
                  📄 {path}
                </div>
              ))}
            </div>
            {/* File preview */}
            <div>
              {selectedFile ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                      {selectedFile}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        navigator.clipboard.writeText(result.app.files[selectedFile]);
                      }}>📋 Copy</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        downloadFile(selectedFile, result.app.files[selectedFile]);
                      }}>💾 Save</button>
                    </div>
                  </div>
                  <div className="prompt-block" style={{ maxHeight: 400, fontSize: 11, lineHeight: 1.6 }}>
                    {result.app.files[selectedFile]}
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <div className="empty-icon">📂</div>
                  <div className="empty-title">Select a file to preview</div>
                  <div className="empty-sub">Click any file in the tree to see its code</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
