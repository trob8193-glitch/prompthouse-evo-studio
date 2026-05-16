import { normalizeOutputText, readJsonFile, resolveFoundryPath, writeJsonFile } from './foundry-runtime.js';

const BASE_URL = 'http://127.0.0.1:3001';
const PREFERENCES_PATH = resolveFoundryPath('preferences.json');
const IS_TEST_ENV = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

let preferences = readJsonFile(PREFERENCES_PATH, {});

function savePreferences() {
  if (IS_TEST_ENV) return;
  writeJsonFile(PREFERENCES_PATH, preferences);
}

function scoreAlignment(output, feedback) {
  const normalizedOutput = String(output || '').toLowerCase();
  const normalizedFeedback = String(feedback || '').toLowerCase();
  if (!normalizedFeedback) return 0;
  return normalizedOutput.includes(normalizedFeedback) ? 1 : 0;
}

export async function submitFeedback(input, feedback) {
  const response = await fetch(`${BASE_URL}/infer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, feedback })
  });

  if (!response.ok) {
    throw new Error(`Preference tuning request failed: ${response.status}`);
  }

  const payload = await response.json();
  const output = normalizeOutputText(payload?.output ?? payload?.message ?? payload);
  const tuned = {
    output,
    feedback: String(feedback ?? ''),
    alignmentScore: scoreAlignment(output, feedback),
    tunedAt: new Date().toISOString()
  };

  preferences[String(input)] = tuned;
  savePreferences();
  return tuned;
}

export function getPreferences() {
  return preferences;
}
