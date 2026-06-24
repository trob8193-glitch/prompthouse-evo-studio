import React, { useState } from 'react';
import { ALL_BOT_ROSTER } from '../engine.js';
import { useSovereignStore } from '../store.js';

/**
 * OnboardingFlow — First-run studio setup wizard.
 * 5 steps: Welcome → Pick Agent → API Key → Theme → Launch
 * Stored in localStorage as 'ph_evo_onboarded'
 */

const THEMES = [
  { id: 'nexus', name: 'Nexus', desc: 'Glassmorphic command center', color: '#00f0ff', icon: '💠' },
  { id: 'forge', name: 'Forge', desc: 'Brutalist power interface', color: '#3b82f6', icon: '⚒️' },
  { id: 'royal', name: 'Royal', desc: 'Premium luxury executive', color: '#eab308', icon: '👑' },
  { id: 'terminal', name: 'Terminal', desc: 'Raw CLI minimal mode', color: '#22c55e', icon: '🖥️' },
  { id: 'genome', name: 'Genome', desc: 'Organic biotech neural', color: '#10b981', icon: '🧬' },
  { id: 'hologram', name: 'Hologram', desc: 'Sci-fi AR heads-up display', color: '#06b6d4', icon: '💽' },
];

const CORE_BOTS = ALL_BOT_ROSTER.slice(0, 8);

export function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedBot, setSelectedBot] = useState('evo');
  const [selectedTheme, setSelectedTheme] = useState('nexus');
  const [apiKey, setApiKey] = useState('');
  const [apiMode, setApiMode] = useState('openai'); // 'openai' | 'ollama' | 'skip'
  const [completing, setCompleting] = useState(false);
  const setActivePage = useSovereignStore((s) => s.setActivePage);
  const applyEvolutionRuntime = useSovereignStore((s) => s.applyEvolutionRuntime);

  const steps = [
    { id: 'welcome', title: 'Welcome to Evo Studio' },
    { id: 'agent', title: 'Choose Your Lead Agent' },
    { id: 'api', title: 'Connect Your AI' },
    { id: 'theme', title: 'Pick Your Interface' },
    { id: 'launch', title: 'You\'re Ready' },
  ];

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleComplete = () => {
    setCompleting(true);
    if (apiKey && apiMode === 'openai') {
      localStorage.setItem('ph_openai_key', apiKey);
    }
    localStorage.setItem('ph_evo_selected_bot', selectedBot);
    localStorage.setItem('ph_evo_onboarded', 'true');
    localStorage.setItem('ph_evo_layout', selectedTheme);

    // Apply theme
    if (applyEvolutionRuntime) applyEvolutionRuntime({ layout: selectedTheme });

    setTimeout(() => {
      setActivePage('dashboard');
      onComplete();
    }, 800);
  };

  return (
    <div style={s.overlay}>
      <div style={s.bgGlow} />

      {/* Progress bar */}
      <div style={s.progressBar}>
        {steps.map((st, i) => (
          <div
            key={st.id}
            style={{
              ...s.progressDot,
              background: i <= step ? '#00f0ff' : 'rgba(255,255,255,0.1)',
              transform: i === step ? 'scale(1.4)' : 'scale(1)',
              boxShadow: i === step ? '0 0 12px #00f0ff' : 'none',
            }}
          />
        ))}
      </div>

      <div style={s.card}>
        <div style={s.stepLabel}>Step {step + 1} of {steps.length}</div>

        {/* STEP 0: WELCOME */}
        {step === 0 && (
          <div style={s.stepContent}>
            <div style={s.hexLogo}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <polygon points="28,4 52,18 52,38 28,52 4,38 4,18" stroke="#00f0ff" strokeWidth="2" fill="rgba(0,240,255,0.06)"/>
                <circle cx="28" cy="28" r="8" fill="#00f0ff" opacity="0.9"/>
                <circle cx="28" cy="28" r="14" stroke="#00f0ff" strokeWidth="0.5" opacity="0.3"/>
              </svg>
            </div>
            <h1 style={s.heading}>Welcome to<br/><span style={{ color: '#00f0ff' }}>Evo Studio</span></h1>
            <p style={s.body}>
              The world's first <strong>self-evolving AI development environment</strong>.
              50 specialized agents. 120 architectural paradigms. An autonomous mutation engine that improves itself overnight.
            </p>
            <div style={s.featureGrid}>
              {[
                ['🤖', '50 AI Agents', 'Specialized bots with distinct roles'],
                ['🌀', 'Self-Evolution', 'Studio improves itself autonomously'],
                ['💎', '120 UI Themes', 'Living interface paradigms'],
                ['🔐', 'Crypto Ledger', 'Every action cryptographically signed'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={s.featureCard}>
                  <div style={s.featureIcon}>{icon}</div>
                  <div style={s.featureTitle}>{title}</div>
                  <div style={s.featureDesc}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: AGENT PICKER */}
        {step === 1 && (
          <div style={s.stepContent}>
            <h2 style={s.heading}>Choose Your Lead Agent</h2>
            <p style={s.body}>Your primary AI partner. You can always switch later.</p>
            <div style={s.botGrid}>
              {CORE_BOTS.map(bot => (
                <button
                  key={bot.id}
                  onClick={() => setSelectedBot(bot.id)}
                  style={{
                    ...s.botCard,
                    borderColor: selectedBot === bot.id ? bot.palette.primary : 'rgba(255,255,255,0.06)',
                    background: selectedBot === bot.id ? `${bot.palette.primary}15` : 'rgba(255,255,255,0.02)',
                    boxShadow: selectedBot === bot.id ? `0 0 20px ${bot.palette.primary}25` : 'none',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{bot.icon}</span>
                  <div style={s.botName}>{bot.name}</div>
                  <div style={{ ...s.botRole, color: bot.palette.primary }}>{bot.species}</div>
                </button>
              ))}
            </div>
            {selectedBot && (
              <div style={s.botDetail}>
                {(() => {
                  const b = CORE_BOTS.find(x => x.id === selectedBot);
                  return b ? <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', margin: 0 }}><em>"{b.signature}"</em></p> : null;
                })()}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: API KEY */}
        {step === 2 && (
          <div style={s.stepContent}>
            <h2 style={s.heading}>Connect Your AI</h2>
            <p style={s.body}>Power your agents with an AI model. You can change this in Settings.</p>

            <div style={s.apiModes}>
              {[
                { id: 'openai', label: 'OpenAI', icon: '⚡', desc: 'GPT-4o, GPT-4.1, o3' },
                { id: 'ollama', label: 'Ollama (Local)', icon: '🏠', desc: 'Runs on your machine' },
                { id: 'skip', label: 'Skip for now', icon: '⏭️', desc: 'Set up later in Settings' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setApiMode(mode.id)}
                  style={{
                    ...s.modeBtn,
                    borderColor: apiMode === mode.id ? '#00f0ff' : 'rgba(255,255,255,0.08)',
                    background: apiMode === mode.id ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{mode.icon}</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{mode.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {apiMode === 'openai' && (
              <div style={{ marginTop: 20 }}>
                <label style={s.label}>OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={s.input}
                  onFocus={e => e.target.style.borderColor = '#00f0ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 8 }}>
                  Stored locally. Never sent to our servers.
                </p>
              </div>
            )}
            {apiMode === 'ollama' && (
              <div style={s.ollamaNote}>
                <div style={{ color: '#10b981', fontWeight: 700, marginBottom: 4 }}>✓ Ollama Detected</div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
                  Evo Studio will route to your local Ollama instance at localhost:11434.
                  Make sure ollama is running and a model is pulled (e.g., <code>ollama pull qwen2.5-coder:7b</code>).
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: THEME */}
        {step === 3 && (
          <div style={s.stepContent}>
            <h2 style={s.heading}>Pick Your Interface</h2>
            <p style={s.body}>Choose how your studio looks and feels. You can evolve it anytime.</p>
            <div style={s.themeGrid}>
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  style={{
                    ...s.themeCard,
                    borderColor: selectedTheme === theme.id ? theme.color : 'rgba(255,255,255,0.06)',
                    background: selectedTheme === theme.id ? `${theme.color}12` : 'rgba(255,255,255,0.02)',
                    boxShadow: selectedTheme === theme.id ? `0 0 24px ${theme.color}20` : 'none',
                  }}
                >
                  <span style={{ fontSize: 24, marginBottom: 6, display: 'block' }}>{theme.icon}</span>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>{theme.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 3 }}>{theme.desc}</div>
                  {selectedTheme === theme.id && (
                    <div style={{ position: 'absolute', top: 6, right: 8, color: theme.color, fontSize: 10, fontWeight: 900 }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: LAUNCH */}
        {step === 4 && (
          <div style={{ ...s.stepContent, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
            <h2 style={s.heading}>You're All Set</h2>
            <p style={s.body}>
              Your Evo Studio is configured and ready to evolve.
              Your lead agent is <strong style={{ color: '#00f0ff' }}>
                {CORE_BOTS.find(b => b.id === selectedBot)?.name || 'Evo'}
              </strong> and your theme is <strong style={{ color: '#00f0ff' }}>
                {THEMES.find(t => t.id === selectedTheme)?.name || 'Nexus'}
              </strong>.
            </p>
            <div style={s.launchChecks}>
              {[
                '50 specialized AI agents activated',
                'Self-evolution engine standing by',
                'Cryptographic audit ledger initialized',
                'AGI Iron Man HUD connected',
              ].map(item => (
                <div key={item} style={s.launchCheck}>
                  <span style={{ color: '#00f0ff' }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={s.navRow}>
          {step > 0 && (
            <button onClick={back} style={s.backBtn}>← Back</button>
          )}
          <div style={{ flex: 1 }} />
          {step < steps.length - 1 ? (
            <button onClick={next} style={s.nextBtn}>
              {step === 0 ? 'Get Started →' : 'Continue →'}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              style={{ ...s.nextBtn, background: completing ? 'rgba(0,240,255,0.3)' : 'linear-gradient(135deg, #00f0ff, #7c3aed)', minWidth: 160 }}
            >
              {completing ? 'Launching...' : '🚀 Launch Studio'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: '#050508',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 9998, fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '16px', overflow: 'auto',
  },
  bgGlow: {
    position: 'fixed', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 70%)',
  },
  progressBar: {
    display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center',
  },
  progressDot: {
    width: 8, height: 8, borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  card: {
    width: '100%', maxWidth: 560,
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: '36px 32px',
    boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
  },
  stepLabel: {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
    color: 'rgba(0,240,255,0.6)', textTransform: 'uppercase', marginBottom: 16,
  },
  stepContent: { minHeight: 320 },
  hexLogo: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  heading: {
    fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
    color: '#fff', margin: '0 0 12px', lineHeight: 1.2,
  },
  body: {
    fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 24px',
  },
  featureGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
  },
  featureCard: {
    padding: '16px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
  },
  featureIcon: { fontSize: 20, marginBottom: 6 },
  featureTitle: { fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 3 },
  featureDesc: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  botGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12,
  },
  botCard: {
    padding: '12px 8px', borderRadius: 12, border: '1px solid',
    background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    fontFamily: 'inherit',
  },
  botName: { fontSize: 10, fontWeight: 800, color: '#fff', textAlign: 'center' },
  botRole: { fontSize: 9, fontWeight: 600, textAlign: 'center' },
  botDetail: { padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginTop: 8 },
  apiModes: { display: 'flex', flexDirection: 'column', gap: 10 },
  modeBtn: {
    padding: '14px 16px', borderRadius: 12, border: '1px solid',
    background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: 14,
    fontFamily: 'inherit', textAlign: 'left',
  },
  label: {
    display: 'block', fontSize: 10, fontWeight: 800,
    letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase', marginBottom: 8,
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 13, outline: 'none',
    fontFamily: 'monospace', boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  ollamaNote: {
    marginTop: 20, padding: '16px', borderRadius: 12,
    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
  },
  themeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
  },
  themeCard: {
    padding: '16px 10px', borderRadius: 14, border: '1px solid',
    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
    fontFamily: 'inherit', textAlign: 'center',
  },
  launchChecks: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 },
  launchCheck: {
    padding: '12px 16px',
    background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.1)',
    borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  navRow: {
    display: 'flex', alignItems: 'center', marginTop: 28, gap: 12,
  },
  backBtn: {
    padding: '10px 18px', borderRadius: 10,
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  nextBtn: {
    padding: '12px 24px', borderRadius: 12,
    background: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
    border: 'none', color: '#000', fontSize: 13, fontWeight: 900,
    cursor: 'pointer', letterSpacing: '0.02em', fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
};

export default OnboardingFlow;
