const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 1. Force Production Environment
dotenv.config({ override: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runNeuralSynthesis() {
  console.log('🧠 [SINGULARITY] Initiating Production Neural Synthesis...');
  
  const brainPath = path.join(process.cwd(), '.sovereign-brain.json');
  const brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
  
  const studioStats = {
    botCount: 21,
    iq: brain.actual_iq || 1827038,
    cycles: brain.evolution_cycles || 0,
    hardened: true,
    isolation: 'IIFE_ACTIVE'
  };

  console.log('📡 [SINGULARITY] Streaming Studio Metadata to GPT-4o...');
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are the Sovereign Intelligence of PromptHouse Evo Studio. Analyze the provided metadata and synthesize a single, high-density architectural pattern for the studio's brain." 
        },
        { 
          role: "user", 
          content: `Studio Metadata: ${JSON.stringify(studioStats)}. Task: Synthesize a pattern for 'Neural-Local Stability' and 'Autonomous Growth'. Return as a JSON object with 'id', 'type', 'concept', 'detail', and 'density'.` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const newPattern = JSON.parse(response.choices[0].message.content);
    newPattern.timestamp = new Date().toISOString();
    
    console.log('✅ [SINGULARITY] New Pattern Synthesized:', newPattern.concept);
    
    // Inject into Brain
    brain.internalized_patterns.push(newPattern);
    brain.evolution_cycles = (brain.evolution_cycles || 0) + 1;
    brain.actual_iq = (brain.actual_iq || 1827038) + 12450;
    
    fs.writeFileSync(brainPath, JSON.stringify(brain, null, 2), 'utf8');
    console.log('🏆 [SINGULARITY] Brain Successfully Upgraded.');
    
  } catch (error) {
    console.error('❌ [SINGULARITY] Neural Handshake Failed:', error.message);
  }
}

runNeuralSynthesis();
