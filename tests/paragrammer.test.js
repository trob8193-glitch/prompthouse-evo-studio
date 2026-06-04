import { describe, it, expect } from 'vitest';
import { Paragrammer } from '../src/core/training/Paragrammer.js';

describe('Paragrammer', () => {
  it('extracts template parameters from text', () => {
    const p = new Paragrammer();
    const params = p.extractParameters('Hello {{name}}, welcome to {{city}}');
    
    expect(params).toContain('name');
    expect(params).toContain('city');
    expect(params.length).toBe(2);
  });

  it('creates templates by replacing values with keys', () => {
    const p = new Paragrammer();
    const result = p.createTemplate('The sky is blue and water is blue.', { color: 'blue' });
    
    expect(result).toBe('The sky is {{color}} and water is {{color}}.');
  });

  it('getStatus returns active grade', () => {
    const p = new Paragrammer();
    const status = p.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
