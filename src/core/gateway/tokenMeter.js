const APPROX_CHARS_PER_TOKEN = 4;

export function estimateTokens(text = '') {
  const clean = String(text || '');
  if (!clean) return 0;
  return Math.max(1, Math.ceil(clean.length / APPROX_CHARS_PER_TOKEN));
}

export function estimateMessagesTokens(messages = []) {
  if (!Array.isArray(messages)) return estimateTokens(String(messages || ''));
  return messages.reduce((sum, message) => {
    const roleOverhead = 4;
    return sum + roleOverhead + estimateTokens(message?.content || '');
  }, 0);
}

export function estimateCompressionStats({ originalText = '', compressedText = '' } = {}) {
  const beforeTokens = estimateTokens(originalText);
  const afterTokens = estimateTokens(compressedText || originalText);
  const savedTokens = Math.max(0, beforeTokens - afterTokens);
  const savingsPercent = beforeTokens > 0 ? Number(((savedTokens / beforeTokens) * 100).toFixed(2)) : 0;
  return { beforeTokens, afterTokens, savedTokens, savingsPercent };
}

export function estimateRequestTokens({ messages = [], expectedOutputTokens = 800 } = {}) {
  return {
    inputTokens: estimateMessagesTokens(messages),
    outputTokens: Number(expectedOutputTokens || 0)
  };
}
