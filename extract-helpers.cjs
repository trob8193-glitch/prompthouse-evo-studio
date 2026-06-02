const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('promptbridge-server.js', 'utf8');
const lines = content.split('\n');

function extractLines(startStr, endStr, newFile, imports = '') {
  const startIndex = lines.findIndex(l => l.startsWith(startStr));
  const endIndex = lines.findIndex((l, i) => i > startIndex && (l.startsWith(endStr) || l.includes(endStr)));
  
  if (startIndex === -1 || endIndex === -1) {
    console.error(`Could not find ${startStr} or ${endStr}`);
    return null;
  }
  
  // Extract functions
  const chunk = lines.slice(startIndex, endIndex).join('\n');
  
  // Create module file
  const moduleContent = `${imports}\n\n${chunk}\n`;
  
  // Find exported functions
  const exports = [];
  const funcRegex = /^(?:async )?function ([a-zA-Z0-9_]+)/gm;
  let match;
  while ((match = funcRegex.exec(chunk)) !== null) {
    exports.push(match[1]);
  }
  
  const finalContent = `${moduleContent}\nexport {\n  ${exports.join(',\n  ')}\n};\n`;
  fs.mkdirSync(path.dirname(newFile), { recursive: true });
  fs.writeFileSync(newFile, finalContent);
  
  // Splice out of original
  lines.splice(startIndex, endIndex - startIndex, `// Extracted to ${newFile}`);
  
  return { file: newFile, exports };
}

// 1. Evolution Helpers
extractLines('function resolveEvolutionSubject', 'function ensureJsonWebTokenSecret', 'src/server/utils/evolution-helpers.js', 
`import crypto from 'crypto';
import { stableHash, clamp, toSafeJson } from './common-helpers.js';
import db from '../../core/db/quad_schema.js';`);

// 2. Common Helpers
extractLines('function sanitizeEmail', 'function resolveEvolutionSubject', 'src/server/utils/common-helpers.js', 
`import crypto from 'crypto';`);

// 3. Auth Helpers
extractLines('function ensureJsonWebTokenSecret', 'function createRateLimit', 'src/server/utils/auth-helpers.js', 
`import jwt from 'jsonwebtoken';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { hasExplicitOwnerApproval, getApprovalBlockReason } from '../../owner-approval.js';

const JWT_SECRET = process.env.JWT_SECRET || '';
const REQUIRE_AUTH_FOR_MUTATIONS = process.env.REQUIRE_AUTH_MUTATIONS !== 'false';
const DATA_DIR = join(process.cwd(), '.prompthouse-data');
const AUTH_TOKENS_FILE = join(DATA_DIR, 'revoked_tokens.json');`);

// 4. Diagnostic Helpers
extractLines('function resolveWorkspacePath', 'async function runEvoLmTeamChat', 'src/server/utils/diagnostic-helpers.js', 
`import { join, resolve, dirname, extname, relative } from 'path';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
const DIAGNOSTIC_SKIP_DIRS = new Set(['node_modules', '.git', '.gemini', 'dist', '.next']);
const DIAGNOSTIC_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);`);

// 5. AI Helpers
extractLines('async function runEvoLmTeamChat', 'function defaultNightforgeState', 'src/server/utils/ai-helpers.js', 
`import { join } from 'path';
import { writeFileSync } from 'fs';

// These need to be passed in or imported
// For now we will rely on caller dependency injection or pass them in to the functions`);

fs.writeFileSync('promptbridge-server.js', lines.join('\n'));
console.log('Extraction complete.');
