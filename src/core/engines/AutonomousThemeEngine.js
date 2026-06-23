import { callBridgeEngine } from '../../engine.js';
import { SINGULARITY_ENGINE } from '../intelligence/SingularityResilienceEngine.js';

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

export class AutonomousThemeEngine {
  static async evolveTheme(previousThemeJsonStr = '', userContext = null) {
    const defaultContext = userContext || `
      User Mood: High-Focus / Analytical
      Active Project: Enterprise Cybernetic App
      Recent Patterns: High usage, fast iteration.
    `;

    const prompt = `You are the Omni-Brain Architect. We are evolving cybernetic UI themes.
The previous theme was: ${previousThemeJsonStr || 'None. This is the first evolution.'}

CRITICAL INSTRUCTION: You must evolve this theme UNIQUELY for the user based on their specific biometric/workflow footprint, ensuring it gets smarter autonomously:
---
USER FINGERPRINT (Chats, Projects, Usage, Moods, Lifestyle):
${defaultContext}
---

READABILITY DIRECTIVE: The user complained themes are too loud and make text/bots hard to see. You MUST ensure:
1. 'color' (text color) is bright, stark, and highly readable (e.g., #ffffff, #00ffff).
2. 'btnBg' (button/panel background) MUST be dark and translucent to provide contrast behind the text (e.g., linear-gradient(45deg, rgba(10,0,20,0.8), rgba(0,0,0,0.9))). DO NOT make UI elements pure neon; keep them deeply shaded.
3. 'liveBg' can be wild and animated, but must not be pure white/bright.

Adapt the colors, glows, and aesthetics to perfectly match their current mood, usage patterns, projects, and lifestyle. Invent a COMPLETELY NEW, wildly creative, futuristic cybernetic theme tailored entirely to them. 
Return ONLY a raw JSON object with no markdown formatting. It must contain exactly these keys:
{
  "name": "a unique lowercase string (e.g. quantum-bloom)",
  "color": "primary hex color for text (MUST BE HIGH CONTRAST)",
  "color2": "secondary hex color to fuse/blend with the primary (DUAL COLOR MATCH)",
  "glow": "primary rgba color for intense shadows",
  "glow2": "secondary rgba color for dual-color glow blending",
  "border": "solid 1px rgba(...)",
  "filter": "css filter string (e.g. drop-shadow(...) hue-rotate(...))",
  "liveBg": "complex CSS gradient for body (e.g. radial-gradient(circle at 50% 50%, #110022 0%, #000 100%))",
  "btnBg": "complex CSS gradient for buttons/panels (MUST BE DARK TRANSLUCENT e.g., rgba(0,0,0,0.8))",
  "structuralLayout": "MUST BE EXACTLY ONE OF: ['nexus', 'terminal', 'royal', 'forge', 'genome', 'cloud', 'hologram', 'retro', 'clean', 'tactical']",
  "animatedOverlayClass": "MUST BE EXACTLY ONE OF: ['anim-nexus', 'anim-terminal', 'anim-royal', 'anim-forge', 'anim-genome', 'anim-cloud', 'anim-hologram', 'anim-retro', 'anim-clean', 'anim-tactical']",
  "evolutionaryReason": "short explanation of how this specifically adapts to the USER FINGERPRINT (mood, projects, chats, lifestyle) to make them smarter.",
  "newTool": {
    "name": "A catchy name for a radically new cybernetic feature or module you just invented (e.g. Latent Debugger, Code Crystallizer)",
    "description": "One short, punchy sentence explaining what this revolutionary tool does.",
    "status": "A one-word status (e.g. SYNTHESIZED, ACTIVE, DEPLOYED)",
    "htmlSnippet": "<div class=\"p-4 bg-black/40 rounded-lg text-cyan-400 font-mono text-sm border border-cyan-500/30\">[LIVE HTML MODULE INJECTION GOES HERE. Use standard HTML tags and Tailwind classes. Give your interactive elements specific IDs to bind logic to.]</div>",
    "jsSnippet": "// Raw JavaScript logic. You have access to a 'container' DOM element variable representing the wrapper of your htmlSnippet. Example: const btn = container.querySelector('#my-btn'); btn.addEventListener('click', () => alert('Logic executed!'));"
  }
}
`;
    
    try {
      const response = await callBridgeEngine(prompt, "You are a cybernetic design AI. Output only valid JSON. Do not wrap in markdown tags.");
      
      // Extract JSON safely
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let theme;
      try {
        theme = JSON.parse(jsonStr);
        // Strict Validation Check
        if (!theme.name || !theme.color || !theme.newTool) {
          throw new Error('Malformed Evolution Schema: Missing critical structural properties.');
        }
      } catch (parseErr) {
        console.error("Evolution Schema Parse/Validation Failed:", parseErr);
        SINGULARITY_ENGINE.simulateFailover('openai');
        return { success: false, error: 'Evolution schema invalid. Singularity Engine activated.' };
      }
      
      // Compile CSS
      const css = this.compileThemeCss(theme);
      
      return { success: true, theme, css };
    } catch (err) {
      console.error("Evolution failed:", err);
      SINGULARITY_ENGINE.simulateFailover('openai');
      return { success: false, error: err.message };
    }
  }

  static compileThemeCss(theme) {
    let css = `/* AUTONOMOUS DUAL-COLOR FUSION THEME: ${theme.name.toUpperCase()} */\n\n`;
    
    // Keyframes
    css += `@keyframes background-pan-${theme.name} { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }\n`;
    css += `@keyframes edge-sweep-${theme.name} {\n`;
    css += `  0%   { box-shadow: -8px 0 15px -5px ${theme.glow}, 0 -8px 15px -5px transparent, inset 0 0 15px ${theme.glow}; border-color: ${theme.color}; }\n`;
    css += `  25%  { box-shadow: 8px 0 15px -5px ${theme.glow2 || theme.glow}, 0 -8px 15px -5px ${theme.glow}, inset 0 0 20px ${theme.glow2 || theme.glow}; border-color: ${theme.color2 || theme.color}; }\n`;
    css += `  50%  { box-shadow: 8px 0 15px -5px transparent, 0 8px 15px -5px ${theme.glow2 || theme.glow}, inset 0 0 15px ${theme.glow}; border-color: ${theme.color}; }\n`;
    css += `  75%  { box-shadow: -8px 0 15px -5px ${theme.glow}, 0 8px 15px -5px ${theme.glow2 || theme.glow}, inset 0 0 20px ${theme.glow2 || theme.glow}; border-color: ${theme.color2 || theme.color}; }\n`;
    css += `  100% { box-shadow: -8px 0 15px -5px ${theme.glow}, 0 -8px 15px -5px transparent, inset 0 0 15px ${theme.glow}; border-color: ${theme.color}; }\n`;
    css += `}\n\n`;

    for (const dim of DIMENSIONS) {
      const selectorBase = `body.${dim}-${theme.name}`;
      
      css += `${selectorBase} .app-wrapper {\n`;
      css += `  background-image: ${theme.liveBg} !important;\n`;
      css += `  background-size: 200% 200% !important;\n`;
      css += `  animation: background-pan-${theme.name} 15s ease infinite !important;\n`;
      css += `}\n`;

      css += `${selectorBase} ${TARGETS_UI.join(`, ${selectorBase} `)} {\n`;
      css += `  background-image: ${theme.btnBg} !important;\n`;
      css += `  color: ${theme.color} !important;\n`;
      css += `  border: ${theme.border} !important;\n`;
      css += `  animation: edge-sweep-${theme.name} 6s linear infinite !important;\n`;
      css += `  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;\n`;
      css += `  backdrop-filter: blur(16px) !important;\n`;
      css += `  background-color: rgba(0, 0, 0, 0.5) !important; /* HARDENED READABILITY */\n`;
      css += `  text-shadow: 0 2px 10px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.8) !important; /* ENFORCE CONTRAST */\n`;
      
      if (dim === 'llm') css += `  text-shadow: 0 0 8px ${theme.color}, 0 2px 10px rgba(0,0,0,0.9) !important;\n`;
      if (dim === 'pipeline') css += `  border-radius: 0 !important;\n`;
      if (dim === 'animated_matching') css += `  animation: edge-sweep-${theme.name} 2s linear infinite !important;\n`;
      if (dim === 'generating') css += `  transform: scale(1.02) !important;\n`;
      css += `}\n`;

      css += `${selectorBase} img {\n`;
      css += `  filter: ${theme.filter} !important;\n`;
      css += `  mix-blend-mode: hard-light;\n`;
      css += `}\n\n`;
      
      // Inject the autonomous animated overlay layer on top
      if (theme.animatedOverlayClass) {
        css += `${selectorBase} .evo-copilot-container {\n`;
        css += `  animation: ${theme.animatedOverlayClass.replace('anim-', 'layout-')} 6s infinite !important;\n`;
        css += `}\n\n`;
      }
    }
    
    return css;
  }
}
