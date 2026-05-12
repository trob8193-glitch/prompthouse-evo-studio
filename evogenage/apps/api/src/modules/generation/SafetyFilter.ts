/**
 * EVOGENAGE — SAFETY FILTER (SOVEREIGN GUARD)
 * ═══════════════════════════════════════════════════════════════
 * Blocks prompts that violate safety, copyright, or brand truth.
 */

const PROHIBITED_PATTERNS = [
  { name: 'NSFW', regex: /\b(nude|sex|porn|nsfw|explicit|gore|violence)\b/i },
  { name: 'COPYRIGHT_DRIFT', regex: /\b(disney|mickey|mario|pikachu|marvel|batman|superman)\b/i },
  { name: 'IMPERSONATION', regex: /\b(elon musk|trump|biden|putin|celebrity|real person)\b/i },
  { name: 'BRAND_ATTACK', regex: /\b(ugly lion|stupid panther|broken robot|fake studio)\b/i }
];

export class SafetyFilter {
  async scan(prompt: string) {
    const findings = [];

    for (const pattern of PROHIBITED_PATTERNS) {
      if (pattern.regex.test(prompt)) {
        findings.push({
          type: 'SAFETY_VIOLATION',
          pattern: pattern.name,
          message: `Your prompt contains prohibited content: ${pattern.name}`
        });
      }
    }

    return {
      isSafe: findings.length === 0,
      findings
    };
  }
}
