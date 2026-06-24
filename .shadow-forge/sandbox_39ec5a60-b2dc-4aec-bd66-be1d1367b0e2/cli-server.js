import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { OpenAIConnectedAgent } from '@openai/agents';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock Agent for Studio
app.post('/api/ai/chat', async (req, res) => {
  const { message, botId } = req.body;
  console.log(`Chat request for ${botId}: ${message}`);
  
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      messages: [{ role: "user", content: message }],
    });
    
    const reply = completion.choices[0].message.content;
    res.json({ output_text: reply });
  } catch (error) {
    console.error('Chat Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/status', (req, res) => {
  res.json({ ok: true, bridge: 'PromptHouse Evo Bridge v1.2' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Bridge listening on port ${PORT}`);
});
