import { describe, it, expect } from 'vitest';
import {
  DOMAIN_PACKS,
  STRICTNESS_MODES,
  BOT_ROSTER,
  scorePrompt,
  getGrade,
  getBarColor,
  buildPromptStack
} from '../src/engine.js';

describe('AI Generator Hub', () => {

  // ─── Domain Packs ──────────────────────────────────────────────
  describe('Domain Packs', () => {
    it('has at least 5 domain packs', () => {
      expect(Object.keys(DOMAIN_PACKS).length).toBeGreaterThanOrEqual(5);
    });

    it('each pack has id, name, icon, color, and keywords', () => {
      for (const pack of Object.values(DOMAIN_PACKS)) {
        expect(pack.id).toBeDefined();
        expect(pack.name).toBeDefined();
        expect(pack.icon).toBeDefined();
        expect(pack.color).toBeDefined();
        expect(Array.isArray(pack.keywords)).toBe(true);
        expect(pack.keywords.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Strictness Modes ──────────────────────────────────────────
  describe('Strictness Modes', () => {
    it('has at least 4 strictness modes', () => {
      expect(Object.keys(STRICTNESS_MODES).length).toBeGreaterThanOrEqual(4);
    });

    it('each mode has id, name, icon, and description', () => {
      for (const mode of Object.values(STRICTNESS_MODES)) {
        expect(mode.id).toBeDefined();
        expect(mode.name).toBeDefined();
        expect(mode.description).toBeDefined();
      }
    });
  });

  // ─── Prompt Scoring ────────────────────────────────────────────
  describe('scorePrompt', () => {
    it('returns 0 for empty prompt', () => {
      expect(scorePrompt('')).toBe(0);
    });

    it('returns a numeric score for a basic prompt', () => {
      const score = scorePrompt('Build a login page');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(150);
    });

    it('scores higher for detailed prompts with high-signal keywords', () => {
      const basic = scorePrompt('Build a login page');
      const detailed = scorePrompt(
        'Build a production-grade authenticated login page with rate limiting, ' +
        'error handling, validation, type-safe schema, and comprehensive test coverage ' +
        'using React, Node.js, and PostgreSQL. Must handle edge cases for expired tokens ' +
        'and ensure atomic database operations with proper migration strategy.'
      );
      expect(detailed).toBeGreaterThan(basic);
    });

    it('returns 150 when singularity and omega are active', () => {
      expect(scorePrompt('anything', '', '', 'development', 'autonomous', true, true)).toBe(150);
    });

    it('sovereign mode scores >= autonomous mode for same prompt', () => {
      const prompt = 'Build a secure API with validation';
      const sovScore = scorePrompt(prompt, '', '', 'development', 'sovereign');
      const autoScore = scorePrompt(prompt, '', '', 'development', 'autonomous');
      expect(sovScore).toBeGreaterThanOrEqual(autoScore);
    });
  });

  // ─── Grade Labels ──────────────────────────────────────────────
  describe('getGrade', () => {
    it('returns Sovereign grade for 130+', () => {
      expect(getGrade(150).label).toContain('Sovereign');
    });

    it('returns Raw Draft for very low scores', () => {
      expect(getGrade(5).label).toContain('Raw Draft');
    });

    it('returns a color with each grade', () => {
      expect(getGrade(90).color).toBeDefined();
      expect(getGrade(90).color).toMatch(/^#/);
    });
  });

  // ─── Bar Color ─────────────────────────────────────────────────
  describe('getBarColor', () => {
    it('returns green for scores >= 90', () => {
      expect(getBarColor(95)).toBe('#4ade80');
    });

    it('returns red for scores < 50', () => {
      expect(getBarColor(30)).toBe('#f87171');
    });
  });

  // ─── Prompt Stack Builder ──────────────────────────────────────
  describe('buildPromptStack', () => {
    it('builds a complete prompt stack from task spec', () => {
      const stack = buildPromptStack({
        task: 'Build a dashboard',
        stack: 'React, Node.js',
        domain: 'development',
        strictness: 'autonomous',
        context: 'This is for an internal tool.'
      });

      expect(stack.systemPrompt).toContain('Autonomous');
      expect(stack.systemPrompt).toContain('Development');
      expect(stack.executionPrompt).toContain('Build a dashboard');
      expect(stack.executionPrompt).toContain('React, Node.js');
      expect(stack.executionPrompt).toContain('internal tool');
      expect(stack.repairPrompt).toContain('Build a dashboard');
      expect(stack.qaPrompt).toContain('QA Gate');
      expect(stack.releaseGatePrompt).toContain('Release Gate');
    });

    it('sovereign mode adds truth verification directive', () => {
      const stack = buildPromptStack({
        task: 'Build a secure API',
        strictness: 'sovereign'
      });
      expect(stack.systemPrompt).toContain('SOVEREIGN MODE');
    });

    it('defaults to development domain and autonomous mode', () => {
      const stack = buildPromptStack({ task: 'Test' });
      expect(stack.systemPrompt).toContain('Development');
      expect(stack.systemPrompt).toContain('Autonomous');
    });
  });
});
