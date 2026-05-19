import path from 'path';

export function getEvoLlmPaths({ rootDir = process.cwd() } = {}) {
  const base = path.join(rootDir, '.evo-llm');
  return {
    base,
    training: path.join(base, 'training-data'),
    receipts: path.join(base, 'receipts'),
    modelCards: path.join(base, 'model-cards'),
    manifest: path.join(base, 'dataset-manifest.json'),
    trainJsonl: path.join(base, 'training-data', 'evo-train.jsonl'),
    evalJsonl: path.join(base, 'training-data', 'evo-eval.jsonl')
  };
}
