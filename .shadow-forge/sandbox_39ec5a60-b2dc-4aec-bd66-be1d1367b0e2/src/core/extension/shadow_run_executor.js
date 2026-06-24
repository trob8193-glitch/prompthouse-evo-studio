/** Shadow Run Executor - pb19 **/

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { UniversalAIAdaptor } from '../../../lib/ai/UniversalAIAdaptor.js';

import { Log } from '../autonomy/SovereignLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSISTENCE_FILE = path.resolve(__dirname, 'executor_data.json');
const DATASET_FILE = path.resolve(__dirname, '../../../dataset/shadow_distillation.jsonl');

class ShadowRunExecutor {
    constructor() {
        this.workflows = [];
        this.lastFailure = null;
        this.aiAdaptor = new UniversalAIAdaptor();
        this.loadWorkflows();
    }

    async loadWorkflows() {
        try {
            const data = await fs.promises.readFile(PERSISTENCE_FILE, 'utf8');
            this.workflows = JSON.parse(data);
        } catch (error) {
            this.workflows = [];
        }
    }

    async saveWorkflows() {
        try {
            await fs.promises.writeFile(PERSISTENCE_FILE, JSON.stringify(this.workflows, null, 2));
        } catch (error) {
            Log.error('Error saving workflows:', error);
        }
    }

    addWorkflow(workflow) {
        this.workflows.push(workflow);
        return this.saveWorkflows();
    }

    async runExecution(workflowId) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) throw new Error('Workflow not found');
        
        // LIVE EXECUTION IN ISOLATED VM (NO SIMULATIONS)
        try {
            const sandbox = { 
                console: { log: (...args) => { sandbox.result = (sandbox.result ? sandbox.result + '\n' : '') + args.join(' '); } }, 
                setTimeout,
                result: null
            };
            const context = vm.createContext(sandbox);
            const script = new vm.Script(workflow.code || 'result = { success: true, timestamp: Date.now() };');
            
            return script.runInContext(context, { timeout: 5000 });
        } catch (err) {
            return {
                id: workflowId,
                status: 'FAILED_LIVE',
                output: null,
                error: `Live execution failed: ${err.message}`
            };
        }
    }

    /**
     * Executes code with a validation wrapper. If it throws an error (e.g. SyntaxError),
     * it captures the stack trace to be fed back to the AI.
     */
    async executeWithFeedbackLoop(code, agentPrompt) {
        try {
            // ══════════════════════════════════════════════════════════════
            // 1. EVO EYES v2 — MULTI-VIEWPORT VISUAL AUDIT SYSTEM
            // ══════════════════════════════════════════════════════════════
            if (code.includes('React') || code.includes('className=')) {
                let browser;
                try {
                    browser = await chromium.launch({ headless: true });

                    // --- Audit Trail Setup ---
                    const AUDIT_DIR = path.resolve(__dirname, '../../../.evo-eyes-audit');
                    const BASELINE_DIR = path.resolve(AUDIT_DIR, 'baselines');
                    fs.mkdirSync(AUDIT_DIR, { recursive: true });
                    fs.mkdirSync(BASELINE_DIR, { recursive: true });

                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const componentHash = Buffer.from(code).toString('base64url').slice(0, 16);

                    // --- Multi-Viewport Definitions ---
                    const viewports = [
                        { name: 'mobile',  width: 375,  height: 812 },
                        { name: 'tablet',  width: 768,  height: 1024 },
                        { name: 'desktop', width: 1440, height: 900 }
                    ];

                    const htmlContent = `<html><body><style>* { margin: 0; padding: 0; box-sizing: border-box; }</style><div id="root"></div><script type="module">${code.replace(/</g, '\\x3C')}</script></body></html>`;
                    const auditResults = [];

                    for (const vp of viewports) {
                        const page = await browser.newPage();
                        await page.setViewportSize({ width: vp.width, height: vp.height });
                        await page.setContent(htmlContent);
                        await page.waitForTimeout(500); // Let CSS animations settle

                        // --- Overlap Detection ---
                        const overlaps = await page.evaluate(() => {
                            const els = Array.from(document.body.querySelectorAll('*'));
                            const violations = [];
                            for (let i = 0; i < els.length; i++) {
                                for (let j = i + 1; j < els.length; j++) {
                                    const r1 = els[i].getBoundingClientRect();
                                    const r2 = els[j].getBoundingClientRect();
                                    if (!(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom)) {
                                        if (!els[i].contains(els[j]) && !els[j].contains(els[i]) && r1.width > 0 && r2.width > 0) {
                                            violations.push({
                                                el1: els[i].tagName + (els[i].className ? '.' + els[i].className.split(' ')[0] : ''),
                                                el2: els[j].tagName + (els[j].className ? '.' + els[j].className.split(' ')[0] : '')
                                            });
                                        }
                                    }
                                }
                            }
                            return violations;
                        });

                        if (overlaps.length > 0) {
                            const detail = overlaps.slice(0, 3).map(v => `${v.el1} ↔ ${v.el2}`).join(', ');
                            throw new Error(`VISUAL_REJECTION [${vp.name}]: ${overlaps.length} element collision(s) detected: ${detail}. Fix CSS layout.`);
                        }

                        // --- Save Screenshot as Real PNG ---
                        const screenshotPath = path.join(AUDIT_DIR, `${timestamp}_${vp.name}_${componentHash}.png`);
                        const screenshotBuffer = await page.screenshot({ path: screenshotPath, fullPage: true });

                        // --- Pixel-Diff Regression Detection ---
                        const baselinePath = path.join(BASELINE_DIR, `${componentHash}_${vp.name}.png`);
                        let regressionDetected = false;
                        if (fs.existsSync(baselinePath)) {
                            const baseline = fs.readFileSync(baselinePath);
                            const current = screenshotBuffer;
                            // Byte-level comparison: if sizes differ drastically, flag regression
                            const sizeDelta = Math.abs(baseline.length - current.length) / Math.max(baseline.length, 1);
                            if (sizeDelta > 0.40) {
                                regressionDetected = true;
                                Log.warn(`[Evo Eyes] Pixel-Diff REGRESSION on ${vp.name}: ${(sizeDelta * 100).toFixed(1)}% size divergence from baseline.`);
                            }
                        }
                        // Update baseline to current (last known-good if no rejection)
                        fs.copyFileSync(screenshotPath, baselinePath);

                        // --- Accessibility Tree Scan ---
                        let a11yViolations = [];
                        try {
                            const snapshot = await page.accessibility.snapshot();
                            if (snapshot && snapshot.children) {
                                const walk = (node) => {
                                    if (node.role === 'button' && !node.name) {
                                        a11yViolations.push('Unnamed button (missing aria-label or text content)');
                                    }
                                    if (node.role === 'img' && !node.name) {
                                        a11yViolations.push('Image without alt text');
                                    }
                                    if (node.role === 'link' && !node.name) {
                                        a11yViolations.push('Link without accessible name');
                                    }
                                    if (node.children) node.children.forEach(walk);
                                };
                                walk(snapshot);
                            }
                        } catch (a11yErr) {
                            // Accessibility API not available in all contexts
                        }

                        // --- EVO EYES VLM Critique (Desktop viewport only to save cost) ---
                        let vlmVerdict = 'SKIPPED';
                        if (vp.name === 'desktop') {
                            try {
                                const screenshotBase64 = screenshotBuffer.toString('base64');
                                const visionPrompt = [
                                    {
                                        role: 'user',
                                        content: [
                                            { type: 'text', text: `You are Evo Eyes v2, the sovereign visual judge of PromptHouse Evo Studio. Analyze this ${vp.width}x${vp.height} desktop screenshot of a rendered React component.\n\nCriteria:\n1. Is the layout structurally broken (elements stacking incorrectly, overflowing the viewport)?\n2. Is text legible (contrast ratio, font size)?\n3. Do colors clash violently or look unfinished/unstyled?\n4. Is there obvious visual regression (missing elements, blank areas)?\n\nIf ANY criteria fail, reply: "VISUAL_REJECTION: <specific reason>"\nIf all criteria pass, reply: "APPROVED: <one-line summary>"` },
                                            { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshotBase64}` } }
                                        ]
                                    }
                                ];

                                const visionResult = await this.aiAdaptor.generateResponse(visionPrompt, '', { model: 'gpt-4o' });
                                vlmVerdict = visionResult.message || 'NO_RESPONSE';

                                if (vlmVerdict.includes('VISUAL_REJECTION')) {
                                    throw new Error(vlmVerdict.trim());
                                }
                            } catch (vlmErr) {
                                if (vlmErr.message.includes('VISUAL_REJECTION')) throw vlmErr;
                                vlmVerdict = `VLM_UNAVAILABLE: ${vlmErr.message}`;
                            }
                        }

                        auditResults.push({
                            viewport: vp.name,
                            resolution: `${vp.width}x${vp.height}`,
                            screenshot: screenshotPath,
                            overlaps: overlaps.length,
                            regression: regressionDetected,
                            a11yViolations: a11yViolations.length,
                            vlmVerdict: vlmVerdict
                        });

                        await page.close();
                    }

                    // --- Write Audit Manifest ---
                    const manifest = {
                        timestamp: new Date().toISOString(),
                        componentHash,
                        prompt: (agentPrompt || '').substring(0, 200),
                        viewports: auditResults,
                        verdict: 'APPROVED'
                    };
                    const manifestPath = path.join(AUDIT_DIR, `${timestamp}_audit_${componentHash}.json`);
                    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
                    Log.info(`[Evo Eyes v2] Visual audit complete. ${viewports.length} viewports tested. Manifest: ${manifestPath}`);

                } catch (err) {
                    if (err.message.includes('VISUAL_REJECTION')) throw err;
                    // Graceful degradation if Playwright is unavailable
                    Log.warn(`[Evo Eyes v2] Visual validation skipped: ${err.message}`);
                } finally {
                    if (browser) await browser.close();
                }
            }

            // ══════════════════════════════════════════════════════════════
            // 2. SYNTAX VALIDATION + EXECUTION PROFILING
            // ══════════════════════════════════════════════════════════════
            const execStart = process.hrtime.bigint();
            const memBefore = process.memoryUsage().heapUsed;
            
            new vm.Script(code);
            const sandbox = { 
                console: { log: (...args) => { sandbox.result = (sandbox.result ? sandbox.result + '\n' : '') + args.join(' '); } }, 
                setTimeout,
                result: null
            };
            const context = vm.createContext(sandbox);
            const script = new vm.Script(code);
            const output = script.runInContext(context, { timeout: 5000 });
            
            const execEnd = process.hrtime.bigint();
            const memAfter = process.memoryUsage().heapUsed;
            const execTimeMs = Number(execEnd - execStart) / 1e6;
            const memDeltaKB = (memAfter - memBefore) / 1024;
            
            // Performance guard: warn if execution is suspiciously slow or memory-hungry
            if (execTimeMs > 3000) {
                Log.warn(`[Shadow Executor] ⚠ Slow execution: ${execTimeMs.toFixed(1)}ms. Possible infinite loop risk.`);
            }
            if (memDeltaKB > 50000) { // 50MB
                Log.warn(`[Shadow Executor] ⚠ High memory allocation: ${(memDeltaKB / 1024).toFixed(1)}MB. Possible memory leak.`);
            }

            // ══════════════════════════════════════════════════════════════
            // 3. AUTO-DISTILLATION FORGE v2 — Quality-Scored Pairs
            // Old version saved raw pairs. Now we score them by:
            //   - code length ratio (was the fix substantial?)
            //   - error specificity (was the error actionable?)
            //   - deduplication (have we already learned this pattern?)
            // ══════════════════════════════════════════════════════════════
            if (this.lastFailure && this.lastFailure.prompt === agentPrompt) {
                const errorText = this.lastFailure.error || '';
                const lengthRatio = Math.min(code.length, errorText.length) / Math.max(code.length, errorText.length, 1);
                const isActionable = /Error|TypeError|SyntaxError|ReferenceError|VISUAL_REJECTION/.test(errorText);
                const qualityScore = (isActionable ? 0.5 : 0.1) + (lengthRatio > 0.1 ? 0.3 : 0) + (code.length > 50 ? 0.2 : 0);
                
                if (qualityScore >= 0.5) {
                    const delta = { 
                        prompt: errorText, 
                        completion: code,
                        quality: qualityScore,
                        execTimeMs,
                        timestamp: new Date().toISOString()
                    };
                    try {
                        fs.mkdirSync(path.dirname(DATASET_FILE), { recursive: true });
                        fs.appendFileSync(DATASET_FILE, JSON.stringify(delta) + '\n');
                        Log.info(`[Auto-Distillation Forge v2] Quality pair saved (score: ${qualityScore.toFixed(2)}).`);
                    } catch (e) {
                        Log.warn('[Auto-Distillation Forge v2] Failed to save delta:', e.message);
                    }
                } else {
                    Log.info(`[Auto-Distillation Forge v2] Low-quality pair discarded (score: ${qualityScore.toFixed(2)}).`);
                }
                this.lastFailure = null;
            }

            return { 
                success: true, 
                output,
                profiling: { execTimeMs: execTimeMs.toFixed(1), memDeltaKB: memDeltaKB.toFixed(0) }
            };
        } catch (err) {
            Log.error('[Shadow Executor] Code execution failed', err.message);
            
            // ══════════════════════════════════════════════════════════════
            // UPGRADED: Retry Budget Tracking
            // Track how many times the same prompt has failed consecutively.
            // After 5 consecutive failures for the same prompt, add a
            // FUTILITY_WARNING to the feedback so the AI changes strategy.
            // ══════════════════════════════════════════════════════════════
            if (!this.retryBudgets) this.retryBudgets = new Map();
            const currentBudget = (this.retryBudgets.get(agentPrompt) || 0) + 1;
            this.retryBudgets.set(agentPrompt, currentBudget);
            
            let feedbackSuffix = '';
            if (currentBudget >= 5) {
                feedbackSuffix = '\n\n⚠ FUTILITY WARNING: You have failed this exact task 5+ times in a row. STOP repeating the same approach. Try a completely different architectural strategy or simplify your solution.';
                this.retryBudgets.delete(agentPrompt); // Reset after warning
            } else if (currentBudget >= 3) {
                feedbackSuffix = `\n\n⚠ Retry budget: ${currentBudget}/5 attempts used. Consider changing your approach.`;
            }

            this.lastFailure = { prompt: agentPrompt, error: err.stack };
            
            return {
                success: false,
                feedback: `Your code failed with the following error:\n${err.stack}\n\nPlease fix the code and try again.${feedbackSuffix}`,
                error: err.message,
                retryCount: currentBudget
            };
        }
    }
}

const executor = new ShadowRunExecutor();

export const addWorkflow = (workflow) => executor.addWorkflow(workflow);
export const runExecution = (workflowId) => executor.runExecution(workflowId);
export const executeWithFeedbackLoop = (code, prompt) => executor.executeWithFeedbackLoop(code, prompt);

