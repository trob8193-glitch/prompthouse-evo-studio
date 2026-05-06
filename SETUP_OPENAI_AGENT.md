# PromptHouse Evo Studio — OpenAI Agent Setup Guide

## Quick Start

Your PromptHouse Evo agent on OpenAI can be deployed two ways:

### Option 1: Modern Agents API (Recommended)
Uses the new `@openai/agents` SDK for stateful, tool-using agents.

```bash
npm run create:agent:modern
```

### Option 2: Classic Assistants API (Legacy)
Uses the traditional OpenAI Assistants with code interpreter.

```bash
npm run create:agent:classic
```

---

## Prerequisites

1. **OpenAI API Key** (already in `.env`)
   - Verify: `echo $env:OPENAI_API_KEY` (PowerShell)
   - Key should start with `sk-proj-`

2. **OpenAI Account with Agent Access**
   - Visit: https://platform.openai.com/account/api-keys
   - Check: https://platform.openai.com/docs/guides/agents

3. **Required npm packages** (already installed)
   - `openai@^6.35.0`
   - `@openai/agents@^0.8.5`

---

## What Gets Created

### Agent Identity
- **Name**: PromptHouse Evo Studio
- **Model**: gpt-5.5 (agents) or gpt-4-turbo (assistants)
- **Role**: Sovereign intelligence engine for prompt generation, code synthesis, and proof verification
- **Tools**: Code interpreter, file handling, knowledge retrieval

### System Prompt
The agent receives a comprehensive instructions file that covers:
- 11 core operational modules
- Truth state tracking (known, inferred, blocked, built, verified)
- Domain constraints (dev, business, legal, creative)
- Strictness modes (autonomous, production, balanced)
- Langmoji status indicators (🦁 ⚙️ 🔍 ✅ 🚦)

---

## Running the Setup

### Step 1: Verify Your API Key
```powershell
cd C:\Users\Noname\.gemini\antigravity\scratch\prompthouse-evo-studio
$env:OPENAI_API_KEY
```

Expected: `sk-proj-...` (no output means it's not set)

If missing, update `.env`:
```
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
OPENAI_MODEL=gpt-5.5
```

### Step 2: Create the Agent
```powershell
# For modern Agents API (recommended):
npm run create:agent:modern

# OR for classic Assistants API:
npm run create:agent:classic
```

### Step 3: Capture the Agent ID
The script will output:
```
✅ Successfully created the PromptHouse Evo Studio Agent!

ID: agent_abc123xyz...
```

**IMPORTANT**: Save this ID. You'll use it to interact with the agent.

### Step 4: Store the Agent ID
Create `.env.agent`:
```
AGENT_ID=agent_abc123xyz...
OPENAI_API_KEY=sk-proj-...
```

### Step 5: Test the Agent
```powershell
npm run test:agent
```

---

## Agent APIs & Endpoints

Once created, interact with your agent via:

### Chat Endpoint (Express bridge)
```
POST /api/agent/chat
Body: {
  "message": "Build a Flutter authentication flow",
  "agentId": "agent_abc123xyz..."
}
```

### Direct OpenAI SDK
```javascript
import { Agent } from '@openai/agents';

const agent = new Agent({
  apiKey: process.env.OPENAI_API_KEY,
  agentId: process.env.AGENT_ID
});

const response = await agent.run({
  message: "Create a production React component"
});
```

---

## Troubleshooting

### Error: "401 Unauthorized"
- ❌ API key expired or invalid
- ✅ Fix: Generate new key at https://platform.openai.com/api-keys

### Error: "Agent model not available"
- ❌ gpt-5.5 not available in your region/plan
- ✅ Fallback: Use `gpt-4-turbo` or `gpt-4`

### Error: "Tools not supported"
- ❌ Your OpenAI plan doesn't support agents/tools
- ✅ Fix: Upgrade to GPT-4 API access via billing settings

### Agent runs but gives vague responses
- ❌ System prompt isn't being applied
- ✅ Fix: Verify instructions file was uploaded, check agent settings on platform.openai.com

---

## Files Generated

| File | Purpose |
|------|---------|
| `.env` | API key & model (do NOT commit) |
| `.env.agent` | Agent ID storage (do NOT commit) |
| `openai-agent-modern.js` | Create/manage Agents API agent |
| `openai-agent-classic.js` | Create/manage Assistants API agent |
| `agent-runtime.js` | Runtime for agent interactions |
| `public/agent-playground.html` | Web UI to test agent |

---

## Next Steps

1. ✅ Run the setup script
2. ✅ Capture the Agent ID
3. ✅ Test via `/api/agent/chat` endpoint
4. ✅ Deploy to staging (verify responses match domain)
5. ✅ Configure tool integrations (GitHub, Stripe, Vercel)
6. ✅ Enable owner approval for production

---

## Resources

- **OpenAI Agents Docs**: https://platform.openai.com/docs/guides/agents
- **OpenAI Assistants API**: https://platform.openai.com/docs/assistants
- **Agent Playground**: http://localhost:5173/agent-playground
- **Truth State Reference**: See `RELEASE_CHECKLIST.md`

