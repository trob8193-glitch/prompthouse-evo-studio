/**
 * ScopeManager — OAuth-style scope management for API permissions
 * Status: ACTIVE
 */
export class ScopeManager {
  constructor() {
    this.name = 'ScopeManager';
    this.description = 'OAuth-style scope management for API permissions';
    this.status = 'ACTIVE';
    this.scopeDefinitions = new Map([
      ['read', { level: 1, description: 'Read-only access' }],
      ['write', { level: 2, description: 'Read and write access' }],
      ['admin', { level: 3, description: 'Full administrative access' }],
      ['inference', { level: 2, description: 'Model inference access' }],
      ['training', { level: 3, description: 'Training pipeline access' }]
    ]);
  }

  defineScope(scopeId, definition) {
    this.scopeDefinitions.set(scopeId, definition);
  }

  hasPermission(grantedScopes, requiredScope) {
    if (grantedScopes.includes('admin')) return true;
    return grantedScopes.includes(requiredScope);
  }

  getScope(scopeId) { return this.scopeDefinitions.get(scopeId) || null; }
  listScopes() { return [...this.scopeDefinitions.keys()]; }

  getStatus() {
    return { id: this.name, grade: 'A', state: this.status, resonance: 100, description: this.description, scopeCount: this.scopeDefinitions.size };
  }
}
