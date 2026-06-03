import { HonestFallbackClass } from '../fallback-marker.js';

/**
 * WorkspaceMemory — Persists workspace state (open files, layout, preferences) across sessions
 * Status: NOT_IMPLEMENTED (honest fallback)
 */
export class WorkspaceMemory extends HonestFallbackClass {
  constructor() { super('WorkspaceMemory', 'Persists workspace state (open files, layout, preferences) across sessions'); }
}
