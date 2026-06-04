import { describe, it, expect } from 'vitest';
import { SemanticBranchEngine } from '../src/core/knowledge/SemanticBranchEngine.js';

describe('SemanticBranchEngine', () => {
  it('creates a new branch', () => {
    const engine = new SemanticBranchEngine();
    const branch = engine.createBranch('React Concepts');
    
    expect(branch.id).toMatch(/^branch_/);
    expect(branch.root).toBe('React Concepts');
    expect(branch.nodes.length).toBe(1);
    expect(engine.branches.size).toBe(1);
  });

  it('adds nodes to a branch', () => {
    const engine = new SemanticBranchEngine();
    const branch = engine.createBranch('React Concepts');
    
    const node1 = engine.addNode(branch.id, 'React Concepts', 'Hooks');
    const node2 = engine.addNode(branch.id, 'Hooks', 'useEffect');
    
    expect(node1.id).toBe('Hooks');
    expect(node2.parentId).toBe('Hooks');
    expect(branch.nodes.length).toBe(3);
    
    const rootNode = branch.nodes.find(n => n.id === 'React Concepts');
    expect(rootNode.children).toContain('Hooks');
  });

  it('getStatus returns active grade', () => {
    const engine = new SemanticBranchEngine();
    const status = engine.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
