/**
 * EVOGENAGE — CANONLOCK & STYLE REGISTRY (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Defines the immutable visual DNA of PH Evo Studio.
 */

export const CANON_PROFILES = [
  {
    id: 'evo_lion',
    name: 'Evo Lion Lead',
    species: 'Lion',
    role: 'Orchestrator',
    visualDescription: 'Majestic digital lion with a crown of golden data-filaments. Eyes glow with #f5c842 binary pulses. Armor is matte obsidian with gold etched circuitry.',
    colorPalette: ['#f5c842', '#1a1a1a', '#ffffff'],
    materialLanguage: 'Matte Obsidian, Liquid Gold, Holo-Mesh',
    negativePrompt: 'childish, toon, low-res, organic fur, messy, random colors'
  },
  {
    id: 'panther_dev',
    name: 'Panther Developer',
    species: 'Panther',
    role: 'Coder',
    visualDescription: 'Sleek cybernetic panther. Fur has a subtle #22d3ee neon sheen. Integrated HUD eye-piece. Armor is lightweight carbon-fiber.',
    colorPalette: ['#22d3ee', '#000000', '#334155'],
    materialLanguage: 'Carbon Fiber, Neon-Glass, Dark Chrome',
    negativePrompt: 'clunky, slow, bright fur, heavy armor'
  }
];

export const STYLE_PRESETS = [
  {
    id: 'evo_prime',
    name: 'Evo Prime',
    description: 'The definitive PH Evo Studio look: High-contrast, cinematic lighting, ultra-detailed textures, and sovereign gold accents.',
    promptModifiers: 'cinematic lighting, 8k resolution, ultra-detailed, hyper-realistic, photorealistic, professional photography, masterpiece, ph-evo-style',
    negativePromptModifiers: 'blurry, grainy, low quality, distorted, watermark, signature',
    creditMultiplier: 1.0
  },
  {
    id: 'ph_evo_cyber_animal',
    name: 'Cyber Animal',
    description: 'Neon-infused cybernetic aesthetics. Glowing circuits, tech-wear, and digital atmospheric haze.',
    promptModifiers: 'cyberpunk aesthetic, neon glow, futuristic armor, glowing circuits, synthwave colors, volumetric lighting, tech-noir',
    negativePromptModifiers: 'natural, forest, rustic, simple, old-tech',
    creditMultiplier: 1.2
  }
];
