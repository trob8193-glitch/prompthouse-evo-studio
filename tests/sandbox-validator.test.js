import { describe, it, expect } from 'vitest';
import { VMSandboxValidator } from '../src/core/evolution/VMSandboxValidator.js';

describe('VMSandboxValidator', () => {

  describe('AST Validation (validateAST)', () => {
    it('should pass safe valid JavaScript', () => {
      const code = `
        export function calculate(a, b) {
          return a + b;
        }
      `;
      expect(VMSandboxValidator.validateAST(code)).toBe(true);
    });

    it('should throw on process.exit', () => {
      const code = `
        function doBadThing() {
          process.exit(1);
        }
      `;
      expect(() => VMSandboxValidator.validateAST(code)).toThrow('process.exit is strictly forbidden');
    });

    it('should throw on fs.rmSync root deletion', () => {
      const code = `
        import fs from 'fs';
        fs.rmSync('/', { force: true, recursive: true });
      `;
      expect(() => VMSandboxValidator.validateAST(code)).toThrow('Root deletion attempt detected');
    });

    it('should throw on eval()', () => {
      const code = `
        function executeDynamic() {
          eval('console.log("hello")');
        }
      `;
      expect(() => VMSandboxValidator.validateAST(code)).toThrow('eval()');
    });

    it('should throw on hardcoded infinite while(true) loop via Regex', () => {
      const code = `
        while (true) {
          console.log('stuck');
        }
      `;
      expect(() => VMSandboxValidator.validateAST(code)).toThrow('Hardcoded infinite loop detected');
    });
  });

  describe('VM Execution (executeVM)', () => {
    it('should pass pure functional logic within timeout', () => {
      const code = `
        const x = 10;
        const y = 20;
        const z = x * y;
      `;
      expect(VMSandboxValidator.executeVM(code, 500)).toBe(true);
    });

    it('should throw if script times out (infinite loop without while(true))', () => {
      const code = `
        let i = 0;
        for (;;) {
          i++;
        }
      `;
      expect(() => VMSandboxValidator.executeVM(code, 50)).toThrow('Script execution timed out');
    });
  });

});
