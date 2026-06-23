import React from 'react';
import { useSovereignStore } from "../store";

export default function AutonomousAgentRoster() {
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const activeThemeId = globalTheme?.theme || 'evoCore';

  // We only spawn bots for the new layout and extreme grids
  if (!activeThemeId.startsWith('layout') && !activeThemeId.startsWith('extreme')) {
    return null;
  }

  const renderBot = () => {
    switch (activeThemeId) {
      case 'layoutTerminalFullscreen':
        return (
          <div className="autonomous-bot-roster">
            <h3>👻 GHOST TERMINAL BOT [ACTIVE]</h3>
            <p>Intelligence Core: Root Overwrite Mode.</p>
            <p>Ready to deploy untethered commands.</p>
          </div>
        );
      case 'layoutCmdCenter':
        return (
          <div className="autonomous-bot-roster">
            <h3>📊 OMNI-DATA AGENT [ACTIVE]</h3>
            <p>Analyzing 12,000 temporal matrices per second.</p>
            <p>Warning: Extreme data density enabled.</p>
          </div>
        );
      case 'layoutBentoBox':
        return (
          <div className="autonomous-bot-roster" style={{ borderRadius: '24px', border: '1px solid #ccc', background: '#fff' }}>
            <h3>🍏 AESTHETIC UI COPILOT [ACTIVE]</h3>
            <p>Your studio's margins have been perfectly mathematically calculated.</p>
          </div>
        );
      case 'layoutDynamicOverlap':
        return (
          <div className="autonomous-bot-roster" style={{ transform: 'rotate(5deg)' }}>
            <h3>🎨 CHAOS CREATIVE AGENT [ACTIVE]</h3>
            <p>Symmetry is boring. Overlapping dimensions injected.</p>
          </div>
        );
      case 'extremeChatInterface':
        return (
          <div className="autonomous-bot-roster">
            <h3>💬 CONVERSATIONAL UI COPILOT [ACTIVE]</h3>
            <p>Squashing studio. All commands must be sent via natural language.</p>
          </div>
        );
      case 'extremeKanbanBoard':
        return (
          <div className="autonomous-bot-roster">
            <h3>📋 KANBAN WORKFLOW AGENT [ACTIVE]</h3>
            <p>Horizontal task sorting initialized.</p>
          </div>
        );
      case 'extremeVRGrid':
        return (
          <div className="autonomous-bot-roster">
            <h3>🥽 VR SPATIAL MATRIX BOT [ACTIVE]</h3>
            <p>3D Perspectives locked. Ready for headset immersion.</p>
          </div>
        );
      case 'extremeWindows95':
        return (
          <div className="autonomous-bot-roster" style={{ background: '#008080', color: '#fff' }}>
            <h3>📎 RETRO OS ASSISTANT [ACTIVE]</h3>
            <p>It looks like you're trying to build an AI. Would you like help?</p>
          </div>
        );
      case 'extremeGoldenRatio':
        return (
          <div className="autonomous-bot-roster">
            <h3>📐 FIBONACCI MATHEMATICAL AGENT [ACTIVE]</h3>
            <p>Resizing all modules to 1, 1, 2, 3, 5, 8, 13...</p>
          </div>
        );
      case 'extremeCircularHub':
        return (
          <div className="autonomous-bot-roster">
            <h3>🌀 HOLLOW HUB ENGINE BOT [ACTIVE]</h3>
            <p>Void constructed. Waiting for Omni-Tether inputs.</p>
          </div>
        );
      case 'extremeZShapeLayout':
        return (
          <div className="autonomous-bot-roster">
            <h3>👁️ Z-PATTERN EYE TRACKER BOT [ACTIVE]</h3>
            <p>Eye-tracking locked. Follow the zigzag pattern.</p>
          </div>
        );
      case 'extremeDiagonalSlice':
        return (
          <div className="autonomous-bot-roster">
            <h3>🔪 DIAGONAL SLICER BOT [ACTIVE]</h3>
            <p>Studio bisected. Warring factions separated.</p>
          </div>
        );
      default:
        return (
          <div className="autonomous-bot-roster">
            <h3>🤖 GENERAL EVOLUTION BOT [ACTIVE]</h3>
            <p>A new structural paradigm has been selected by the nexus.</p>
          </div>
        );
    }
  };

  return (
    <div className="agent-roster-wrapper" style={{ width: '100%', marginBottom: '20px' }}>
      {renderBot()}
    </div>
  );
}
