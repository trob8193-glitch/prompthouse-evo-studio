import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = 'C:\\Users\\Noname\\.gemini\\antigravity-ide\\brain\\806120f5-3a91-4afc-a62d-358e6f27363c';

export async function evolveAvatar(botId, botName, role) {
  console.log(`[Avatar Daemon] Commencing physical evolution for ${botId}...`);
  
  const outputFilename = `evolved_${botId}_${Date.now()}.png`;
  const outputPath = path.join(ROOT_DIR, 'public', 'bots', outputFilename);
  const glowPath = path.join(ROOT_DIR, 'public', 'bots', `glow_${outputFilename}`);
  
  // 1. Generate the Avatar via Python CV compositor
  const pyScript = path.join(ROOT_DIR, 'scripts', 'avatar_compositor.py');
  try {
    execSync(`python "${pyScript}" "${ASSETS_DIR}" "${outputPath}"`, { stdio: 'inherit' });
    
    // For the glow version, we just copy the same image for now (since the compositor already added the emerald core)
    // Or ideally, the compositor would export a separate glow mask. We will just duplicate it for simplicity.
    fs.copyFileSync(outputPath, glowPath);
    console.log(`[Avatar Daemon] Physical evolution complete: ${outputPath}`);
  } catch (e) {
    console.error(`[Avatar Daemon] Python execution failed:`, e.message);
    return false;
  }

  // 2. Inject into bot-orb.jsx
  const orbPath = path.join(ROOT_DIR, 'src', 'bot-orb.jsx');
  let orbCode = fs.readFileSync(orbPath, 'utf8');
  
  // Add to BOT_AVATARS
  const avatarEntry = `  ${botId}: '/bots/${outputFilename}',\n};`;
  orbCode = orbCode.replace(/};\s*$/m, avatarEntry); // Just a heuristic, better to replace inside the BOT_AVATARS block
  
  // Actually, safe regex insertion for BOT_AVATARS
  orbCode = orbCode.replace(/(export const BOT_AVATARS = \{[\s\S]*?)(};)/, `$1  ${botId}: '/bots/${outputFilename}',\n$2`);
  
  // Add to BOT_AVATARS_GLOW
  orbCode = orbCode.replace(/(export const BOT_AVATARS_GLOW = \{[\s\S]*?)(};)/, `$1  ${botId}: '/bots/glow_${outputFilename}',\n$2`);
  
  fs.writeFileSync(orbPath, orbCode);

  // 3. Inject into engine.js if not exists
  const enginePath = path.join(ROOT_DIR, 'src', 'engine.js');
  let engineCode = fs.readFileSync(enginePath, 'utf8');
  
  if (!engineCode.includes(`id: '${botId}'`)) {
    const newBot = `  { id: '${botId}', name: '${botName}', species: 'Evolved Hybrid', voice: 'onyx', role: '${role}', signature: 'Autonomously Invented.', icon: '✨', palette: { primary: '#10b981' }, generatingTheme: 'omega', generatingPlan: 'Self-Invention', generatingParadigm: 'Singularity' },\n];`;
    engineCode = engineCode.replace(/];/, newBot);
    fs.writeFileSync(enginePath, engineCode);
  }

  console.log(`[Avatar Daemon] Neural registry updated for ${botId}.`);
  return true;
}

// Allow direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const botId = process.argv[2] || `evolved_${Date.now()}`;
  evolveAvatar(botId, 'Invented Sovereign', 'Autonomous Logic Core');
}
