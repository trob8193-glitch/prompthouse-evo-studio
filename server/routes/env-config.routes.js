import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export function registerEnvConfigRoutes(app) {
  // GET /api/config/env - Reads the current .env file
  app.get('/api/config/env', (req, res) => {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (!existsSync(envPath)) {
        return res.json({ success: true, envContent: '' });
      }
      const envContent = readFileSync(envPath, 'utf8');
      res.json({ success: true, envContent });
    } catch (error) {
      console.error('[Evo.env] Error reading .env file:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/config/env - Overwrites the .env file and optionally triggers a daemon restart (if needed)
  app.post('/api/config/env', (req, res) => {
    try {
      const { envContent } = req.body;
      if (typeof envContent !== 'string') {
        return res.status(400).json({ success: false, error: 'envContent must be a string' });
      }
      
      const envPath = path.resolve(process.cwd(), '.env');
      writeFileSync(envPath, envContent, 'utf8');
      
      // Update process.env for the current running process so it takes effect immediately without restart
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            process.env[key] = value;
          }
        }
      }

      console.log(`\n🔒 [Evo.env] .env file successfully overwritten and loaded into runtime memory.\n`);
      res.json({ success: true, message: 'Environment variables saved and injected into runtime.' });
    } catch (error) {
      console.error('[Evo.env] Error writing .env file:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
