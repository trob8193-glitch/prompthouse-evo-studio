/**
 * SEMANTIC ROUTER (The Local-First Cascade)
 * ═══════════════════════════════════════════════════════════════
 * Analyzes intent and routes easy tasks to free local models 
 * (Ollama) while reserving GPT-4o for high-IQ tasks.
 */
export class SemanticRouter {
  constructor() {
    this.localKeywords = [
      'fix spelling', 'format code', 'add comments', 'what is this', 
      'explain', 'rename', 'boilerplate', 'simple component'
    ];
    
    this.highIqKeywords = [
      'architect', 'design', 'complex', 'debug massive', 'refactor entire',
      'saas', 'fullstack', 'database schema', 'recursive'
    ];
  }

  determineRoute(prompt, context) {
    const pLow = prompt.toLowerCase();
    
    // 1. Force Local if explicitly requested
    if (pLow.includes('@local')) {
      return { provider: 'local', model: 'llama3', reasoning: 'Explicit local flag.' };
    }

    // 2. Check for High-IQ triggers
    for (const kw of this.highIqKeywords) {
      if (pLow.includes(kw)) {
        return { provider: 'openai', model: 'gpt-4o', reasoning: `Triggered high-IQ keyword: ${kw}` };
      }
    }

    // 3. Check for Simple Task triggers
    for (const kw of this.localKeywords) {
      if (pLow.includes(kw)) {
        return { provider: 'local', model: 'llama3', reasoning: `Triggered local simple keyword: ${kw}` };
      }
    }

    // 4. Default Heuristics: Context size + Prompt length
    // If it's a massive context dump, we probably need GPT-4o's context window.
    if (context.length > 10000) {
      return { provider: 'openai', model: 'gpt-4o-mini', reasoning: 'Large context, defaulting to fast mini model.' };
    }

    // Default to local to save money if we aren't sure
    return { provider: 'local', model: 'llama3', reasoning: 'Defaulting to local for savings.' };
  }
}
