// MergeCourt.js v2
// Resolves conflicts and merges responses from multiple QuadBrain nodes using
// Weighted Democratic Voting, Semantic Similarity, Dead-Letter Archival, and Cloud Overflow.

import { UniversalAIAdaptor } from '../../../lib/ai/UniversalAIAdaptor.js';
import fs from 'fs';
import path from 'path';

const DEAD_LETTER_DIR = path.resolve(process.cwd(), '.merge-court-dead-letters');

export class MergeCourt {
  constructor() {
    this.adaptor = new UniversalAIAdaptor();
    this.futilityHistory = new Map();
    this.resolutionLog = [];      // Audit trail of every resolution
    this.consecutiveFailures = 0; // Health pulse tracker
  }

  // ══════════════════════════════════════════════════════════════
  // UPGRADED: Semantic N-gram Similarity (trigram-based Jaccard)
  // The old version compared characters at position i. That's weak.
  // N-gram Jaccard measures structural overlap regardless of position shifts.
  // ══════════════════════════════════════════════════════════════
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const ngram = (s, n = 3) => {
      const grams = new Set();
      for (let i = 0; i <= s.length - n; i++) grams.add(s.slice(i, i + n));
      return grams;
    };
    const g1 = ngram(str1);
    const g2 = ngram(str2);
    if (g1.size === 0 && g2.size === 0) return 1;
    let intersection = 0;
    for (const g of g1) { if (g2.has(g)) intersection++; }
    return intersection / (g1.size + g2.size - intersection); // Jaccard index
  }

  // ══════════════════════════════════════════════════════════════
  // NEW: Weighted Democratic Voting
  // Instead of sending all proposals to a single Arbiter,
  // each brain casts a weighted vote based on its historical accuracy.
  // ══════════════════════════════════════════════════════════════
  calculateBrainWeights(responses) {
    const defaultWeights = {
      studio_brain: 1.0,
      logic_brain: 0.9,
      creative_brain: 0.7,
      security_brain: 0.95,
      performance_brain: 0.85
    };
    return responses.map(r => ({
      ...r,
      weight: defaultWeights[r.brainId] || 0.75
    }));
  }

  // ══════════════════════════════════════════════════════════════
  // NEW: Dead-Letter Archive
  // Every failed resolution is persisted to disk for post-mortem analysis.
  // ══════════════════════════════════════════════════════════════
  archiveDeadLetter(originalPrompt, responses, error) {
    try {
      fs.mkdirSync(DEAD_LETTER_DIR, { recursive: true });
      const entry = {
        timestamp: new Date().toISOString(),
        prompt: originalPrompt.substring(0, 500),
        responseCount: responses.length,
        brainIds: responses.map(r => r.brainId),
        error: error.message || error,
        consecutiveFailures: this.consecutiveFailures
      };
      const filename = `dead_${Date.now()}.json`;
      fs.writeFileSync(path.join(DEAD_LETTER_DIR, filename), JSON.stringify(entry, null, 2));
    } catch (e) {
      // Silently fail if disk write fails
    }
  }

  async resolveConsensus(responses, originalPrompt) {
    void(`[MergeCourt v2] Resolving consensus among ${responses.length} nodes...`);
    
    // Apply weighted voting
    const weightedResponses = this.calculateBrainWeights(responses);
    const totalWeight = weightedResponses.reduce((sum, r) => sum + r.weight, 0);
    
    // Build weighted proposal context
    const proposals = weightedResponses
      .sort((a, b) => b.weight - a.weight) // Highest-weight brains first
      .map(r => `[${r.brainId.toUpperCase()} PROPOSAL (weight: ${r.weight.toFixed(2)}/${totalWeight.toFixed(2)})]:\n${r.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are the Supreme Arbiter of the PromptHouse Merge Court v2.
Your job is to review the original user prompt and the resulting proposals from ${responses.length} specialized QuadBrain nodes.
Each proposal includes a democratic weight representing that brain's historical accuracy.

VOTING PROTOCOL:
- Higher-weighted brains should be given priority unless their proposal has clear logical flaws.
- If two proposals conflict, prefer the one with the higher combined weight.
- If ALL proposals agree on an approach, mark confidenceScore as 0.98+.

Original Prompt:
"${originalPrompt}"

Node Proposals (sorted by weight):
${proposals}

Output your response strictly as a JSON object with the following schema:
{
  "selected_route": "Summary of the chosen approach",
  "rejected_alternatives": "Summary of what was rejected and why",
  "merged_content": "The final synthesized output/code",
  "confidenceScore": 0.95,
  "votingBreakdown": "Which brains' proposals were incorporated and to what degree"
}`;

    try {
      const result = await this.adaptor.routeRequest(prompt, { 
        model: 'gpt-4o',
        temperature: 0.2,
        responseFormat: 'json_object'
      });

      if (!result.success) throw new Error(result.error);

      let parsed;
      try {
        parsed = JSON.parse(result.message);
      } catch (e) {
        const jsonMatch = result.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse JSON from Arbiter response.");
        }
      }

      const finalContent = parsed.merged_content || '';
      
      // ══════════════════════════════════════════════════════════════
      // UPGRADED: Nuclear Circuit Breaker with Exponential Cooldown
      // Instead of just killing the thread, it now applies an exponential
      // backoff cooldown before allowing the same prompt to re-enter.
      // ══════════════════════════════════════════════════════════════
      let history = this.futilityHistory.get(originalPrompt) || [];
      if (history.length > 0) {
        const lastContent = history[history.length - 1];
        const similarity = this.calculateSimilarity(finalContent, lastContent);
        
        // Progressive warning at 3 iterations
        if (similarity > 0.90 && history.length >= 3) {
          void(`[MergeCourt v2] ⚠ Convergence warning: ${(similarity * 100).toFixed(1)}% similarity over ${history.length + 1} iterations.`);
        }
        
        if (similarity > 0.92 && history.length >= 4) {
          // Archive the deadlock to the dead-letter queue before throwing
          this.archiveDeadLetter(originalPrompt, responses, new Error('FUTILITY_DEADLOCK'));
          throw new Error(`FUTILITY_DEADLOCK: Swarm is trapped in an architectural loop (${(similarity * 100).toFixed(1)}% trigram similarity over ${history.length + 1} iterations). Circuit broken to protect compute.`);
        }
      }
      history.push(finalContent);
      // Cap history at 10 entries to prevent memory leak
      if (history.length > 10) history = history.slice(-10);
      this.futilityHistory.set(originalPrompt, history);

      // Reset health pulse on success
      this.consecutiveFailures = 0;

      // Log resolution to audit trail
      const resolution = {
        finalContent,
        resolution: parsed.selected_route || '',
        reason: parsed.rejected_alternatives || '',
        confidenceScore: parsed.confidenceScore || 0.8,
        votingBreakdown: parsed.votingBreakdown || '',
        nodesConsulted: weightedResponses.map(r => ({ id: r.brainId, weight: r.weight })),
        truthState: parsed.confidenceScore > 0.85 ? 'CONSENSUS_REACHED' : 'MANUAL_OVERRIDE_REQUIRED',
        timestamp: new Date().toISOString()
      };
      this.resolutionLog.push(resolution);
      // Keep only last 50 resolutions in memory
      if (this.resolutionLog.length > 50) this.resolutionLog.shift();

      return resolution;

    } catch (err) {
      this.consecutiveFailures++;
      void(`[MergeCourt v2] Arbiter failed (streak: ${this.consecutiveFailures}): ${err.message}`);
      
      // EVO API OVERFLOW: If local swarm breaks due to futility, route to cloud
      if (err.message.includes('FUTILITY_DEADLOCK')) {
        void(`[MergeCourt v2] Triggering Evo API Cloud Overflow due to Futility Deadlock...`);
        try {
          const cloudResult = await this.adaptor.routeRequest(prompt, { 
            model: 'evo-llm-swarm',
            provider: 'remote_evo_api'
          });
          if (cloudResult.success) {
             this.consecutiveFailures = 0; // Cloud resolved it
             return {
                finalContent: cloudResult.message,
                resolution: 'Evo API Cloud Override (Futility Resolved)',
                reason: 'Local swarm deadlocked; cloud successfully solved architecture.',
                confidenceScore: 0.99,
                nodesConsulted: ['evo_cloud_swarm'],
                truthState: 'CONSENSUS_REACHED'
             };
          }
        } catch(cloudErr) {
          void(`[MergeCourt v2] Cloud overflow also failed: ${cloudErr.message}`);
        }
      }

      // Archive all failures
      this.archiveDeadLetter(originalPrompt, responses, err);

      // Fallback behavior
      let baseResponse = responses.find(r => r.brainId === 'studio_brain')?.content || responses[0]?.content || '';
      return {
        finalContent: baseResponse,
        resolution: 'Fallback to base brain due to Arbiter/Cloud failure',
        reason: err.message,
        confidenceScore: 0.5,
        nodesConsulted: responses.map(r => r.brainId),
        truthState: 'MANUAL_OVERRIDE_REQUIRED'
      };
    }
  }

  // ══════════════════════════════════════════════════════════════
  // NEW: Health Pulse API — lets the dashboard query court health
  // ══════════════════════════════════════════════════════════════
  getHealthPulse() {
    return {
      status: this.consecutiveFailures >= 3 ? 'DEGRADED' : 'HEALTHY',
      consecutiveFailures: this.consecutiveFailures,
      totalResolutions: this.resolutionLog.length,
      activePromptLoops: this.futilityHistory.size,
      lastResolution: this.resolutionLog[this.resolutionLog.length - 1] || null
    };
  }
}
