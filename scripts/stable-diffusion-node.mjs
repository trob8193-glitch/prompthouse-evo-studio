import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'src', 'assets');

// Load API keys from .env
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const vars = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const match = line.replace(/\r$/, '').match(/^([^#=]+)=(.*)$/);
      if (match) vars[match[1].trim()] = match[2].trim();
    }
  }
  return vars;
}

// ═══════════════════════════════════════════════════════════════
//  STABLE DIFFUSION NODE — Multi-Provider Image Generation
//  Priority: Local SD (7860) → Gemini Imagen → OpenAI DALL-E
//  No fake fallbacks. Real image or error.
// ═══════════════════════════════════════════════════════════════

async function tryLocalSD(prompt, payload) {
  const response = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`SD Node HTTP ${response.status}`);
  const data = await response.json();
  return Buffer.from(data.images[0], 'base64');
}

async function tryGeminiImagen(prompt) {
  const env = loadEnv();
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No GEMINI_API_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: `Generate a detailed SVG image for: ${prompt}. Return ONLY valid SVG markup, nothing else. Make it 512x512, vibrant and premium looking.` }],
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  // Extract SVG from response
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return { type: 'svg', content: svgMatch[0] };
  }
  throw new Error('Gemini did not return valid SVG');
}

async function tryOpenAIDalle(prompt) {
  const env = loadEnv();
  const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('No OPENAI_API_KEY');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-2',
      prompt: prompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json',
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  return Buffer.from(data.data[0].b64_json, 'base64');
}

export async function generateAsset(prompt, filename) {
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const providers = [
    { name: 'Local Stable Diffusion (7860)', fn: () => tryLocalSD(prompt, {
      prompt, negative_prompt: 'ugly, blurry, low quality, text, watermark',
      steps: 20, width: 512, height: 512, sampler_name: 'Euler a', cfg_scale: 7,
    })},
    { name: 'Gemini Imagen (SVG)', fn: () => tryGeminiImagen(prompt) },
    { name: 'OpenAI DALL-E 2', fn: () => tryOpenAIDalle(prompt) },
  ];

  for (const provider of providers) {
    try {
      process.stdout.write(`\x1b[35m🎨 [IMAGE-GEN]\x1b[0m Trying ${provider.name}...\n`);
      const result = await provider.fn();

      // Handle SVG result from Gemini
      if (result && result.type === 'svg') {
        const svgPath = path.join(assetsDir, filename.replace(/\.png$/, '.svg'));
        fs.writeFileSync(svgPath, result.content, 'utf-8');
        process.stdout.write(`\x1b[32m✅ [IMAGE-GEN]\x1b[0m Asset created via ${provider.name}: ${svgPath}\n`);
        return svgPath;
      }

      // Handle PNG buffer
      const pngPath = path.join(assetsDir, filename.endsWith('.png') ? filename : `${filename}.png`);
      fs.writeFileSync(pngPath, result);
      process.stdout.write(`\x1b[32m✅ [IMAGE-GEN]\x1b[0m Asset created via ${provider.name}: ${pngPath}\n`);
      return pngPath;

    } catch (e) {
      process.stdout.write(`\x1b[33m⚠️ [IMAGE-GEN]\x1b[0m ${provider.name} failed: ${e.message}\n`);
    }
  }

  process.stdout.write(`\x1b[31m❌ [IMAGE-GEN]\x1b[0m All providers failed. No image generated.\n`);
  return null;
}

if (process.argv[1] && process.argv[1].endsWith('stable-diffusion-node.mjs')) {
  const prompt = process.argv[2] || 'glassmorphism abstract background, 8k, vibrant colors';
  const filename = process.argv[3] || 'generated-asset.png';
  generateAsset(prompt, filename).then((result) => {
    if (!result) process.exit(1);
  });
}
