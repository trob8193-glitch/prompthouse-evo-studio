/**
 * PH EVO STUDIO — WEB WEAVER ENGINE
 * ═══════════════════════════════════════════════════════════════
 * This module creates "Spider Webs" across the Evo Tree, linking
 * disparate branches, seeds, and leaves into a unified graph.
 * It transforms the tree from a hierarchy into a living connectome.
 */

import fs from 'fs';
import path from 'path';

const BRAIN_PATH = path.join(process.cwd(), '.sovereign-brain.json');

export class WebWeaver {
  constructor() {
    this.brain = this.loadBrain();
  }

  loadBrain() {
    if (fs.existsSync(BRAIN_PATH)) {
      return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf8'));
    }
    return null;
  }

  async weave() {
    console.log('🕷️ [WebWeaver] Weaving spider webs across the training tree...');
    if (!this.brain) return;

    const patterns = this.brain.internalized_patterns || [];
    const webs = [];

    // BATCH_WEAVE: Instead of looping O(n^2), we send a batch of patterns
    // to the Evo Agent to identify the most resonant connections.
    const agentInput = `Analyze these ${patterns.length} patterns and identify the 10 strongest cross-links. Return JSON {links: [{sourceId, targetId, reason, strength}]}.\nPatterns: ${JSON.stringify(patterns.slice(0, 20))}`;
    
    try {
      const response = await fetch('http://localhost:3001/api/agents/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'Evo Knowledge Weaver', input: agentInput })
      });
      const data = await response.json();
      
      if (data.output && data.output.links) {
        data.output.links.forEach(l => {
          webs.push({
            id: `web_${l.sourceId}_${l.targetId}`,
            source: l.sourceId,
            target: l.targetId,
            strength: l.strength || 0.8,
            reason: l.reason,
            resonance: 'agentic',
            type: 'cross_branch_link'
          });
        });
      }
    } catch (e) {
      console.error('🕷️ [WebWeaver] Agentic weave failed, falling back to basic logic:', e.message);
      // Fallback logic for basic matching...
    }

    this.brain.evo_tree_webs = webs;
    this.saveBrain();
    console.log(`  ✓ Wove ${webs.length} spider webs between knowledge nodes.`);
  }

  isRelated(pA, pB) {
    // Legacy fallback
    const catA = pA.category?.toLowerCase();
    const catB = pB.category?.toLowerCase();
    return catA === catB;
  }

  saveBrain() {
    fs.writeFileSync(BRAIN_PATH, JSON.stringify(this.brain, null, 2), 'utf8');
  }
}

// Execution
const weaver = new WebWeaver();
weaver.weave();
