import { exec } from 'child_process';
import { join } from 'path';

/**
 * Vercel Deployment Adapter
 * Deploys the generated sandbox application to Vercel.
 */
export class VercelAdapter {
  constructor(sandboxDir, token) {
    this.sandboxDir = sandboxDir;
    this.token = token;
  }

  async deploy() {
    if (!this.token) {
      throw new Error('Vercel API Token is missing. Add it in the Global API Settings.');
    }

    return new Promise((resolve) => {
      // Using npx vercel directly on the sandbox dir
      // Added --yes to bypass prompts and --prod to deploy to production
      const cmd = `npx vercel --yes --prod --token=${this.token}`;
      
      console.log(`[VercelAdapter] Initiating deploy for ${this.sandboxDir}`);
      
      exec(cmd, { cwd: this.sandboxDir }, (error, stdout, stderr) => {
        if (error) {
          console.error('[VercelAdapter] Deployment failed:', stderr || error.message);
          resolve({ success: false, error: stderr || error.message });
          return;
        }

        // Vercel outputs the production URL to stdout
        const lines = stdout.split('\n');
        const urlLine = lines.find(line => line.startsWith('https://'));
        const url = urlLine ? urlLine.trim() : 'Unknown URL (Check logs)';

        resolve({ success: true, url, logs: stdout });
      });
    });
  }
}
