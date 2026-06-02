import { join } from 'path';
import { writeFileSync } from 'fs';
import { runNuclearTruthAudit } from '../../core/audit/NuclearTruthAudit.js';
import { ai, promptCompressor, truthGate, OLLAMA_BASE, DATA_DIR } from '../core-deps.js';

/* global fetch, AbortSignal */

async function runEvoLmTeamChat(messages, systemPrompt = '') {
  let processedSystemPrompt = systemPrompt;
  if (systemPrompt.length > 200) {
    processedSystemPrompt = await promptCompressor.compress(systemPrompt);
  }

  const ollamaModels = ['evo-lm', 'llama3', 'mistral', 'phi3', 'gemma'];
  for (const model of ollamaModels) {
    try {
      const ollamaMessages = processedSystemPrompt
        ? [{ role: 'system', content: processedSystemPrompt }, ...messages]
        : messages;
      const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: ollamaMessages, stream: false }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const content = data.message?.content || data.response || '';
      if (!content) continue;
      truthGate.enforce(content, 'Evo LM Team Chat');
      return { success: true, message: content, provider: 'evo_lm', model, transport: 'ollama', from_cache: false };
    } catch {
      // Keep trying next model.
    }
  }

  const fallback = await ai.generateResponse(messages, processedSystemPrompt);
  return {
    success: fallback.truth_state === 'VERIFIED',
    message: fallback.message,
    provider: fallback.provider || 'fallback',
    model: 'fallback',
    transport: 'bridge_fallback',
    from_cache: Boolean(fallback.from_cache)
  };
}

function appendTrainingExamples(examples = [], source = 'evo_team_run') {
  const file = join(DATA_DIR, 'evo_training.jsonl');
  const redact = t => String(t || '')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED]')
    .replace(/ph_evo_[A-Za-z0-9]+/g, '[REDACTED]')
    .replace(/Bearer\s+\S{20,}/g, '[REDACTED]');

  const lines = examples.map(example => JSON.stringify({
    messages: [
      { role: 'system', content: redact(example.systemPrompt) },
      { role: 'user', content: redact(example.input) },
      { role: 'assistant', content: redact(example.output) },
    ],
    metadata: {
      source,
      transport: example.transport || 'team_run',
      timestamp: example.timestamp || new Date().toISOString()
    }
  })).join('\n') + '\n';

  writeFileSync(file, lines, { flag: 'a', encoding: 'utf8' });
  return file;
}

export {
  runEvoLmTeamChat,
  appendTrainingExamples
};
