import fs from 'fs';
import path from 'path';
import { getApprovalBlockReason, hasExplicitOwnerApproval } from '../owner-approval.js';

const BLOCKED_MERGE_PATTERNS = [
  /you exceeded your current quota/i,
  /rate limit/i,
  /billing details/i,
  /api-errors/i,
  /^429\b/m,
  /^401\b/m,
  /^403\b/m,
  /^500\b/m,
  /^error[:\s]/im,
  /<html[\s>]/i,
  /<!doctype html/i,
];

const CODE_SIGNAL_PATTERN = /[{}()[\];]|=>|\b(import|export|const|let|class|function|return|async|await)\b/;

export class GhostEditorLogic {
  constructor(ai) {
    this.ai = ai;
  }

  async execute(payload) {
    const { action, filePath, code, ownerApproval } = payload;
    const absolutePath = path.resolve(process.cwd(), filePath);

    if (action === 'get') {
      return await this.getOptimization(absolutePath, filePath);
    }

    if (action === 'merge') {
      return this.mergeOptimization(absolutePath, code, ownerApproval);
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

  mergeOptimization(absolutePath, code, ownerApproval = {}) {
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Cannot merge ghost layer: target file not found (${absolutePath})`);
    }

    if (this.isProtectedCorePath(absolutePath) && !hasExplicitOwnerApproval(ownerApproval, 'core_merge')) {
      throw new Error(getApprovalBlockReason('core_merge'));
    }

    const normalizedCode = this.normalizeGhostCode(code);
    this.assertSafeMergeCandidate(normalizedCode, absolutePath);

    const tempPath = `${absolutePath}.ghost.tmp`;
    try {
      fs.writeFileSync(tempPath, normalizedCode, 'utf8');
      const verifyWrite = fs.readFileSync(tempPath, 'utf8');
      if (verifyWrite !== normalizedCode) {
        throw new Error('Ghost merge validation failed after temp write');
      }

      fs.writeFileSync(absolutePath, normalizedCode, 'utf8');
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
    return { success: true, message: `Merged optimization into ${path.basename(absolutePath)}` };
  }

  normalizeGhostCode(code) {
    if (typeof code !== 'string') {
      throw new Error('Ghost merge rejected: optimized payload is not a string');
    }

    return code.replace(/```(?:javascript|js|jsx|ts|tsx)?\n?/gi, '').trim();
  }

  assertSafeMergeCandidate(code, absolutePath) {
    if (!code) {
      throw new Error('Ghost merge rejected: optimized payload is empty');
    }

    if (BLOCKED_MERGE_PATTERNS.some((pattern) => pattern.test(code))) {
      throw new Error('Ghost merge rejected: payload looks like an API or HTML error response');
    }

    const extension = path.extname(absolutePath).toLowerCase();
    const isCodeFile = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(extension);
    if (isCodeFile && !CODE_SIGNAL_PATTERN.test(code)) {
      throw new Error('Ghost merge rejected: payload does not look like executable code');
    }

    if (code.length < 16) {
      throw new Error('Ghost merge rejected: payload is too short to be valid source code');
    }
  }

  isProtectedCorePath(absolutePath) {
    const relativePath = path
      .relative(process.cwd(), absolutePath)
      .replace(/\\/g, '/')
      .toLowerCase();

    return relativePath === 'src/core' || relativePath.startsWith('src/core/');
  }
}
