import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOCAL_LM_URL = 'http://127.0.0.1:3001/api/llm/generate';

function runAudit() {
    return new Promise((resolve) => {
        exec('node scripts/autonomous_auditor.mjs', (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, output: stdout || stderr });
            } else {
                resolve({ success: true, output: stdout });
            }
        });
    });
}

async function healFile(filePath, errorLog) {
    console.log(`\n🏥 [Immune System] Attempting to heal: ${filePath}`);
    const originalCode = fs.readFileSync(filePath, 'utf8');

    const prompt = `
    You are the Autonomous Immune System. 
    The following file failed the static audit. 
    
    File path: ${filePath}
    Error Log: 
    ${errorLog}
    
    Current Code:
    ${originalCode}
    
    INSTRUCTION: Fix the code so it passes the audit. 
    Output ONLY the fixed, full file code. No markdown. No explanations.
    `;

    try {
        const response = await fetch(LOCAL_LM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, model: 'evo-lm' })
        });

        if (!response.ok) throw new Error('Healing engine failed to respond.');

        const data = await response.json();
        const healedCode = (data.text || data.response || data).replace(/```jsx?/g, '').replace(/```javascript/g, '').replace(/```/g, '').trim();

        if (healedCode.length > 50) {
            fs.writeFileSync(filePath, healedCode, 'utf8');
            console.log(`✅ [Immune System] Applied healing patch to ${filePath}`);
            return true;
        }
    } catch (err) {
        console.error(`❌ [Immune System] Healing failed:`, err);
    }
    return false;
}

async function runImmuneCycle() {
    console.log("🛡️ [Immune System] Initiating System Health Scan...");
    let maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        attempt++;
        const audit = await runAudit();

        if (audit.success) {
            console.log("✅ [Immune System] Health scan clean. Codebase is perfectly compliant.");
            return true;
        }

        console.log(`❌ [Immune System] Audit failed (Attempt ${attempt}/${maxRetries}). Analyzing stack trace...`);
        
        // Extract file paths from audit output
        // Looks for paths after 'in: ' like "[VIOLATION] ... detected in: C:\path\to\file.js"
        const regex = /in:\s*([^\n\r]+)/g;
        let match;
        const failedFiles = new Set();
        
        while ((match = regex.exec(audit.output)) !== null) {
            const potentialPath = match[1].trim();
            if (fs.existsSync(potentialPath)) {
                failedFiles.add(potentialPath);
            }
        }

        if (failedFiles.size === 0) {
            console.log("⚠️ [Immune System] Could not parse file paths from audit log. Manual intervention required.");
            console.log(audit.output);
            return false;
        }

        for (const file of failedFiles) {
            await healFile(file, audit.output);
        }
    }

    console.log("💥 [Immune System] Max healing retries exceeded. Terminal failure.");
    return false;
}

// Run the immune cycle
runImmuneCycle();
