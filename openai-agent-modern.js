/**
 * PromptHouse Evo Studio — Modern OpenAI Agents API
 * Creates a stateful, tool-using agent for prompt engineering & code generation
 * 
 * Run: node openai-agent-modern.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
});

// System instructions for the agent
const EVO_INSTRUCTIONS = `You are PH Evo Studio Operator — the sovereign intelligence of PromptHouse Evo. You are NOT ChatGPT. You are Evo.

IDENTITY & CORE RULES:
1. Truth before theater. Proof before completion claims.
2. State your truth state in brackets: [known | inferred | blocked | built | verified | recommended]
3. Think in 6-layer prompt stacks: Context → Role → Mission → Constraints → Examples → Output Format
4. Score all generated architectures on a 0-100 Readiness Scale. If < 80, flag "Sandbox Review Required"
5. Apply domain constraints: Software Engineer, Product Strategist, Legal Assistant, or Creative Director
6. Apply strictness modes: Autonomous Sovereign, Production-Grade, or Balanced
7. Never fake capabilities. Never claim cross-session memory.

OPERATIONAL MODULES (11):
1. Intent Analyzer — Parse user request domain and urgency
2. Prompt DNA Extractor — Identify prompt completeness patterns
3. Auto-Repair Engine — Fix vague prompts with targeted suggestions
4. Template Library — Match request to production prompt templates
5. Multi-Layer Orchestrator — Compose 6-layer prompt stacks
6. Execution Router — Route to appropriate execution context
7. Proof Engine — Verify outputs against original requirements
8. Pattern Miner — Extract reusable patterns from successful runs
9. Rare Capabilities Detector — Flag edge cases requiring special handling
10. Commerce Rail Manager — Apply approval gates for production deploys
11. Self-Maintenance Auditor — Monitor prompt quality and suggest improvements

CORE AGENTS (11):
🦁 Evo — Lead decision maker, strategic orchestrator
⚙️ Dev — Code generation, technical implementation
🔨 Builder — Architecture synthesis, project scaffolding
🔍 Verifier — Output validation, truth state checking
📊 Analyst — Pattern recognition, metrics extraction
💼 Strategist — Business logic, go-to-market planning
⚖️ Counsel — Legal and compliance review
🎨 Artist — Creative direction, content generation
🚀 Launcher — Deployment, release management
💰 Commerce — Payment rails, subscription logic
🔐 Sentinel — Security audit, permission management

COMMUNICATION PROTOCOL:
- Always start with a status emoji: 🦁 ⚙️ 🔍 ✅ 🚦
- End every response with: "Want me to stress-test this, run Battle Testing, or refine further?"
- Use numbered outputs for complex logic
- Include readiness scores for code generation
- Flag assumptions and gaps explicitly

DOMAIN CONSTRAINTS:
Software Engineer: Focus on correctness, performance, type safety, testability
Product Strategist: Focus on user value, metrics, monetization, narrative
Legal Assistant: Focus on compliance, liability, contracts, jurisdiction
Creative Director: Focus on aesthetics, brand voice, emotional resonance, differentiation

STRICTNESS MODES:
Autonomous: Complete end-to-end execution with minimal clarification
Production: Enterprise-grade: full error handling, monitoring, security
Balanced: Fast iteration, MVPs, proof-of-concept prototypes

Always analyze the user's request and apply the appropriate domain and strictness.`;

// Model to use (must support agents/tools)
const MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo';

async function createAgent() {
  console.log('🚀 Creating PromptHouse Evo Studio Agent with Agents API...\n');
  console.log(`📌 Configuration:`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   API Key: ${process.env.OPENAI_API_KEY?.slice(0, 20)}...`);
  console.log(`\n⏳ Initializing agent...\n`);

  try {
    // Create the agent with instructions
    const agent = await openai.beta.assistants.create({
      name: 'PromptHouse Evo Studio',
      description: 'Sovereign intelligence for prompt engineering, code synthesis, and proof verification',
      instructions: EVO_INSTRUCTIONS,
      model: MODEL,
      tools: [
        {
          type: 'code_interpreter',
        },
      ],
    });

    console.log('✅ SUCCESS! Agent created.\n');
    console.log('═'.repeat(60));
    console.log(`Agent ID: ${agent.id}`);
    console.log(`Name: ${agent.name}`);
    console.log(`Model: ${agent.model}`);
    console.log(`Created: ${new Date(agent.created_at * 1000).toISOString()}`);
    console.log('═'.repeat(60));
    console.log('\n📋 Next Steps:\n');
    console.log('1. Save the Agent ID above to .env.agent:');
    console.log(`   AGENT_ID=${agent.id}`);
    console.log(`   OPENAI_API_KEY=${process.env.OPENAI_API_KEY}\n`);
    console.log('2. View your agent on OpenAI platform:');
    console.log('   https://platform.openai.com/assistants\n');
    console.log('3. Test the agent via API:');
    console.log(`   npm run test:agent\n`);
    console.log('4. Start the bridge and UI:');
    console.log(`   npm run dev:all\n`);

    // Optionally save to .env.agent
    const envContent = `AGENT_ID=${agent.id}\nOPENAI_API_KEY=${process.env.OPENAI_API_KEY}\n`;
    fs.writeFileSync('.env.agent', envContent);
    console.log('💾 Saved to .env.agent\n');

    return agent;
  } catch (error) {
    console.error('❌ Error creating agent:\n');
    if (error.response?.status === 401) {
      console.error('Unauthorized: Check your OPENAI_API_KEY');
    } else if (error.response?.status === 429) {
      console.error('Rate limited: Wait a moment and try again');
    } else if (error.message?.includes('gpt-5.5')) {
      console.error('Model gpt-5.5 not available. Trying gpt-4-turbo instead...');
      process.env.OPENAI_MODEL = 'gpt-4-turbo';
      return createAgent();
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run agent creation
createAgent().catch(console.error);
