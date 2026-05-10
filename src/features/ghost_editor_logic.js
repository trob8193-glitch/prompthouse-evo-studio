import fs from 'fs';
import path from 'path';

export class GhostEditorLogic {
  constructor(ai) {
    this.ai = ai;
  }

  async execute(payload) {
    const { action, filePath, code } = payload;
    const absolutePath = path.resolve(process.cwd(), filePath);

    if (action === 'get') {
      return await this.getOptimization(absolutePath, filePath);
    }

    if (action === 'merge') {
      return this.mergeOptimization(absolutePath, code);
    }

    throw new Error(`Unknown action: ${action}`);
  }

  async getOptimization(absolutePath, relativePath) {
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${relativePath}`);
    }

    const originalCode = fs.readFileSync(absolutePath, 'utf8');

    // Real AI Optimization Call
    if (this.ai) {
      const prompt = `You are the Sovereign Architect. Optimize the following code for maximum performance, density, and structural integrity. 
Maintain all core functionality but use modern ES6+ patterns and Ph-Evo Sovereign principles.
Return ONLY the optimized code. No explanations.

File: ${relativePath}
Code:
${originalCode}`;

      const response = await this.ai.generateResponse({
        messages: [{ role: 'user', content: prompt }]
      });

      // Clean up response if it has markdown blocks
      let ghostCode = response.content || response;
      ghostCode = ghostCode.replace(/```javascript\n|```\n|```/g, '').trim();

      return { originalCode, ghostCode };
    }

    // Fallback if AI is not available (Basic structural enhancement)
    const ghostCode = originalCode
      .replace(/var /g, 'const ')
      .replace(/function\s+(\w+)\s*\((.*?)\)\s*\{/g, 'const $1 = ($2) => {')
      + '\n\n// [SOVEREIGN OPTIMIZATION APPLIED]';

    return { originalCode, ghostCode };
  }

  mergeOptimization(absolutePath, code) {
    fs.writeFileSync(absolutePath, code, 'utf8');
    return { success: true, message: `Merged optimization into ${path.basename(absolutePath)}` };
  }
}
