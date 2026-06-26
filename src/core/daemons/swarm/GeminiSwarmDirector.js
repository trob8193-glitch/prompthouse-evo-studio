import fs from 'fs';
import path from 'path';
import { getSwarmConsensus } from './SwarmConsensusEngine.js';

const STATE_FILE = path.join(process.cwd(), '.prompthouse-data', 'daemons', 'gemini_director_state.json');

export class GeminiSwarmDirector {
  constructor() {
    this.name = 'GeminiSwarmDirector';
    this.timer = null;
    this.pollInterval = 60000; // Poll every 60s
    this.swarm = getSwarmConsensus();
    this.cycleCount = 0;
  }

  start() {
    console.log(`[GeminiDirector] 💎 Online. Orchestrating Swarm autonomy...`);
    this.tick();
    this.timer = setInterval(() => this.tick(), this.pollInterval);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log(`[GeminiDirector] 💎 Offline.`);
  }

  async tick() {
    try {
      this.cycleCount++;
      console.log(`[GeminiDirector] 💎 Tick ${this.cycleCount}. Evaluating architectural vectors...`);
      
      // Check if there are already too many pending tasks to avoid flooding
      const pendingTasks = this.swarm.getTasksByStatus('PROPOSED');
      if (pendingTasks.length > 2) {
        console.log(`[GeminiDirector] Swarm queue is full. Waiting for QuadBrain to process...`);
        return;
      }

      // Dynamically generate an improvement using local LLM
      let proposalDescription = 'Optimize UI rendering cycles and update core aesthetic vectors.';
      try {
        const modelUrl = process.env.VITE_OLLAMA_URL || 'http://127.0.0.1:11434';
        const modelName = process.env.VITE_OLLAMA_MODEL || 'qwen2.5-coder:7b';
        
        const response = await fetch(`${modelUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName,
            prompt: "Propose a single, one-sentence technical task for a React/CSS development swarm to improve a modern web app's aesthetics or performance. Be creative.",
            stream: false
          })
        });
        const data = await response.json();
        if (data.response) proposalDescription = data.response.trim();
      } catch (e) {
        console.log(`[GeminiDirector] 💎 Failed to fetch dynamic LLM proposal. Using fallback.`);
      }

      const proposal = {
        targetFile: 'src/App.jsx', // Generalized target
        description: proposalDescription,
        urgency: 'MEDIUM'
      };

      console.log(`[GeminiDirector] 💎 Proposing Swarm Task: ${proposal.description}`);
      
      await this.swarm.proposeTask(this.name, 'IMPLEMENTATION', proposal);
    } catch (error) {
      console.error(`[GeminiDirector] 💎 Tick failed: ${error.message}`);
    }
  }
}
