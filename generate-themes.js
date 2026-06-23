import fs from 'fs';

const DIMENSIONS = [
  'layout', 'ui', 'bots', 'wiring', 'building', 'routing', 'inventing', 'agent', 
  'brain', 'module', 'react', 'vite', 'extension', 'ide', 'browser', 
  'theme_rearranging', 'scrollbar', 'toolbar', 'feature', 'scope', 'daemon', 
  'core', 'pipeline', 'llm', 'app', 'theme_color_matching', 'glow_matching', 
  'animated_matching', 'generating'
];

const TARGETS_UI = [
  'button', '.tab', 'input', 'textarea', '.evo-shell-container', '.evo-cmd-card', 
  '.remote-btn', 'select', '[role="tab"]', '.bot-glow-override', '.ghost-editor-container'
];

const newThemes = [
  {
    name: 'pangram',
    glow: 'rgba(0, 191, 255, 0.5)',
    liveBg: 'radial-gradient(circle at 30% 30%, #001a33 0%, #000000 100%)',
    btnBg: 'linear-gradient(45deg, rgba(0, 191, 255, 0.1), rgba(0, 191, 255, 0.3))',
    color: '#00bfff',
    border: 'solid 1px rgba(0, 191, 255, 0.5)',
    filter: 'drop-shadow(0 0 15px #00bfff)'
  },
  {
    name: 'paragram',
    glow: 'rgba(255, 215, 0, 0.5)',
    liveBg: 'radial-gradient(ellipse at center, #332b00 0%, #050400 100%)',
    btnBg: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.3))',
    color: '#ffd700',
    border: 'solid 1px rgba(255, 215, 0, 0.5)',
    filter: 'drop-shadow(0 0 15px #ffd700)'
  },
  {
    name: 'quantum-bloom',
    glow: 'rgba(255, 105, 180, 0.5)',
    liveBg: 'radial-gradient(circle at 50% 50%, #33001b 0%, #000000 100%)',
    btnBg: 'linear-gradient(135deg, rgba(255, 105, 180, 0.1), rgba(255, 105, 180, 0.3))',
    color: '#ff69b4',
    border: 'solid 1px rgba(255, 105, 180, 0.5)',
    filter: 'drop-shadow(0 0 15px #ff69b4)'
  },
  {
    name: 'cyber-matrix',
    glow: 'rgba(0, 255, 0, 0.5)',
    liveBg: 'linear-gradient(180deg, #001a00 0%, #000000 100%)',
    btnBg: 'linear-gradient(180deg, rgba(0, 255, 0, 0.1), rgba(0, 255, 0, 0.3))',
    color: '#00ff00',
    border: 'solid 1px rgba(0, 255, 0, 0.5)',
    filter: 'drop-shadow(0 0 15px #00ff00)'
  },
  {
    name: 'neon-synth',
    glow: 'rgba(0, 255, 255, 0.5)',
    liveBg: 'linear-gradient(135deg, #1a0033 0%, #001a33 100%)',
    btnBg: 'linear-gradient(45deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2))',
    color: '#00ffff',
    border: 'solid 1px rgba(255, 0, 255, 0.5)',
    filter: 'drop-shadow(0 0 15px #00ffff)'
  },
  {
    name: 'neural-void',
    glow: 'rgba(138, 43, 226, 0.5)',
    liveBg: 'radial-gradient(circle at 80% 20%, #1c0033 0%, #000000 100%)',
    btnBg: 'linear-gradient(90deg, rgba(138, 43, 226, 0.1), rgba(138, 43, 226, 0.3))',
    color: '#8a2be2',
    border: 'solid 1px rgba(138, 43, 226, 0.5)',
    filter: 'drop-shadow(0 0 15px #8a2be2)'
  }
];

let css = '';

for (const theme of newThemes) {
  css += `\n/* THEME: ${theme.name.toUpperCase()} */\n`;
  css += `@keyframes edge-sweep-${theme.name} {\n`;
  css += `  0%   { box-shadow: -8px 0 10px -5px ${theme.glow}, 0 -8px 10px -5px transparent, inset 0 0 10px ${theme.glow}; }\n`;
  css += `  25%  { box-shadow: 8px 0 10px -5px ${theme.glow}, 0 -8px 10px -5px ${theme.glow}, inset 0 0 15px ${theme.glow}; }\n`;
  css += `  50%  { box-shadow: 8px 0 10px -5px transparent, 0 8px 10px -5px ${theme.glow}, inset 0 0 10px ${theme.glow}; }\n`;
  css += `  75%  { box-shadow: -8px 0 10px -5px ${theme.glow}, 0 8px 10px -5px ${theme.glow}, inset 0 0 15px ${theme.glow}; }\n`;
  css += `  100% { box-shadow: -8px 0 10px -5px ${theme.glow}, 0 -8px 10px -5px transparent, inset 0 0 10px ${theme.glow}; }\n`;
  css += `}\n\n`;

  for (const dim of DIMENSIONS) {
    const selectorBase = `body.${dim}-${theme.name}`;
    
    css += `${selectorBase} {\n`;
    css += `  background-image: ${theme.liveBg} !important;\n`;
    css += `  background-size: 200% 200% !important;\n`;
    css += `  animation: background-pan 15s ease infinite !important;\n`;
    css += `}\n`;

    css += `${selectorBase} ${TARGETS_UI.join(`, ${selectorBase} `)} {\n`;
    css += `  background-image: ${theme.btnBg} !important;\n`;
    css += `  color: ${theme.color} !important;\n`;
    css += `  border: ${theme.border} !important;\n`;
    css += `  animation: edge-sweep-${theme.name} 6s linear infinite !important;\n`;
    css += `  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;\n`;
    css += `  backdrop-filter: blur(10px) !important;\n`;
    css += `}\n`;

    css += `${selectorBase} img {\n`;
    css += `  filter: ${theme.filter} !important;\n`;
    css += `  mix-blend-mode: hard-light;\n`;
    css += `}\n\n`;
  }
}

fs.appendFileSync('./src/themes.css', css);
console.log('Successfully appended 6 new themes to themes.css');
