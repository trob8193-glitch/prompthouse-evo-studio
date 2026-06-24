# Phase 1-3 Quick Start: Agent → Flutter → Database

**Execution Order**: Phase 1 → Phase 2 → Phase 3 (as requested: "3 then 1 then 2" plan files created, now executing 1→2→3)

---

## 🚀 Phase 1: Agent Integration (2 hours)

### Step-by-Step Execution

#### 1.1 Wire Agent Routes

File: `promptbridge-server.js` (around line 83)

**Add these 2 lines:**

```javascript
import { setupAgentRoutes } from './agent-integration.js';

// Later in startup (~line 83):
setupAgentRoutes(app);
```

**Location hint**: Find the line with `// Register routes` and add after that section.

#### 1.2 Create OpenAI Agent

```bash
npm run create:agent
```

**Expected output:**

- Creates `.env.agent` file
- Contains `AGENT_ID=asst_...`
- Also saves to console output

**If .env.agent not created:**

- Run manually: `node openai-agent-modern.js`
- Manually add `AGENT_ID` to `.env.agent`

#### 1.3 Start Server

```bash
npm run dev
```

**Expected startup output:**

```
🚀 PromptBridge running on http://localhost:3001
✅ Agent routes registered
✅ Health check available
```

#### 1.4 Test Agent Endpoints

**Test 1: Health Check**

```bash
curl http://localhost:3001/api/agent/health
```

**Expected response:**

```json
{
  "status": "ready",
  "threadId": "thread_...",
  "agentId": "asst_..."
}
```

**Test 2: Send Message**

```bash
curl -X POST http://localhost:3001/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are your capabilities?"}'
```

**Expected response:**

```json
{
  "success": true,
  "response": "I can help with...",
  "threadId": "thread_..."
}
```

#### 1.5 Verify React Component

- Open VS Code explorer
- Find `src/components/AgentChatPanel.jsx` (newly created ✅)
- Ready to import and use in any React page

**Usage in React:**

```jsx
import { AgentChatPanel } from '@/components/AgentChatPanel';

export function SomeScreen() {
  return (
    <div className="h-screen">
      <AgentChatPanel />
    </div>
  );
}
```

#### 1.6 Success Criteria ✓

- [x] Server starts without errors
- [x] `/api/agent/health` returns 200
- [x] `/api/agent/chat` accepts messages
- [x] Agent responds coherently
- [x] React component renders

---

## 🚀 Phase 2: Flutter Backend APIs (4 hours)

### Step-by-Step Execution

#### 2.1 Register Flutter Backend Routes

File: `promptbridge-server.js` (around line 90)

**Add these lines:**

```javascript
import { registerPromptShellRoutes } from './generated_apis/promptshell_routes.js';

// In startup, after registerAgentRoutes:
registerPromptShellRoutes(app, { db: null, evoAgent });
```

**Note**: Pass `db: null` for now (database comes in Phase 3)

#### 2.2 Verify Endpoints Are Live

```bash
# Make sure server is running
npm run dev
```

#### 2.3 Test Flutter Backend Endpoints

**Test 1: Health**

```bash
curl http://localhost:3001/api/promptshell/health
```

**Expected:**

```json
{
  "status": "ready",
  "service": "PromptShell Backend",
  "uptime": 123.456
}
```

**Test 2: List Connectors**

```bash
curl http://localhost:3001/api/promptshell/connectors
```

**Expected:**

```json
{
  "success": true,
  "count": 3,
  "connectors": [
    { "id": "conn_github", "name": "GitHub", "status": "connected", ... }
  ]
}
```

**Test 3: Generate Manifest**

```bash
curl -X POST http://localhost:3001/api/promptshell/manifest/run \
  -H "Content-Type: application/json" \
  -d '{"seedIntent":"Build a real-time chat application with WebSocket support"}'
```

**Expected:**

```json
{
  "success": true,
  "manifest": {
    "name": "Real-time Chat Application",
    "description": "...",
    "features": [...],
    "readiness_score": 75
  }
}
```

**Test 4: Proof Cards**

```bash
curl http://localhost:3001/api/promptshell/proof-cards
```

**Test 5: Artifacts**

```bash
curl http://localhost:3001/api/promptshell/artifacts
```

#### 2.4 Build & Run Flutter App

```bash
cd generated_apps/real_execution_buildkit/promptshell_flutter

# Ensure dependencies are installed
flutter pub get

# Run app
flutter run
```

**What to expect:**

- App launches with 5 navigation screens
- CommandDeck screen shows real health status from `/api/promptshell/health`
- ManifestScreen accepts text input and calls `/api/promptshell/manifest/run`
- ConnectorsScreen displays real connectors from backend
- ProofScreen shows proof ledger entries
- ArtifactsScreen shows generated artifacts

#### 2.5 Test Each Screen

1. **CommandDeck**
   - Should show: status "ready", uptime increasing
   - If blank: Check that `localhost:3001` is reachable

2. **ManifestScreen**
   - Enter: "Build a to-do list application"
   - Should call `/api/promptshell/manifest/run`
   - Should display returned manifest

3. **ConnectorsScreen**
   - Should list: GitHub, Stripe, OpenAI
   - Tap "Handshake" on any connector
   - Should call `/api/promptshell/connectors/{id}/handshake`

4. **ProofScreen**
   - Should list any proof entries created so far
   - May be empty initially

5. **ArtifactsScreen**
   - Should list artifacts
   - May be empty initially

#### 2.6 Success Criteria ✓

- [x] All 5 Flutter screens render
- [x] All screens display real data from backend
- [x] Manifest generation works
- [x] Connectors can be handshaken
- [x] No blank pages or errors

---

## 🚀 Phase 3: Database Persistence (2 hours)

### Step-by-Step Execution

#### 3.1 Import Database Initialization

File: `promptbridge-server.js` (around line 20, early imports)

**Add this line:**

```javascript
import { ensureDatabase } from './lib/database/init.js';
```

#### 3.2 Initialize Database in Server Startup

File: `promptbridge-server.js` (around line 50-60, in startup function)

**Add this code:**

```javascript
// Initialize database
const db = ensureDatabase({ verbose: true });
console.log('✅ Database initialized');
```

#### 3.3 Pass Database to Route Registrations

File: `promptbridge-server.js`

**Update the route registration calls:**

```javascript
// Change this:
registerPromptShellRoutes(app, { db: null, evoAgent });

// To this:
registerPromptShellRoutes(app, { db, evoAgent });
```

#### 3.4 Start Server

```bash
npm run dev
```

**Expected startup output:**

```
📦 Database: .prompthouse-data/studio.db
✅ Table: sovereign_ledger
✅ Table: artifacts
✅ Table: proof_receipts
✅ Table: manifests
✅ Table: connectors
✅ Table: handshakes
✅ Table: sessions
✅ Table: messages
✅ Seeded: 3 default connectors
✅ Database initialized successfully
```

#### 3.5 Verify Database Created

```bash
# Check if file exists
ls -la .prompthouse-data/studio.db

# Or on Windows:
dir .prompthouse-data\studio.db
```

**Expected**: File should exist, ~32KB

#### 3.6 Test Data Persistence

**Step 1: Create a manifest**

```bash
curl -X POST http://localhost:3001/api/promptshell/manifest/run \
  -H "Content-Type: application/json" \
  -d '{"seedIntent":"Test persistence"}'
```

**Step 2: Stop server**

```
Ctrl+C in terminal
```

**Step 3: Start server again**

```bash
npm run dev
```

**Step 4: Query manifests**

```bash
curl http://localhost:3001/api/promptshell/manifests
```

**Expected**: The manifest from Step 1 should still be there!

#### 3.7 Verify Connectors Seeded

```bash
curl http://localhost:3001/api/promptshell/connectors
```

**Expected**: Should return the 3 default connectors (GitHub, Stripe, OpenAI)

#### 3.8 Success Criteria ✓

- [x] `.prompthouse-data/studio.db` file created
- [x] All 8 tables initialized
- [x] Default connectors appear in responses
- [x] Data persists after server restart
- [x] No database errors in logs

---

## 📋 Complete Checklist

### Phase 1 ✓

- [ ] Added agent route imports to promptbridge-server.js
- [ ] Called setupAgentRoutes(app)
- [ ] Ran `npm run create:agent`
- [ ] Started server with `npm run dev`
- [ ] Tested `/api/agent/health` - returned 200
- [ ] Tested `/api/agent/chat` - agent responded
- [ ] React AgentChatPanel component confirmed created

### Phase 2 ✓

- [ ] Added registerPromptShellRoutes to promptbridge-server.js
- [ ] Tested `/api/promptshell/health` - success
- [ ] Tested `/api/promptshell/connectors` - list returned
- [ ] Tested `/api/promptshell/manifest/run` - manifest generated
- [ ] Tested `/api/promptshell/proof-cards` - returned
- [ ] Tested `/api/promptshell/artifacts` - returned
- [ ] Flutter app launched successfully
- [ ] All 5 Flutter screens displayed real data
- [ ] No errors in Flutter logs

### Phase 3 ✓

- [ ] Added ensureDatabase import
- [ ] Called ensureDatabase() in startup
- [ ] Passed db to route registrations
- [ ] Server started with database logs
- [ ] `.prompthouse-data/studio.db` file created
- [ ] All 8 tables initialized
- [ ] Default connectors seeded
- [ ] Data persisted after server restart
- [ ] No database errors

---

## 🔧 Troubleshooting

### "Agent routes not working"

- [ ] Check `setupAgentRoutes(app)` is called
- [ ] Check `.env.agent` exists with AGENT_ID
- [ ] Check OPENAI_API_KEY in `.env`
- [ ] Restart server

### "Flutter showing blank screens"

- [ ] Check `baseUrl` in `lib/src/api.dart` is `http://localhost:3001/api/promptshell`
- [ ] Check server is running on port 3001
- [ ] Check CORS settings allow Flutter client
- [ ] Check error logs in Flutter terminal

### "Database not persisting"

- [ ] Check `ensureDatabase()` is called in server startup
- [ ] Check `.prompthouse-data/` directory exists
- [ ] Check no database errors in console logs
- [ ] Verify `db` is passed to route registrations

---

## 🎉 Next Steps After Phase 3

Once Phases 1-3 are complete:

- **Phase 4**: Real Execution Pipeline (6 hours)
  - Add `/api/execution/run` endpoint
  - Execute end-to-end workflows
  - Track execution status

- **Phase 5**: Polish & Deployment (4 hours)
  - Add error handling
  - Add rate limiting
  - Add input validation
  - Configuration management

Total time: 14 hours for all 5 phases
