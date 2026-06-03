import { HonestFallbackClass } from '../fallback-marker.js';

/**
 * ApiKeyManager — Manages API key lifecycle, rotation, and scope permissions
 * Status: NOT_IMPLEMENTED (honest fallback)
 */
export class ApiKeyManager extends HonestFallbackClass {
  constructor() { super('ApiKeyManager', 'Manages API key lifecycle, rotation, and scope permissions'); }
}
