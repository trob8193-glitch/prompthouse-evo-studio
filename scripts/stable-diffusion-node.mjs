import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'src', 'assets');

/**
 * Connects to a local Automatic1111 Stable Diffusion node
 * Default port: 7860
 */
export async function generateAsset(prompt, filename) {
  console.log(`\x1b[35m🎨 [STABLE-DIFFUSION]\x1b[0m Connecting to local node...`);
  console.log(`   Prompt: "${prompt}"`);
  
  const payload = {
    prompt: prompt,
    negative_prompt: "ugly, blurry, low quality, text, watermark",
    steps: 20,
    width: 512,
    height: 512,
    sampler_name: "Euler a",
    cfg_scale: 7
  };

  try {
    const response = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`SD Node HTTP error ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.images[0];
    
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const filepath = path.join(assetsDir, filename.endsWith('.png') ? filename : `${filename}.png`);
    fs.writeFileSync(filepath, base64Image, 'base64');
    
    console.log(`\x1b[32m✅ [STABLE-DIFFUSION]\x1b[0m Asset forged: ${filepath}`);
    return filepath;
  } catch (err) {
    console.error(`\x1b[31m❌ [STABLE-DIFFUSION] Error: Could not reach local node.\x1b[0m Is Automatic1111 running on 127.0.0.1:7860?`);
    console.error(`   Details: ${err.message}`);
    
    // Fallback: Create a transparent placeholder so the pipeline doesn't crash
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
    const filepath = path.join(assetsDir, filename.endsWith('.png') ? filename : `${filename}.png`);
    const fallbackBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    fs.writeFileSync(filepath, fallbackBase64, 'base64');
    console.log(`\x1b[33m⚠️ [STABLE-DIFFUSION] Created invisible fallback placeholder.\x1b[0m`);
    return filepath;
  }
}

if (process.argv[1] && process.argv[1].endsWith('stable-diffusion-node.mjs')) {
  const prompt = process.argv[2] || "glassmorphism abstract background, 8k, vibrant colors";
  const filename = process.argv[3] || "generated-asset.png";
  generateAsset(prompt, filename).then(() => process.exit(0));
}
