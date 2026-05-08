import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Log } from '../core/autonomy/SovereignLogger.js';

export class DeadHunterPro {
  constructor() {
    this.strikePatterns = [
      { name: "ConsoleLogs", regex: /console\.log\(/g, description: "Console log found" },
      { name: "UnhandledError", regex: /(try[\s\S]*?catch\s*\(\s*\)\s*\{)/g, description: "Empty catch block found" },
      { name: "MissingErrorHandler", regex: /function\s*\(\s*err\s*\)/g, description: "Function missing error handling" }
    ];
    this.trainingFile = path.join(process.cwd(), '.prompthouse-data', 'evo_training.jsonl');
  }

  runGlobalStrike(projectPath) {
    const issues = [];
    this._scanDirectory(projectPath, issues);
    
    // Log training data
    this._logTrainingData('DeadHunterPro', { projectPath }, { issuesFound: issues.length });
    
    return issues;
  }

  _scanDirectory(dir, issues) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git') {
          this._scanDirectory(fullPath, issues);
        }
      } else if (stat.isFile() && path.extname(fullPath) === '.js') {
        this._analyzeFile(fullPath, issues);
      }
    }
  }

  _analyzeFile(filePath, issues) {
    const content = fs.readFileSync(filePath, 'utf8');
    this.strikePatterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        issues.push({
          file: filePath,
          issue: pattern.name,
          description: pattern.description,
          occurrences: matches.length
        });
      }
    });
  }

  _logTrainingData(module, input, output) {
    try {
      const dir = path.dirname(this.trainingFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const trainingEntry = {
        messages: [
          { role: 'system', content: `You are the ${module} engine. Master of algorithms, structure, and digital infrastructure.` },
          { role: 'user', content: `Context:\n${JSON.stringify(input)}\n\nAction requested: execute` },
          { role: 'assistant', content: JSON.stringify(output) }
        ],
        metadata: {
          source: 'autonomous_deadhunter',
          transport: 'live_execution',
          timestamp: Date.now(),
          concepts: ["Algorithms", "Structure", "Digital Infrastructure"]
        }
      };

      fs.appendFileSync(this.trainingFile, JSON.stringify(trainingEntry) + '\n', 'utf8');
      Log.info(`📊 [DeadHunterPro] Training data logged to ${this.trainingFile}`);
    } catch (err) {
      Log.error('📊 [DeadHunterPro] Failed to log training data.', err);
    }
  }
}

export class EntropyLockV2 {
  constructor() {
    this.checksumAlgorithm = 'sha256';
  }

  computeChecksum(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash(this.checksumAlgorithm).update(fileBuffer).digest('hex');
  }

  verifyFileIntegrity(filePath, knownChecksum) {
    const currentChecksum = this.computeChecksum(filePath);
    return currentChecksum === knownChecksum;
  }
}

