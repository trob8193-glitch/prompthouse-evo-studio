const fs = require('fs');
const path = require('path');

function extractFunctions(functionNames, newFile, imports = '') {
  const content = fs.readFileSync('promptbridge-server.js', 'utf8');
  const lines = content.split('\n');
  
  let extractedLines = [];
  let remainingLines = [];
  
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    let matchedName = null;
    
    for (const name of functionNames) {
      if (line.startsWith(`function ${name}(`) || line.startsWith(`async function ${name}(`)) {
        matchedName = name;
        break;
      }
    }
    
    if (matchedName) {
      let braceCount = 0;
      let started = false;
      let blockLines = [];
      
      while (i < lines.length) {
        let currentLine = lines[i];
        blockLines.push(currentLine);
        
        // Simple brace counting (ignores strings/comments but usually works for simple functions)
        for (const char of currentLine) {
          if (char === '{') {
            braceCount++;
            started = true;
          } else if (char === '}') {
            braceCount--;
          }
        }
        
        i++;
        if (started && braceCount === 0) {
          break;
        }
      }
      
      extractedLines.push(...blockLines);
      extractedLines.push('');
    } else {
      remainingLines.push(line);
      i++;
    }
  }
  
  if (extractedLines.length > 0) {
    const exports = `\nexport {\n  ${functionNames.join(',\n  ')}\n};\n`;
    const finalContent = `${imports}\n\n${extractedLines.join('\n')}${exports}`;
    fs.mkdirSync(path.dirname(newFile), { recursive: true });
    fs.writeFileSync(newFile, finalContent);
    fs.writeFileSync('promptbridge-server.js', remainingLines.join('\n'));
    console.log(`Extracted to ${newFile}`);
  }
}

const authFns = [
  'ensureJsonWebTokenSecret', 'loadRevokedTokens', 'saveRevokedTokens', 
  'createAuthToken', 'verifyAuthToken', 'requireAuth', 'requireMasterKey', 
  'requireAuthOrMaster', 'maybeRequireAuthOrMaster', 'attachOptionalAuthUser', 
  'requireOwnerApprovalScope', 'enforceJsonObjectBody'
];

const authImports = `import jwt from 'jsonwebtoken';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { hasExplicitOwnerApproval, getApprovalBlockReason } from '../../owner-approval.js';

const JWT_SECRET = process.env.JWT_SECRET || '';
const REQUIRE_AUTH_FOR_MUTATIONS = process.env.REQUIRE_AUTH_MUTATIONS !== 'false';
const DATA_DIR = join(process.cwd(), '.prompthouse-data');
const AUTH_TOKENS_FILE = join(DATA_DIR, 'revoked_tokens.json');`;

extractFunctions(authFns, 'src/server/utils/auth-helpers.js', authImports);

const commonFns = ['sanitizeEmail', 'sanitizeDisplayName', 'toSafeJson', 'stableHash', 'clamp'];
const commonImports = `import crypto from 'crypto';`;
extractFunctions(commonFns, 'src/server/utils/common-helpers.js', commonImports);

const evoFns = [
  'resolveEvolutionSubject', 'defaultEvolutionProfile', 'inflateEvolutionProfile', 
  'persistEvolutionProfile', 'loadOrCreateEvolutionProfile', 'recordEvolutionEvent', 
  'applyEvolutionSignal', 'mutateEvolutionProfile', 'evolutionCssVariables'
];
const evoImports = `import crypto from 'crypto';
import { stableHash, clamp, toSafeJson } from './common-helpers.js';
import db from '../../core/db/quad_schema.js';`;
extractFunctions(evoFns, 'src/server/utils/evolution-helpers.js', evoImports);

const diagFns = [
  'toPosixPath', 'collectStudioSourceFiles', 'extractImportSpecifiers', 
  'isLocalImportSpecifier', 'resolveDependencyPath', 'classifyModuleHealth', 
  'scanStudioModules', 'buildStudioDiagnostics'
];
const diagImports = `import { join, resolve, dirname, extname, relative } from 'path';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
const DIAGNOSTIC_SKIP_DIRS = new Set(['node_modules', '.git', '.gemini', 'dist', '.next']);
const DIAGNOSTIC_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);`;
extractFunctions(diagFns, 'src/server/utils/diagnostic-helpers.js', diagImports);

const aiFns = ['runEvoLmTeamChat', 'appendTrainingExamples'];
const aiImports = `import { join } from 'path';
import { writeFileSync } from 'fs';
import { runNuclearTruthAudit } from '../../core/audit/NuclearTruthAudit.js';`;
extractFunctions(aiFns, 'src/server/utils/ai-helpers.js', aiImports);

const nightforgeFns = [
  'defaultNightforgeState', 'loadNightforgeState', 'saveNightforgeState', 
  'updateNightforgeState', 'clearNightforgeDaemon', 'readNightforgeReceipts', 
  'buildNightforgeMetrics', 'buildNightforgeActions', 'runNightforgeCycle', 
  'scheduleNightforgeDaemon'
];
const nightforgeImports = `import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Log } from '../../core/autonomy/SovereignLogger.js';
import { dispatchEvolutionSignal } from './evolution-helpers.js';`;
extractFunctions(nightforgeFns, 'src/server/utils/nightforge-helpers.js', nightforgeImports);

console.log('All functions extracted.');
