import { HonestFallbackClass } from '../fallback-marker.js';

/**
 * LocalMemoryBox — Local-first encrypted memory storage for sensitive agent state
 * Status: NOT_IMPLEMENTED (honest fallback)
 */
export class LocalMemoryBox extends HonestFallbackClass {
  constructor() { super('LocalMemoryBox', 'Local-first encrypted memory storage for sensitive agent state'); }
}
