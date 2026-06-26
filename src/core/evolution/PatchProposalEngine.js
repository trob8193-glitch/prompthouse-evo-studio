import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SHADOW_FORGE } from '../autonomy/ShadowForge.js';
import { GlobalSplitTether } from '../tethers/SplitTetherDaemon.js';

const PROPOSALS_DIR = () => path.join(process.cwd(), '.prompthouse-data', 'evolution', 'proposals');

function ensureDir() {
  const dir = PROPOSALS_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Builds a structured patch proposal from a BlendedEvolutionEngine suggestion.
 * Generates file diffs, verification commands, and rollback instructions.
 */
export async function buildPatchProposal(options = {}) {
  const { suggestion, rootDir = process.cwd(), runId } = options;
  if (!suggestion) return { verificationOnly: true, blockedReasons: ['No suggestion provided'], files: [] };

  const proposalId = runId || crypto.randomUUID();
  const targetFile = suggestion.targetFile || 'src/index.css';
  const absolutePath = path.resolve(rootDir, targetFile);
  const fileExists = fs.existsSync(absolutePath);

  const proposal = {
    id: proposalId,
    createdAt: new Date().toISOString(),
    targetFile,
    fileExists,
    changeType: suggestion.cssRule ? 'css' : suggestion.componentChange ? 'component' : 'architecture',
    description: suggestion.description || 'No description',
    blockedReasons: [],
    files: [],
    verificationCommands: ['npm run build'],
    rollbackStrategy: fileExists ? 'restore_from_backup' : 'delete_new_file'
  };

  // Capture current file content for rollback
  if (fileExists) {
    const currentContent = fs.readFileSync(absolutePath, 'utf8');
    proposal.files.push({
      path: targetFile,
      action: 'modify',
      currentHash: crypto.createHash('sha256').update(currentContent).digest('hex'),
      proposedChange: suggestion.cssRule || suggestion.componentChange || suggestion.architectureChange,
      currentContentPreview: currentContent.slice(-200)
    });
  } else {
    proposal.files.push({
      path: targetFile,
      action: 'create',
      proposedChange: suggestion.cssRule || suggestion.componentChange || suggestion.architectureChange
    });
  }

  // Safety checks
  if (!suggestion.cssRule && !suggestion.componentChange && !suggestion.architectureChange) {
    proposal.blockedReasons.push('No actionable change in suggestion');
  }

  // [SHADOWFORGE TETHER] Validate non-CSS code through ShadowForge before persisting
  const proposedCode = suggestion.componentChange || suggestion.architectureChange;
  if (proposedCode && !suggestion.cssRule) {
    try {
      const safe = await SHADOW_FORGE.shadowBuild(`proposal_${proposalId}`, proposedCode);
      if (!safe) {
        proposal.blockedReasons.push('ShadowForge AST/syntax validation failed');
      }
    } catch (e) {
      proposal.blockedReasons.push(`ShadowForge error: ${e.message}`);
    }
  }

  // Persist proposal to disk
  ensureDir();
  const proposalPath = path.join(PROPOSALS_DIR(), `proposal_${proposalId}.json`);
  fs.writeFileSync(proposalPath, JSON.stringify(proposal, null, 2), 'utf8');

  proposal.verificationOnly = proposal.blockedReasons.length > 0;
  
  // [SPLIT-TETHER AMPLIFICATION] Send to Audit & Maintenance
  try {
    await GlobalSplitTether.splitAndRoute('PatchProposalEngine', { type: 'EVOLUTION_PATCH', id: proposal.id, payload: proposal });
  } catch (e) { /* ignore tether routing errors */ }

  return proposal;
}

/**
 * Retrieves a stored proposal by ID.
 */
export function getProposal(proposalId) {
  const proposalPath = path.join(PROPOSALS_DIR(), `proposal_${proposalId}.json`);
  if (!fs.existsSync(proposalPath)) return null;
  try { return JSON.parse(fs.readFileSync(proposalPath, 'utf8')); } catch { return null; }
}

/**
 * Lists recent proposals.
 */
export function listProposals(limit = 20) {
  ensureDir();
  const dir = PROPOSALS_DIR();
  try {
    return fs.readdirSync(dir)
      .filter(f => f.startsWith('proposal_') && f.endsWith('.json'))
      .sort().reverse().slice(0, limit)
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; }
      }).filter(Boolean);
  } catch { return []; }
}
