export function compareEvolutionRun({ beforeSnapshot, afterSnapshot, proof, proposal } = {}) {
  const beforeHashes = beforeSnapshot?.fileHashes || {};
  const afterHashes = afterSnapshot?.fileHashes || {};
  const targetFiles = (proposal?.files || []).map(file => file.path).filter(Boolean);
  const changedFiles = targetFiles.filter(file => beforeHashes[file] !== afterHashes[file]);
  const issues = [];

  if (!proof?.passed) issues.push(`Proof failed: ${proof?.failedCommand || 'unknown command'}`);
  if ((proposal?.blockedReasons || []).length) issues.push(...proposal.blockedReasons);
  if (targetFiles.length > 0 && changedFiles.length === 0) issues.push('No target files changed.');

  return {
    improved: issues.length === 0,
    changedFiles,
    issues,
    proofPassed: Boolean(proof?.passed),
    risk: proposal?.risk || 'UNKNOWN'
  };
}

export function isImprovement(comparison = {}) {
  return Boolean(comparison.improved && comparison.proofPassed && (comparison.issues || []).length === 0);
}

export function getRegressionReasons(comparison = {}) {
  return comparison.issues || [];
}
