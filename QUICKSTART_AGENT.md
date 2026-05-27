# Quick Start: Create Your PromptHouse Evo Agent on OpenAI

## ⚡ 3-Step Setup (5 minutes)

### Step 1: Verify API Key
Open PowerShell in the project directory:
```powershell
cd C:\Users\Noname\.gemini\antigravity\scratch\prompthouse-evo-studio
echo $env:OPENAI_API_KEY
```

You should see: `sk-proj-...` (if blank, your .env isn't loaded)

### Step 2: Create the Agent
```powershell
npm run create:agent
```

Expected output:
```
🚀 Creating PromptHouse Evo Studio Agent with Agents API...

✅ SUCCESS! Agent created.

============================================================
Agent ID: asst_abc123xyz...
Name: PromptHouse Evo Studio
Model: gpt-4-turbo
Created: 2026-05-04T...
============================================================

💾 Saved to .env.agent
```

### Step 3: Test the Agent
```powershell
npm run test:agent
```

You should see Evo respond with something like:
```
🦁 Evo:

[known] I'm PromptHouse Evo Studio, your sovereign intelligence engine.

My core mission: Transform raw user requests into production-grade architectures 
through 11 operational modules and 11 core agents...

Want me to stress-test this, run Battle Testing, or refine further?
```

---

## ✅ Success!

Your agent is now live. You can:

### 1. Chat with Evo (Interactive REPL)
```powershell
npm run agent:repl
```

Then type prompts like:
- `Build a Flutter authentication flow`
- `Create a React component with Zustand state management`
- `Generate a Node.js Express API with JWT auth`

Exit with `exit` or Ctrl+C

### 2. Single-Shot Requests
```powershell
npm run agent -- "Create a Stripe payment integration for a Next.js app"
```

### 3. Integrate with Your App
```javascript
// In your bridge or React app
import { EvoAgent } from './agent-runtime.js';

const evo = new EvoAgent();
const response = await evo.chat("Your prompt here");
console.log(response);
```

### 4. View on OpenAI Platform
Visit: https://platform.openai.com/assistants

Find "PromptHouse Evo Studio" and monitor:
- Message history
- Tool usage
- Token consumption

---

## 🔗 Integration Points

### Express Bridge Endpoint (Already Wired)
```
POST /api/agent/chat
Content-Type: application/json

{
  "message": "Build a production React component",
  "agentId": "asst_abc123xyz..."
}
```

### React Frontend
Add this to your chat UI:
```jsx
async function askEvo(prompt) {
  const response = await fetch('/api/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt })
  });
  return response.json();
}
```

---

## 🚀 Next Steps

1. ✅ Test the agent — Run `npm run agent:repl` and chat
2. ✅ Integrate into UI — Add agent chat panel to React
3. ✅ Connect tools — Add code interpreter outputs to your workflow
4. ✅ Monitor usage — Check token costs on OpenAI dashboard
5. ✅ Deploy — Add agent endpoint to PromptBridge for production

---

## 📋 Troubleshooting

| Issue | Fix |
|-------|-----|
| `AGENT_ID not found` | Run `npm run create:agent` first |
| `Unauthorized (401)` | Check `OPENAI_API_KEY` in `.env` |
| `Model not available` | Use `gpt-4-turbo` instead of `gpt-5.5` |
| `No response from agent` | Wait 30s and try again (rate limiting) |
| `Thread creation failed` | Ensure you have OpenAI API credits |

---

## 📚 Files Created

- `openai-agent-modern.js` — Create agent with Agents API
- `agent-runtime.js` — Runtime for interacting with agent
- `SETUP_OPENAI_AGENT.md` — Full setup documentation
- `.env.agent` — Stores your Agent ID (git-ignored)

---

## 🎯 What's Happening

When you run `npm run create:agent`:

1. **Connects to OpenAI** using your API key
2. **Sends system prompt** with Evo's personality & instructions
3. **Creates an Assistant** on OpenAI's platform
4. **Gets back an Agent ID** (e.g., `asst_abc123...`)
5. **Stores it locally** in `.env.agent` for future use

That Agent ID is your agent's persistent identity on OpenAI. You can use it for:
- Chat conversations
- File uploads
- Tool executions
- Analytics

---

**Ready to chat with Evo?** 🦁

```powershell
npm run agent:repl
```
