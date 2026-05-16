import fetch from 'node-fetch';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * PH EVO STUDIO — GEMINI ANALYZER (SMFF PHASE A)
 * ═══════════════════════════════════════════════════════════════
 * Ingests the entire repository context to identify profitable feature gaps.
 */
export class GeminiAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = "gemini-1.5-pro"; // Large context model
  }

  async analyzeProject(rootPath) {
    console.log(`🔍 [GeminiAnalyzer] Ingesting project context from: ${rootPath}`);
    const context = this.harvestCodebase(rootPath);
    
    const prompt = `
      You are the PromptHouse Evo Studio "Product Architect."
      I am providing the entire source code of the studio below.
      
      YOUR GOAL: 
      Identify 3 distinct, high-value features that are currently MISSING from this studio.
      These features must be something users would pay for (micro-SaaS).
      
      Output your response as a JSON array of "missions":
      [
        {
          "id": "feature_id",
          "name": "Feature Name",
          "description": "What it does and why it's valuable.",
          "estimatedPrice": 900, // price in cents
          "complexity": "HIGH|MEDIUM|LOW",
          "techStack": ["React", "Vite", "Stripe"]
        }
      ]
      
      PROJECT CONTEXT:
      ${context}
    `;

    return await this.callGemini(prompt);
  }

  harvestCodebase(dir, depth = 0) {
    if (depth > 5) return ""; // Limit depth
    let context = "";
    const files = readdirSync(dir);

    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.prompthouse-data') continue;
      
      const fullPath = join(dir, file);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        context += `\n--- DIRECTORY: ${file} ---\n`;
        context += this.harvestCodebase(fullPath, depth + 1);
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
        const content = readFileSync(fullPath, 'utf8');
        context += `\nFILE: ${file}\nCONTENT:\n${content.substring(0, 2000)}\n`; // Sample first 2k chars per file
      }
    }
    return context;
  }

  async callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ [GeminiAnalyzer] Error:', e.message);
      return { error: e.message };
    }
  }
}
