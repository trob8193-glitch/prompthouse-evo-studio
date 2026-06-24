import fetch from 'node-fetch';
import OpenAI from 'openai';
import { getActiveModel } from '../../src/core/ai/ModelRegistry.js';

export class UniversalImageAdaptor {
  constructor(keys = {}) {
    this.keys = keys;
    this.openai = keys.openai ? new OpenAI({ apiKey: keys.openai }) : null;
  }

  updateKeys(keys) {
    this.keys = { ...this.keys, ...keys };
    if (this.keys.openai) {
      this.openai = new OpenAI({ apiKey: this.keys.openai });
    }
  }

  async generate(prompt, engine, options = {}) {
    const steps = options.steps || 30;
    const cfg = options.cfg || 7;

    try {
      if (engine === 'dalle' && this.keys.openai) {
        return await this.callDalle(prompt);
      } else if (engine === 'stablediffusion') {
        return await this.callStableDiffusion(prompt, steps, cfg);
      } else {
        throw new Error(`Unsupported image engine or missing API key: ${engine}`);
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async callDalle(prompt) {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      return { success: true, url: response.data[0].url, engine: 'dalle' };
    } catch (e) {
      throw new Error(`DALL-E 3 Error: ${e.message}`);
    }
  }

  async callStableDiffusion(prompt, steps, cfg) {
    try {
      // Calls local Automatic1111 /sdapi/v1/txt2img
      const response = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: 'blurry, ugly, poor quality, text, watermark',
          steps: steps,
          cfg_scale: cfg,
          width: 1024,
          height: 1024
        })
      });
      
      const data = await response.json();
      if (!data.images || data.images.length === 0) {
        throw new Error("No image returned from Stable Diffusion.");
      }
      
      // Automatic1111 returns raw base64. We prepend the data URI header for the frontend.
      const base64Image = `data:image/png;base64,${data.images[0]}`;
      return { success: true, url: base64Image, engine: 'stablediffusion' };
    } catch (e) {
      if (e.message.includes('fetch')) {
        throw new Error("Stable Diffusion server not reachable. Ensure it is running on http://127.0.0.1:7860 with --api enabled.");
      }
      throw new Error(`Stable Diffusion Error: ${e.message}`);
    }
  }
}
