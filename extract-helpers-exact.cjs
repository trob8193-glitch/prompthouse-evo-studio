const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('promptbridge-server.js', 'utf8');
const lines = content.split('\n');

function extractBlock(startFunc, endFunc, newFile, imports = '') {
  const startIndex = lines.findIndex(l => l.startsWith('function ' + startFunc) || l.startsWith('async function ' + startFunc));
  let endIndex = -1;
  if (endFunc) {
     endIndex = lines.findIndex(l => l.startsWith('function ' + endFunc) || l.startsWith('async function ' + endFunc));
  } else {
     endIndex = lines.length; // to the end
  }
  
  if (startIndex === -1 || (endFunc && endIndex === -1)) {
    console.error(`Could not find ${startFunc} or ${endFunc}`);
    return null;
  }
  
  // Look for end of the last function before endFunc
  let realEndIndex = endIndex - 1;
  while (realEndIndex > startIndex && lines[realEndIndex].trim() === '') {
     realEndIndex--;
  }
  // Include the closing brace of the last function
  if (lines[realEndIndex].trim() !== '}') {
     while (realEndIndex < lines.length && lines[realEndIndex].trim() !== '}') {
       realEndIndex++;
     }
  }
  realEndIndex++; // include the brace line
  
  const chunk = lines.slice(startIndex, realEndIndex).join('\n');
  const moduleContent = `${imports}\n\n${chunk}\n`;
  
  const exports = [];
  const funcRegex = /^(?:async )?function ([a-zA-Z0-9_]+)/gm;
  let match;
  while ((match = funcRegex.exec(chunk)) !== null) {
    exports.push(match[1]);
  }
  
  const finalContent = `${moduleContent}\nexport {\n  ${exports.join(',\n  ')}\n};\n`;
  fs.mkdirSync(path.dirname(newFile), { recursive: true });
  fs.writeFileSync(newFile, finalContent);
  
  // Replace the block with an empty string so it gets deleted
  for (let i = startIndex; i < realEndIndex; i++) {
     lines[i] = 'DELETE_ME';
  }
  
  console.log(`Extracted ${startFunc} to ${newFile}`);
}

// 1. Common Helpers
extractBlock('sanitizeEmail', 'resolveEvolutionSubject', 'src/server/utils/common-helpers.js', 
`import crypto from 'crypto';`);

// 2. Evolution Helpers
extractBlock('resolveEvolutionSubject', 'ensureJsonWebTokenSecret', 'src/server/utils/evolution-helpers.js', 
`import crypto from 'crypto';
import { stableHash, clamp, toSafeJson } from './common-helpers.js';
import db from '../../core/db/quad_schema.js';`);

// 3. Auth Helpers
extractBlock('ensureJsonWebTokenSecret', 'resolveWorkspacePath', 'src/server/utils/auth-helpers.js', 
`import jwt from 'jsonwebtoken';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { hasExplicitOwnerApproval, getApprovalBlockReason } from '../../owner-approval.js';

const JWT_SECRET = process.env.JWT_SECRET || '';
const REQUIRE_AUTH_FOR_MUTATIONS = process.env.REQUIRE_AUTH_MUTATIONS !== 'false';
const DATA_DIR = join(process.cwd(), '.prompthouse-data');
const AUTH_TOKENS_FILE = join(DATA_DIR, 'revoked_tokens.json');`);

// 4. Diagnostic Helpers
extractBlock('resolveWorkspacePath', 'runEvoLmTeamChat', 'src/server/utils/diagnostic-helpers.js', 
`import { join, resolve, dirname, extname, relative } from 'path';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
const DIAGNOSTIC_SKIP_DIRS = new Set(['node_modules', '.git', '.gemini', 'dist', '.next']);
const DIAGNOSTIC_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);`);

// 5. AI Helpers
extractBlock('runEvoLmTeamChat', 'defaultNightforgeState', 'src/server/utils/ai-helpers.js', 
`import { join } from 'path';
import { writeFileSync } from 'fs';
import { runNuclearTruthAudit } from '../../core/audit/NuclearTruthAudit.js';`);

// 6. Nightforge Helpers
extractBlock('defaultNightforgeState', 'scheduleNightforgeDaemon', 'src/server/utils/nightforge-helpers.js', 
`import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Log } from '../../core/autonomy/SovereignLogger.js';
import { dispatchEvolutionSignal } from './evolution-helpers.js';`);

const finalLines = lines.filter(l => l !== 'DELETE_ME');
fs.writeFileSync('promptbridge-server.js', finalLines.join('\n'));
console.log('Extraction complete.');
