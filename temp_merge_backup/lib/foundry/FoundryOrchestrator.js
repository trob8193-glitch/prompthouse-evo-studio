import { GeminiAnalyzer } from '../ai/GeminiAnalyzer.js';
import { StripeAdaptor } from '../commerce/StripeAdaptor.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * PH EVO STUDIO — FOUNDRY ORCHESTRATOR (SMFF PHASE B)
 * ═══════════════════════════════════════════════════════════════
 * The "Brain" that coordinates analysis, building, and pricing.
 */
export class FoundryOrchestrator {
  constructor(aiAdaptor, stripeAdaptor) {
    this.ai = aiAdaptor;
    this.stripe = stripeAdaptor;
    this.projectRoot = process.cwd();
  }

  async harvest(rootPath) {
    const prompt = `
      You are the PromptHouse Evo Studio "Product Architect."
      Analyze the current codebase and identify 3 high-value features missing from this studio.
      Output your response as a JSON array of "missions":
      [
        {
          "id": "feature_id",
          "name": "Feature Name",
          "description": "...",
          "estimatedPrice": 900,
          "complexity": "HIGH",
          "techStack": ["React", "Express"]
        }
      ]
    `;
    
    try {
      const response = await this.ai.generateResponse([{ role: 'user', content: prompt }], 'Analyze project context and identify product gaps.');
      // Extract JSON from message
      const text = response.message;
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        return { success: true, missions: JSON.parse(jsonMatch[0]) };
      }
      return { success: false, error: 'Failed to parse AI response as JSON.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async initiateBuild(mission) {
    const productResult = await this.stripe.createProductSession({
      productName: mission.name,
      price: mission.estimatedPrice,
      description: mission.description
    });
    return { success: true, stripe: productResult };
  }
}
