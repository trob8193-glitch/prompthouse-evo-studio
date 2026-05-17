import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function build() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY missing in .env');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });

  console.log(`📡 [Build] Requesting full implementation for src/autonomous_code_executor.py from OpenAI (${model})...`);

  const prompt = `
You are the Cloud Core of the PromptHouse Evo Studio.
We are building Phase 15. Your task is to generate the FULL, production-grade Python code for \`src/autonomous_code_executor.py\`.

Based on the blueprint:
- **Purpose:** Enable autonomous code execution with multi-language support and self-correction capabilities.
- **Key Components:**
  - \`LanguageMastery\`: Detects language and executes snippets (use Python's \`subprocess\` or \`exec\` safely).
  - \`SelfCorrectionEngine\`: A mock or simple implementation that simulates calling an LLM to fix errors (since this file runs locally, it should probably print that it's requesting a fix or use a local heuristic).
  - \`AutonomousCodeExecutor\`: The main class that orchestrates the run and retry.

Make it a complete, runnable Python file with a main block that demonstrates it working.
Include comments and error handling.
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a master Python developer specializing in safe code execution and self-healing systems.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    const content = response.choices[0].message.content;
    
    // Extract python code block if present
    const codeMatch = content.match(/```python\s*([\s\S]*?)```/);
    const finalCode = codeMatch ? codeMatch[1] : content;

    const outputPath = path.join(root, 'src/autonomous_code_executor.py');
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, finalCode, 'utf8');
    console.log(`✅ [Build] File created at: ${outputPath}`);
    
  } catch (err) {
    console.error('❌ [Build] Error:', err.message);
    process.exit(1); // Exit with error so the loop knows it failed
  }
}

build();
