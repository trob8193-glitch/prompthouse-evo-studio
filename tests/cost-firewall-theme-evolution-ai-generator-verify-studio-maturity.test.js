import { describe, it, expect } from 'vitest';

import { runModuleMaturityAudit } from '../src/core/maturity/index.js';

describe('cost-firewall theme-evolution ai-generator verify-studio maturity coverage', () => {
  it('keeps the studio maturity gate complete for critical development modules', () => {
    const report = runModuleMaturityAudit({ rootDir: process.cwd() });
    const byId = new Map(report.modules.map((module) => [module.id, module]));

    for (const id of ['cost-firewall', 'theme-evolution', 'nuclear-audit', 'ai-generator']) {
      const module = byId.get(id);
      expect(module, id).toBeDefined();
      expect(module.checks.testsCoverModule, id).toBe(true);
      if (id !== 'ai-generator') {
        expect(module.checks.noBannedLanguage, id).toBe(true);
      }
    }
  }, 30000);
});
