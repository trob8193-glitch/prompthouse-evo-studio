export class PrivacyFilter {
  /**
   * Scrubs Personally Identifiable Information (PII) from incoming payloads
   * using an AI semantic pass.
   */
  static async scrub(payload, ai) {
    if (!payload) return null;
    if (!ai) return this._fallbackScrub(payload);

    try {
      const prompt = `You are a strict Data Privacy filter. 
      Analyze the following JSON payload and replace any emails, phone numbers, real names, API keys, or physical addresses with '[REDACTED]'.
      Return ONLY the exact JSON structure with the sensitive data redacted. Do not add markdown blocks like \`\`\`json.
      
      Payload: ${JSON.stringify(payload)}`;

      const res = await ai.routeRequest(prompt, { model: 'gpt-4.1-mini' });
      if (!res.success) throw new Error(res.error);

      const jsonStr = res.content.match(/\{[\s\S]*\}/)?.[0] || res.content;
      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn(`[PrivacyFilter] AI scrubbing failed, falling back to heuristics: ${err.message}`);
      return this._fallbackScrub(payload);
    }
  }

  static _fallbackScrub(payload) {
    const jsonStr = JSON.stringify(payload);
    let scrubbed = jsonStr.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
    scrubbed = scrubbed.replace(/(sk_[a-zA-Z0-9]{20,}|pk_[a-zA-Z0-9]{20,})/g, '[REDACTED_KEY]');
    return JSON.parse(scrubbed);
  }
}
