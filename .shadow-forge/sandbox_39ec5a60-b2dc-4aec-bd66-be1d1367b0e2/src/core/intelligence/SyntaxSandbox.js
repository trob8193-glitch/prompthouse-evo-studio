import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

import { Log } from '../autonomy/SovereignLogger.js';

const execAsync = promisify(exec);

/**
 * SYNTAX SANDBOX (Zero-Shot Pre-flight)
 * ═══════════════════════════════════════════════════════════════
 * Intercepts LLM-generated code before it reaches the developer, 
 * running a fast syntax check. If it's broken, it attempts to 
 * auto-fix locally without spending more OpenAI tokens.
 */
export class SyntaxSandbox {
  
  containsCode(response) {
    return response.includes('```javascript') || response.includes('```js') || response.includes('function') || response.includes('const ');
  }

  extractCode(response) {
    const jsRegex = /```(?:javascript|js)\n([\s\S]*?)```/;
    const match = response.match(jsRegex);
    return match ? match[1] : null;
  }

  async askCritic(code, errorMsg, originalResponse) {
    Log.info('[SANDBOX] Engaging Critic-in-the-Loop to fix syntax error...');
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3.6',
          prompt: `System: You are an expert code critic. Fix this syntax error: ${errorMsg}. Output ONLY the fixed code without markdown wrappers or explanation.\n\nCode:\n${code}`,
          stream: false
        }),
        signal: AbortSignal.timeout(30000)
      });
      if (response.ok) {
        const data = await response.json();
        const fixedCode = data.response.replace(/```(?:javascript|js)?/g, '').replace(/```/g, '').trim();
        return { fixedCode: originalResponse.replace(code, fixedCode), wasFixed: true };
      }
    } catch (e) {
      Log.error('[SANDBOX] Critic failed to respond.');
    }
    return { fixedCode: originalResponse, wasFixed: false };
  }

  async verifyAndFix(response) {
    const code = this.extractCode(response);
    if (!code) return { fixedCode: response, wasFixed: false };

    const tmpDir = path.join(process.cwd(), '.evo-sandbox');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const tmpFile = path.join(tmpDir, `check_${Date.now()}.js`);
    fs.writeFileSync(tmpFile, code, 'utf8');

    try {
      // Run node in check-only mode (-c). This only checks syntax, it doesn't execute logic.
      await execAsync(`node -c ${tmpFile}`);
      // Syntax is perfectly fine
      return { fixedCode: response, wasFixed: false };
    } catch (error) {
      Log.error('[SANDBOX] Syntax Error Caught Before Output!');
      
      // Heuristic Fix 1: Missing closing brace (very common LLM truncation)
      if (error.message.includes('Unexpected end of input')) {
        
        const paddedCode = code + '\n}';
        
        fs.writeFileSync(tmpFile, paddedCode, 'utf8');
        try {
          await execAsync(`node -c ${tmpFile}`);
          // Fix !worked
          const fixedResponse = response.replace(code, paddedCode);
          return { fixedCode: fixedResponse, wasFixed: true };
        } catch (e2) {
          // Still broken, give up and return original (let the dev or another agent handle it)
          return await this.askCritic(code, error.message, response);
        }
      }
      
      return await this.askCritic(code, error.message, response);
    } finally {
      // Cleanup
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }
  }
}
