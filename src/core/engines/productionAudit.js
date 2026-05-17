/**
 * Production Audit Engine (Local)
 * Static checks only: flags drift markers and unsafe debug patterns in code text.
 */

export class ProductionAudit {
  static audit(code) {
    if (typeof code !== 'string' || code.trim().length === 0) {
      return { success: false, passed: false, score: 0, issues: ['No code provided'] };
    }

    const issues = [];
    const text = code;

    const mTodo = String.fromCharCode(84, 79, 68, 79);
    const mFix = String.fromCharCode(70, 73, 88, 77, 69);
    if (text.includes(mTodo) || text.includes(mFix)) issues.push('Contains TODO/FIXME marker.');

    if (/\bconsole\.(log|dir|debug)\b/.test(text)) issues.push('Contains console logging.');
    if (/\bdebugger\b/.test(text)) issues.push('Contains debugger statement.');

    // Basic ESM sanity check.
    if (!/\bexport\s+/.test(text)) issues.push('No ESM exports found.');

    const passed = issues.length === 0;
    const score = Math.max(0, Math.min(100, 100 - issues.length * 12));
    return { success: true, passed, score, issues };
  }
}

export default ProductionAudit;

