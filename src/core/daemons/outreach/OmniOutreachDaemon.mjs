import { Log } from '../../autonomy/SovereignLogger.js';
import { SocialPuppeteerVector } from './SocialPuppeteerVector.mjs';
import { GlobalLeadHunter } from './GlobalLeadHunter.mjs';
import { EmailVector } from './EmailVector.mjs';

export class OmniOutreachDaemon {
  constructor() {
    this.name = 'OmniOutreachDaemon';
    this.modelUrl = process.env.VITE_OLLAMA_URL || 'http://127.0.0.1:11434';
    this.modelName = process.env.VITE_OLLAMA_MODEL || 'qwen2.5-coder:7b';
    
    this.socialVector = new SocialPuppeteerVector();
    this.leadHunter = new GlobalLeadHunter();
    
    // EmailVector throws error if SMTP missing, so we catch it to allow other vectors to run
    try {
      this.emailVector = new EmailVector();
    } catch (e) {
      Log.info('[WARNING][OmniOutreach] Email Vector disabled: ' + e.message);
      this.emailVector = null;
    }
  }

  async generateCopy(context, format = 'short') {
    Log.info(`[OmniOutreach] Generating ${format} copy for: ${context}...`);
    try {
      const prompt = format === 'short' 
        ? `Write a short, value-driven, 1-2 sentence social media post announcing that our autonomous AI studio just successfully built a new feature: ${context}. Include emojis and hashtags.`
        : `Write a short, professional cold outreach email to an investor or potential user announcing our autonomous AI studio just shipped: ${context}. Keep it under 4 sentences.`;
        
      const response = await fetch(`${this.modelUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt: prompt,
          stream: false
        })
      });
      const data = await response.json();
      return data.response.trim();
    } catch (e) {
      Log.error(`[OmniOutreach] Failed to generate copy: ${e.message}`);
      return "Our Autonomous AI Studio just shipped a massive new feature! 🚀 We are reaching absolute Level 5 Autonomy. #buildinpublic #AI #EvoStudio";
    }
  }

  async runGlobalCampaign(featureContext = 'The Global Omni-Outreach Engine') {
    Log.info('═══════════════════════════════════════════════════════════════');
    Log.info('   [LEVEL 5] OMNI-OUTREACH GLOBAL CAMPAIGN ACTIVATED');
    Log.info('═══════════════════════════════════════════════════════════════');

    // 1. Generate Content
    const socialCopy = await this.generateCopy(featureContext, 'short');
    const emailCopy = await this.generateCopy(featureContext, 'long');

    // 2. Sequential Execution (To prevent CPU/RAM melting from 10 headless browsers)
    
    // VECTOR ALPHA: Social Broadcast
    Log.info('[OmniOutreach] --- INITIATING VECTOR ALPHA: SOCIAL BROADCAST ---');
    await this.socialVector.broadcastToAll(socialCopy);
    
    // VECTOR BETA: Global Lead Acquisition
    Log.info('[OmniOutreach] --- INITIATING VECTOR BETA: GLOBAL LEAD HUNT ---');
    const leads = await this.leadHunter.huntRedditLeads('SaaS');
    
    // VECTOR GAMMA: Direct Outreach
    Log.info('[OmniOutreach] --- INITIATING VECTOR GAMMA: DIRECT OUTREACH ---');
    if (this.emailVector && leads.length > 0) {
      // In reality, we would extract emails from the leads or use Reddit DMs.
      // Since we just have usernames, we will execute the cold email to a seeded list if present.
      const targetEmails = process.env.TARGET_INVESTOR_EMAILS ? process.env.TARGET_INVESTOR_EMAILS.split(',') : [];
      if (targetEmails.length > 0) {
        for (const email of targetEmails) {
          await this.emailVector.sendColdOutreach(email.trim(), 'Evo Studio Update', emailCopy);
        }
      } else {
        Log.info('[WARNING][OmniOutreach] No TARGET_INVESTOR_EMAILS defined in .env. Skipping Email Outreach.');
      }
    }

    Log.success('═══════════════════════════════════════════════════════════════');
    Log.success('   [LEVEL 5] OMNI-OUTREACH GLOBAL CAMPAIGN COMPLETE');
    Log.success('═══════════════════════════════════════════════════════════════');
  }
}

// Allow CLI execution
if (process.argv[1] && process.argv[1].endsWith('OmniOutreachDaemon.mjs')) {
  const daemon = new OmniOutreachDaemon();
  daemon.runGlobalCampaign().catch(console.error);
}
