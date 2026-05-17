export class SelfEvolutionError extends Error {
  constructor(message, code = 'SELF_EVOLUTION_ERROR', details = {}) {
    super(message);
    this.name = 'SelfEvolutionError';
    this.code = code;
    this.details = details;
  }
}

export class PolicyViolationError extends SelfEvolutionError {
  constructor(message, details = {}) {
    super(message, 'POLICY_VIOLATION', details);
    this.name = 'PolicyViolationError';
  }
}

export class ProofFailedError extends SelfEvolutionError {
  constructor(message, details = {}) {
    super(message, 'PROOF_FAILED', details);
    this.name = 'ProofFailedError';
  }
}

export class RollbackRequiredError extends SelfEvolutionError {
  constructor(message, details = {}) {
    super(message, 'ROLLBACK_REQUIRED', details);
    this.name = 'RollbackRequiredError';
  }
}
