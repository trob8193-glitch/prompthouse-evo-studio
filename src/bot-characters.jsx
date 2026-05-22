/**
 * PH EVO STUDIO — SENTIENT BOT ROSTER (PHASE 13 MANIFEST)
 * ═══════════════════════════════════════════════════════════════
 * The official 21-member Evo Dev Team. These are bio-mechanical 
 * sentient agents in gold-and-green cybernetic armor.
 */

import { BOT_ROSTER } from './engine.js';

export const EVO_DEV_TEAM = BOT_ROSTER;

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
            {bot.avatarUrl ? (
              <img src={bot.avatarUrl} alt={bot.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              showExpression ? icon : ''
            )}
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
