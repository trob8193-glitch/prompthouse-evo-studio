import express from 'express';
import fs from 'fs';
import path from 'path';

export default function registerCredentialVaultRoutes(app) {
  const vaultPath = path.join(process.cwd(), '.env.vault');

  app.get('/api/vault/status', (req, res) => {
    try {
      const configured = fs.existsSync(vaultPath);
      res.json({ success: true, data: { configured } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/vault/store', (req, res) => {
    try {
      const { openai, stripe, vercel } = req.body;
      
      const content = `
# PH EVO STUDIO VAULT
VAULT_OPENAI_KEY=${openai || ''}
VAULT_STRIPE_KEY=${stripe || ''}
VAULT_VERCEL_TOKEN=${vercel || ''}
VAULT_SECURED_AT=${new Date().toISOString()}
`.trim();

      fs.writeFileSync(vaultPath, content, { mode: 0o600 });
      res.json({ success: true, message: 'Vault secured.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
