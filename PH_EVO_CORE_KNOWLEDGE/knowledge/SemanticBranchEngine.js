/**
 * PH EVO STUDIO — SEMANTIC BRANCH ENGINE
 * ═══════════════════════════════════════════════════════════════
 * A Semantic Network system that takes a concept and expands it into
 * related topics, subtopics, keywords, and knowledge paths.
 */

import fs from 'fs';
import path from 'path';

const BRAIN_PATH = path.join(process.cwd(), '.sovereign-brain.json');

export class SemanticBranchEngine {
  constructor() {
    this.brain = this.loadBrain();
  }

  loadBrain() {
    if (fs.existsSync(BRAIN_PATH)) {
      return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf8'));
    }
    return null;
  }

  /**
   * EXPAND: Takes a concept and builds a Semantic Network
   */
  expand(concept) {
    console.log(`🌿 [SemanticBranch] Expanding concept: "${concept}"...`);
    if (!this.brain) return null;

    const patterns = this.brain.internalized_patterns || [];
    const lowerConcept = concept.toLowerCase();

    // 1. Find the Root Node
    const rootNodes = patterns.filter(p => 
      p.category?.toLowerCase().includes(lowerConcept) || 
      p.summary?.toLowerCase().includes(lowerConcept)
    );

    // 2. Branch out via Spider Webs
    const webs = this.brain.evo_tree_webs || [];
    const relatedIds = new Set();
    
    rootNodes.forEach(root => {
      webs.forEach(web => {
        if (web.source === root.id) relatedIds.add(web.target);
        if (web.target === root.id) relatedIds.add(web.source);
      });
    });

    // 3. Build the Network
    const network = {
      root: concept,
      nodes: rootNodes.map(r => ({ id: r.id, title: r.summary, category: r.category })),
      branches: Array.from(relatedIds).map(id => {
        const pattern = patterns.find(p => p.id === id);
        return pattern ? { id: pattern.id, title: pattern.summary, category: pattern.category } : null;
      }).filter(Boolean),
      timestamp: new Date().toISOString()
    };

    console.log(`  ✓ Expanded into ${network.branches.length} subtopics.`);
    return network;
  }
}
