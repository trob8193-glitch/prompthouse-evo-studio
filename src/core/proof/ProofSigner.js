import crypto from 'crypto';

function removeSignatureFields(value = {}) {
  const unsigned = { ...value };
  delete unsigned.signature;
  delete unsigned.signedAt;
  delete unsigned.signedBy;
  delete unsigned.signatureVersion;
  return unsigned;
}

export function stableStringify(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function hashProofPayload(value) {
  return crypto.createHash('sha256').update(stableStringify(value)).digest('hex');
}

export function signProofObject(value, { signedBy = 'gatekeeper', signatureVersion = 'sha256-local-v1' } = {}) {
  const unsigned = removeSignatureFields(value);
  return {
    ...value,
    signedBy,
    signatureVersion,
    signature: hashProofPayload(unsigned),
    signedAt: new Date().toISOString()
  };
}

export function verifyProofSignature(value = {}) {
  if (!value.signature) {
    return { valid: false, truthState: 'PROOF_SIGNATURE_MISSING' };
  }
  const expected = hashProofPayload(removeSignatureFields(value));
  return {
    valid: expected === value.signature,
    truthState: expected === value.signature ? 'PROOF_SIGNATURE_VALID' : 'PROOF_SIGNATURE_MISMATCH',
    expected,
    actual: value.signature
  };
}
