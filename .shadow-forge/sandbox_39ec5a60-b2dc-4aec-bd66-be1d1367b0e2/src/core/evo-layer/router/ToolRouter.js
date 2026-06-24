import { getAdapterStatus } from '../adapters/AdapterBus.js';

export function routeTask({ rootDir = process.cwd(), task }) {
  const adapters = getAdapterStatus({ rootDir });

  const t = (task || '').toLowerCase();

  const active = (name) => adapters.find(a => a.name === name && a.status !== 'missing');

  if (t.includes('code') || t.includes('refactor') || t.includes('build')) {
    return active('vscode') ? 'vscode' : active('cursor') ? 'cursor' : 'filesystem';
  }

  if (t.includes('ai') || t.includes('chat') || t.includes('model')) {
    return active('ollama') ? 'ollama' : 'openai';
  }

  if (t.includes('deploy') || t.includes('release')) {
    return active('vercel') ? 'vercel' : 'filesystem';
  }

  if (t.includes('payment') || t.includes('billing')) {
    return active('stripe') ? 'stripe' : 'openai';
  }

  return active('filesystem') ? 'filesystem' : 'git';
}
