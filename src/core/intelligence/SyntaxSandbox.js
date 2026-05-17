import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

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

  async verifyAndFix(response) {
    const code = this.extractCode(response);
    if (!code) return { fixedCode: response, wasFixed: false };

    const tmpDir = path.join(process.cwd(), '.sovereign-sandbox');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const tmpFile = path.join(tmpDir, `check_${Date.now()}.js`);
    fs.writeFileSync(tmpFile, code, 'utf8');

    try {
      // Run node in check-only mode (-c). This only checks syntax, it doesn't execute logic.
      await execAsync(`node -c ${tmpFile}`);
      // Syntax is perfectly fine
      return { fixedCode: response, wasFixed: false };
    } catch (error) {
      console.error('[SANDBOX] Syntax Error Caught Before Output!');
      
      // Heuristic Fix 1: Missing closing brace (very common LLM truncation)
      if (error.message.includes('Unexpected end of input')) {
<<<<<<< HEAD
        
=======
        console.log('[SANDBOX] Attempting auto-fix: Adding missing brace...');
>>>>>>> main
        const paddedCode = code + '\n}';
        
        fs.writeFileSync(tmpFile, paddedCode, 'utf8');
        try {
          await execAsync(`node -c ${tmpFile}`);
          // Fix worked!
          const fixedResponse = response.replace(code, paddedCode);
          return { fixedCode: fixedResponse, wasFixed: true };
        } catch (e2) {
          // Still broken, give up and return original (let the dev or another agent handle it)
<<<<<<< HEAD
          
=======
          console.log('[SANDBOX] Auto-fix failed.');
>>>>>>> main
        }
      }
      
      return { fixedCode: response, wasFixed: false };
    } finally {
      // Cleanup
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }
  }
}
