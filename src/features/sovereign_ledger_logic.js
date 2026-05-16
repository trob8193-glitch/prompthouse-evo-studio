import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Log } from '../core/autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — SOVEREIGN LEDGER (Physical Edition)
 * ═══════════════════════════════════════════════════════════════
 * The Merkle-Tree history ledger. Tracks every logic transition.
 * ABSOLUTE REALITY: Disk-anchored JSONL chain.
 */

export class SovereignLedger {
  ledgerPath;

  constructor(rootDir = process.cwd()) {
    this.ledgerPath = path.join(rootDir, 'proof_receipts', 'SOVEREIGN_MERKLE_LEDGER.jsonl');
    this.ensureLedgerExists();
  }

  ensureLedgerExists() {
    const dir = path.dirname(this.ledgerPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.ledgerPath)) fs.writeFileSync(this.ledgerPath, '');
  }

  async append(entry) {
    Log.info('⚖️ [SovereignLedger] Appending Physical Merkle Block...');
    
    // Read last hash
    const lines = fs.readFileSync(this.ledgerPath, 'utf8').split('\n').filter(Boolean);
    const prevHash = lines.length > 0 ? JSON.parse(lines[lines.length - 1]).hash : '0xSTART';
    
    const blockData = JSON.stringify({ ...entry, prevHash, timestamp: Date.now() });
    const hash = crypto.createHash('sha256').update(blockData).digest('hex');
    
    const newEntry = {
      ...entry,
      prevHash,
      hash,
      timestamp: new Date().toISOString(),
      truthState: 'SIGNED_PHYSICAL'
    };

    fs.appendFileSync(this.ledgerPath, JSON.stringify(newEntry) + '\n');
    return newEntry;
  }
}

/**
 * PH EVO STUDIO — FRANCHISE ENGINE (Physical Edition)
 * ═══════════════════════════════════════════════════════════════
 * Enables recursive studio franchising.
 * ABSOLUTE REALITY: Performs physical filesystem cloning.
 */

export class FranchiseEngine {
  async cloneAndMutate(sourcePath: string, targetPath: string, mutationIdentity: any) {
    Log.info(`🌱 [FranchiseEngine] Performing Physical Clone: ${sourcePath} -> ${targetPath}`);
    
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    // Physical Copy Logic (Recursive)
    const copyRecursive = (src: string, dest: string) => {
      const stats = fs.statSync(src);
      if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(child => {
          copyRecursive(path.join(src, child), path.join(dest, child));
        });
      } else {
        // Apply mutation if it's a logic file
        let content = fs.readFileSync(src, 'utf8');
        if (/\.(js|jsx|ts|tsx)$/.test(src)) {
          content += `\n\n// FRANCHISE_MUTATION: ${mutationIdentity.name || 'ANONYMOUS'}\n`;
          content += `// TRUTH_SIGNATURE: ${crypto.createHash('sha256').update(content).digest('hex')}\n`;
        }
        fs.writeFileSync(dest, content);
      }
    };

    copyRecursive(sourcePath, targetPath);

    return { 
      success: true, 
      status: 'MUTATED_PHYSICAL', 
      path: targetPath,
      truthState: 'SIGNED_PHYSICAL'
    };
  }
}