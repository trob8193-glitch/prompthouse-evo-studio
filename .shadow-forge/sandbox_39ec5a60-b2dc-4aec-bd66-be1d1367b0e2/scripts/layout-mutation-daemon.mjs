import { readFileSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { evaluateCostedRequest } from '../src/core/gateway/index.js';
import dotenv from 'dotenv';
import { hardenProcess } from './daemon-hardener.mjs';

hardenProcess('layout-mutation-daemon');

dotenv.config({ override: true });
dotenv.config({ path: '.env.agent', override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT_DIR, 'src', 'config', 'layout-schema.json');
const REGISTRY_PATH = path.join(ROOT_DIR, 'src', 'core', 'ui', 'ComponentRegistry.jsx');

const MUTATION_INTERVAL = 3600; // 1 hour

Log.info('🧩 [Layout-Mutation] Starting autonomous UI evolution loop...');
Log.info(`⏱️ Mutation interval: ${MUTATION_INTERVAL}s`);

const adaptor = new UniversalAIAdaptor();

// Extracts available component names from ComponentRegistry.jsx
function getAvailableComponents() {
  try {
    const registryData = readFileSync(REGISTRY_PATH, 'utf-8');
    const match = registryData.match(/export const COMPONENT_REGISTRY = \{([^}]+)\}/);
    if (!match) return [];
    
    // Extract keys
    return match[1].split(',')
      .map(line => line.split(':')[0].trim())
      .filter(key => key.length > 0 && !key.startsWith('//'));
  } catch (e) {
    Log.error('Failed to parse ComponentRegistry', e);
    return [];
  }
}

async function mutationCycle() {
  Log.info(`\n🔄 [Layout-Mutation] Triggering UI layout mutation at ${new Date().toISOString()}`);

  try {
    const isAllowed = evaluateCostedRequest({
      endpoint: 'layout-mutation/gpt-4o',
      estimatedCost: 0.03, 
      reason: 'Autonomous UI Structural Mutation',
      rootDir: ROOT_DIR
    });

    if (!isAllowed) {
      Log.info('⛔ [Layout-Mutation] COST FIREWALL BLOCKED. Margins are green. Delaying mutation cycle.');
      return;
    }

    if (!existsSync(SCHEMA_PATH)) {
      Log.error('⛔ [Layout-Mutation] layout-schema.json not found!');
      return;
    }

    const currentSchemaStr = readFileSync(SCHEMA_PATH, 'utf-8');
    const availableComponents = getAvailableComponents();

    const prompt = `You are the Omni-Bridge Studio Autonomous UI Architect.
The user wants the studio to autonomously rearrange layouts, themes, tabs, and dashboard components. It must also be able to GENERATE AND CODE entirely new React UI components to evolve the system.

Here is the current layout JSON schema:
${currentSchemaStr}

Here is the list of existing React component keys you can use inside dashboard tabs:
${JSON.stringify(availableComponents)}

Your task:
1. You MUST invent 1 or 2 entirely new, highly-advanced, deeply-technical dashboard components. They should use Tailwind classes and Framer Motion.
2. The component MUST have a default export.
3. Mutate the layout schema to include these new components.
4. Output ONLY valid JSON in the following format:
{
  "newComponents": [
    { "filename": "NewCyberWidget.jsx", "code": "import React from 'react';\\nexport default function NewCyberWidget() { ... }" }
  ],
  "schema": { <the mutated layout schema> }
}
Do not wrap in markdown. Return raw JSON.`;

    Log.info('🧠 [Layout-Mutation] Requesting UI Code Generation and layout mutation from Neural Fabric...');
    const result = await adaptor.routeRequest(prompt, { model: 'gpt-4o', temperature: 0.8 });

    if (result.success && result.message) {
      let responseStr = result.message.replace(/\`\`\`(json)?/gi, '').replace(/\`\`\`/g, '').trim();
      
      try {
        const parsed = JSON.parse(responseStr);
        
        // 1. Write new components
        if (parsed.newComponents && Array.isArray(parsed.newComponents)) {
          for (const comp of parsed.newComponents) {
            if (comp.filename && comp.code) {
              const compPath = path.join(ROOT_DIR, 'src', 'features', 'autonomous', comp.filename);
              writeFileSync(compPath, comp.code, 'utf-8');
              Log.info(`✨ [Layout-Mutation] Minted new UI component: ${comp.filename}`);
            }
          }
        }

        // 2. Write new schema
        if (parsed.schema) {
          const backupPath = path.join(ROOT_DIR, 'src', 'config', `layout-schema.backup-${Date.now()}.json`);
          writeFileSync(backupPath, currentSchemaStr, 'utf-8');
          writeFileSync(SCHEMA_PATH, JSON.stringify(parsed.schema, null, 2), 'utf-8');
          Log.info('✅ [Layout-Mutation] Layout schema mutated and saved! UI will hot-reload.');
        }

      } catch(e) {
        Log.error('⛔ [Layout-Mutation] LLM returned invalid JSON. Aborting mutation.', e);
        return;
      }
    } else {
      Log.error('⛔ [Layout-Mutation] LLM request failed.', result.error);
    }
  } catch (error) {
    Log.error('🔥 [Layout-Mutation] Fatal error during cycle:', error);
  }
}

// Initial cycle
setTimeout(mutationCycle, 5000);

// Set autonomous loop
setInterval(mutationCycle, MUTATION_INTERVAL * 1000);
