import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

/**
 * SaaS Orchestrator Engine
 * Handles multi-file context planning and parallel code generation.
 */
export class SaasOrchestrator {
  constructor(aiAdaptor, sandboxDir) {
    this.ai = aiAdaptor;
    this.sandboxDir = sandboxDir;
    mkdirSync(this.sandboxDir, { recursive: true });
  }

  async buildSaaS(prompt) {
    // 1. Blueprint Phase
    const blueprintMessage = [
      { role: 'system', content: 'You are a Senior SaaS Architect. Output ONLY valid JSON representing the file structure and purpose of the requested SaaS app. Do not include markdown formatting or backticks. Format: {"architecture": [{"path": "src/App.jsx", "type": "frontend", "description": "..."}]}' },
      { role: 'user', content: `Design a full-stack architecture for: ${prompt}` }
    ];

    console.log('[SaasOrchestrator] Generating Blueprint...');
    const blueprintRes = await this.ai.generateResponse(blueprintMessage);
    
    let blueprint;
    try {
      // Handle potential markdown wrapped JSON
      let rawJson = blueprintRes.message.replace(/```json/g, '').replace(/```/g, '').trim();
      blueprint = JSON.parse(rawJson);
    } catch (err) {
      throw new Error(`Failed to parse blueprint JSON: ${blueprintRes.message}`);
    }

    if (!blueprint.architecture || !Array.isArray(blueprint.architecture)) {
      throw new Error('Invalid blueprint format.');
    }

    console.log(`[SaasOrchestrator] Blueprint created with ${blueprint.architecture.length} files.`);

    // 2. Generation Phase (Parallel)
    const files = [];
    const buildPromises = blueprint.architecture.map(async (fileDef) => {
      const genMessage = [
        { role: 'system', content: `You are a Senior Developer building the ${fileDef.type} part of a SaaS. Write the complete, production-ready code for the file: ${fileDef.path}. Follow this description: ${fileDef.description}. Output ONLY the raw code, no markdown backticks, no explanations.` },
        { role: 'user', content: `Generate the code for ${fileDef.path}` }
      ];

      const res = await this.ai.generateResponse(genMessage);
      const code = res.message.replace(/^```[\w]*\n/, '').replace(/```$/, '').trim();
      
      files.push({
        path: fileDef.path,
        content: code
      });
    });

    await Promise.all(buildPromises);

    // 3. Assembly Phase
    console.log('[SaasOrchestrator] Assembling files in sandbox...');
    for (const file of files) {
      const fullPath = join(this.sandboxDir, file.path);
      const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
      if (dir !== this.sandboxDir) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(fullPath, file.content, 'utf8');
    }

    return {
      status: 'success',
      message: `SaaS generation complete. Wrote ${files.length} files to sandbox.`,
      files: files.map(f => f.path)
    };
  }
}
