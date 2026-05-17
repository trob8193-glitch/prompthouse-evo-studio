/**
 * PH EVO STUDIO — SENTIENT BOT ROSTER (PHASE 13 MANIFEST)
 * ═══════════════════════════════════════════════════════════════
 * The official 21-member Evo Dev Team. These are bio-mechanical 
 * sentient agents in gold-and-green cybernetic armor.
 */

export const EVO_DEV_TEAM = [
  { id: 1, name: 'MONKEY_PRIME', role: 'Evo Evolution Engineer', species: 'Humanoid Half-Cyborg Monkey', specialty: 'Structural Evolution & Architecture', color: '#f59e0b', icon: '🐒' },
  { id: 2, name: 'PANTHER', role: 'Security Infiltrator', specialty: 'Encryption/Bypass', color: '#10b981' },
  { id: 3, name: 'OWL', role: 'Knowledge Weaver', specialty: 'Global Context', color: '#f59e0b' },
  { id: 4, name: 'OCTO_UI', role: 'Evo UI Engineer', species: 'Humanoid Half-Cyborg Octopus', specialty: 'React/Vite/Aesthetic Refinement', color: '#10b981', icon: '🐙' },
  { id: 5, name: 'TIGER', role: 'Logic Striker', specialty: 'Algorithmic Speed', color: '#f59e0b' },
  { id: 6, name: 'FOX', role: 'Strategic Deceiver', specialty: 'Edge-Case Debugging', color: '#10b981' },
  { id: 7, name: 'CHEETAH', role: 'Rapid Deployer', specialty: 'Build Optimization', color: '#f59e0b' },
  { id: 8, name: 'WOLF', role: 'Swarm Coordinator', specialty: 'Parallel Processing', color: '#10b981' },
  { id: 9, name: 'GORILLA', role: 'Infrastructure Heavy', specialty: 'Database/Storage', color: '#f59e0b' },
  { id: 10, name: 'RHINO', role: 'Breach Specialist', specialty: 'Stress Testing', color: '#10b981' },
  { id: 11, name: 'COBRA', role: 'Injection specialist', specialty: 'Security Auditing', color: '#f59e0b' },
  { id: 12, name: 'FALCON', role: 'Precision Sniper', specialty: 'Bug Elimination', color: '#10b981' },
  { id: 13, name: 'JAGUAR', role: 'Silken Threader', specialty: 'Seamless Integration', color: '#f59e0b' },
  { id: 14, name: 'BEAR', role: 'Guardian Tank', specialty: 'System Resilience', color: '#10b981' },
  { id: 15, name: 'RAM', role: 'Forceful Pusher', specialty: 'Deployment Velocity', color: '#f59e0b' },
  { id: 16, name: 'DOLPHIN_DOC', role: 'Evo Doctor', species: 'Humanoid Half-Cyborg Dolphin', specialty: 'Proactive Medical Remediation', color: '#10b981', icon: '🐬' },
  { id: 17, name: 'LYNX', role: 'Subtle Observer', specialty: 'Logging/Monitoring', color: '#f59e0b' },
  { id: 18, name: 'BULL', role: 'Market Mover', specialty: 'Commerce/Analytics', color: '#10b981' },
  { id: 19, name: 'RAVEN', role: 'Shadow Oracle', specialty: 'Predictive Analysis', color: '#f59e0b' },
  { id: 20, name: 'CROCODILE', role: 'Deep Diver', specialty: 'Legacy Code Excavation', color: '#10b981' },
  { id: 21, name: 'HYENA', role: 'Resource Scavenger', specialty: 'Garbage Collection', color: '#f59e0b' }
];

export const getBotById = (id) => EVO_DEV_TEAM.find(b => b.id === id);

export const EXPRESSIONS = { neutral: 'neutral' };
export const MOTIONS = {
  idle: 'idle',
  speaking: 'speaking',
  walking: 'walking',
  gesturing: 'gesturing',
  building: 'building',
  scanning: 'scanning',
  guarding: 'guarding',
  celebrating: 'celebrating',
  pointing: 'pointing',
  typing: 'typing',
  resting: 'resting',
  charging: 'charging'
};

import React from 'react';

export const BotCharacter = ({ bot, expression = 'neutral', motion = 'idle', isSpeaking = false, size = 'md', showGlow = true, showExpression = true }) => {
  if (!bot) return null;
  const color = bot?.palette?.primary || bot?.color || '#f5c842';
  const icon = bot?.icon || bot?.name?.charAt(0) || '?';
  const motionClass = `char-motion-${motion}`;
  const speakingClass = isSpeaking ? 'char-speaking' : '';
  
  const sizeMap = { sm: 48, md: 80, lg: 160 };
  const pxSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`bot-char-container ${motionClass} ${speakingClass}`} style={{ '--char-size': `${pxSize}px`, '--bot-accent': color }}>
      <div className="char-image-wrapper" style={{ width: pxSize, height: pxSize }}>
        <div className="bot-sigil-avatar" style={{ width: '100%', height: '100%', borderColor: `${color}88`, boxShadow: showGlow ? `0 0 ${pxSize/3}px ${color}44, inset 0 0 ${pxSize/4}px ${color}33` : 'none' }}>
          <div className="bot-sigil-grid"></div>
          <div className="bot-sigil-ring" style={{ borderColor: `${color}88` }}></div>
          <div className="bot-sigil-ring ring-two" style={{ borderColor: `${color}55` }}></div>
          <div className="bot-scanline"></div>
          
          <div className="bot-sigil-mark" style={{ color: '#fff', textShadow: `0 0 12px ${color}` }}>
            {showExpression ? icon : ''}
          </div>
          
          {size === 'lg' && (
            <div className="bot-sigil-name" style={{ color: color }}>
              {bot.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BotStageCharacter = (props) => {
  return (
    <div className="bot-stage-character-wrapper">
      <div className="bot-stage-live-badge">
        <div className="live-dot"></div>
        LIVE
      </div>
      <BotCharacter {...props} size="lg" />
    </div>
  );
};
