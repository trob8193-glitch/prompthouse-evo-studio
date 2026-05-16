/**
 * CONTEXT COMPACTOR
 * ═══════════════════════════════════════════════════════════════
 * Shrinks massive codeblocks, removes whitespace, strips generic
 * comments, and creates a dense AST-like representation to drastically
 * reduce API input token costs.
 */
export class ContextCompactor {
  constructor() {
    this.GPT4_COST_PER_1K_INPUT = 0.0025; // Example blended rate
  }

  compress(contextStr) {
    if (!contextStr || contextStr.length === 0) {
      return { compactedContext: '', savings: { tokens: 0, cost: 0 } };
    }

    const originalLength = contextStr.length;
    
    // 1. Strip block comments (/** ... */ and /* ... */)
    let compacted = contextStr.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 2. Strip single line comments (// ...) but preserve URLs (http://)
    compacted = compacted.replace(/(?<!:)\/\/.*/g, '');
    
    // 3. Remove excessive whitespace and blank lines
    compacted = compacted.replace(/^\s*[\r\n]/gm, '');
    compacted = compacted.replace(/\s{2,}/g, ' ');
    
    // 4. Remove excessive console.logs (optional, but saves tokens)
    compacted = compacted.replace(/console\.log\([^)]*\);?/g, '');

    const newLength = compacted.length;
    
    // Rough heuristic: 4 characters per token
    const originalTokens = Math.ceil(originalLength / 4);
    const newTokens = Math.ceil(newLength / 4);
    const tokensSaved = Math.max(0, originalTokens - newTokens);
    
    const costSaved = (tokensSaved / 1000) * this.GPT4_COST_PER_1K_INPUT;

    return {
      compactedContext: compacted.trim(),
      savings: {
        tokens: tokensSaved,
        cost: costSaved
      }
    };
  }
}
