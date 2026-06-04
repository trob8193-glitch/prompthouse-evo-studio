/**
 * ModelRegistry — Registry of available AI models with capability metadata
 * Status: ACTIVE
 */
export class ModelRegistry {
  constructor() {
    this.name = 'ModelRegistry';
    this.description = 'Registry of available AI models with capability metadata';
    this.status = 'ACTIVE';
    this.models = new Map();
  }

  register(modelId, capabilities = {}) {
    if (this.models.has(modelId)) return false;
    this.models.set(modelId, { id: modelId, capabilities, registeredAt: Date.now(), active: true });
    return true;
  }

  get(modelId) { return this.models.get(modelId) || null; }

  listActive() { return [...this.models.values()].filter(m => m.active); }

  deactivate(modelId) {
    const m = this.models.get(modelId);
    if (!m) return false;
    m.active = false;
    return true;
  }

  getStatus() {
    return { id: this.name, grade: 'A', state: this.status, resonance: 100, description: this.description, modelCount: this.models.size };
  }
}
