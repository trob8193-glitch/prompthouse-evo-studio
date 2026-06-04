/**
 * SovereignPhysics — Physics-based layout engine for dynamic UI element positioning
 * Status: ACTIVE
 */
export class SovereignPhysics {
  constructor() {
    this.name = 'SovereignPhysics';
    this.description = 'Physics-based layout engine for dynamic UI element positioning';
    this.status = 'ACTIVE';
  }

  // Force-directed graph simulation step
  simulateTick(nodes, edges, options = {}) {
    const { 
      repulsion = 1000, 
      springLength = 100, 
      springFactor = 0.05, 
      damping = 0.8 
    } = options;

    // Apply repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        nodes[i].vx = (nodes[i].vx || 0) - fx;
        nodes[i].vy = (nodes[i].vy || 0) - fy;
        nodes[j].vx = (nodes[j].vx || 0) + fx;
        nodes[j].vy = (nodes[j].vy || 0) + fy;
      }
    }

    // Apply spring forces along edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const displacement = dist - springLength;
      const force = displacement * springFactor;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx = (source.vx || 0) + fx;
      source.vy = (source.vy || 0) + fy;
      target.vx = (target.vx || 0) - fx;
      target.vy = (target.vy || 0) - fy;
    });

    // Update positions and apply damping
    nodes.forEach(node => {
      node.x += (node.vx || 0);
      node.y += (node.vy || 0);
      node.vx = (node.vx || 0) * damping;
      node.vy = (node.vy || 0) * damping;
    });

    return nodes;
  }

  applyGravityToNodes(nodes, center = { x: 0, y: 0 }, strength = 0.01) {
    nodes.forEach(node => {
      const dx = center.x - node.x;
      const dy = center.y - node.y;
      node.vx = (node.vx || 0) + dx * strength;
      node.vy = (node.vy || 0) + dy * strength;
    });
    return nodes;
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'A',
      state: this.status,
      resonance: 100,
      description: this.description
    };
  }
}

export function calculateCapabilityGravity(candidate) {
  let gravity = 0;
  if (candidate.gated) return -100; // Severely penalize gated candidates
  if (candidate.proofCount) gravity += candidate.proofCount;
  if (candidate.testsPassed) gravity += 3;
  if (candidate.buildPassed) gravity += 3;
  return gravity;
}

export function rankCapabilityField(field) {
  return field
    .map(c => ({ ...c, gravity: calculateCapabilityGravity(c) }))
    .sort((a, b) => b.gravity - a.gravity);
}
