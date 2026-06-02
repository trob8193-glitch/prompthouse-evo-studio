import { join } from 'path';
import { UniversalAIAdaptor } from '../../lib/ai/UniversalAIAdaptor.js';
import { SelfMaintenance } from '../core/automation/self_maintenance.js';
import { TruthGate } from '../core/truth/TruthGate.js';
import { StripeAdaptor } from '../../lib/commerce/StripeAdaptor.js';
import { FoundryOrchestrator } from '../../lib/foundry/FoundryOrchestrator.js';
import { ExecutionSandbox } from '../../lib/terminal/ExecutionSandbox.js';
import { SaasOrchestrator } from '../core/engines/saasOrchestrator.js';
import { IntelligenceCore } from '../core/engines/IntelligenceCore.js';
import { PromptCompressor } from '../../lib/ai/PromptCompressor.js';

export const DATA_DIR = join(process.cwd(), '.prompthouse-data');
export const OLLAMA_BASE = 'http://localhost:11434';
export const userConfig = {
  keys: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    stripe: process.env.STRIPE_SECRET_KEY || ''
  },
  ph_evo_master_key: process.env.PH_EVO_MASTER_KEY || ''
};
export const ai = new UniversalAIAdaptor(userConfig.keys);
export const maintenance = new SelfMaintenance();
export const truthGate = new TruthGate();
export const stripe = new StripeAdaptor(userConfig.keys.stripe);
export const foundry = new FoundryOrchestrator(ai, stripe);
export const SANDBOX_DIR = join(DATA_DIR, 'sandbox');
export const saasOrchestrator = new SaasOrchestrator(ai, SANDBOX_DIR);
export const terminalSandbox = new ExecutionSandbox(SANDBOX_DIR);
export const intelligenceCore = new IntelligenceCore(ai);
export const promptCompressor = new PromptCompressor();
export const globalFirewallSavings = { tokens: 0, dollars: 0.00 };
