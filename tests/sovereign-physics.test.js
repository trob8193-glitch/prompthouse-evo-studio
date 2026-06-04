import { describe, it, expect } from 'vitest';
import { 
  SovereignPhysics, 
  calculateCapabilityGravity, 
  rankCapabilityField 
} from '../src/core/physics/SovereignPhysics.js';

describe('SovereignPhysics', () => {
  it('applies physics simulation correctly', () => {
    const physics = new SovereignPhysics();
    const nodes = [
      { id: '1', x: 0, y: 0 },
      { id: '2', x: 10, y: 10 }
    ];
    const edges = [
      { source: '1', target: '2' }
    ];

    const resultNodes = physics.simulateTick(nodes, edges);

    expect(resultNodes.length).toBe(2);
    // Nodes should have velocity applied and moved apart or together
    expect(resultNodes[0].x).not.toBe(0);
    expect(resultNodes[0].y).not.toBe(0);
  });

  it('applies center gravity to nodes', () => {
    const physics = new SovereignPhysics();
    const nodes = [
      { id: '1', x: -100, y: -100 },
      { id: '2', x: 100, y: 100 }
    ];
    
    physics.applyGravityToNodes(nodes, { x: 0, y: 0 }, 0.1);

    // Nodes should accelerate towards center (0,0)
    expect(nodes[0].vx).toBeGreaterThan(0);
    expect(nodes[0].vy).toBeGreaterThan(0);
    expect(nodes[1].vx).toBeLessThan(0);
    expect(nodes[1].vy).toBeLessThan(0);
  });

  it('calculates capability gravity properly', () => {
    expect(calculateCapabilityGravity({ gated: true })).toBe(-100);
    expect(calculateCapabilityGravity({ proofCount: 5, testsPassed: true, buildPassed: true })).toBe(11); // 5 + 3 + 3
  });

  it('ranks capabilities by gravity', () => {
    const candidates = [
      { id: 'A', gated: true },
      { id: 'B', proofCount: 1, testsPassed: false, buildPassed: false },
      { id: 'C', proofCount: 10, testsPassed: true, buildPassed: true }
    ];

    const ranked = rankCapabilityField(candidates);
    expect(ranked[0].id).toBe('C');
    expect(ranked[1].id).toBe('B');
    expect(ranked[2].id).toBe('A');
  });

  it('getStatus returns active grade', () => {
    const physics = new SovereignPhysics();
    const status = physics.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
