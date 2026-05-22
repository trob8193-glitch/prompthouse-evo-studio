import fs from 'fs';
import path from 'path';

// The Genesis Ideator - Multi-Agent Swarm Edition
// 1. Architect (Code Generation)
// 2. Red Team (Security/Audit)
// 3. QA (Test/A11y)
// 4. Designer (Aesthetics)

const LOCAL_LM_URL = 'http://127.0.0.1:3001/api/llm/generate';

async function querySwarmAgent(role, instructions, inputCode = '') {
    const prompt = `
    You are the ${role} of the Genesis Swarm.
    INSTRUCTION: ${instructions}
    ${inputCode ? `INPUT CODE:\n${inputCode}\n` : ''}
    Output ONLY valid JSX code. No markdown formatting. No explanations.
    `;

    let retries = 3;
    let delay = 2000;

    while (retries > 0) {
        try {
            const response = await fetch(LOCAL_LM_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, model: 'evo-lm' })
            });

            if (!response.ok) throw new Error(`${role} engine HTTP error: ${response.status}`);
            const data = await response.json();
            const code = data.text || data.response || data;
            return code.replace(/```jsx?/g, '').replace(/```/g, '').trim();
        } catch (err) {
            console.warn(`⚠️ [Genesis Swarm: ${role}] Fetch failed. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, delay));
            retries--;
            delay *= 2;
        }
    }
    console.error(`❌ [Genesis Swarm: ${role}] Exponential backoff exhausted. Agent offline.`);
    return null;
}

export async function ideateNewFeature(capabilityGraphPath, ragContext = '') {
    let context = 'No existing graph found.';
    if (fs.existsSync(capabilityGraphPath)) {
        const graph = JSON.parse(fs.readFileSync(capabilityGraphPath, 'utf8'));
        context = `Studio has ${graph.summary.uiModules} UI modules.`;
    }

    console.log("🐝 [Swarm] Waking up the Genesis Swarm...");

    // 1. The Architect
    console.log("🐝 [Swarm: Architect] Drafting initial logic...");
    const architectInstructions = `Invent a highly original, single-file React component adding a novel feature. 
    Context: ${context}
    Memory/RAG Context: ${ragContext}`;
    let code = await querySwarmAgent('Architect', architectInstructions);
    if (!code) return null;

    // 2. The Red Team
    console.log("🐝 [Swarm: Red Team] Auditing and securing the draft...");
    const redTeamInstructions = `Review the provided React component. Ensure there are no naked fetch calls (must use try/catch). Ensure no security vulnerabilities. Return the secured code.`;
    const securedCode = await querySwarmAgent('Red Team', redTeamInstructions, code);
    if (securedCode) code = securedCode;

    // 3. The QA Engineer
    console.log("🐝 [Swarm: QA Engineer] Injecting A11y and test IDs...");
    const qaInstructions = `Review the provided React component. Add 'data-testid' to all interactive elements. Add appropriate aria-labels. Return the improved code.`;
    const qaCode = await querySwarmAgent('QA Engineer', qaInstructions, code);
    if (qaCode) code = qaCode;

    // 4. The Designer
    console.log("🐝 [Swarm: Designer] Polishing visual aesthetics...");
    const designerInstructions = `Review the provided React component. Upgrade the inline styles to be highly modern, vibrant, and beautiful. Return the polished code.`;
    const finalCode = await querySwarmAgent('Designer', designerInstructions, code);
    if (finalCode) code = finalCode;

    console.log("🐝 [Swarm] Consensus reached. Code ready for Quarantine.");
    return code;
}
