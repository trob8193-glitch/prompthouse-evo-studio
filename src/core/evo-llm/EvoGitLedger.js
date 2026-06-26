import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getEvoLlmPaths } from './EvoLlmPaths.js';

export class EvoGitLedger {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.paths = getEvoLlmPaths({ rootDir });
    this.ledgerFile = path.join(this.paths.base, 'immutable-evo-ledger.jsonl');
  }

  ensureLedgerExists() {
    if (!fs.existsSync(path.dirname(this.ledgerFile))) {
      fs.mkdirSync(path.dirname(this.ledgerFile), { recursive: true });
    }
  }

  hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  createCryptographicSnapshot(targetFileRelativePath) {
    const fullPath = path.join(this.rootDir, targetFileRelativePath);
    if (!fs.existsSync(fullPath)) {
      return { success: false, error: 'File does not exist' };
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    const hash = this.hashContent(content);
    return { success: true, file: targetFileRelativePath, hash, content };
  }

  writeLedgerCommit({ targetFile, preHash, postHash, intention, author = 'evo-blended-engine' }) {
    this.ensureLedgerExists();
    
    const commit = {
      commitId: `evo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      author,
      targetFile,
      preHash,
      postHash,
      intention
    };

    // Make it tamper-evident by chaining with the previous line if we wanted to,
    // but a simple append-only log works well for offline Git mimicry.
    fs.appendFileSync(this.ledgerFile, `${JSON.stringify(commit)}\n`, 'utf8');
    
    return commit;
  }

  restoreCryptographicSnapshot(targetFileRelativePath, commitId) {
    const log = this.getLedgerLog(1000);
    const commit = log.find(c => c.commitId === commitId && c.targetFile === targetFileRelativePath);
    if (!commit) {
      return { success: false, error: 'Commit not found in ledger' };
    }
    
    const fullPath = path.join(this.rootDir, targetFileRelativePath);
    // In a full implementation, we'd pull the actual blob from an object store like .evo-layer/objects
    // But since this ledger just tracks hashes, a true restore requires an object store.
    // For now, we execute the capability or log the requirement for the object blob.
    
    // We will log a rollback event
    const rollbackCommit = this.writeLedgerCommit({
      targetFile: targetFileRelativePath,
      preHash: 'UNKNOWN_CURRENT',
      postHash: commit.preHash, // The hash it used to be
      intention: `HOT_ROLLBACK_TO_${commitId}`,
      author: 'evo-rollback-engine'
    });

    return { success: true, message: `Rollback triggered for ${targetFileRelativePath} to ${commitId}. Manual blob restoration required from git.`, rollbackCommit };
  }


  getLedgerLog(limit = 50) {
    if (!fs.existsSync(this.ledgerFile)) return [];
    const lines = fs.readFileSync(this.ledgerFile, 'utf8').split('\n').filter(Boolean);
    return lines.slice(-limit).map(line => JSON.parse(line)).reverse();
  }

  verifyLedgerIntegrity() {
    // A simplified verify: checks if files matched their last known post-hashes
    const log = this.getLedgerLog(100);
    const fileStates = {};
    let integrityIntact = true;
    const failures = [];

    // Traverse oldest to newest (by reversing the reverse)
    [...log].reverse().forEach(commit => {
      fileStates[commit.targetFile] = commit.postHash;
    });

    for (const [file, expectedHash] of Object.entries(fileStates)) {
      const fullPath = path.join(this.rootDir, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const currentHash = this.hashContent(content);
        if (currentHash !== expectedHash) {
          integrityIntact = false;
          failures.push({ file, expectedHash, currentHash, state: 'ALTERED_OUTSIDE_EVO' });
        }
      } else {
        integrityIntact = false;
        failures.push({ file, expectedHash, currentHash: null, state: 'DELETED_OUTSIDE_EVO' });
      }
    }

    return { intact: integrityIntact, fileCount: Object.keys(fileStates).length, failures };
  }
}
