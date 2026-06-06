import ProductionAudit from '../engines/productionAudit.js';

/**
 * Recovery Waterfall Engine
 * Implements the 3-phase autonomous repair pipeline.
 * 
 * Phase 1: Friction Scan
 * Phase 2: AI Repair Twin Execution
 * Phase 3: Verification Gate
 */
export class RecoveryWaterfall {
  /**
   * Orchestrates the recovery of broken code.
   * @param {string} code - The broken code to repair.
   * @param {object} aiAdaptor - Instance of UniversalAIAdaptor.
   * @returns {object} The result of the recovery process.
   */
  static async execute(code, aiAdaptor) {
    if (!code || code.trim().length === 0) {
      return { success: false, error: 'No code provided for recovery.' };
    }

    // Phase 1: Friction Scan
    const initialAudit = ProductionAudit.audit(code);
    if (initialAudit.passed) {
      return {
        success: true,
        repaired: false,
        message: 'Code passed audit perfectly. No repair needed.',
        code: code,
        score: initialAudit.score
      };
    }

    // Phase 2: AI Repair Twin Execution
    const issuesList = initialAudit.issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n');
    const repairPrompt = `
You are the PromptHouse Repair Twin. Your only job is to fix broken code.
The following code failed our strict production audit for the following reasons:
${issuesList}

Your task is to provide the EXACT repaired code. 
- Do NOT include markdown code blocks (e.g. \`\`\`javascript).
- Do NOT include any conversational text or explanations.
- Return ONLY the raw code string that passes the audit.

Original Code:
${code}
`;

    let repairedCode;
    try {
      const response = await aiAdaptor.routeRequest(repairPrompt);
      if (!response.success) throw new Error(response.error || 'AI request failed');
      // Strip markdown code blocks if the AI accidentally included them
      repairedCode = response.content.replace(/^```[a-z]*\n/gm, '').replace(/```$/gm, '').trim();
    } catch (e) {
      return {
        success: false,
        error: `Repair Twin Failed: ${e.message}`,
        originalAudit: initialAudit
      };
    }

    // Phase 3: Verification Gate
    const finalAudit = ProductionAudit.audit(repairedCode);
    
    if (!finalAudit.passed && finalAudit.score <= initialAudit.score) {
      return {
        success: false,
        error: 'Repair Twin failed to improve the code.',
        originalAudit: initialAudit,
        finalAudit: finalAudit,
        code: repairedCode
      };
    }

    return {
      success: true,
      repaired: true,
      message: finalAudit.passed ? 'Code successfully repaired and verified.' : 'Code partially repaired.',
      code: repairedCode,
      originalScore: initialAudit.score,
      newScore: finalAudit.score,
      issuesFixed: initialAudit.issues.filter(i => !finalAudit.issues.includes(i)),
      remainingIssues: finalAudit.issues
    };
  }
}

export default RecoveryWaterfall;
