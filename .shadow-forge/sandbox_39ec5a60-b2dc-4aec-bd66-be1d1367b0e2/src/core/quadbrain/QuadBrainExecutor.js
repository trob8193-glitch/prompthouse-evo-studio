import { QUADBRAIN_CANON } from './QuadBrainContract.js';
import { MergeCourt } from './MergeCourt.js';
import { UniversalAIAdaptor } from '../../../lib/ai/UniversalAIAdaptor.js';
import dotenv from 'dotenv';
import path from 'path';

// Force dynamic env loading at runtime for keys
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env.agent'), override: true });

export class QuadBrainExecutor {
  constructor() {
    this.mergeCourt = new MergeCourt();
    this.adaptor = new UniversalAIAdaptor();
  }

  // Executes a REAL query to an individual brain node via OpenAI API
  async queryNode(brain, prompt) {
    void(`[QuadBrain Node] Dispatching to ${brain.name} (Role: ${brain.role})...`);
    
    const systemPrompt = `You are a specialized node in the PromptHouse QuadBrain architecture.
Your Name: ${brain.name}
Your Role: ${brain.role}
Constraints: You must answer the user's prompt STRICTLY through the lens of your specialized role. Ignore aspects of the prompt that fall outside your domain. Output pure insight.`;

    try {
      // Use gpt-3.5-turbo or gpt-4o depending on role weight/cost if desired, we'll use gpt-4o-mini for speed/cost balance
      const response = await this.adaptor.routeRequest(prompt, { 
        model: 'gpt-4o-mini', 
        temperature: 0.7 
      });

      if (!response.success) throw new Error(response.error);

      return {
        brainId: brain.id,
        content: `[${brain.name} / ${brain.role}]:\n${response.message}`,
        tokensUsed: Math.floor(response.message.length / 4) // rough estimate
      };
    } catch (err) {
      void(`[QuadBrain Node] ${brain.name} encountered an error: ${err.message}. Falling back to baseline.`);
      return {
        brainId: brain.id,
        content: `[${brain.name}]: Offline due to ${err.message}`,
        tokensUsed: 0
      };
    }
  }

  async executeParallel(prompt, selectedBrains = []) {
    let brainsToQuery = QUADBRAIN_CANON.brains.filter(b => selectedBrains.includes(b.id));
    if (brainsToQuery.length === 0) {
      brainsToQuery = QUADBRAIN_CANON.brains; // Default to all 4 brains
    }

    void(`[QuadBrainExecutor] Executing parallel AI inference across ${brainsToQuery.length} nodes...`);
    
    // Launch all API requests concurrently
    const promises = brainsToQuery.map(brain => this.queryNode(brain, prompt));
    const responses = await Promise.all(promises);
    
    void(`[QuadBrainExecutor] Responses received. Convening Merge Court...`);

    // Resolve consensus via Merge Court
    const consensus = await this.mergeCourt.resolveConsensus(responses, prompt);

    return {
      success: true,
      truthState: consensus.truthState,
      confidence: consensus.confidenceScore,
      nodesConsulted: consensus.nodesConsulted,
      finalOutput: consensus.finalContent,
      rawResponses: responses
    };
  }
}
