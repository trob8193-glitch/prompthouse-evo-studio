import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import vm from 'vm';
import { Log } from '../autonomy/SovereignLogger.js';

/**
 * Validates generated JavaScript/JSX patches using Deep AST parsing and Node's VM execution.
 * Detects infinite loops, destructive globals, and syntax errors.
 */
export class VMSandboxValidator {
  
  /**
   * Run semantic AST validation.
   * Acorn can't parse raw JSX natively without a plugin, so we will do a best-effort 
   * JS parse if possible, or fallback to regex for raw JSX if acorn fails.
   */
  static validateAST(logic) {
    Log.info('🧠 [VMSandboxValidator] Running Deep Semantic AST validation...');

    // 1. Regex checks for immediate dangerous patterns that Acorn might miss in raw JSX
    const bannedPatterns = [
      { regex: /process\.exit/g, reason: 'process.exit is strictly forbidden in patches' },
      { regex: /fs\.rmSync\s*\(\s*['"]\/['"]/g, reason: 'Root deletion attempt detected' },
      { regex: /eval\s*\(/g, reason: 'eval() is not permitted in dynamic execution' },
      { regex: /while\s*\(\s*true\s*\)/g, reason: 'Hardcoded infinite loop detected' }
    ];

    for (const pattern of bannedPatterns) {
      if (pattern.regex.test(logic)) {
        throw new Error(`SEMANTIC_VIOLATION: ${pattern.reason}`);
      }
    }

    // 2. Acorn AST Parsing
    // Acorn by default throws on JSX tags. If the file contains JSX, parse might fail.
    try {
      const ast = parse(logic, { 
        ecmaVersion: 'latest', 
        sourceType: 'module' 
      });

      // Walk the AST to look for loops without await/break or dangerous identifiers
      walk.simple(ast, {
        WhileStatement(node) {
          // If we detect a while loop, we log a warning or could throw.
          // For now, let's just log a strict warning.
          Log.warn('⚠️ [VMSandboxValidator] Found while loop in logic. Ensure it is bounded.');
        },
        CallExpression(node) {
          if (node.callee && node.callee.type === 'Identifier') {
            if (node.callee.name === 'eval') {
              throw new Error("SEMANTIC_VIOLATION: eval() found via AST");
            }
          }
        }
      });

    } catch (e) {
      // If Acorn fails, it might just be JSX syntax. We rely on the Regex fallback.
      Log.warn(`⚠️ [VMSandboxValidator] AST parser skipped (likely JSX syntax): ${e.message}`);
    }

    return true;
  }

  /**
   * Run pure JS logic in a restricted Node VM context with a strict timeout.
   */
  static executeVM(logic, timeoutMs = 500) {
    try {
      const context = {
        console: { log: () => {}, warn: () => {}, error: () => {} },
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval
      };
      
      vm.createContext(context);
      
      // Execute the logic with a strict timeout
      vm.runInNewContext(logic, context, { timeout: timeoutMs });
      return true;
    } catch (error) {
      // If it times out, it throws "Error: Script execution timed out after 500ms"
      Log.error(`❌ [VMSandboxValidator] VM Execution failed: ${error.message}`);
      throw new Error(`VM_VIOLATION: ${error.message}`);
    }
  }
}
