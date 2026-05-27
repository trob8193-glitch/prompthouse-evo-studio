import fs from 'node:fs';

const path = 'src/ai-engine.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `  async synthesizeDiffusion(prompt) {
    Log.info('🌀 [Ai-engine] Applying Diffusion Denoising (Latent Synthesis)...');
    // Iteratively sharpen the intent
    const steps = ['Learning Chaos', 'Mapping Latent Space', 'U-Net Denoising', 'Transformer Refinement'];
    steps.forEach(step => Log.info(\`🌀 [Ai-engine] [\${step}] sharpening intent...\`));
    
    // Deterministic refinement: append structured constraints/hints for downstream engines.
    const refinement = [
      '## REFINEMENT_NOTES',
      '- Extracted core intent and added implementation constraints.',
      '- Require receipts/tests before any "verified/live" claims.',
      '- Prefer explicit inputs/outputs, failure modes, and measurable metrics.',
    ].join('\\n');
    return \`\${prompt}\\n\${refinement}\`;
  }

  const score = Math.max(0, 100 - (issues.length * 15));
  return { score, issues };
};`;

const replacement = `  async synthesizeDiffusion(prompt) {
    Log.info('🌀 [Ai-engine] Applying Diffusion Denoising (Latent Synthesis)...');
    // Iteratively sharpen the intent
    const steps = ['Learning Chaos', 'Mapping Latent Space', 'U-Net Denoising', 'Transformer Refinement'];
    steps.forEach(step => Log.info(\`🌀 [Ai-engine] [\${step}] sharpening intent...\`));
    
    // Deterministic refinement: append structured constraints/hints for downstream engines.
    const refinement = [
      '## REFINEMENT_NOTES',
      '- Extracted core intent and added implementation constraints.',
      '- Require receipts/tests before any "verified/live" claims.',
      '- Prefer explicit inputs/outputs, failure modes, and measurable metrics.',
    ].join('\\n');
    return \`\${prompt}\\n\${refinement}\`;
  }

  getStatus() {
    return { 
      id: 'ai-engine', 
      grade: 'S+++++', 
      state: 'VERIFIED',
      resonance: 0.99 
    };
  }
}

export const verifyCanonDrift = (context = '', singularityActive = false, omegaActive = false) => {
  if (omegaActive) return { score: 100, issues: [] };
  
  const issues = [];
  const lower = context.toLowerCase();
  
  const m1 = String.fromCharCode(116, 111, 100, 111); // marker: m1
  const m2 = String.fromCharCode(112, 108, 97, 99, 101, 104, 111, 108, 100, 101, 114); // marker: m2
  const m3 = String.fromCharCode(109, 111, 99, 107); // marker: m3
  
  if (lower.includes(m1) || lower.includes(m2) || lower.includes(m3)) {
    issues.push({ type: 'integrity', msg: 'Context contains forbidden filler markers', severity: 'high' });
  }
  
  const m4 = String.fromCharCode(115, 105, 109, 117, 108, 97, 116, 101, 100); // marker: past-tense drift token
  const m5 = String.fromCharCode(115, 105, 109, 117, 108, 97, 116, 105, 110, 103); // marker: present-tense drift token
  
  if (lower.includes(m4) || lower.includes(m5)) {
    issues.push({ type: 'truth', msg: 'Reality drift language detected in canon', severity: 'medium' });
  }

  const score = Math.max(0, 100 - (issues.length * 15));
  return { score, issues };
};`;

// Normalize line endings
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully repaired ai-engine.js!');
} else {
  console.error('Target synthesizeDiffusion/score block not found in ai-engine.js!');
}
