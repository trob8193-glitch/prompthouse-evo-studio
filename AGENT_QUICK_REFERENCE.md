# PromptHouse Evo Studio — OpenAI Agent Quick Reference

## 🚀 Quick Start (Copy & Paste)

```powershell
cd C:\Users\Noname\.gemini\antigravity\scratch\prompthouse-evo-studio
npm run create:agent
```

**Expected Output:**
```
✅ SUCCESS! Agent created.

============================================================
Agent ID: asst_abc123xyz...
Name: PromptHouse Evo Studio
Model: gpt-4-turbo
Created: 2026-05-04T...
============================================================

💾 Saved to .env.agent
```

---

## 📋 Available Commands

| Command | What It Does |
|---------|-------------|
| `npm run create:agent` | Create the agent on OpenAI |
| `npm run test:agent` | Test with a sample prompt |
| `npm run agent:repl` | Interactive REPL (type prompts, exit with `exit`) |
| `npm run dev:all` | Start UI + Express bridge |
| `npm run bridge` | Start Express bridge only |

---

## 💬 Testing the Agent

### Method 1: REPL (Recommended for Testing)
```powershell
npm run agent:repl
# Then type your prompts:
# > Build a Flutter authentication flow
# > Create a React component with Zustand
# > exit
```

### Method 2: Single Message
```powershell
npm run agent -- "Create a production REST API"
```

### Method 3: API (After Starting Bridge)
```powershell
# In another terminal:
npm run bridge

# Then POST to:
curl -X POST http://localhost:3001/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Build a Flutter app"}'
```

---

## 🔧 Integration in React

```jsx
// In your React component
async function askEvo(prompt) {
  const response = await fetch('/api/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt })
  });
  return response.json();
}

// Usage:
const result = await askEvo("Create a Flutter login screen");
console.log(result.message); // Evo's response
```

---

## ✅ Verification Checklist

- [ ] API key in `.env` (check: `echo $env:OPENAI_API_KEY`)
- [ ] npm packages installed (`npm install` if needed)
- [ ] Agent created (`npm run create:agent`)
- [ ] Agent ID saved to `.env.agent`
- [ ] Test passed (`npm run test:agent`)
- [ ] Can reach REPL (`npm run agent:repl`)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `AGENT_ID not found` | Run `npm run create:agent` first |
| `Unauthorized (401)` | Check OPENAI_API_KEY in .env |
| `Model not available` | Script will fallback to gpt-4-turbo |
| Agent doesn't respond | Wait 2-3 seconds, check token rate limit |
| Port 3001 in use | Change port in promptbridge-server.js |

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `openai-agent-modern.js` | Create agent on OpenAI |
| `agent-runtime.js` | Runtime engine for conversations |
| `agent-integration.js` | Express routes for `/api/agent/*` |
| `.env.agent` | Stores AGENT_ID (auto-created) |
| `SETUP_OPENAI_AGENT.md` | Full documentation |
| `QUICKSTART_AGENT.md` | 3-step setup guide |

---

## 🎯 What's Happening Under the Hood

1. **npm run create:agent** → Creates an OpenAI Assistant with Evo's system prompt
2. **Agent ID** → Unique identifier (e.g., `asst_abc123`) saved locally
3. **npm run test:agent** → Sends a test message and gets response
4. **npm run agent:repl** → Starts interactive terminal mode
5. **Express routes** → `/api/agent/chat` proxies requests to OpenAI

---

## 🔐 Security Notes

- API key is in `.env` (never commit this file)
- Agent credentials in `.env.agent` (also never commit)
- All conversation history stored locally
- No external calls except to OpenAI API
- Agent ID is safe to share (it's like a username)

---

## 📞 Next Steps

1. ✅ Run `npm run create:agent`
2. ✅ Test with `npm run agent:repl`
3. ✅ Try a few prompts:
   - "Explain your core mission"
   - "Build a React dashboard"
   - "Create a Node.js API"
4. ✅ Integrate `/api/agent/chat` into your UI
5. ✅ Deploy bridge to production

---

**Ready?** 🦁 Let's go!

```powershell
npm run create:agent
```

