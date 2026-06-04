import { describe, it, expect } from 'vitest';
import { ConsentModes } from '../src/core/memory/consent_modes.js';

describe('ConsentModes', () => {
  it('defaults to STRICT mode', () => {
    const consent = new ConsentModes();
    expect(consent.getConsentMode()).toBe('STRICT');
  });

  it('blocks all data collection in STRICT mode', () => {
    const consent = new ConsentModes('STRICT');
    expect(consent.canCollect('telemetry')).toBe(false);
    expect(consent.canCollect('promptCapture')).toBe(false);
    expect(consent.canCollect('modelTraining')).toBe(false);
  });

  it('allows telemetry but blocks prompts in ANONYMOUS mode', () => {
    const consent = new ConsentModes('ANONYMOUS');
    expect(consent.canCollect('telemetry')).toBe(true);
    expect(consent.canCollect('promptCapture')).toBe(false);
    expect(consent.canCollect('modelTraining')).toBe(false);
    expect(consent.canCollect('usageAnalytics')).toBe(true);
  });

  it('allows everything in FULL mode', () => {
    const consent = new ConsentModes('FULL');
    expect(consent.canCollect('telemetry')).toBe(true);
    expect(consent.canCollect('promptCapture')).toBe(true);
    expect(consent.canCollect('modelTraining')).toBe(true);
  });

  it('changes mode and tracks history', () => {
    const consent = new ConsentModes();
    consent.setConsentMode('FULL');
    
    expect(consent.getConsentMode()).toBe('FULL');
    expect(consent.getHistory().length).toBe(2);
  });

  it('rejects invalid modes', () => {
    const consent = new ConsentModes();
    const result = consent.setConsentMode('INVALID');
    expect(result.success).toBe(false);
    expect(consent.getConsentMode()).toBe('STRICT');
  });

  it('getStatus returns active grade', () => {
    const consent = new ConsentModes();
    const status = consent.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
