import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Provider Credential Checklist Service', () => {
  let mod;

  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('configured provider returns configured true without raw value', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-proj-super-secret-key-that-must-not-leak');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(48));
    vi.stubEnv('PH_EVO_MASTER_KEY', 'b'.repeat(48));

    mod = await import('../server/services/provider-credential-checklist.js');
    const checklist = mod.getProviderCredentialChecklist();
    
    // Check OpenAI provider
    const openai = checklist.providers.find(p => p.envKey === 'OPENAI_API_KEY');
    expect(openai.configured).toBe(true);
    
    // Verify secret did not leak
    const json = JSON.stringify(checklist);
    expect(json).not.toContain('sk-proj-super-secret-key-that-must-not-leak');
  });

  it('missing optional providers returns PROVIDER_GATED', async () => {
    vi.stubEnv('JWT_SECRET', 'a'.repeat(48));
    vi.stubEnv('PH_EVO_MASTER_KEY', 'b'.repeat(48));
    // Provide empty/missing for the rest
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    vi.stubEnv('VERCEL_TOKEN', '');

    mod = await import('../server/services/provider-credential-checklist.js');
    const checklist = mod.getProviderCredentialChecklist();

    expect(checklist.truthState).toBe('PROVIDER_GATED');
    expect(checklist.warnings.length).toBe(4);
  });

  it('missing JWT_SECRET returns NEEDS_CREDENTIALS', async () => {
    vi.stubEnv('JWT_SECRET', '');
    vi.stubEnv('PH_EVO_MASTER_KEY', 'b'.repeat(48));
    
    mod = await import('../server/services/provider-credential-checklist.js');
    const checklist = mod.getProviderCredentialChecklist();

    expect(checklist.truthState).toBe('NEEDS_CREDENTIALS');
    expect(checklist.blockers[0]).toContain('JWT_SECRET');
  });

  it('missing PH_EVO_MASTER_KEY returns NEEDS_CREDENTIALS', async () => {
    vi.stubEnv('JWT_SECRET', 'a'.repeat(48));
    vi.stubEnv('PH_EVO_MASTER_KEY', '');

    mod = await import('../server/services/provider-credential-checklist.js');
    const checklist = mod.getProviderCredentialChecklist();

    expect(checklist.truthState).toBe('NEEDS_CREDENTIALS');
    expect(checklist.blockers[0]).toContain('PH_EVO_MASTER_KEY');
  });

  it('all providers configured returns VERIFIED', async () => {
    vi.stubEnv('JWT_SECRET', 'a'.repeat(48));
    vi.stubEnv('PH_EVO_MASTER_KEY', 'b'.repeat(48));
    vi.stubEnv('OPENAI_API_KEY', 'x');
    vi.stubEnv('GEMINI_API_KEY', 'x');
    vi.stubEnv('STRIPE_SECRET_KEY', 'x');
    vi.stubEnv('VERCEL_TOKEN', 'x');

    mod = await import('../server/services/provider-credential-checklist.js');
    const checklist = mod.getProviderCredentialChecklist();

    expect(checklist.truthState).toBe('VERIFIED');
    expect(checklist.blockers).toHaveLength(0);
    expect(checklist.warnings).toHaveLength(0);
  });
});
