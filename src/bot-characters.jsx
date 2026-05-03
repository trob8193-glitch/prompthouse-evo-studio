// bot-characters.jsx — Full-body animated cyborg bot character system
// Real character art with SVG limb animation overlays + facial expressions + particles

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion as fm, AnimatePresence } from 'framer-motion';
import './bot-characters.css';
import './bot-limbs.css';

// ── Bot image paths ──
const BOT_IMAGES = {
  evo: '/bots/evo.png', dev: '/bots/dev.png', builder: '/bots/builder.png',
  verifier: '/bots/verifier.png', companion: '/bots/companion.png',
  conductor: '/bots/swarm_falcon.png', boundary: '/bots/boundary.png',
  ledger: '/bots/ledger.png', memory: '/bots/memory.png',
  heartbeat: '/bots/heartbeat.png', sovereignty: '/bots/sovereignty.png',
  cipher_lynx: '/bots/cipher_lynx.png', vector_wolf: '/bots/vector_wolf.png',
  compiler_bearcat: '/bots/compiler_bearcat.png', schema_beaver: '/bots/schema_beaver.png',
  eval_mantis: '/bots/eval_mantis.png', swarm_falcon: '/bots/swarm_falcon.png',
  blueprint_orca: '/bots/blueprint_orca.png', signal_foxhound: '/bots/signal_foxhound.png',
  temporal_raven: '/bots/temporal_raven.png', forge_rhino: '/bots/boundary.png',
};

const BOT_ASSET_VERSION = '2026-04-30-live-bots';

// ── Expressions ──
export const EXPRESSIONS = {
  neutral: { emoji: '😐', label: 'Neutral', eye: '', mouth: '' },
  focused: { emoji: '🎯', label: 'Focused', eye: '', mouth: '' },
  happy: { emoji: '😄', label: 'Happy', eye: 'happy', mouth: 'happy' },
  angry: { emoji: '😠', label: 'Angry', eye: 'angry', mouth: 'angry' },
  thinking: { emoji: '🤔', label: 'Thinking', eye: 'thinking', mouth: '' },
  surprised: { emoji: '😲', label: 'Surprised', eye: 'surprised', mouth: 'surprised' },
  celebrating: { emoji: '🎉', label: 'Celebrating', eye: 'celebrating', mouth: 'celebrating' },
  error: { emoji: '⚠️', label: 'Error', eye: 'error', mouth: 'angry' },
};

export const MOTIONS = {
  idle: { emoji: '🧍', label: 'Idle' }, speaking: { emoji: '🗣️', label: 'Speaking' },
  walking: { emoji: '🚶', label: 'Walking' }, gesturing: { emoji: '👋', label: 'Gesturing' },
  building: { emoji: '🔨', label: 'Building' }, scanning: { emoji: '🔍', label: 'Scanning' },
  guarding: { emoji: '🛡️', label: 'Guarding' }, celebrating: { emoji: '🎊', label: 'Celebrating' },
  pointing: { emoji: '👉', label: 'Pointing' }, typing: { emoji: '⌨️', label: 'Typing' },
  resting: { emoji: '💤', label: 'Resting' }, charging: { emoji: '⚡', label: 'Charging' },
};

// ── Expression visual effects ──
const EXPR_EFFECTS = {
  neutral: { filter: 'none', overlay: 'transparent', glow: 1 },
  focused: { filter: 'contrast(1.1) saturate(1.2)', overlay: 'rgba(34,211,238,0.06)', glow: 1.3 },
  happy: { filter: 'brightness(1.12) saturate(1.3)', overlay: 'rgba(74,222,128,0.06)', glow: 1.5 },
  angry: { filter: 'contrast(1.3) saturate(1.5) hue-rotate(-10deg)', overlay: 'rgba(239,68,68,0.1)', glow: 2 },
  thinking: { filter: 'brightness(0.9) contrast(1.1)', overlay: 'rgba(139,92,246,0.06)', glow: 0.8 },
  surprised: { filter: 'brightness(1.2) contrast(1.15)', overlay: 'rgba(251,146,60,0.08)', glow: 1.8 },
  celebrating: { filter: 'brightness(1.2) saturate(1.4)', overlay: 'rgba(250,204,21,0.1)', glow: 2.5 },
  error: { filter: 'contrast(1.4) saturate(0.5) hue-rotate(10deg)', overlay: 'rgba(239,68,68,0.12)', glow: 2 },
};

const MOTION_CLASS = {
  idle:'char-motion-idle', speaking:'char-motion-speaking', walking:'char-motion-walking',
  gesturing:'char-motion-gesturing', building:'char-motion-building', scanning:'char-motion-scanning',
  guarding:'char-motion-guarding', celebrating:'char-motion-celebrating', pointing:'char-motion-pointing',
  typing:'char-motion-typing', resting:'char-motion-resting', charging:'char-motion-charging',
};

const BOT_LIVE_EMOJIS = {
  evo: ['🦁', '✨', '🧠', '⚡'],
  dev: ['🐆', '💻', '⚙️', '🔧'],
  builder: ['🐻', '🏗️', '🧱', '🔨'],
  verifier: ['🦉', '✅', '🔍', '🧪'],
  companion: ['🦊', '💬', '🤝', '🌙'],
  conductor: ['🦅', '🧭', '🗺️', '🎼'],
  boundary: ['🐏', '🛡️', '🚧', '🔐'],
  ledger: ['🐦‍⬛', '📜', '🧾', '🔏'],
  memory: ['🐘', '🧠', '💾', '🕯️'],
  heartbeat: ['🐆', '💓', '📡', '⚕️'],
  sovereignty: ['🐅', '👑', '⚖️', '🔥'],
};

const LIVE_EMOJI_SLOTS = [
  { x: 12, y: 20, delay: 0, duration: 9 },
  { x: 78, y: 16, delay: 1.1, duration: 10.5 },
  { x: 18, y: 72, delay: 2.2, duration: 11 },
  { x: 82, y: 68, delay: 3.3, duration: 9.6 },
  { x: 50, y: 8, delay: 1.8, duration: 12 },
  { x: 48, y: 82, delay: 4.4, duration: 10.8 },
];



// ── Particle system ──
function BotSigilAvatar({ bot, size }) {
  return (
    <div className="bot-sigil-avatar" style={{ height: size, width: size }}>
      <div className="bot-sigil-ring ring-one" />
      <div className="bot-sigil-ring ring-two" />
      <div className="bot-sigil-grid" />
      <div className="bot-sigil-mark">{bot.icon || bot.name.slice(0, 2).toUpperCase()}</div>
      <div className="bot-sigil-name">{bot.name}</div>
    </div>
  );
}



// ── Facial Expression Overlay ──
function FaceOverlay({ expression, isSpeaking, accent, glow }) {
  const expr = EXPRESSIONS[expression] || EXPRESSIONS.neutral;
  const [blinking, setBlinking] = useState(false);
  const blinkRef = useRef(null);

  useEffect(() => {
    const blink = () => {
      blinkRef.current = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
        blink();
      }, 2500 + Math.random() * 4000);
    };
    blink();
    return () => clearTimeout(blinkRef.current);
  }, []);

  const eyeClass = blinking ? 'blink' : (expr.eye || '');
  const mouthClass = isSpeaking ? 'speaking' : (expr.mouth || '');

  return (
    <div className="face-overlay" style={{ '--bot-accent': accent, '--bot-glow': glow }}>
      <div className="face-eyes">
        <div className={`face-eye ${eyeClass}`} />
        <div className={`face-eye ${eyeClass}`} />
      </div>
      <div className={`face-mouth ${mouthClass}`} />
    </div>
  );
}

// ── Animated Limb Overlay ──
function LimbOverlay() {
  return (
    <div className="char-anim-overlay">
      <div className="limb-head" />
      <div className="limb-left-arm" />
      <div className="limb-right-arm" />
      <div className="limb-left-leg" />
      <div className="limb-right-leg" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BOT CHARACTER — Main Component
// ══════════════════════════════════════════════════════════════
export function BotCharacter({
  bot, expression = 'neutral', motion = 'idle', isSpeaking = false,
  size = 'md', showGlow = true, showExpression = true, onClick, className = '',
}) {
  const effect = EXPR_EFFECTS[expression] || EXPR_EFFECTS.neutral;
  const motionClass = MOTION_CLASS[motion] || MOTION_CLASS.idle;
  const speaking = isSpeaking || motion === 'speaking';
  const [imageFailed, setImageFailed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imagePath = bot.avatar || BOT_IMAGES[bot.id];
  const imgSrc = imagePath ? `${imagePath}?v=${BOT_ASSET_VERSION}` : '';
  const sizeMap = { sm: 90, md: 160, lg: 220, xl: 320 };
  const px = sizeMap[size] || sizeMap.md;
  const showParticles = motion === 'celebrating' || motion === 'charging' || expression === 'celebrating';
  const showSigil = !imgSrc || imageFailed;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setImageFailed(false);
  }, [bot.id]);

  return (
    <fm.div
      ref={containerRef}
      className={`bot-char-container bot-char-${bot.id} ${motionClass} ${speaking ? 'char-speaking' : ''} ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [0, -6, 0],
        rotateX: mousePos.y * 15,
        rotateY: mousePos.x * 15,
      }}
      transition={{ 
        y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
        scale: { duration: 0.4 },
        rotateX: { type: 'spring', stiffness: 100, damping: 20 },
        rotateY: { type: 'spring', stiffness: 100, damping: 20 },
      }}
      style={{
        '--bot-accent': bot.palette.accent,
        '--bot-primary': bot.palette.primary, '--char-size': `${px}px`, width: px,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      title={`${bot.name} — ${bot.species} form`}
    >
      {/* Expression badge */}
      {showExpression && expression !== 'neutral' && (
        <div className="char-expression-badge" key={expression}>
          {EXPRESSIONS[expression]?.emoji}
        </div>
      )}

      {/* Character image without effects */}
      <div className="char-image-wrapper">
        {/* Main character: Rive animation if available, else image, else sigil */}
        {showSigil ? (
          <BotSigilAvatar bot={bot} size={px} />
        ) : (
          <fm.img
            src={imgSrc}
            alt={`${bot.name} - ${bot.species} cyborg`}
            className="char-image"
            style={{ height: px }}
            draggable={false}
            onError={() => setImageFailed(true)}
            animate={{ 
              filter: speaking ? ['brightness(1)', 'brightness(1.4)', 'brightness(1)'] : 'brightness(1)' 
            }}
            transition={{ 
              duration: 0.3, 
              repeat: speaking ? Infinity : 0, 
              ease: "easeInOut" 
            }}
          />
        )}
      </div>
    </fm.div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROSTER CARD
// ══════════════════════════════════════════════════════════════
export function BotRosterCard({ bot, isActive, isLead, onClick, expression, motion, isSpeaking }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`bot-roster-card ${isActive ? 'active' : ''} ${isLead ? 'bot-lead-active' : ''}`}
      style={{ '--bot-accent': bot.palette.accent }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <BotCharacter
        bot={bot}
        expression={hovered ? 'happy' : (expression || 'neutral')}
        motion={hovered ? 'gesturing' : (motion || 'idle')}
        isSpeaking={isSpeaking}
        size="sm"
        showGlow={true}
        showExpression={false}
      />
      <div className="bot-roster-name">{bot.name}</div>
      <div className="bot-roster-species">// {bot.species} form</div>
      <div className="bot-roster-role">{bot.role.split('.')[0]}</div>
      <div className="bot-roster-signature">{bot.signatureMove}</div>
      {isLead && <span className="badge badge-gold" style={{ fontSize: 9 }}>LEAD</span>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STAGE CHARACTER (large cinematic)
// ══════════════════════════════════════════════════════════════
export function BotStageCharacter({ bot, expression, motion, isSpeaking }) {
  return (
    <div className="bot-stage-wrapper">
      <BotCharacter
        bot={bot} expression={expression} motion={motion} isSpeaking={isSpeaking}
        size="xl" showGlow={true} showExpression={true}
      />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// useBotExpression Hook
// ══════════════════════════════════════════════════════════════
export function useBotExpression(defaultExpr = 'neutral') {
  const [expression, setExpression] = useState(defaultExpr);
  const [motion, setMotion] = useState('idle');
  const [speaking, setSpeaking] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(true);

  // Manual actions temporarily disable autonomous mode logic
  const speak = useCallback((expr = 'focused', mot = 'speaking', ms = 3000) => {
    setExpression(expr);
    setMotion(mot);
    setSpeaking(true);
    setTimeout(() => { 
      setSpeaking(false); 
      setMotion('idle'); 
      setExpression(defaultExpr); 
    }, ms);
  }, [defaultExpr]);

  const celebrate = useCallback(() => {
    setExpression('celebrating');
    setMotion('celebrating');
    setTimeout(() => { 
      setExpression(defaultExpr); 
      setMotion('idle'); 
    }, 2000);
  }, [defaultExpr]);

  // Autonomous Behavior Loop
  useEffect(() => {
    if (!isAutonomous) return;

    let timeoutId;
    const triggerAmbientAction = () => {
      // Don't interrupt if currently speaking or celebrating
      if (!speaking && motion === 'idle') {
        const ambientActions = [
          { e: 'focused', m: 'scanning', dur: 2500 },
          { e: 'thinking', m: 'idle', dur: 3000 },
          { e: 'neutral', m: 'gesturing', dur: 1800 },
          { e: 'surprised', m: 'idle', dur: 1200 },
          { e: 'focused', m: 'idle', dur: 2000 }
        ];
        
        const action = ambientActions[Math.floor(Math.random() * ambientActions.length)];
        
        setExpression(action.e);
        setMotion(action.m);
        
        // Reset after duration
        setTimeout(() => {
          setExpression(defaultExpr);
          setMotion('idle');
        }, action.dur);
      }
      
      // Schedule next ambient action between 5 to 12 seconds
      const nextInterval = 5000 + Math.random() * 7000;
      timeoutId = setTimeout(triggerAmbientAction, nextInterval);
    };

    // Start loop
    timeoutId = setTimeout(triggerAmbientAction, 3000);

    return () => clearTimeout(timeoutId);
  }, [isAutonomous, speaking, motion, defaultExpr]);

  return { 
    expression, motion, speaking, isAutonomous, 
    setExpression, setMotion, setSpeaking, setIsAutonomous, 
    speak, celebrate 
  };
}
