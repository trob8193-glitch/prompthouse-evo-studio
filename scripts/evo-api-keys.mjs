import db from '../src/core/db/quad_schema.js';
import crypto from 'crypto';

const action = process.argv[2];

if (action === 'generate') {
  const name = process.argv[3] || 'External Client';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `ph_evo_sk_${randomBytes}`;
  const prefix = `ph_evo_sk_${randomBytes.slice(0, 6)}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const id = `key_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;

  db.prepare(`
    INSERT INTO api_keys (id, organization_id, name, key_prefix, key_hash, environment, status)
    VALUES (?, 'org_master', ?, ?, ?, 'production', 'active')
  `).run(id, name, prefix, keyHash);

  console.log('✅ Evo API Key successfully generated!');
  console.log(`\n======================================================`);
  console.log(`🔑 Key ID:  ${id}`);
  console.log(`🏷️  Name:    ${name}`);
  console.log(`✨ Raw Key: ${rawKey}`);
  console.log(`======================================================\n`);
  console.log('⚠️  Store this key safely! It will never be displayed again.');
  console.log('💡 Users can now send POST requests to http://<your-ip>:3001/v1/chat/completions using this key as the Bearer token.');
  
} else if (action === 'list') {
  const keys = db.prepare(`
    SELECT id, name, key_prefix, environment, status, created_at, last_used_at 
    FROM api_keys 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `).all();

  console.log(`\n📋 Active Evo API Keys (${keys.length}):\n`);
  keys.forEach(k => {
    console.log(`- [${k.id}] ${k.name} (Prefix: ${k.key_prefix}...) | Created: ${k.created_at} | Last Used: ${k.last_used_at || 'Never'}`);
  });
  console.log('');
  
} else if (action === 'revoke') {
  const id = process.argv[3];
  if (!id) {
    console.error('❌ Error: Please provide the Key ID to revoke (e.g., key_abc123).');
    process.exit(1);
  }
  
  const result = db.prepare(`
    UPDATE api_keys 
    SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(id);
  
  if (result.changes === 0) {
    console.error(`❌ Error: Key '${id}' not found or already revoked.`);
  } else {
    console.log(`✅ Key '${id}' successfully revoked! It can no longer be used to access the Swarm.`);
  }

} else {
  console.log(`
Evo API Key Manager
===================
Usage:
  node scripts/evo-api-keys.mjs generate [name]
  node scripts/evo-api-keys.mjs list
  node scripts/evo-api-keys.mjs revoke [key_id]
  `);
}
