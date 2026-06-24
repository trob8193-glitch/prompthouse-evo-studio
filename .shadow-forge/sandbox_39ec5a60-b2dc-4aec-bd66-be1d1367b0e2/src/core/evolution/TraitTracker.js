/**
 * TRAIT TRACKER — Detects structural traits in prompts and code
 * Used by the evolution engine to understand what patterns are present
 * and track how traits change across evolution cycles.
 */

const TRAIT_PATTERNS = {
  persona: /you are|act as|role:|signature:/i,
  jsonSchema: /json|schema|type:|required:|properties:/i,
  proof: /proof|verify|assert|test|expect|validate/i,
  tools: /tool|function_call|execute|terminal|sandbox/i,
  errorHandling: /try\s*\{|catch\s*\(|throw\s|error|reject/i,
  asyncPatterns: /async|await|promise|\.then\(/i,
  imports: /^import\s|^require\(/m,
  exports: /^export\s/m,
  documentation: /\/\*\*|@param|@returns|@description/i,
  securityPatterns: /sanitize|escape|validate|hash|encrypt|auth/i,
  stateManagement: /useState|useReducer|zustand|store|dispatch/i,
  routing: /router|route|navigate|path:/i,
  cssVariables: /var\(--|--[a-z]/i,
  animations: /animation|transition|keyframe|motion|framer/i,
  typeChecking: /typescript|type\s|interface\s|:\s*(string|number|boolean)/i
};

/**
 * Detects structural traits in content (prompt or code).
 * Returns a map of trait names to boolean presence.
 */
export function detectPromptTraits(content) {
  if (!content || typeof content !== 'string') {
    return Object.fromEntries(Object.keys(TRAIT_PATTERNS).map(k => [k, false]));
  }

  const traits = {};
  for (const [name, pattern] of Object.entries(TRAIT_PATTERNS)) {
    traits[name] = pattern.test(content);
  }

  // Compute density score (0-1)
  const traitCount = Object.values(traits).filter(Boolean).length;
  traits._density = traitCount / Object.keys(TRAIT_PATTERNS).length;
  traits._traitCount = traitCount;
  traits._totalTraits = Object.keys(TRAIT_PATTERNS).length;

  return traits;
}

/**
 * Compares two trait snapshots and returns the delta.
 * Identifies which traits were gained and lost.
 */
export function comparePromptTraits(oldTraits, newTraits) {
  if (!oldTraits || !newTraits) return { delta: 0, gained: [], lost: [], likelyHelpfulTraits: [] };

  const gained = [];
  const lost = [];

  for (const key of Object.keys(TRAIT_PATTERNS)) {
    if (!oldTraits[key] && newTraits[key]) gained.push(key);
    if (oldTraits[key] && !newTraits[key]) lost.push(key);
  }

  const delta = gained.length - lost.length;
  const likelyHelpfulTraits = gained.filter(t =>
    ['errorHandling', 'securityPatterns', 'documentation', 'proof', 'typeChecking'].includes(t)
  );

  return {
    delta,
    gained,
    lost,
    likelyHelpfulTraits,
    oldDensity: oldTraits._density || 0,
    newDensity: newTraits._density || 0,
    improved: delta > 0 || (newTraits._density || 0) > (oldTraits._density || 0)
  };
}
