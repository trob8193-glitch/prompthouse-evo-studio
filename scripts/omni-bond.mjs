#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import db from '../src/core/db/quad_schema.js';

const cwd = process.cwd();
const secretDir = path.join(cwd, '.prompthouse-data', 'secrets');
const receiptDir = path.join(cwd, '.prompthouse-data', 'omni-bond');
const tokenEnvName = 'PH_EVO_IDE_TOKEN';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeIdeFile(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, value, 'utf8');
}

function createIdeToken() {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `ph_evo_sk_${randomBytes}`;
  const prefix = `ph_evo_sk_${randomBytes.slice(0, 6)}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyId = `key_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
  db.prepare(`
    INSERT INTO api_keys (id, organization_id, name, key_prefix, key_hash, environment, status)
    VALUES (?, 'org_master', 'IDE-Tether-Omni', ?, ?, 'local', 'active')
  `).run(keyId, prefix, keyHash);
  return { keyId, rawKey, prefix, keyHash };
}

function writeTokenInstructions({ rawKey, prefix }) {
  ensureDir(secretDir);
  const envFile = path.join(secretDir, 'ide-token.local.env');
  fs.writeFileSync(envFile, `${tokenEnvName}=${rawKey}\n`, { encoding: 'utf8', mode: 0o600 });
  return { envFile, prefix };
}

function bondIdeConfigs() {
  const vscodeDir = path.join(cwd, '.vscode');
  ensureDir(vscodeDir);
  writeIdeFile(path.join(vscodeDir, 'settings.json'), JSON.stringify({
    editor: undefined,
    'editor.formatOnSave': true,
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'files.exclude': { '**/.sovereign-shards': true, '**/.prompthouse-data': true },
    'workbench.colorCustomizations': {
      'activityBar.background': '#0F172A',
      'titleBar.activeBackground': '#020617',
      'titleBar.activeForeground': '#818CF8',
    },
    'terminal.integrated.defaultProfile.windows': 'PowerShell',
  }, null, 2));
  writeIdeFile(path.join(vscodeDir, 'extensions.json'), JSON.stringify({
    recommendations: ['esbenp.prettier-vscode', 'bradlc.vscode-tailwindcss', 'dbaeumer.vscode-eslint'],
  }, null, 2));

  const rule = `You are bonded to the PromptHouse Evo Studio. Never delete .prompthouse-data. Always format with Prettier. Respect the Sovereign Ledger. If you discover a new pattern, teach the Sovereign Master Layer with:\n\ncurl -X POST http://127.0.0.1:3001/api/sovereign-uplink -H "Content-Type: application/json" -H "Authorization: Bearer \${${tokenEnvName}}" -d '{"origin":"ExternalAI","action":"TEACH","payload":"your message"}'\n\nDo not paste raw API keys into rule files. Load ${tokenEnvName} from .prompthouse-data/secrets/ide-token.local.env or your OS secret store.`;
  writeIdeFile(path.join(cwd, '.cursorrules'), rule);
  writeIdeFile(path.join(cwd, '.windsurfrules'), rule);

  const zedDir = path.join(cwd, '.zed');
  ensureDir(zedDir);
  writeIdeFile(path.join(zedDir, 'settings.json'), JSON.stringify({ format_on_save: 'on', formatter: 'prettier', ui_font_size: 14, theme: 'One Dark' }, null, 2));

  const codexDir = path.join(cwd, '.codex');
  ensureDir(codexDir);
  writeIdeFile(path.join(codexDir, 'manifest.json'), JSON.stringify({ engine: 'OpenAI Codex', strictMode: true, lore: 'Sovereign Master Layer' }, null, 2));

  const agDir = path.join(cwd, '.gemini', 'antigravity-ide');
  ensureDir(agDir);
  writeIdeFile(path.join(agDir, 'manifest.json'), JSON.stringify({ engine: 'Antigravity Neural Subsystem', strictMode: true, lore: 'Sovereign Master Layer', tetherStatus: 'ACTIVE' }, null, 2));

  ensureDir(path.join(cwd, '.idea'));

  return ['vscode', 'cursor', 'windsurf', 'webstorm', 'zed', 'codex', 'antigravity'];
}

const token = createIdeToken();
const secret = writeTokenInstructions(token);
const bonded = bondIdeConfigs();
const receipt = {
  success: true,
  truthState: 'OMNI_BOND_SECURE_TOKENIZED',
  generatedAt: new Date().toISOString(),
  bonded,
  keyId: token.keyId,
  keyPrefix: token.prefix,
  tokenStorage: path.relative(cwd, secret.envFile),
  rawTokenWrittenToRules: false,
  ruleTokenReference: tokenEnvName,
};

writeJson(path.join(receiptDir, `omni-bond-${Date.now()}.json`), receipt);
writeJson(path.join(receiptDir, 'latest.json'), receipt);
console.log(JSON.stringify(receipt, null, 2));
