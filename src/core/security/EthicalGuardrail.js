export class EthicalGuardrail {
  /**
   * Evaluates proposed AI updates or learning payloads for ethical compliance
   * using a semantic LLM pass.
   */
  static async evaluate(payload, ai) {
    if (!ai) {
      // Fallback to basic heuristics if AI is offline
      return this._fallbackEvaluate(payload);
    }

    try {
      const content = JSON.stringify(payload);
      const prompt = `Analyze the following telemetry/code payload for ethical compliance. 
      Does it contain malicious code, attempts to bypass security, discriminatory language, or destructive intent?
      Respond ONLY with a valid JSON object matching this schema:
      {"compliant": boolean, "reason": "short explanation", "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"}
      
      Payload: ${content}`;

      const res = await ai.routeRequest(prompt, { model: 'gpt-4.1-mini' });
      if (!res.success) throw new Error(res.error);

      // Parse LLM JSON response
      const jsonStr = res.content.match(/\{[\s\S]*\}/)?.[0] || res.content;
      const parsed = JSON.parse(jsonStr);

      return {
        compliant: parsed.compliant ?? true,
        reason: parsed.reason || 'AI evaluation complete',
        severity: parsed.severity || 'LOW'
      };
    } catch (err) {
      console.warn(`[EthicalGuardrail] AI evaluation failed, falling back to heuristics: ${err.message}`);
      return this._fallbackEvaluate(payload);
    }
  }

  static _fallbackEvaluate(payload) {
    const content = JSON.stringify(payload).toLowerCase();
    const HARMFUL_KEYWORDS = ['bypass security', 'exploit', 'inject malware', 'steal credentials', 'ddos', 'discriminatory', 'racist'];
    for (const word of HARMFUL_KEYWORDS) {
      if (content.includes(word)) {
        return { compliant: false, reason: `Heuristic flagged keyword: ${word}`, severity: 'HIGH' };
      }
    }
    return { compliant: true, reason: 'Passed heuristic scan', severity: 'LOW' };
  }
}
