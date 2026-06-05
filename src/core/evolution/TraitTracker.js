const TRAIT_KEYWORDS = Object.freeze({
  persona: ['act as', 'persona', 'role'],
  jsonSchema: ['json', 'schema', 'keys'],
  examples: ['example', 'sample'],
  proof: ['proof', 'receipt', 'verify'],
  cost: ['short', 'compress', 'tokens'],
  tools: ['tool', 'function', 'api', 'route']
});

function hasAny(text, words) {
  const lower = String(text || '').toLowerCase();
  return words.some(word => lower.includes(word));
}

export function detectPromptTraits(text = '') {
  const traits = {};
  for (const [name, words] of Object.entries(TRAIT_KEYWORDS)) {
    traits[name] = hasAny(text, words);
  }
  return traits;
}

export function comparePromptTraits({ before = '', after = '', scoreBefore = 0, scoreAfter = 0 } = {}) {
  const beforeTraits = detectPromptTraits(before);
  const afterTraits = detectPromptTraits(after);
  const addedTraits = Object.keys(afterTraits).filter(key => afterTraits[key] && !beforeTraits[key]);
  const removedTraits = Object.keys(beforeTraits).filter(key => beforeTraits[key] && !afterTraits[key]);
  const delta = Number(scoreAfter || 0) - Number(scoreBefore || 0);
  return {
    truthState: delta === 0 ? 'TRAIT_REPORT_FLAT' : 'TRAIT_REPORT_READY',
    scoreBefore,
    scoreAfter,
    delta,
    beforeTraits,
    afterTraits,
    addedTraits,
    removedTraits,
    likelyHelpfulTraits: delta > 0 ? addedTraits : []
  };
}

export default { detectPromptTraits, comparePromptTraits };
