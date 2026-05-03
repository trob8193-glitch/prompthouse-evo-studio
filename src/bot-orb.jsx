import React, { useState, useEffect, useCallback, useRef } from 'react';
import './bot-animations.css';
import { BotCharacter, EXPRESSIONS, MOTIONS } from './bot-characters.jsx';
import { BOT_ROSTER } from './engine.js';

// ── Correct emoji map (unicode literals avoid encoding issues) ──
export const BOT_EMOJI = {
  evo:         '\uD83E\uDD81', // 🦁
  dev:         '\uD83D\uDC06', // 🐆 (using cheetah-like for panther)
  builder:     '\uD83D\uDC3B', // 🐻
  verifier:    '\uD83E\uDD89', // 🦉
  companion:   '\uD83E\uDD8A', // 🦊
  conductor:   '\uD83E\uDD85', // 🦅
  boundary:    '\uD83E\uDD8F', // 🦏
  ledger:      '\uD83D\uDC26', // 🐦 (raven)
  memory:      '\uD83D\uDC18', // 🐘
  heartbeat:   '\uD83D\uDC06', // 🐆 (cheetah)
  sovereignty: '\uD83D\uDC2F', // 🐯
};

export const BOT_AVATARS = {
  evo: '/bots/evo.png',
  dev: '/bots/dev.png',
  builder: '/bots/builder.png',
  conductor: '/bots/conductor.png',
  verifier: '/bots/verifier.png',
  sovereignty: '/bots/sovereignty.png',
  beaver: '/bots/beaver.png',
  mantis: '/bots/mantis.png',
  orca: '/bots/orca.png',
  falcon: '/bots/falcon.png',
  rhino: '/bots/rhino.png',
  wolf: '/bots/wolf.png',
  lynx: '/bots/lynx.png',
  raven: '/bots/raven.png',
  elephant: '/bots/elephant.png',
  owl: '/bots/owl.png',
  fox: '/bots/fox.png',
  foxhound: '/bots/foxhound.png',
  bearcat: '/bots/bearcat.png',
  cheetah: '/bots/cheetah.png',
  panther: '/bots/panther.png',
};

const BOT_COLORS = {
  evo: '#f5c842', dev: '#22d3ee', builder: '#4ade80', verifier: '#8b5cf6',
  companion: '#fb923c', conductor: '#0f766e', boundary: '#ef4444',
  ledger: '#c4b5fd', memory: '#38bdf8', heartbeat: '#22c55e', sovereignty: '#ea580c',
};

// Which bot is active per view
const VIEW_BOT_MAP = {
  builder:   'evo',
  mission:   'conductor',
  chain:     'builder',
  vault:     'memory',
  battle:    'verifier',
  export:    'ledger',
  chat:      'evo',
  intent:    'companion',
  dna:       'verifier',
  templates: 'memory',
  repair:    'dev',
  botstage:  'sovereignty',
  agentctl:  'heartbeat',
  autobuilder: 'builder',
  code:      'dev',
  arch:      'conductor',
  cli:       'builder',
  flutter:   'dev',
  packs:     'evo',
  cast:      'sovereignty',
  modules:   'ledger',
  history:   'memory',
};

// Contextual bot lines per view + action
const BOT_LINES = {
  evo: {
    idle: ["Mission received. What are we building?", "Sovereign mode: active. Give me the objective.", "Ready for intake. Speak your mission."],
    generate: ["Stack compiled. Running readiness check...", "Prompt stack generated. Verifier is reviewing.", "Output locked. Want me to stress-test this?"],
    copy: ["Copied to clipboard. Deploy it.", "Prompt extracted. Use it well.", "Locked and copied. Mission continues."],
    save: ["Archived in Vault. Canon preserved.", "Saved. Memory logged.", "Vault entry confirmed."],
  },
  dev: {
    idle: ["Dev mode active. Show me the code problem.", "No stubs. No mocks. Real code only.", "Ready to build. What's the stack?"],
    generate: ["Code generated. Run flutter analyze.", "Implementation complete. Check for TODOs.", "File structure ready. Connect the dots."],
    copy: ["Code copied. Paste and verify.", "Build command ready.", "Run it. Report back."],
    save: ["Code logged in Vault.", "Implementation archived.", "Saved. Next feature?"],
  },
  builder: {
    idle: ["Builder active. What needs constructing?", "I make it real. Not just planned.", "Give me the feature name."],
    generate: ["Artifact assembled.", "Files constructed. Check the output.", "Built. Audit before deploying."],
    copy: ["Copied. Build it.", "Scaffold ready.", "Construct initiated."],
    save: ["Artifact saved.", "Build archived.", "Vault entry created."],
  },
  verifier: {
    idle: ["Verifier scanning. Proof required.", "Show me the evidence.", "Nothing ships without my audit."],
    generate: ["Running quality check...", "Scoring completeness and realism...", "Gate check initiated."],
    copy: ["Verified. Use it.", "Audit passed — copied.", "Evidence confirmed."],
    save: ["Verification logged.", "Proof archived.", "Audit trail saved."],
  },
  companion: {
    idle: ["Hey! What are you trying to do? I'll translate it.", "Let me bridge your intent to execution.", "Not sure what domain? I'll figure it out with you."],
    generate: ["Got it — routing to the right bot.", "Intent captured. Stack building.", "Understood. Here's what Evo heard."],
    copy: ["Ready to use! Copy confirmed.", "Nice! That one's solid.", "Here you go — go build something great."],
    save: ["Saved for later! Good thinking.", "Archived. You'll want that.", "Vault updated!"],
  },
  conductor: {
    idle: ["Routing active. Smallest strong workflow first.", "What's the mission? I'll map the route.", "Sequence locked. Tell me the objective."],
    generate: ["Route optimized. Executing workflow.", "Pipeline mapped. Proceeding.", "Workflow engaged."],
    copy: ["Command ready. Execute.", "Route copied.", "Workflow command locked."],
    save: ["Route archived.", "Workflow saved.", "Mission sequence stored."],
  },
  boundary: {
    idle: ["Boundary active. I enforce the limits.", "What's blocked? Tell me the constraint.", "Safety layer engaged."],
    generate: ["Checking constraints...", "Boundary scan complete.", "Limits verified."],
    copy: ["Copied within boundary.", "Command verified — within limits.", "Proceed."],
    save: ["Constraint logged.", "Boundary documented.", "Limits archived."],
  },
  ledger: {
    idle: ["Ledger active. Name the truth state.", "known | inferred | blocked | built | verified", "What needs classifying?"],
    generate: ["Classifying output...", "Truth states applied.", "Status labeled."],
    copy: ["Status copied.", "Classification copied.", "Truth state logged."],
    save: ["Ledger entry created.", "Status archived.", "Canon updated."],
  },
  memory: {
    idle: ["Memory active. What do you need recalled?", "Canon thread intact.", "Prior decisions preserved."],
    generate: ["Session context logged.", "Memory updated with new artifact.", "Canon thread extended."],
    copy: ["Copied from vault.", "Memory extracted.", "Thread archived."],
    save: ["Memory archived.", "Canon logged.", "Thread preserved."],
  },
  heartbeat: {
    idle: ["Heartbeat: operational. Status?", "Pace check. Where are we?", "Sprint checkpoint active."],
    generate: ["Progress logged.", "Checkpoint: output generated.", "Momentum maintained."],
    copy: ["Status extracted.", "Checkpoint copied.", "Pace: steady."],
    save: ["Checkpoint saved.", "Progress archived.", "Sprint log updated."],
  },
  sovereignty: {
    idle: ["Sovereignty active. This is yours. Own it.", "User authority: confirmed.", "Command and control: yours."],
    generate: ["Ownership lock applied.", "Sovereign output generated.", "Your mission. Your product."],
    copy: ["Your prompt. Your IP.", "Copied — you own this.", "Sovereign asset extracted."],
    save: ["Ownership archived.", "Sovereign record saved.", "Your vault. Your canon."],
  },
};

function getLine(botId, action = 'idle') {
  const lines = BOT_LINES[botId]?.[action] || BOT_LINES.evo[action] || ["Ready."];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ── Global event bus for bot reactions ──
export const BotBus = {
  listeners: new Set(),
  emit(event) { this.listeners.forEach(l => l(event)); },
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
};

export function useBotEvent() {
  return useCallback((action) => BotBus.emit({ action }), []);
}

// ── Main Bot Orb Component ──────────────────────────────────
export function BotOrb({ view }) {
  const botId = VIEW_BOT_MAP[view] || 'evo';
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState(() => getLine(botId, 'idle'));
  const [speaking, setSpeaking] = useState(false);
  const [action, setAction] = useState('idle');
  const [key, setKey] = useState(0);
  const prevBotId = useRef(botId);

  // Change message when bot changes
  useEffect(() => {
    if (prevBotId.current !== botId) {
      prevBotId.current = botId;
      setSpeaking(true);
      setKey(k => k + 1);
      setTimeout(() => {
        setMessage(getLine(botId, 'idle'));
        setSpeaking(false);
      }, 800);
    }
  }, [botId]);

  // Listen to global bus events
  useEffect(() => {
    return BotBus.on(({ action: a }) => {
      setAction(a);
      setSpeaking(true);
      setTimeout(() => {
        setMessage(getLine(botId, a));
        setSpeaking(false);
      }, 600);
    });
  }, [botId]);

  const color = BOT_COLORS[botId] || '#f5c842';
  const emoji = BOT_EMOJI[botId] || '🤖';

  return (
    <div className="bot-orb-wrapper">
      {/* Bubble */}
      {!expanded && (
        <div className="bot-bubble" key={`bubble-${botId}-${key}`} style={{ borderColor: color + '44', borderLeftColor: color }}>
          <div className="bot-bubble-name" style={{ color }}>{botId.toUpperCase()}</div>
          {speaking ? (
            <div className="bot-speaking-dots" style={{ color }}>
              <span /><span /><span />
            </div>
          ) : (
            <div className="bot-bubble-text">{message}</div>
          )}
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="bot-expand-panel" key={`panel-${botId}`} style={{ borderColor: color + '44' }}>
          <div className="bot-expand-header">
            {(() => {
              const rosterBot = BOT_ROSTER.find(b => b.id === botId);
              return rosterBot ? (
                <div style={{ width: 50, height: 60, overflow: 'hidden', flexShrink: 0 }}>
                  <BotCharacter bot={rosterBot} expression={speaking ? 'focused' : 'happy'} motion={speaking ? 'speaking' : 'gesturing'} isSpeaking={speaking} size="sm" showGlow={false} showExpression={false} />
                </div>
              ) : <span style={{ fontSize: 28 }}>{emoji}</span>;
            })()}
            <div>
              <div className="bot-expand-name" style={{ color }}>{botId.charAt(0).toUpperCase() + botId.slice(1)}</div>
              <div className="bot-expand-species">// {VIEW_BOT_MAP[view] && botId} form</div>
            </div>
            <button onClick={() => setExpanded(false)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16 }}>✕</button>
          </div>
          <div className="bot-expand-role" style={{ color: 'var(--text-dim)' }}>
            {BOT_LINES[botId]?.idle?.[0]}
          </div>
          <div className="bot-expand-role">
            <strong style={{ color }}>Signature:</strong> {getBotSignature(botId)}
          </div>
          <div className="bot-action-row">
            {['idle','generate','copy','save'].map(a => (
              <button key={a} className="bot-action-btn" style={{ borderColor: color + '44', color }} onClick={() => {
                BotBus.emit({ action: a });
              }}>{a}</button>
            ))}
          </div>
          {speaking ? (
            <div className="bot-speaking-dots" style={{ color, marginTop: 10 }}><span /><span /><span /></div>
          ) : (
            <div className="bot-bubble-text" style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 8 }}>{message}</div>
          )}
        </div>
      )}

      {/* Orb — full-body character */}
      <div
        className={`bot-orb anim-${botId}`}
        key={`orb-${botId}`}
        onClick={() => setExpanded(e => !e)}
        title={`${botId.charAt(0).toUpperCase() + botId.slice(1)} — Click to expand`}
      >
        {(() => {
          const rosterBot = BOT_ROSTER.find(b => b.id === botId);
          if (rosterBot) {
            return (
              <div style={{ transform: 'scale(0.60)', transformOrigin: 'center center', pointerEvents: 'none' }}>
                <BotCharacter
                  bot={rosterBot}
                  expression={speaking ? 'focused' : 'neutral'}
                  motion={speaking ? 'speaking' : 'idle'}
                  isSpeaking={speaking}
                  size="md"
                  showGlow={false}
                  showExpression={false}
                />
              </div>
            );
          }
          return emoji;
        })()}
        {speaking && <div className="bot-status-dot" style={{ background: '#fb923c' }} />}
      </div>
    </div>
  );
}

function getBotSignature(id) {
  const sigs = { evo:'ANCHOR·RESOLVE·LEAD', dev:'BUILD·CODE·SHIP', builder:'CONSTRUCT·MANIFEST·FINISH', verifier:'PROOF·AUDIT·VERIFY', companion:'LISTEN·BRIDGE·CLARIFY', conductor:'ROUTE·COMPRESS·DIRECT', boundary:'BLOCK·PROTECT·ENFORCE', ledger:'TRACK·CLASSIFY·RECORD', memory:'RETAIN·RECALL·PERSIST', heartbeat:'PACE·ACCELERATE·DRIVE', sovereignty:'GOVERN·CANONIZE·ANCHOR' };
  return sigs[id] || 'EXECUTE·DELIVER·VERIFY';
}

// ── Bot Inline Badge (for chat messages) ───────────────────
export function BotBadge({ botId }) {
  const color = BOT_COLORS[botId] || '#f5c842';
  const emoji = BOT_EMOJI[botId] || '🤖';
  return (
    <span className="inline-bot-badge" style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
      {emoji} {botId}
    </span>
  );
}

// ── Bot Reaction Hook (call from anywhere to trigger bot) ──
export function useBotReaction() {
  return useCallback((action) => {
    BotBus.emit({ action });
  }, []);
}
